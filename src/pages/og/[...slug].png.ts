import type { APIRoute, GetStaticPaths } from 'astro';
import { getCollection } from 'astro:content';
import { renderSocialImage } from '../../lib/render-social-image';
import { SOCIAL_IMAGE_TYPE, type SocialImageArticle } from '../../lib/social-image';

export const prerender = true;

export const getStaticPaths = (async () => {
	const posts = await getCollection('blog');
	return posts.map((post) => ({
		params: { slug: post.id },
		props: {
			article: { id: post.id, title: post.data.title, category: post.data.category, pubDate: post.data.pubDate },
		},
	}));
}) satisfies GetStaticPaths;

export const GET = (async ({ props }) => {
	const png = await renderSocialImage(props.article as SocialImageArticle);
	return new Response(new Uint8Array(png), {
		headers: { 'Content-Type': SOCIAL_IMAGE_TYPE },
	});
}) satisfies APIRoute;
