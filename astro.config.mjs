// @ts-check

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { defineConfig, fontProviders } from 'astro/config';
import { blogLastModified } from './src/lib/sitemap.mjs';
import { satteri } from '@astrojs/markdown-satteri';
import { responsiveMarkdownImages } from './src/lib/markdown-images.mjs';

const site = 'https://putl.online';
const articleDates = await blogLastModified(new URL('./src/content/blog/', import.meta.url), site);

// https://astro.build/config
export default defineConfig({
	site,
	markdown: { processor: satteri({ hastPlugins: [responsiveMarkdownImages] }) },
	integrations: [mdx(), sitemap({
		filter: (page) => !/^\/(?:404(?:\.html)?\/?$|og(?:\/|$))/.test(new URL(page).pathname),
		serialize: (item) => {
			const lastmod = articleDates.get(new URL(item.url).pathname);
			return lastmod ? { ...item, lastmod } : item;
		},
	})],
	image: {
		layout: 'constrained',
		responsiveStyles: false,
		breakpoints: [320, 480, 768, 1024, 1536],
	},
	fonts: [
		{
			provider: fontProviders.local(),
			name: 'Atkinson',
			cssVariable: '--font-atkinson',
			fallbacks: ['sans-serif'],
			options: {
				variants: [
					{
						src: ['./src/assets/fonts/atkinson-regular.woff'],
						weight: 400,
						style: 'normal',
						display: 'swap',
					},
					{
						src: ['./src/assets/fonts/atkinson-bold.woff'],
						weight: 700,
						style: 'normal',
						display: 'swap',
					},
				],
			},
		},
	],
});
