import { existsSync } from 'fs';
import { execCommand } from '../shared';
import { rimraf } from 'rimraf';

export async function initSimpleGitHooks(cwd = process.cwd()) {
  const huskyDir = `${cwd}/.husky`;
  const existHusky = existsSync(huskyDir);

  if (existHusky) {
    await rimraf(huskyDir);
    await execCommand('git', ['config', 'core.hooksPath', `${cwd}/.git/hooks/`], { stdio: 'inherit' });
  }

  await rimraf(`${cwd}/.git/hooks`);
  await execCommand('npx', ['simple-git-hooks'], { stdio: 'inherit' });
}
