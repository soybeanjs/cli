import { execa } from 'execa';

export async function release() {
  await execa('npx', [
    'bumpp',
    '**/package.json',
    '!**/node_modules',
    '--execute="npx soy changelog"',
    '--all',
    '--tag',
    '--commit="chore(projects): release v%s"'
  ]);
}
