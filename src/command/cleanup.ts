import { rimraf } from 'rimraf';
import { glob } from 'glob';

const NODE_MODULE_PATH = 'node_modules';

const pathStrs = [NODE_MODULE_PATH, 'dist', 'package-lock.json', 'yarn.lock', 'pnpm-lock.yaml'];

const deepPathStrs = pathStrs.map(item => `./**/${item}`);

export async function cleanup() {
  const paths = await glob(deepPathStrs, { ignore: 'node_modules/**' });

  rimraf(paths.concat([NODE_MODULE_PATH]));
}
