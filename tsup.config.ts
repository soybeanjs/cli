import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts', 'src/config/commitlint.config.js'],
  splitting: false,
  sourcemap: false,
  clean: false,
  format: ['esm', 'cjs']
});
