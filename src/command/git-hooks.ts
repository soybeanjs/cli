import { existsSync } from 'fs';
import { execCommand } from '../shared';
import { rimraf } from 'rimraf';

export async function initSimpleGitHooks() {
  const huskyDir = `${process.cwd()}/.husky`;
  const existHusky = existsSync(huskyDir);

  if (existHusky) {
    await rimraf('.husky');
    await execCommand('git', ['config', 'core.hooksPath', '.git/hooks/'], { stdio: 'inherit' });
  }

  await rimraf('.git/hooks');
  await execCommand('npx', ['simple-git-hooks'], { stdio: 'inherit' });
}
