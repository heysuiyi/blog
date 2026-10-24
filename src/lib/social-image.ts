/** Public metadata shared by article pages and the build-time PNG endpoint. */
export const SOCIAL_IMAGE_WIDTH = 1200;
export const SOCIAL_IMAGE_HEIGHT = 630;
export const SOCIAL_IMAGE_TYPE = 'image/png';

export interface SocialImageArticle {
	id: string;
	title: string;
	category: string;
	pubDate: Date;
}

/** Encode path segments separately so nested content IDs keep working. */
export function socialImagePath(id: string): string {
	return `/og/${id.split('/').map(encodeURIComponent).join('/')}.png`;
}

/** UTC makes a date-only frontmatter value independent of the build machine. */
export function socialImageDate(date: Date): string {
	return `${date.getUTCFullYear()}年${date.getUTCMonth() + 1}月${date.getUTCDate()}日`;
}

export function socialImageAlt(article: Omit<SocialImageArticle, 'id'>): string {
	return `${article.title} · ${article.category} · ${socialImageDate(article.pubDate)}`;
}
