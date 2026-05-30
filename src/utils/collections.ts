import { getCollection, type CollectionEntry } from 'astro:content';
import { getDateFromFilepath } from '@utils/dates';

export const getArticlesInOrder = async (): Promise<CollectionEntry<'articles'>[]> => {
    const articles = await getCollection('articles');
    return articles
        .filter(article => {
            if (import.meta.env.DEV) {
                return true;
            }
            const filename = article.filePath!.split('/').pop()!;
            const date = filename.slice(0, 10);
            return new Date(date).valueOf() <= Date.now();
        })
        .sort((a, b) => {
            const filenameA = a.filePath!.split('/').pop()!;
            const filenameB = b.filePath!.split('/').pop()!;
            const dateA = filenameA.slice(0, 10);
            const dateB = filenameB.slice(0, 10);
            return new Date(dateB).valueOf() - new Date(dateA).valueOf();
        });
};

export const getAppearancesInOrder = async (): Promise<CollectionEntry<'appearances'>[]> => {
    const appearances = await getCollection('appearances');
    return appearances.sort((a, b) => {
        const dateA = getDateFromFilepath(a.filePath!);
        const dateB = getDateFromFilepath(b.filePath!);
        return dateB.getTime() - dateA.getTime();
    });
};

export const getProjectsInOrder = async (): Promise<CollectionEntry<'projects'>[]> => {
    const projects = await getCollection('projects');
    return projects.sort((a, b) => a.data.order - b.data.order);
};
