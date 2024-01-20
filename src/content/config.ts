import { z, defineCollection, reference } from 'astro:content';
import { fetchGitHubRepository } from '@utils/github';

export const collections = {
    articles: defineCollection({
        type: 'content',
        schema: z.object({
            title: z.string(),
            disclaimerNoAI: z.boolean().default(true),
        }),
    }),
    repositories: defineCollection({
        type: 'data',
        schema: z.object({
            github: z.string().transform(async repository => fetchGitHubRepository(repository)),
        }),
    }),
    projects: defineCollection({
        type: 'content',
        schema: z.object({
            title: z.string(),
            tags: z.array(z.string()).default([]),
            repositories: z.array(reference('repositories')),
        }),
    }),
};
