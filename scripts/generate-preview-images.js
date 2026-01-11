import path from 'path';
import { mkdir } from 'fs/promises';
import { glob } from 'glob';
import puppeteer from 'puppeteer';
import sharp from 'sharp';

const IMAGE_WIDTH = 1200;
const IMAGE_HEIGHT = 630;
const TARGET_DIR = './public/preview/';

await mkdir(TARGET_DIR, { recursive: true });

const articles = await glob('./src/content/articles/*.md', { withFileTypes: true });

const browser = await puppeteer.launch({
    headless: true,
});

const screenshots = articles.map(async file => {
    const slug = file.name.replace('.md', '').substring(11);
    const url = `http://localhost:4321/articles/${slug}/preview/`;

    const page = await browser.newPage();
    await page.setViewport({
        width: IMAGE_WIDTH,
        height: IMAGE_HEIGHT,
        deviceScaleFactor: 2,
    });

    await page.goto(url, { waitUntil: 'networkidle0' });

    const screenshot = await page.screenshot({
        type: 'png',
    });
    await page.close();

    await sharp(screenshot)
        .png({ quality: 80, compressionLevel: 9 })
        .toFile(path.join(TARGET_DIR, `${slug}.png`));
});

await Promise.allSettled(screenshots);
await browser.close();
