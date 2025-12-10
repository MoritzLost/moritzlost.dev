import rss from '@astrojs/rss';
import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { sortArticlesByDatePrefix } from '@utils/sort-content';

export const GET: APIRoute = async context => {
    const articles = await getCollection('articles');
    const articlesSorted = sortArticlesByDatePrefix(articles);

    return rss({
        title: 'Moritz L’Hoest - Articles',
        description:
            'My occasionally incoherent and infrequent ramblings about web development and possibly other stuff, too.',
        site: context.site!,
        items: articlesSorted.map(post => ({
            title: post.data.title,
            pubDate: new Date(post.filePath!.split('/').pop()!.slice(0, 10)),
            description: post.data.description,
            link: `/articles/${post.id}/`,
        })),
        customData: `<language>en</language>`,
    });
};
