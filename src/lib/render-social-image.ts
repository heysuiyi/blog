import { createHash } from 'node:crypto';
import { resolve } from 'node:path';
import sharp from 'sharp';
import { SITE_TITLE } from '../consts';
import {
	SOCIAL_IMAGE_HEIGHT,
	SOCIAL_IMAGE_WIDTH,
	socialImageDate,
	type SocialImageArticle,
} from './social-image';

// Build-only source asset: it is deliberately not shipped in public/ or fetched
// at build time. The unique family name prevents host-font substitutions.
const fontfile = resolve('src/assets/fonts/social/SuiyiSocialSans-Regular.otf');
const fontFamily = 'Suiyi Social Sans';
const palette = { paper: '#f8f7f2', ink: '#303934', teal: '#446d66', muted: '#656c64', line: '#dedfd5' };

function escapeMarkup(text: string): string {
	const entities: Record<string, string> = {
		'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;',
	};
	return text.replace(/[&<>"']/g, (character) => entities[character]);
}

/** Prefer an existing phrase boundary over breaking a Chinese word or date. */
function titleWithNaturalBreak(title: string): string {
	const units = (text: string) => Array.from(text).reduce((sum, character) => sum + (/[\x00-\x7f]/.test(character) ? 0.5 : 1), 0);
	const total = units(title);
	if (total <= 16) return title;
	const candidates = Array.from(title.matchAll(/[，,：:；;·]\s*/g)).map((match) => {
		const position = match.index! + match[0].length;
		return { position, before: units(title.slice(0, position)) };
	}).filter(({ before }) => before >= total * 0.3 && before <= total * 0.7);
	candidates.sort((a, b) => Math.abs(a.before - total / 2) - Math.abs(b.before - total / 2));
	if (!candidates.length) return title;
	const { position } = candidates[0];
	return `${title.slice(0, position).trimEnd()}\n${title.slice(position).trimStart()}`;
}

async function textLayer(text: string, size: number, color: string, width: number) {
	return sharp({
		text: {
			text: `<span foreground="${color}">${escapeMarkup(text)}</span>`,
			font: `${fontFamily} ${size}`,
			fontfile,
			width,
			wrap: 'word-char',
			spacing: 12,
			rgba: true,
			dpi: 72,
		},
	}).png().toBuffer({ resolveWithObject: true });
}

/** Fit the complete text without clipping or ellipses, including future titles. */
async function fittedText(text: string, size: number, color: string, width: number, height: number) {
	for (let currentSize = size; currentSize >= 12; currentSize -= 2) {
		const layer = await textLayer(text, currentSize, color, width);
		if (layer.info.width <= width && layer.info.height <= height) return layer;
	}
	throw new Error(`Social image text is too long to fit without truncation: ${text}`);
}

/** Raster PNG; no network, random values, system fonts, hero images, or clock. */
export async function renderSocialImage(article: SocialImageArticle): Promise<Buffer> {
	const [brand, category, title, date, address] = await Promise.all([
		textLayer(SITE_TITLE, 30, palette.teal, 500),
		fittedText(article.category, 26, palette.teal, 460, 50),
		fittedText(titleWithNaturalBreak(article.title), 64, palette.ink, 1032, 234),
		textLayer(socialImageDate(article.pubDate), 24, palette.muted, 650),
		textLayer('putl.online', 24, palette.muted, 300),
	]);
	// A quiet article-specific mark also distinguishes otherwise identical titles.
	const digest = createHash('sha256').update(article.id).digest();
	const marks = Array.from({ length: 16 }, (_, index) => {
		const height = 4 + (digest[index] % 17);
		return `<rect x="${84 + index * 10}" y="${445 - height}" width="4" height="${height}" fill="${palette.teal}" opacity="0.55"/>`;
	}).join('');
	const frame = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
		<rect width="1200" height="630" fill="${palette.paper}"/>
		<path d="M84 136H1116 M84 496H1116" stroke="${palette.line}"/>
		<path d="M84 136H156" stroke="${palette.teal}" stroke-width="3"/>
		${marks}
	</svg>`);
	return sharp(frame)
		.composite([
			{ input: brand.data, left: 84, top: 76 },
			{ input: category.data, left: 1116 - category.info.width, top: 78 },
			{ input: title.data, left: 84, top: 174 + Math.floor((234 - title.info.height) / 2) },
			{ input: date.data, left: 84, top: 537 },
			{ input: address.data, left: 1116 - address.info.width, top: 537 },
		])
		.resize(SOCIAL_IMAGE_WIDTH, SOCIAL_IMAGE_HEIGHT)
		.removeAlpha()
		.png({ compressionLevel: 9, adaptiveFiltering: false })
		.toBuffer();
}
