import { defineBuildConfig } from 'unbuild';

export default defineBuildConfig({
  entries: ['src/index', 'src/lint-staged.config'],
  clean: true,
  rollup: {
    emitCJS: true,
    inlineDependencies: true
  }
});
