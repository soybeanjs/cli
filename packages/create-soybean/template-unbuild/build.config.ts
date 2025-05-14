import { URL, fileURLToPath } from 'node:url';
import { defineBuildConfig } from 'unbuild';

export default defineBuildConfig({
  alias: {
    '@': fileURLToPath(new URL('./src', import.meta.url))
  },
  entries: ['src/index'],
  clean: true,
  declaration: true,
  rollup: {
    emitCJS: true,
    inlineDependencies: true,
    esbuild: {
      minify: true
    }
  },
  sourcemap: false
});
