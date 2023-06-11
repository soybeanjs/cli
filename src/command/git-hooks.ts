import path from 'path';
import { existsSync } from 'fs';
import { execCommand } from '../shared';
import { rimraf } from 'rimraf';

export async function initSimpleGitHooks(cwd = process.cwd()) {
  const huskyDir = path.join(cwd, '.husky');
  const existHusky = existsSync(huskyDir);

  const gitHooksDir = path.join(cwd, '.git/hooks');

  if (existHusky) {
    await rimraf(huskyDir);

    await execCommand('git', ['config', 'core.hooksPath', gitHooksDir], { stdio: 'inherit' });
  }

  await rimraf(gitHooksDir);
  await execCommand('npx', ['simple-git-hooks'], { stdio: 'inherit' });
}
