import { readFile } from 'fs/promises';
import { generateChangelog, generateTotalChangelog } from '@soybeanjs/changelog';

export async function genChangelog(total = false) {
  let githubToken = '';

  try {
    const pkgJson = await readFile(`${process.cwd()}/package.json`, 'utf-8');
    const pkg = JSON.parse(pkgJson);
    githubToken = pkg?.['github-token'] || '';
  } catch {}

  if (total) {
    generateTotalChangelog({ github: { token: githubToken, repo: '' } });
  } else {
    generateChangelog({ github: { token: githubToken, repo: '' } });
  }
}
