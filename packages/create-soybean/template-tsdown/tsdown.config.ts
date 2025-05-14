import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['src/index.ts'],
  platform: 'neutral',
  clean: true,
  dts: true,
  format: ['esm', 'cjs'],
  outExtensions: ctx => {
    return {
      js: ctx.format === 'cjs' ? '.cjs' : '.mjs'
    };
  },
  shims: true,
  sourcemap: false,
  minify: false
});
