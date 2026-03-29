import { validateJOBL } from './jobl/schema';

export interface RepoConfig {
  repoUrl: string;
  repoPath: string;
  repoBranch?: string;
}

/**
 * Converts various Git repo URL formats to raw content URLs
 * Supports GitHub and GitLab public repos
 */
export function buildRawContentUrl(config: RepoConfig): string {
  const { repoUrl, repoPath, repoBranch = 'main' } = config;

  // GitHub: https://github.com/user/repo -> https://raw.githubusercontent.com/user/repo/branch/path
  const githubMatch = repoUrl.match(/github\.com[\/:]([^\/]+)\/([^\/\.]+)(\.git)?/);
  if (githubMatch) {
    const [, owner, repo] = githubMatch;
    const cleanPath = repoPath.startsWith('/') ? repoPath.slice(1) : repoPath;
    return `https://raw.githubusercontent.com/${owner}/${repo}/${repoBranch}/${cleanPath}`;
  }

  // GitLab: https://gitlab.com/user/repo -> https://gitlab.com/user/repo/-/raw/branch/path
  const gitlabMatch = repoUrl.match(/gitlab\.com[\/:]([^\/]+)\/([^\/\.]+)(\.git)?/);
  if (gitlabMatch) {
    const [, owner, repo] = gitlabMatch;
    const cleanPath = repoPath.startsWith('/') ? repoPath.slice(1) : repoPath;
    return `https://gitlab.com/${owner}/${repo}/-/raw/${repoBranch}/${cleanPath}`;
  }

  throw new Error('Unsupported repository URL format. Only GitHub and GitLab public repos are supported.');
}

export interface SyncResult {
  success: boolean;
  joblContent?: unknown;
  error?: string;
}

/**
 * Fetches and validates JOBL content from a git repository
 */
export async function syncFromRepo(config: RepoConfig): Promise<SyncResult> {
  try {
    const rawUrl = buildRawContentUrl(config);

    const response = await fetch(rawUrl);
    if (!response.ok) {
      if (response.status === 404) {
        return {
          success: false,
          error: `File not found: ${config.repoPath} in branch ${config.repoBranch || 'main'}`
        };
      }
      return {
        success: false,
        error: `Failed to fetch file: HTTP ${response.status}`
      };
    }

    const text = await response.text();
    let joblContent: unknown;

    try {
      joblContent = JSON.parse(text);
    } catch (parseError) {
      return {
        success: false,
        error: 'File is not valid JSON'
      };
    }

    // Validate JOBL schema
    const validation = validateJOBL(joblContent);
    if (!validation.valid) {
      return {
        success: false,
        error: `Invalid JOBL format: ${validation.errors?.join(', ') || 'Unknown validation error'}`
      };
    }

    return {
      success: true,
      joblContent
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * Extracts a friendly name from JOBL content for display
 */
export function extractResumeTitle(joblContent: unknown): string {
  if (typeof joblContent !== 'object' || !joblContent) {
    return 'Untitled';
  }

  const jobl = joblContent as Record<string, unknown>;
  const person = jobl.person as Record<string, unknown> | undefined;

  if (person && typeof person.name === 'string' && person.name) {
    return person.name;
  }

  return 'Untitled';
}
