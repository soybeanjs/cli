import { execa } from 'execa';

export function prettierFormat() {
  const formatFiles = [
    '!**/*.{js,jsx,mjs,cjs,json,ts,tsx,mts,cts,vue,svelte,astro}',
    '!*.min.*',
    '!CHANGELOG.md',
    '!dist',
    '!LICENSE*',
    '!output',
    '!coverage',
    '!public',
    '!temp',
    '!package-lock.json',
    '!pnpm-lock.yaml',
    '!yarn.lock',
    '!__snapshots__'
  ];

  execa('npx', ['prettier', '.', '--write', ...formatFiles], {
    stdio: 'inherit'
  });
}
