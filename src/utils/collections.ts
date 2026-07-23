import { getCollection, type CollectionEntry } from 'astro:content';
import { revisionHistory } from './git';

const getDateFromFilepath = (filepath: string): Date => {
    const filename = filepath.split('/').slice(-1)[0];
    const result = filename.match(/^\d{4}-\d{2}-\d{2}/);
    if (!result) throw new Error(`No date found in filename: ${filename}`);
    return new Date(result[0]);
};

export const computeArticle = (article: CollectionEntry<'articles'>) => {
    article.data.date = getDateFromFilepath(article.filePath!);
    article.data.revisionHistory = revisionHistory(article.filePath!);
    return article;
};

export const computeArticles = async (): Promise<CollectionEntry<'articles'>[]> => {
    const articles = await getCollection('articles');
    return articles
        .map(computeArticle)
        .filter(article => {
            if (import.meta.env.DEV) {
                return true;
            }
            return article.data.date!.valueOf() <= Date.now();
        })
        .sort((a, b) => {
            return b.data.date!.valueOf() - a.data.date!.valueOf();
        });
};

export const computeAppearances = async (): Promise<CollectionEntry<'appearances'>[]> => {
    const appearances = await getCollection('appearances');
    return appearances
        .map(appearance => {
            const date = getDateFromFilepath(appearance.filePath!);
            appearance.data.date = date;
            return appearance;
        })
        .sort((a, b) => {
            return b.data.date!.valueOf() - a.data.date!.valueOf();
        });
};

export const computeProjects = async (): Promise<CollectionEntry<'projects'>[]> => {
    const projects = await getCollection('projects');
    return projects.sort((a, b) => a.data.order - b.data.order);
};
