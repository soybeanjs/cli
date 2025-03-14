import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  clean: true,
  dts: true,
  format: ['cjs', 'esm'],
  outExtension: ctx => {
    return {
      js: ctx.format === 'cjs' ? '.cjs' : '.mjs'
    };
  },
  external: [],
  shims: true,
  cjsInterop: true,
  sourcemap: false,
  minify: true
});
