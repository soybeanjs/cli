import { execCommand } from '../shared';

export async function ncu(args: string[] = ['--deep', '-u']) {
  await execCommand('pnpm', ['npm-check-updates', ...args], { stdio: 'inherit' });
}
