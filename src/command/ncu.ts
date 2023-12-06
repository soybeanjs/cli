import { execCommand } from '../shared';

export async function ncu(args: string[] = ['--deep', '-u']) {
  await execCommand('npx', ['ncu', ...args], { stdio: 'inherit' });
}
