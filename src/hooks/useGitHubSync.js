import { useState } from 'react';
import { Octokit } from 'octokit';

/**
 * Hook to manage GitHub interactions: Fork -> Branch -> Commit -> PR
 */
export function useGitHubSync() {
    const [isSyncing, setIsSyncing] = useState(false);
    const [syncStatus, setSyncStatus] = useState(''); // e.g., 'Forking repository...', 'Creating PR...'
    const [error, setError] = useState(null);

    /**
     * Main function to propose changes
     * @param {string} token - GitHub Personal Access Token
     * @param {object} shipData - The JSON object to save
     * @param {string} commitMessage - Message for the commit
     * @param {string} targetOwner - Owner of the main repo (default: toki-sgr)
     * @param {string} targetRepo - Name of the main repo (default: KanToki)
     */
    const proposeChanges = async (token, shipData, commitMessage = 'Update ship data', targetOwner = 'toki-sgr', targetRepo = 'KanToki') => {
        setIsSyncing(true);
        setSyncStatus('Authenticating...');
        setError(null);

        try {
            // 1. Authenticate
            const octokit = new Octokit({ auth: token });
            const { data: user } = await octokit.rest.users.getAuthenticated();

            // 2. Fork Repository (Idempotent: returns existing fork if present)
            setSyncStatus(`Ensuring fork exists for ${user.login}...`);
            const { data: fork } = await octokit.rest.repos.createFork({
                owner: targetOwner,
                repo: targetRepo,
            });

            // wait a bit for fork to be ready if it was just created
            await new Promise(r => setTimeout(r, 2000));

            const forkOwner = fork.owner.login; // Should be user.login
            const forkRepo = fork.name;

            // 3. Get latest commit SHA from MAIN (upstream or origin? We usually want upstream main to base off)
            // Note: Ideally we sync the fork first, but for now let's assume fork main is close enough or use upstream SHA if possible.
            // Easiest path: Get SHA from TARGET repo's main branch to base our work off, 
            // but creating a branch on FORK requires the base SHA to exist on FORK.
            // So we must get SHA from FORK's main.

            // Better flow: Get SHA from Fork's main.
            setSyncStatus('Getting latest base commit...');
            const { data: refData } = await octokit.rest.git.getRef({
                owner: forkOwner,
                repo: forkRepo,
                ref: 'heads/main',
            });
            const latestCommitSha = refData.object.sha;

            // 4. Create a new Branch
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const branchName = `update-ships-${timestamp}`;
            setSyncStatus(`Creating branch ${branchName}...`);

            await octokit.rest.git.createRef({
                owner: forkOwner,
                repo: forkRepo,
                ref: `refs/heads/${branchName}`,
                sha: latestCommitSha,
            });

            // 5. Create Blob (File Content)
            setSyncStatus('Creating data blob...');
            const content = JSON.stringify(shipData, null, 2); // Pretty print
            const { data: blob } = await octokit.rest.git.createBlob({
                owner: forkOwner,
                repo: forkRepo,
                content: content,
                encoding: 'utf-8',
            });

            // 6. Create Tree (linking file path to blob)
            setSyncStatus('creating file tree...');
            const { data: tree } = await octokit.rest.git.createTree({
                owner: forkOwner,
                repo: forkRepo,
                base_tree: latestCommitSha,
                tree: [
                    {
                        path: 'src/data/ships.json',
                        mode: '100644',
                        type: 'blob',
                        sha: blob.sha,
                    },
                ],
            });

            // 7. Create Commit
            setSyncStatus('Wait for it...');
            const { data: newCommit } = await octokit.rest.git.createCommit({
                owner: forkOwner,
                repo: forkRepo,
                message: commitMessage,
                tree: tree.sha,
                parents: [latestCommitSha],
            });

            // 8. Update Branch Reference to point to new commit
            await octokit.rest.git.updateRef({
                owner: forkOwner,
                repo: forkRepo,
                ref: `heads/${branchName}`,
                sha: newCommit.sha,
            });

            // 9. Create Pull Request (From Fork:Branch -> Target:Main)
            setSyncStatus('Opening Pull Request...');
            const { data: pr } = await octokit.rest.pulls.create({
                owner: targetOwner,
                repo: targetRepo,
                title: commitMessage,
                head: `${forkOwner}:${branchName}`,
                base: 'main',
                body: `Automated data update submitted by ${user.login} via KanToki Web App.`,
            });

            setSyncStatus('Done! PR Created.');
            return pr.html_url;

        } catch (err) {
            console.error(err);
            setError(err.message || 'An unexpected error occurred');
            throw err;
        } finally {
            setIsSyncing(false);
        }
    };

    return {
        isSyncing,
        syncStatus,
        error,
        proposeChanges
    };
}
