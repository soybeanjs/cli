import { ofetch } from 'ofetch';
import { execCommand, notNullish } from '../shared';
import type { RawGitCommit, GitCommit, GitCommitAuthor, Reference, AuthorInfo } from '../types';

export async function getTotalGitTags() {
  const tagStr = await execCommand('git', ['--no-pager', 'tag', '-l', '--sort=creatordate']);

  const tags = tagStr.split('\n');

  return tags;
}

export function getFromToTags(tags: string[]) {
  const result: { from: string; to: string }[] = [];

  tags.forEach((tag, index) => {
    if (index < tags.length - 1) {
      result.push({ from: tag, to: tags[index + 1] });
    }
  });

  return result;
}

export async function getLastGitTag(delta = 0) {
  const tags = await getTotalGitTags();

  return tags[tags.length + delta - 1];
}

async function getGitMainBranchName() {
  const main = await execCommand('git', ['rev-parse', '--abbrev-ref', 'HEAD']);

  return main;
}

export async function getCurrentGitBranch() {
  const tag = await execCommand('git', ['tag', '--points-at', 'HEAD']);
  const main = getGitMainBranchName();

  return tag || main;
}

export async function getGitHubRepo() {
  const url = await execCommand('git', ['config', '--get', 'remote.origin.url']);
  const match = url.match(/github\.com[/:]([\w\d._-]+?)\/([\w\d._-]+?)(\.git)?$/i);
  if (!match) {
    throw new Error(`Can not parse GitHub repo from url ${url}`);
  }
  return `${match[1]}/${match[2]}`;
}

export function isPrerelease(version: string) {
  const REG = /^[^.]*[\d.]+$/;

  return !REG.test(version);
}

export function getFirstGitCommit() {
  return execCommand('git', ['rev-list', '--max-parents=0', 'HEAD']);
}

async function getGitDiff(from?: string, to = 'HEAD'): Promise<RawGitCommit[]> {
  // https://git-scm.com/docs/pretty-formats
  const rawGit = await execCommand('git', [
    '--no-pager',
    'log',
    `${from ? `${from}...` : ''}${to}`,
    '--pretty="----%n%s|%h|%an|%ae%n%b"',
    '--name-status'
  ]);

  const rwaGitLines = rawGit.split('----\n').splice(1);

  const gitCommits = rwaGitLines.map(line => {
    const [firstLine, ...body] = line.split('\n');
    const [message, shortHash, authorName, authorEmail] = firstLine.split('|');
    const gitCommmit: RawGitCommit = {
      message,
      shortHash,
      author: { name: authorName, email: authorEmail },
      body: body.join('\n')
    };
    return gitCommmit;
  });

  return gitCommits;
}

function parseGitCommit(commit: RawGitCommit, scopeMap: Record<string, string>): GitCommit | null {
  // https://www.conventionalcommits.org/en/v1.0.0/
  // https://regex101.com/r/FSfNvA/1
  const ConventionalCommitRegex = /(?<type>[a-z]+)(\((?<scope>.+)\))?(?<breaking>!)?: (?<description>.+)/i;
  const CoAuthoredByRegex = /co-authored-by:\s*(?<name>.+)(<(?<email>.+)>)/gim;
  const PullRequestRE = /\([a-z]*(#\d+)\s*\)/gm;
  const IssueRE = /(#\d+)/gm;

  const match = commit.message.match(ConventionalCommitRegex);

  if (!match?.groups) {
    return null;
  }

  const type = match.groups.type;

  let scope = match.groups.scope || '';
  scope = scopeMap[scope] || scope;

  const isBreaking = Boolean(match.groups.breaking);
  let description = match.groups.description;

  // Extract references from message
  const references: Reference[] = [];
  for (const m of description.matchAll(PullRequestRE)) {
    references.push({ type: 'pull-request', value: m[1] });
  }
  for (const m of description.matchAll(IssueRE)) {
    if (!references.some(i => i.value === m[1])) {
      references.push({ type: 'issue', value: m[1] });
    }
  }
  references.push({ value: commit.shortHash, type: 'hash' });

  // Remove references and normalize
  description = description.replace(PullRequestRE, '').trim();

  // Find all authors
  const authors: GitCommitAuthor[] = [commit.author];

  const matchs = commit.body.matchAll(CoAuthoredByRegex);

  for (const $match of matchs) {
    const { name = '', email = '' } = $match.groups || {};

    const author: GitCommitAuthor = {
      name: name.trim(),
      email: email.trim()
    };

    authors.push(author);
  }

  return {
    ...commit,
    authors,
    resolvedAuthors: [],
    description,
    type,
    scope,
    references,
    isBreaking
  };
}

export async function getGitCommits(from?: string, to = 'HEAD', scopeMap: Record<string, string> = {}) {
  const rwaGitCommits = await getGitDiff(from, to);
  const commits = rwaGitCommits.map(commit => parseGitCommit(commit, scopeMap)).filter(notNullish);

  return commits;
}

function getHeaders(githubToken: string) {
  return {
    accept: 'application/vnd.github.v3+json',
    authorization: `token ${githubToken}`
  };
}

async function getResolvedAuthorLogin(params: {
  github: string;
  githubToken: string;
  commitHashes: string[];
  email: string;
}) {
  const { github, githubToken, commitHashes, email } = params;

  let login = '';

  // token not provided, skip github resolving
  if (!githubToken) {
    return login;
  }

  try {
    const data = await ofetch(`https://api.github.com/search/users?q=${encodeURIComponent(email)}`, {
      headers: getHeaders(githubToken)
    });
    login = data.items[0].login;
  } catch {}

  if (login) {
    return login;
  }

  if (commitHashes.length) {
    try {
      const data = await ofetch(`https://api.github.com/repos/${github}/commits/${commitHashes[0]}`, {
        headers: getHeaders(githubToken)
      });
      login = data?.author?.login || '';
    } catch (e) {}
  }

  return login;
}

export async function getGitCommitsAndResolvedAuthors(commits: GitCommit[], github: string, githubToken: string) {
  const resultCommits: GitCommit[] = [];

  const map = new Map<string, AuthorInfo>();

  for (const commit of commits) {
    const resolvedAuthors: AuthorInfo[] = [];

    for (const [index, author] of Object.entries(commit.authors)) {
      const { email, name } = author;

      if (email && name) {
        const commitHashes: string[] = [];

        if (index === '0') {
          commitHashes.push(commit.shortHash);
        }

        const resolvedAuthor: AuthorInfo = {
          name,
          email,
          commits: commitHashes,
          login: ''
        };

        if (!map.has(email)) {
          // eslint-disable-next-line no-await-in-loop
          resolvedAuthor.login = await getResolvedAuthorLogin({ github, githubToken, commitHashes, email });

          map.set(author.email, resolvedAuthor);
        } else {
          const resolvedItem = map.get(author.email)!;
          Object.assign(resolvedAuthor, resolvedItem);
        }

        resolvedAuthors.push(resolvedAuthor);
      }
    }

    const resultCommit = { ...commit, resolvedAuthors };

    resultCommits.push(resultCommit);
  }

  return {
    commits: resultCommits,
    contributors: Array.from(map.values())
  };
}

getTotalGitTags();
