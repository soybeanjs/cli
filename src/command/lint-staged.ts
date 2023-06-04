import { execCommand } from '../shared';

export function lintStaged() {
  execCommand('npx', ['lint-staged', '--config', '@soybeanjs/cli/lint-staged'], { stdio: 'inherit' });
}
