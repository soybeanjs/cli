import { execCommand } from '../shared';

export async function ncu(args: string[] = ['-u', '-w']) {
  const finalArgs = args.length > 0 ? args : ['-u', '-w'];
  await execCommand('pnpm', ['npm-check-updates', ...finalArgs], { stdio: 'inherit' });
}
