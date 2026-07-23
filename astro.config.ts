import { defineConfig, envField } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
    site: 'https://moritzlost.dev',
    markdown: {
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
