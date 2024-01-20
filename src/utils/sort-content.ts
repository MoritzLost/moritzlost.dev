import type { CollectionEntry } from 'astro:content';

export const sortArticlesByDatePrefix = (articles: CollectionEntry<'articles'>[]) =>
    [...articles].sort((a, b) => {
        return new Date(b.id.slice(0, 10)).valueOf() - new Date(a.id.slice(0, 10)).valueOf();
    });
