import { z, defineCollection, reference } from 'astro:content';
import { glob } from 'astro/loaders';
import { fetchGitHubRepository } from '@utils/github';
import repositories from './content/repositories.json';

export const collections = {
    articles: defineCollection({
        loader: glob({
            pattern: '*.md',
            base: './src/content/articles',
            generateId: ({ entry }) => entry.replace(/^\d{4}-\d{2}-\d{2}-/, '').replace(/\.md$/, ''),
        }),
        schema: z.object({ title: z.string(), disclaimerNoAI: z.boolean().default(true) }),
    }),
    projects: defineCollection({
        loader: glob({ pattern: '*.md', base: './src/content/projects' }),
        schema: z.object({
            title: z.string(),
            tags: z.array(z.string()).default([]),
            repositories: z.array(reference('repositories')),
        }),
    }),
    repositories: defineCollection({
        loader: async () => {
            const githubPromises = repositories.map(async (repository: string) => fetchGitHubRepository(repository));
            const github = await Promise.all(githubPromises);
            return repositories.map((repository, i) => ({
                id: repository,
                github: github[i],
            }));
        },
    }),
};
