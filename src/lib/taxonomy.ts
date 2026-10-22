import type { CollectionEntry } from 'astro:content';
export type TaxonomyKind = 'category' | 'tag';
export const taxonomyUrl = (kind: TaxonomyKind, name: string) => '/' + (kind === 'category' ? 'categories' : 'tags') + '/' + encodeURIComponent(name) + '/';
export function taxonomyEntries(posts: CollectionEntry<'blog'>[], kind: TaxonomyKind) {
 const counts = new Map<string, number>();
 for (const post of posts) for (const name of new Set(kind === 'category' ? [post.data.category] : post.data.tags)) counts.set(name, (counts.get(name) || 0) + 1);
 return Array.from(counts, ([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, 'zh-CN'));
}
