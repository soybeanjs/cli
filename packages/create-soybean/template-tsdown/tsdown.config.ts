import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['src/index.ts'],
  platform: 'neutral',
  clean: true,
  dts: true,
  sourcemap: false,
  minify: false
});
