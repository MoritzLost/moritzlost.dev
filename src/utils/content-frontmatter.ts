import { execSync } from 'child_process';

export function publishedDate() {
    return function (_: any, file: any) {
        const filepath = file.history[0];
        const filename = filepath.split('/').slice(-1)[0];
        const result = filename.match(/^\d{4}-\d{2}-\d{2}/);
        if (!result) return;

        file.data.astro.frontmatter.publishedDate = result[0];
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
