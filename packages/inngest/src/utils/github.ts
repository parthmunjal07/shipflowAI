import { App } from "octokit";
import { prisma } from "@repo/db";

export async function getOctokit(githubInstallationDbId: string) {
  const ghInstallation = await prisma.githubInstallation.findUnique({
    where: { id: githubInstallationDbId },
  });
  if (!ghInstallation) throw new Error(`GitHub Installation not found for ID: ${githubInstallationDbId}`);

  const appId = process.env.GITHUB_APP_ID;
  const privateKey = process.env.GITHUB_PRIVATE_KEY;
  if (!appId || !privateKey) {
    throw new Error("GITHUB_APP_ID or GITHUB_PRIVATE_KEY is missing from environment variables.");
  }

  const app = new App({ appId, privateKey });
  return await app.getInstallationOctokit(ghInstallation.installationId);
}

const LOCKFILE_PATTERNS = [
  "package-lock.json",
  "yarn.lock",
  "pnpm-lock.yaml",
  "Cargo.lock",
  "poetry.lock",
  "Gemfile.lock",
  "mix.lock"
];

function isLockfile(filename: string): boolean {
  return LOCKFILE_PATTERNS.some((pattern) => filename.endsWith(pattern));
}

export interface DiffFile {
  filename: string;
  status: string;
  additions: number;
  deletions: number;
  changes: number;
  patch?: string;
  contentFallback?: string;
  unreviewable?: boolean;
  unreviewableReason?: string;
  isLockfile?: boolean;
}

export interface PullRequestDiffResult {
  files: DiffFile[];
  hasUnreviewableFiles: boolean;
}

export async function fetchPullRequestDiff(
  githubInstallationDbId: string,
  owner: string,
  repo: string,
  pullNumber: number,
  headSha: string
): Promise<PullRequestDiffResult> {
  const octokit = await getOctokit(githubInstallationDbId);
  
  const files: DiffFile[] = [];
  let page = 1;
  const per_page = 100;

  // 1. Fetch all changed files via pagination
  while (true) {
    const response = await octokit.rest.pulls.listFiles({
      owner,
      repo,
      pull_number: pullNumber,
      per_page,
      page,
    });

    if (response.data.length === 0) break;

    for (const file of response.data) {
      const diffFile: DiffFile = {
        filename: file.filename,
        status: file.status,
        additions: file.additions,
        deletions: file.deletions,
        changes: file.changes,
      };

      if (isLockfile(file.filename)) {
        diffFile.isLockfile = true;
        diffFile.patch = "[Lockfile changed (dependency lockfile)]";
        files.push(diffFile);
        continue;
      }

      // If the file is not removed, and there is no patch (meaning it was too large or binary)
      if (file.status !== "removed" && !file.patch) {
        try {
          // Attempt fallback: fetch full file content
          const contentResp = await octokit.rest.repos.getContent({
            owner,
            repo,
            path: file.filename,
            ref: headSha,
          });

          if (!Array.isArray(contentResp.data) && contentResp.data.type === "file" && contentResp.data.content) {
            const decodedContent = Buffer.from(contentResp.data.content, "base64").toString("utf-8");
            
            // Check if it appears to be a binary file by looking for null bytes or strange chars
            // Simple heuristic: if we can't cleanly decode it as text, it's likely binary.
            // Buffer.toString('utf-8') on binary might produce  (replacement character)
            if (decodedContent.includes("\u0000")) {
               diffFile.unreviewable = true;
               diffFile.unreviewableReason = "File appears to be binary.";
            } else {
               diffFile.contentFallback = decodedContent;
            }
          } else {
            diffFile.unreviewable = true;
            diffFile.unreviewableReason = "Content API returned unexpected format or directory.";
          }
        } catch (error) {
          diffFile.unreviewable = true;
          diffFile.unreviewableReason = "Failed to fetch full file content fallback (potentially too large).";
        }
      } else {
        diffFile.patch = file.patch;
      }

      files.push(diffFile);
    }

    if (response.data.length < per_page) break;
    page++;
  }

  const hasUnreviewableFiles = files.some((f) => f.unreviewable);

  return {
    files,
    hasUnreviewableFiles,
  };
}
