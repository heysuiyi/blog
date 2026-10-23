type ThemeMode = 'light' | 'dark' | 'system';
type AudioPhase = 'off' | 'starting' | 'playing' | 'error';
type AudioConstructor = typeof AudioContext;

interface RainGraph {
	context: AudioContext;
	source: AudioBufferSourceNode;
	lowCut: BiquadFilterNode;
	filter: BiquadFilterNode;
	output: GainNode;
	disposed: boolean;
}

const THEME_KEY = 'suiyi-theme';
const systemDark = window.matchMedia('(prefers-color-scheme: dark)');
let themeMode: ThemeMode = readTheme();
let phase: AudioPhase = 'off';
let volume = 20;
let muted = false;
let audioMessage = '未开启';
let generation = 0;
let graph: RainGraph | null = null;

function normalizeTheme(value: string | null | undefined): ThemeMode {
	return value === 'light' || value === 'dark' ? value : 'system';
}

function readTheme(): ThemeMode {
	try {
		return normalizeTheme(window.localStorage.getItem(THEME_KEY));
	} catch {
		return normalizeTheme(document.documentElement.dataset.themeMode);
	}
}

function paintTheme(targetDocument: Document = document): void {
	const theme = themeMode === 'system' ? (systemDark.matches ? 'dark' : 'light') : themeMode;
	targetDocument.documentElement.dataset.themeMode = themeMode;
	targetDocument.documentElement.dataset.theme = theme;
	targetDocument.documentElement.style.colorScheme = theme;
	targetDocument.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#232724' : '#f8f7f2');
	targetDocument.querySelectorAll<HTMLButtonElement>('[data-reading-tools] [data-theme-mode]').forEach((button) => {
		button.disabled = false;
		button.setAttribute('aria-pressed', String(button.dataset.themeMode === themeMode));
	});
}

function chooseTheme(value: string | undefined): void {
	themeMode = normalizeTheme(value);
	paintTheme();
	try {
		window.localStorage.setItem(THEME_KEY, themeMode);
	} catch {
		// The selection still works for this visit when storage is blocked.
	}
}

function audioConstructor(): AudioConstructor | undefined {
	return window.AudioContext ?? (window as Window & { webkitAudioContext?: AudioConstructor }).webkitAudioContext;
}

function renderAudio(): void {
	const active = phase === 'playing';
	const starting = phase === 'starting';
	const silent = muted || volume === 0;
	const supported = Boolean(audioConstructor());
	const label = starting ? '取消开启雨声' : active ? '暂停合成雨声' : '开启合成雨声';
	const status = !supported ? '浏览器不支持' : starting ? '开启中…' : active ? (silent ? '已静音' : '合成雨声') : audioMessage;

	document.querySelectorAll<HTMLElement>('[data-reading-tools]').forEach((root) => {
		const ambience = root.querySelector<HTMLElement>('[data-ambience]');
		if (ambience) {
			ambience.dataset.audioState = phase;
			ambience.dataset.playing = String(active);
			ambience.dataset.muted = String(silent);
		}
		const toggle = root.querySelector<HTMLButtonElement>('[data-audio-toggle]');
		if (toggle) {
			toggle.disabled = !supported;
			toggle.setAttribute('aria-pressed', String(active || starting));
			toggle.setAttribute('aria-label', label);
			toggle.setAttribute('aria-busy', String(starting));
		}
		const mute = root.querySelector<HTMLButtonElement>('[data-audio-mute]');
		if (mute) {
			mute.disabled = !active;
			mute.setAttribute('aria-pressed', String(muted));
			mute.setAttribute('aria-label', muted ? '取消雨声静音' : '静音雨声');
			mute.textContent = muted ? '恢复' : '静音';
		}
		const slider = root.querySelector<HTMLInputElement>('[data-audio-volume]');
		if (slider) {
			slider.disabled = !active;
			slider.value = String(volume);
			slider.setAttribute('aria-valuetext', `${volume}%`);
		}
		const statusElement = root.querySelector<HTMLElement>('[data-audio-status]');
		if (statusElement && statusElement.textContent !== status) statusElement.textContent = status;
	});
}

function disposeGraph(target: RainGraph): void {
	if (target.disposed) return;
	target.disposed = true;
	target.context.onstatechange = null;
	// Silence and disconnect synchronously, even if close() fails or is delayed.
	target.output.gain.cancelScheduledValues(target.context.currentTime);
	target.output.gain.setValueAtTime(0, target.context.currentTime);
	try { target.source.stop(); } catch { /* The source may already be stopped. */ }
	target.source.disconnect();
	target.lowCut.disconnect();
	target.filter.disconnect();
	target.output.disconnect();
	if (target.context.state !== 'closed') void target.context.close().catch(() => undefined);
}

function stopAudio(reset = false): void {
	generation += 1;
	const previous = graph;
	graph = null;
	phase = 'off';
	audioMessage = reset ? '未开启' : '已暂停';
	if (reset) {
		volume = 20;
		muted = false;
	}
	if (previous) disposeGraph(previous);
	renderAudio();
}

