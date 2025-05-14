import { URL, fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import Vue from '@vitejs/plugin-vue';
import VueJsx from '@vitejs/plugin-vue-jsx';
import VueDevtools from 'vite-plugin-vue-devtools';
import Unocss from 'unocss/vite';
import Components from 'unplugin-vue-components/vite';
import SoybeanUIResolver from 'soy-ui/resolver';
import ElegantRouter from 'elegant-router/vite';

export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  plugins: [
    Vue(),
    VueJsx(),
    VueDevtools(),
    Unocss(),
    Components({
      dts: 'src/typings/components.d.ts',
      types: [{ from: 'vue-router', names: ['RouterLink', 'RouterView'] }],
      resolvers: [SoybeanUIResolver()]
    }),
    ElegantRouter(),
  ]
});
