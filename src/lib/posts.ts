import type { CollectionEntry } from 'astro:content';

export type BlogPost = CollectionEntry<'blog'>;
export type BlogPostData = BlogPost['data'];

type DatedPost = { id: string; data: { pubDate: Date; updatedDate?: Date } };

/** A stable order shared by feeds, archives, and adjacent-post navigation. */
export function sortPostsNewestFirst<T extends DatedPost>(posts: readonly T[]): T[] {
	return [...posts].sort((a, b) => {
		const byDate = b.data.pubDate.valueOf() - a.data.pubDate.valueOf();
		return byDate || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0);
	});
}

/** Content dates only: a build or deployment is not an editorial update. */
export function postContentDate(post: Pick<DatedPost, 'data'>): Date {
	return post.data.updatedDate ?? post.data.pubDate;
}

/** Approximate prose reading time: 300 CJK characters or 200 other words/minute. */
export function estimatedReadingMinutes(text: string): number {
	const prose = text
		.replace(/^---\r?\n[\s\S]*?\r?\n---(?:\r?\n|$)/, '')
		.replace(/```[\s\S]*?```|~~~[\s\S]*?~~~/g, ' ')
		.replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
		.replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
		.replace(/^\s*\[[^\]]+\]:\s+\S+.*$/gm, ' ')
		.replace(/<[^>]*>/g, ' ')
		.replace(/https?:\/\/\S+/g, ' ');
	const cjk = /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}]/gu;
	const characters = prose.match(cjk)?.length ?? 0;
	const words = prose.replace(cjk, ' ').match(/[\p{L}\p{N}]+(?:['’\-][\p{L}\p{N}]+)*/gu)?.length ?? 0;
	return Math.max(1, Math.ceil(characters / 300 + words / 200));
}
