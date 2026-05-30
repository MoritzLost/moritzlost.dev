import rss from '@astrojs/rss';
import type { APIRoute } from 'astro';
import { getArticlesInOrder } from '@utils/collections';

export const GET: APIRoute = async context => {
    const articles = await getArticlesInOrder();

    return rss({
        title: 'Moritz L’Hoest - Articles',
        description:
            'My occasionally incoherent and infrequent ramblings about web development and possibly other stuff, too.',
        site: context.site!,
        items: articles.map(post => ({
            title: post.data.title,
            pubDate: new Date(post.filePath!.split('/').pop()!.slice(0, 10)),
            description: post.data.description,
            link: `/articles/${post.id}/`,
        })),
        customData: `<language>en</language>`,
    });
};
