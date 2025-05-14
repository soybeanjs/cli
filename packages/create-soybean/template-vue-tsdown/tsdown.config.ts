import { defineConfig } from 'tsdown';
import unpluginVue from 'unplugin-vue/rolldown';
import unpluginVueJsx from 'unplugin-vue-jsx/rolldown';

export default defineConfig({
  entry: ['src/index.ts'],
  platform: 'neutral',
  plugins: [unpluginVue({ isProduction: true }), unpluginVueJsx()],
  dts: {
    vue: true
  },
  clean: true,
  external: ['vue'],
  sourcemap: false,
  minify: false
});
