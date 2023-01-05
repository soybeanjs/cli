import { $ } from 'zx';

export async function cleanup() {
  await $`pnpm rimraf node_modules ./**/node_modules dist ./**/dist pnpm-lock.yaml ./**/pnpm-lock.yaml`;
}
