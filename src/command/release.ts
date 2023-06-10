export async function release() {
  const { versionBump } = await import('bumpp');

  await versionBump({
    files: ['**/package.json', '!**/node_modules'],
    execute: 'npx soy changelog',
    all: true,
    tag: true,
    commit: 'chore(projects): release v%s',
    push: true
  });
}
