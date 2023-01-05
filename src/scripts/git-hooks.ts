import { $ } from 'zx';

export async function initSimpleGitHooks() {
  await $`pnpm rimraf .husky`;
  await $`git config core.hooksPath .git/hooks/`;
  await $`rimraf .git/hooks`;
  await $`pnpm simple-git-hooks`;
}
