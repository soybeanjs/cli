import { existsSync } from 'fs';
import { readFile, writeFile } from 'fs/promises';
import dayjs from 'dayjs';
import { convert } from 'convert-gitmoji';
import { partition, groupBy, capitalize, join } from '../shared';
import type { Reference, GitCommit, ChangelogOption, AuthorInfo } from '../types';

function formatReferences(references: Reference[], github: string, type: 'issues' | 'hash'): string {
  const refs = references
    .filter(i => {
      if (type === 'issues') return i.type === 'issue' || i.type === 'pull-request';
      return i.type === 'hash';
    })
    .map(ref => {
      if (!github) return ref.value;
      if (ref.type === 'pull-request' || ref.type === 'issue')
        return `https://github.com/${github}/issues/${ref.value.slice(1)}`;
      return `[<samp>(${ref.value.slice(0, 5)})</samp>](https://github.com/${github}/commit/${ref.value})`;
    });

  const referencesString = join(refs).trim();

  if (type === 'issues') return referencesString && `in ${referencesString}`;
  return referencesString;
}

function formatLine(commit: GitCommit, options: ChangelogOption) {
  const prRefs = formatReferences(commit.references, options.github, 'issues');
  const hashRefs = formatReferences(commit.references, options.github, 'hash');

  let authors = join([...new Set(commit.resolvedAuthors.map(i => (i.login ? `@${i.login}` : `**${i.name}**`)))]).trim();

  if (authors) {
    authors = `by ${authors}`;
  }

  let refs = [authors, prRefs, hashRefs].filter(i => i?.trim()).join(' ');

  if (refs) {
    refs = `&nbsp;-&nbsp; ${refs}`;
  }

  const description = options.capitalize ? capitalize(commit.description) : commit.description;

  return [description, refs].filter(i => i?.trim()).join(' ');
}

function formatTitle(name: string, options: ChangelogOption) {
  const emojisRE =
    /([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g;

  let formatName = name.trim();

  if (!options.emoji) {
    formatName = name.replace(emojisRE, '').trim();
  }

  return `### &nbsp;&nbsp;&nbsp;${formatName}`;
}

function formatSection(commits: GitCommit[], sectionName: string, options: ChangelogOption) {
  if (!commits.length) return [];

  const lines: string[] = ['', formatTitle(sectionName, options), ''];

  const scopes = groupBy(commits, 'scope');
  let useScopeGroup = options.group;

  // group scopes only when one of the scope have multiple commits
  if (!Object.entries(scopes).some(([k, v]) => k && v.length > 1)) useScopeGroup = false;

  Object.keys(scopes)
    .sort()
    .forEach(scope => {
      let padding = '';
      let prefix = '';
      const scopeText = `**${options.scopeMap[scope] || scope}**`;
      if (scope && (useScopeGroup === true || (useScopeGroup === 'multiple' && scopes[scope].length > 1))) {
        lines.push(`- ${scopeText}:`);
        padding = '  ';
      } else if (scope) {
        prefix = `${scopeText}: `;
      }

      lines.push(...scopes[scope].reverse().map(commit => `${padding}- ${prefix}${formatLine(commit, options)}`));
    });

  return lines;
}

export function getGitUserAvatar(userName: string) {
  const avatarUrl = `https://github.com/${userName}.png?size=48`;

  return avatarUrl;
}

function createUserAvatar(userName: string) {
  const el = `<a href="https://github.com/${userName}" data-hovercard-type="user" data-hovercard-url="/users/yanbowe/hovercard" data-octo-click="hovercard-link-click" data-octo-dimensions="link_type:self">
  <img src="${getGitUserAvatar(
    userName
  )}" alt="@${userName}" size="32" height="32" width="32" data-view-component="true" class="avatar circle">
</a>`;

  return el;
}

export function generateMarkdown(params: {
  commits: GitCommit[];
  options: ChangelogOption;
  showTitle: boolean;
  contributors: AuthorInfo[];
}) {
  const { commits, options, showTitle, contributors } = params;

  const lines: string[] = [];

  const url = `https://github.com/${options.github}/compare/${options.from}...${options.to}`;

  if (showTitle) {
    const today = dayjs().format('YYYY-MM-DD');

    const title = `## [${options.to}](${url})(${today}})`;

    lines.push(title);
  }

  const [breaking, changes] = partition(commits, c => c.isBreaking);

  const group = groupBy(changes, 'type');

  lines.push(...formatSection(breaking, options.titles.breakingChanges!, options));

  for (const type of Object.keys(options.types)) {
    const items = group[type] || [];
    lines.push(...formatSection(items, options.types[type].title, options));
  }

  if (!lines.length) {
    lines.push('*No significant changes*');
  }

  if (!showTitle) {
    lines.push('', `##### &nbsp;&nbsp;&nbsp;&nbsp;[View changes on GitHub](${url})`);
  }

  if (showTitle) {
    lines.push('', '### ❤️ Contributors', '');

    const contributorLine = contributors.map(item => createUserAvatar(item.login)).join(' ');

    lines.push(contributorLine);
  }

  const md = convert(lines.join('\n').trim(), true);

  const markdown = md.replace(/&nbsp;/g, '');

  return markdown;
}

export async function writeMarkdown(md: string, mdPath: string) {
  let changelogMD: string;

  const changelogPrefix = '# Changelog';

  if (existsSync(mdPath)) {
    changelogMD = await readFile(mdPath, 'utf8');
    if (!changelogMD.startsWith(changelogPrefix)) {
      changelogMD = `${changelogPrefix}\n\n${changelogMD}`;
    }
  } else {
    changelogMD = `${changelogPrefix}\n\n`;
  }

  const lastEntry = changelogMD.match(/^###?\s+.*$/m);

  if (lastEntry) {
    changelogMD = `${changelogMD.slice(0, lastEntry.index) + md}\n\n${changelogMD.slice(lastEntry.index)}`;
  } else {
    changelogMD += `\n${md}\n\n`;
  }

  await writeFile(mdPath, changelogMD);
}
