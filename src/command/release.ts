import versionBumpp from 'bumpp';

export async function release() {
  await versionBumpp({
    files: ['**/package.json', '!**/node_modules'],
    execute: 'npx soy changelog',
    all: true,
    tag: true,
    commit: 'chore(projects): release v%s'
  });
}
