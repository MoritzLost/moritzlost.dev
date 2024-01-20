import { Octokit } from "octokit";

export const fetchGitHubRepository = async (repository: string) => {
    const octokit = new Octokit({
        auth: import.meta.env.GITHUB_ACCESS_TOKEN,
        timeZone: 'Europe/Berlin',
    });
    const [owner, repo] = repository.split('/');
    const { data } = await octokit.rest.repos.get({
        owner,
        repo,
    });
    return data;
}
