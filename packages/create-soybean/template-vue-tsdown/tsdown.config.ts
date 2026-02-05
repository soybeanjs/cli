import { defineConfig } from 'tsdown';
import unpluginVue from 'unplugin-vue/rolldown';
import unpluginVueJsx from 'unplugin-vue-jsx/rolldown';

export default defineConfig({
  entry: ['src/index.ts'],
  platform: 'neutral',
  external: ['vue'],
  clean: true,
  dts: {
    vue: true
  },
  plugins: [unpluginVue({ isProduction: true }), unpluginVueJsx()],
  sourcemap: false,
  minify: false
});
