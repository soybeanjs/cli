import { execa } from 'execa';

export async function updatePkg() {
  execa('npx', ['ncu', '--deep', '-u'], { stdio: 'inherit' });
}
