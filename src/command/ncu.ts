import { execCommand } from '../shared';

export async function ncu(args: string[] = ['--deep', '-u']) {
  execCommand('pnpx', ['npm-check-updates', ...args], { stdio: 'inherit' });
}
