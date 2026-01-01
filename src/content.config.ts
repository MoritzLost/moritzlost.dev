import { z, defineCollection, reference } from 'astro:content';
import { glob } from 'astro/loaders';
import { fetchGitHubRepository } from '@utils/github';
import repositories from './content/repositories.json';
import type { Octokit } from 'octokit';

type RepositoryData = Awaited<ReturnType<Octokit['rest']['repos']['get']>>['data'];

export const collections = {
    appearances: defineCollection({
        loader: glob({
            pattern: '*.md',
            base: './src/content/appearances',
            generateId: ({ entry }) => entry.replace(/^\d{4}-\d{2}-\d{2}-/, '').replace(/\.md$/, ''),
        }),
        schema: z.object({
            title: z.string(),
            links: z.array(
                z.object({
                    title: z.string(),
                    url: z.string().url(),
                }),
            ),
        }),
    }),
    articles: defineCollection({
        loader: glob({
            pattern: '*.md',
            base: './src/content/articles',
            generateId: ({ entry }) => entry.replace(/^\d{4}-\d{2}-\d{2}-/, '').replace(/\.md$/, ''),
        }),
        schema: z.object({ title: z.string(), description: z.string() }),
    }),
    projects: defineCollection({
        loader: glob({ pattern: '*.md', base: './src/content/projects' }),
        schema: z.object({
            title: z.string(),
            tags: z.array(z.string()),
            repositories: z.array(reference('repositories')),
            website: z.string().url().optional(),
            order: z.number(),
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
        schema: z.object({
            github: z.custom<RepositoryData>(val => {
                return val !== null && typeof val === 'object';
            }),
        }),
    }),
};
