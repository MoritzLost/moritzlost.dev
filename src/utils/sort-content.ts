import type { CollectionEntry } from 'astro:content';

export const sortArticlesByDatePrefix = (articles: CollectionEntry<'articles'>[]) =>
    [...articles].sort((a, b) => {
        const filenameA = a.filePath!.split('/').pop()!;
        const filenameB = b.filePath!.split('/').pop()!;
        const dateA = filenameA.slice(0, 10);
        const dateB = filenameB.slice(0, 10);

        return new Date(dateB).valueOf() - new Date(dateA).valueOf();
    });
