import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import rss from '@astrojs/rss';
import { SITE_DESCRIPTION, SITE_TITLE } from '../consts';
import { postContentDate, sortPostsNewestFirst } from '../lib/posts';

export const GET: APIRoute = async ({ site }) => {
	if (!site) throw new Error('A canonical site URL is required for the RSS feed.');
	const posts = sortPostsNewestFirst(await getCollection('blog'));
	const latestContentDate = posts.reduce<Date | undefined>((latest, post) => {
		const date = postContentDate(post);
		return !latest || date > latest ? date : latest;
	}, undefined);

	return rss({
		title: SITE_TITLE,
		description: SITE_DESCRIPTION,
		site,
		customData: `<language>zh-CN</language>${latestContentDate ? `<lastBuildDate>${latestContentDate.toUTCString()}</lastBuildDate>` : ''}`,
		items: posts.map((post) => ({
			title: post.data.title,
			description: post.data.description,
			pubDate: post.data.pubDate,
			// @astrojs/rss also uses this canonical permalink as the stable item GUID.
			link: new URL(`/blog/${post.id}/`, site).href,
			categories: [...new Set([post.data.category, ...post.data.tags])],
		})),
	});
};
