import { defineBuildConfig } from 'unbuild';

export default defineBuildConfig({
  alias: {
    '@': './src'
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
  }
});
