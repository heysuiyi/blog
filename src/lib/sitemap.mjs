import { readdir, readFile } from 'node:fs/promises';
import { slug as githubSlug } from 'github-slugger';
import { load as loadYaml } from 'js-yaml';

/**
 * Astro's content API is not available in astro.config. Read only the metadata
 * needed by sitemap.serialize, using the same YAML parser and slug rules as
 * Astro's glob content loader. Never substitute the filesystem or build date.
 */
export async function blogLastModified(contentDirectory, site) {
	const dates = new Map();

	async function visit(directory, prefix = '') {
		for (const entry of await readdir(directory, { withFileTypes: true })) {
			if (entry.name.startsWith('.')) continue;
			const relativePath = `${prefix}${entry.name}`;
			const file = new URL(encodeURIComponent(entry.name), directory);
			if (entry.isDirectory()) {
				await visit(new URL(`${encodeURIComponent(entry.name)}/`, directory), `${relativePath}/`);
				continue;
			}
			if (!entry.isFile() || !/\.(md|mdx)$/.test(entry.name)) continue;
			const source = await readFile(file, 'utf8');
			const frontmatter = source.match(/^\uFEFF?---[ \t]*\r?\n([\s\S]*?)\r?\n(?:---|\.\.\.)[ \t]*(?:\r?\n|$)/);
			if (!frontmatter) throw new Error(`Missing YAML frontmatter in ${relativePath}`);
			const data = loadYaml(frontmatter[1]);
			if (!data || typeof data !== 'object' || Array.isArray(data)) {
				throw new Error(`Invalid YAML frontmatter in ${relativePath}`);
			}
			const rawDate = data.updatedDate ?? data.pubDate;
			const date = new Date(rawDate);
			if (rawDate == null || !Number.isFinite(date.valueOf())) {
				throw new Error(`Invalid content date in ${relativePath}`);
			}
			const id = data.slug
				? String(data.slug)
				: relativePath.replace(/\.(md|mdx)$/, '').split('/').map((segment) => githubSlug(segment)).join('/').replace(/\/index$/, '');
			const pathname = new URL(`/blog/${id}/`, site).pathname;
			if (dates.has(pathname)) throw new Error(`Duplicate blog URL in sitemap metadata: ${pathname}`);
			dates.set(pathname, date.toISOString());
		}
	}

	await visit(contentDirectory);
	return dates;
}
