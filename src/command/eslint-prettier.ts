import { execCommand } from '../shared';

export async function eslintPrettier() {
  await execCommand('npx', ['eslint', '.', '--fix'], {
    stdio: 'inherit'
  });

  await execCommand('npx', ['soy', 'prettier-format'], {
    stdio: 'inherit'
  });
}
