export interface GitCommitAuthor {
  name: string;
  email: string;
}

export interface RawGitCommit {
  message: string;
  body: string;
  shortHash: string;
  author: GitCommitAuthor;
}

export interface Reference {
  type: 'hash' | 'issue' | 'pull-request';
  value: string;
}

export interface AuthorInfo extends GitCommitAuthor {
  commits: string[];
  login: string;
}

export interface GitCommit extends RawGitCommit {
  description: string;
  type: string;
  scope: string;
  references: Reference[];
  authors: GitCommitAuthor[];
  resolvedAuthors: AuthorInfo[];
  isBreaking: boolean;
}

export type SemverBumpType = 'major' | 'premajor' | 'minor' | 'preminor' | 'patch' | 'prepatch' | 'prerelease';

export interface GithubConfig {
  repo: string;
  token: string;
}

export interface ChangelogOption {
  cwd: string;
  types: Record<string, { title: string; semver?: SemverBumpType }>;
  scopeMap: Record<string, string>;
  github: GithubConfig;
  from: string;
  to: string;
  tags: string[];
  tagDateMap: Map<string, string>;
  prerelease: boolean;
  capitalize: boolean;
  /**
   * Use emojis in section titles
   * @default true
   */
  emoji: boolean;
  titles: {
    breakingChanges: string;
  };
  /**
   * Nest commit messages under their scopes
   * @default true
   */
  group?: boolean | 'multiple';
  output: string;
  overrideChangelog: boolean;
  /** version from package.json, with preffix "v" */
  newVersion: string;
}
