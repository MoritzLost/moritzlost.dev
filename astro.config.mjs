import { defineConfig } from 'astro/config';
import { publishedDate, revisionHistory } from './src/utils/content-frontmatter';
import { loadEnv } from 'vite';

const { SITE_URL } = loadEnv(process.env.NODE_ENV, process.cwd(), '');

export default defineConfig({
    site: SITE_URL,
    markdown: {
        remarkPlugins: [revisionHistory, publishedDate],
    },
});
