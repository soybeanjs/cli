import cliProgress from 'cli-progress';
import { readFile } from 'fs/promises';
import {
  getTotalGitTags,
  getTagDateMap,
  getLastGitTag,
  getFromToTags,
  getCurrentGitBranch,
  getGitHubRepo,
  isPrerelease,
  getFirstGitCommit,
  getGitCommits,
  getGitCommitsAndResolvedAuthors
} from './git';
import { isVersionInMarkdown, generateMarkdown, writeMarkdown } from './markdown';
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
    github: {
      repo: '',
      token: process.env.GITHUB_TOKEN || ''
    },
    from: '',
    to: '',
    tags: [],
    tagDateMap: new Map(),
    prerelease: false,
    capitalize: true,
    emoji: true,
    titles: {
      breakingChanges: '🚨 Breaking Changes'
    },
    output: 'CHANGELOG.md',
    overrideChangelog: false,
    newVersion: ''
  };

  return options;
}

async function getOptionsFromPkg(cwd: string) {
  let githubToken = '';
  let newVersion = '';

  try {
    const pkgJson = await readFile(`${cwd}/package.json`, 'utf-8');
    const pkg = JSON.parse(pkgJson);
    githubToken = pkg?.['github-token'] || '';
    newVersion = pkg?.version || '';
  } catch {}

  return {
    githubToken,
    newVersion
  };
}

export async function initOptions() {
  const options = createDefaultOptions();

  const { githubToken, newVersion } = await getOptionsFromPkg(options.cwd);

  options.github.token ||= githubToken;
  options.github.repo = await getGitHubRepo();

  options.newVersion ||= `v${newVersion}`;
  options.from ||= await getLastGitTag();
  options.to ||= await getCurrentGitBranch();

  if (options.to === options.from) {
    const lastTag = await getLastGitTag(-1);
    const firstCommit = await getFirstGitCommit();
    options.from = lastTag || firstCommit;
  }

  options.tags = await getTotalGitTags();

  options.tagDateMap = await getTagDateMap();

  options.prerelease = isPrerelease(options.to);

  return options;
}

async function generateChangelogByTag(options: ChangelogOption) {
  const gitCommits = await getGitCommits(options.from, options.to, options.scopeMap);
  const { commits, contributors } = await getGitCommitsAndResolvedAuthors(gitCommits, options.github);
  const md = generateMarkdown({ commits, options, showTitle: true, contributors });
  return md;
}

async function generateChangelogByTags(options: ChangelogOption) {
  const tags = getFromToTags(options.tags);

  const bar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
  bar.start(tags.length, 0);

  let md = '';

  const resolvedLogins = new Map<string, string>();

  for await (const [index, tag] of tags.entries()) {
    const { from, to } = tag;
    const gitCommits = await getGitCommits(from, to, options.scopeMap);
    const { commits, contributors } = await getGitCommitsAndResolvedAuthors(gitCommits, options.github, resolvedLogins);
    const opts = { ...options, from, to };
    const nextMd = generateMarkdown({ commits, options: opts, showTitle: true, contributors });

    md = `${nextMd}\n\n${md}`;

    bar.update(index + 1);
  }

  bar.stop();

  return md;
}

/**
 * 根据git commit message生成CHANGELOG.md
 */
export async function generateChangelog(total = false) {
  const options = await initOptions();

  let md = '';

  if (total) {
    md = await generateChangelogByTags(options);
    await writeMarkdown(md, options.output, true);
    return;
  }

  const isIn = await isVersionInMarkdown(options.to, options.output);

  if (!options.overrideChangelog && isIn) {
    return;
  }

  md = await generateChangelogByTag(options);
  await writeMarkdown(md, options.output, false);
}