function createRain(): RainGraph {
	const Constructor = audioConstructor();
	if (!Constructor) throw new Error('Web Audio is not supported.');
	const context = new Constructor();
	try {
		// Generated locally only after a click. No fetch, audio file, or autoplay.
		const buffer = context.createBuffer(2, context.sampleRate * 8, context.sampleRate);
		for (let channel = 0; channel < buffer.numberOfChannels; channel += 1) {
			const samples = buffer.getChannelData(channel);
			let previous = 0;
			for (let index = 0; index < samples.length; index += 1) {
				const white = Math.random() * 2 - 1;
				previous = (previous + 0.025 * white) / 1.025;
				samples[index] = previous * 6;
			}
			// A short wraparound blend avoids a click when the rain loop repeats.
			const blend = Math.min(2048, Math.floor(samples.length / 4));
			for (let index = 0; index < blend; index += 1) {
				const weight = index / blend;
				const endIndex = samples.length - blend + index;
				samples[endIndex] = samples[endIndex] * (1 - weight) + samples[index] * weight;
			}
		}
		const source = context.createBufferSource();
		source.buffer = buffer;
		source.loop = true;
		// The crossfade ends at this matching point, not the buffer's first sample.
		source.loopStart = Math.min(2048, Math.floor(buffer.length / 4)) / context.sampleRate;
		const lowCut = context.createBiquadFilter();
		lowCut.type = 'highpass';
		lowCut.frequency.value = 180;
		const filter = context.createBiquadFilter();
		filter.type = 'lowpass';
		filter.frequency.value = 3200;
		filter.Q.value = 0.4;
		const output = context.createGain();
		output.gain.value = 0;
		source.connect(lowCut);
		lowCut.connect(filter);
		filter.connect(output);
		output.connect(context.destination);
		source.start();
		return { context, source, lowCut, filter, output, disposed: false };
	} catch (error) {
		void context.close().catch(() => undefined);
		throw error;
	}
}

function setLevel(): void {
	if (graph && phase === 'playing') {
		const now = graph.context.currentTime;
		graph.output.gain.cancelScheduledValues(now);
		graph.output.gain.setTargetAtTime(muted ? 0 : (volume / 100) * 0.17, now, 0.12);
	}
	renderAudio();
}

async function startAudio(): Promise<void> {
	const request = ++generation;
	phase = 'starting';
	audioMessage = '未开启';
	renderAudio();
	let next: RainGraph | null = null;
	let timeout: ReturnType<typeof setTimeout> | undefined;
	try {
		next = createRain();
		graph = next;
		const current = next;
		current.context.onstatechange = () => {
			if (graph === current && phase === 'playing' && current.context.state !== 'running') {
				// OS/browser interruptions must never restart audio on their own.
				stopAudio();
			}
		};
		// Call resume within the click handler's user activation, before awaiting.
		const resumed = current.context.resume();
		await Promise.race([
			resumed,
			new Promise<never>((_, reject) => {
				timeout = setTimeout(() => reject(new Error('Audio start timed out.')), 6000);
			}),
		]);
		if (request !== generation || graph !== current) {
			disposeGraph(current);
			return;
		}
		if (current.context.state !== 'running') throw new Error('Audio could not start.');
		phase = 'playing';
		setLevel();
	} catch {
		if (next) disposeGraph(next);
		if (request === generation) {
			graph = null;
			phase = 'error';
			audioMessage = '暂不可用，请重试';
			renderAudio();
		}
	} finally {
		if (timeout !== undefined) clearTimeout(timeout);
	}
}

document.addEventListener('click', (event) => {
	if (!(event.target instanceof Element)) return;
	const button = event.target.closest<HTMLButtonElement>('[data-reading-tools] button');
	if (!button || button.disabled) return;
	if (button.hasAttribute('data-theme-mode')) {
		chooseTheme(button.dataset.themeMode);
	} else if (button.hasAttribute('data-audio-toggle')) {
		if (phase === 'playing' || phase === 'starting') stopAudio();
		else void startAudio();
	} else if (button.hasAttribute('data-audio-mute') && phase === 'playing') {
		muted = !muted;
		setLevel();
	}
});

document.addEventListener('input', (event) => {
	if (!(event.target instanceof HTMLInputElement) || !event.target.matches('[data-reading-tools] [data-audio-volume]')) return;
	if (phase !== 'playing') return;
	const nextVolume = event.target.valueAsNumber;
	volume = Number.isFinite(nextVolume) ? Math.min(100, Math.max(0, nextVolume)) : 20;
	if (volume > 0) muted = false;
	setLevel();
});

systemDark.addEventListener('change', () => {
	if (themeMode === 'system') paintTheme();
});

window.addEventListener('storage', (event) => {
	if (event.key !== THEME_KEY && event.key !== null) return;
	themeMode = event.key === null ? readTheme() : normalizeTheme(event.newValue);
	paintTheme();
});

function initializePage(): void {
	// Deliberately preserve theme only. Rain never resumes across navigation.
	themeMode = readTheme();
	paintTheme();
	stopAudio(true);
}

window.addEventListener('pagehide', () => stopAudio(true));
window.addEventListener('pageshow', (event) => {
	if (event.persisted) initializePage();
});
document.addEventListener('astro:before-preparation', () => stopAudio(true));
document.addEventListener('astro:before-swap', (event) => {
	stopAudio(true);
	if ('newDocument' in event && event.newDocument instanceof Document) paintTheme(event.newDocument);
});
document.addEventListener('astro:page-load', initializePage);

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initializePage, { once: true });
else initializePage();

export {};
