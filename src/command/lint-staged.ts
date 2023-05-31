import { execa } from 'execa';

export function lintStaged() {
  execa('npx', ['lint-staged', '--config', '@soybeanjs/cli/lint-staged'], { stdio: 'inherit' });
}
