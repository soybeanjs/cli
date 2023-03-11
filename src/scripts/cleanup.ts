import { rimraf } from 'rimraf';

const pathStrs = ['node_modules', 'dist', 'package-lock.json', 'yarn.lock', 'pnpm-lock.yaml'];

export function cleanup() {
  rimraf(pathStrs);
}

export async function cleanupDeep() {
  const deepPathStrs = pathStrs.map(item => `./**/${item}`);

  const allPathStrs = pathStrs.concat(deepPathStrs);

  rimraf(allPathStrs);
}
