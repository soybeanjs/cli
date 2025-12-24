import { URL, fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import Vue from '@vitejs/plugin-vue';
import VueJsx from '@vitejs/plugin-vue-jsx';
import UiResolver from '@soybeanjs/ui/resolver';
import Unocss from 'unocss/vite';
import Components from 'unplugin-vue-components/vite';
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
    Unocss(),
    Components({
      dts: 'src/typings/components.d.ts',
      types: [{ from: 'vue-router', names: ['RouterLink', 'RouterView'] }],
      resolvers: [UiResolver()]
    }),
    ElegantRouter(),
  ]
});
