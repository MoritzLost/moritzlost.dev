import { execSync } from 'child_process';
import { getDateFromFilepath } from './dates';

export function publishedDate() {
    return function (_: any, file: any) {
        const filepath = file.history[0];
        try {
            const date = getDateFromFilepath(filepath);
            file.data.astro.frontmatter.publishedDate = date;
        } catch {
            return;
        }
    };
}

export function revisionHistory() {
    return function (_: any, file: any) {
        const filepath = file.history[0];
        const modificationTimes = execSync(`git log --pretty="format:%cI" "${filepath}"`)
            .toString()
            .split(/[\n\r]/);
        const modificationMessages = execSync(`git log --pretty="format:%s" "${filepath}"`)
            .toString()
            .split(/[\n\r]/);

        const history = modificationTimes.map((date, index) => ({
            date,
            message: modificationMessages[index],
        }));

        file.data.astro.frontmatter.revisionHistory = history;
    };
}
