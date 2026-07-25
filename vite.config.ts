import { defineConfig } from 'vite-plus';
import { lint, fmt } from '@soybeanjs/oxc-config';

export default defineConfig({
  staged: {
    '*': 'vp check --fix'
  },
  lint,
  fmt: {
    ...fmt,
    ignorePatterns: ['CHANGELOG.md']
  },
  resolve: {
    tsconfigPaths: true
  },
  pack: {
    entry: ['src/index.ts'],
    platform: 'node',
    clean: true,
    dts: true,
    fixedExtension: false
  }
});
