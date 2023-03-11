import { existsSync } from 'fs';
import { execa } from 'execa';
import { rimraf } from 'rimraf';

export async function initSimpleGitHooks() {
  const huskyDir = `${process.cwd()}/.husky`;
  const existHusky = existsSync(huskyDir);

  if (existHusky) {
    await rimraf('.husky');
    await execa('git', ['config', 'core.hooksPath', '.git/hooks/'], { stdio: 'inherit' });
  }

  await rimraf('.git/hooks');
  await execa('npx', ['simple-git-hooks'], { stdio: 'inherit' });
}
