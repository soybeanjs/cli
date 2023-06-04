import { execCommand } from '../shared';

export async function eslintPretter() {
  await execCommand('npx', ['eslint', '.', '--fix'], {
    stdio: 'inherit'
  });

  await execCommand('npx', ['soy', 'prettier-format'], {
    stdio: 'inherit'
  });
}
