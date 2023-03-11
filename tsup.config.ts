import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  outDir: 'bin',
  splitting: false,
  sourcemap: false,
  clean: true,
  dts: false,
  format: ['esm', 'cjs']
});
