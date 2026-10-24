/** Match the article's actual reading column instead of requesting viewport-wide images. */
export const articleImageSizes = '(max-width: 650px) calc(100vw - 50px), (max-width: 850px) calc(100vw - 84px), 766px';

/** @type {import('satteri').HastPluginDefinition} */
export const responsiveMarkdownImages = {
	name: 'responsive-article-images',
	element: {
		filter: ['img'],
		visit(node, ctx) {
			const src = node.properties?.src;
			if (typeof src !== 'string' || src.startsWith('/') || /^https?:/i.test(src)) return;
			if (/\.svg(?:[?#]|$)/i.test(src)) {
				// Vector diagrams already scale cleanly; do not generate duplicate SVG widths.
				ctx.setProperty(node, 'layout', 'none');
				return;
			}
			ctx.setProperty(node, 'layout', 'constrained');
			ctx.setProperty(node, 'sizes', articleImageSizes);
			ctx.setProperty(node, 'loading', 'lazy');
			ctx.setProperty(node, 'decoding', 'async');
		},
	},
};
