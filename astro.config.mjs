import { defineConfig, envField } from 'astro/config';
import { publishedDate, revisionHistory } from './src/utils/content-frontmatter';

export default defineConfig({
    site: 'https://moritzlost.dev',
    markdown: {
        remarkPlugins: [publishedDate, revisionHistory],
    },
    env: {
        schema: {
            GITHUB_ACCESS_TOKEN: envField.string({ context: 'server', access: 'secret' }),
        },
    },
});
