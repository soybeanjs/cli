import { execCommand } from '../shared';

export async function ncu(args: string[] = ['--deep', '-u']) {
  execCommand('npx', ['ncu', ...args], { stdio: 'inherit' });
}
