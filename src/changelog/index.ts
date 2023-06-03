import { readFile } from 'fs/promises';
import {
  getLastGitTag,
  getCurrentGitBranch,
  getGitHubRepo,
  isPrerelease,
  getFirstGitCommit,
  getGitCommits,
  getGitCommitsAndResolvedAuthors
} from './git';
import { generateMarkdown, writeMarkdown } from './markdown';
import type { ChangelogOption } from '../types';

function createDefaultOptions() {
  const cwd = process.cwd();

  const options: ChangelogOption = {
    cwd,
    types: {
      feat: { title: '🚀 Features' },
      fix: { title: '🐞 Bug Fixes' },
      perf: { title: '🔥 Performance' },
      refactor: { title: '💅 Refactors' },
      docs: { title: '📖 Documentation' },
      build: { title: '📦 Build' },
      types: { title: '🌊 Types' },
      chore: { title: '🏡 Chore' },
      examples: { title: '🏀 Examples' },
      test: { title: '✅ Tests' },
      style: { title: '🎨 Styles' },
      ci: { title: '🤖 CI' }
    },
    scopeMap: {},
    github: '',
    githubToken: process.env.GITHUB_TOKEN || '',
    from: '',
    to: '',
    prerelease: false,
    capitalize: true,
    emoji: true,
    titles: {
      breakingChanges: '🚨 Breaking Changes'
    },
    output: 'CHANGELOG1.md'
  };

  return options;
}

async function getGithubTokenFromPkg(cwd: string) {
  let githubToken = '';

  try {
    const pkgJson = await readFile(`${cwd}/package.json`, 'utf-8');
    const pkg = JSON.parse(pkgJson);
    githubToken = pkg?.['github-token'] || '';
  } catch {}

  return githubToken;
}

export async function initOptions() {
  const options = createDefaultOptions();

  const githubToken = await getGithubTokenFromPkg(options.cwd);
  options.githubToken = options.githubToken || githubToken;
  options.from = await getLastGitTag();
  options.to = await getCurrentGitBranch();
  options.github = await getGitHubRepo();
  options.prerelease = isPrerelease(options.to);

  if (options.to === options.from) {
    const lastTag = await getLastGitTag(-1);
    const firstCommit = await getFirstGitCommit();

    options.from = lastTag || firstCommit;
  }

  return options;
}

/**
 * 根据git commit message生成CHANGELOG.md
 */
export async function generateChangelog() {
  const options = await initOptions();
  const gitCommits = await getGitCommits(options.from, options.to, options.scopeMap);
  const { commits, contributors } = await getGitCommitsAndResolvedAuthors(
    gitCommits,
    options.github,
    options.githubToken
  );
  const md = generateMarkdown({ commits, options, showTitle: true, contributors });
  writeMarkdown(md, options.output);
}
