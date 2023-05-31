import { execa } from 'execa';

export async function eslintPretter() {
  await execa('npx', ['eslint', '.', '--fix'], {
    stdio: 'inherit'
  });

  await execa('npx', ['soy', 'prettier-format'], {
    stdio: 'inherit'
  });
}
