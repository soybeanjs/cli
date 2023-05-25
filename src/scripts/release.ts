import { execa } from 'execa';

export async function release() {
  await execa('npx', ['changelogen', '--release --push --no-github']);
}
