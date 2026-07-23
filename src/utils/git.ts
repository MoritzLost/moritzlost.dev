import { execSync } from 'child_process';

export function revisionHistory(filepath: string) {
    const modificationTimes = execSync(`git log --pretty="format:%cI" "${filepath}"`)
        .toString()
        .split(/[\n\r]/);
    const modificationMessages = execSync(`git log --pretty="format:%s" "${filepath}"`)
        .toString()
        .split(/[\n\r]/);

    return modificationTimes.map((date, index) => ({
        date,
        message: modificationMessages[index],
    }));
}
