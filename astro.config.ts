import { defineConfig, envField } from 'astro/config';
import { publishedDate, revisionHistory } from './src/utils/content-frontmatter';
import sitemap from '@astrojs/sitemap';
import { unified } from '@astrojs/markdown-remark';

export default defineConfig({
    site: 'https://moritzlost.dev',
    markdown: {
        processor: unified({
            remarkPlugins: [publishedDate, revisionHistory],
        }),
        shikiConfig: {
            theme: 'monokai',
        },
    },
    env: {
        schema: {
            GITHUB_ACCESS_TOKEN: envField.string({ context: 'server', access: 'secret' }),
        },
    },
    build: {
        inlineStylesheets: 'never',
    },
    integrations: [sitemap()],
});
