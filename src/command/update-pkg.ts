import { execCommand } from '../shared';

export async function updatePkg() {
  execCommand('npx', ['ncu', '--deep', '-u'], { stdio: 'inherit' });
}
