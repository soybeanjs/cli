import { $ } from 'zx';

export async function cleanup() {
  await $`pnpm rimraf node_modules dist package-lock.json yarn.lock pnpm-lock.yaml ./**/node_modules ./**/dist ./**/package-lock.json ./**/yarn.lock ./**/pnpm-lock.yaml`;
}
