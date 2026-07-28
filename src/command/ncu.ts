import { execCommand } from '../shared';

export async function ncu(args: string[] = ['-u', '-w']) {
  await execCommand('pnpm', ['npm-check-updates', ...args], { stdio: 'inherit' });
}
