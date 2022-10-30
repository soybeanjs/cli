export const types = [
  { value: 'init', title: 'init:     项目初始化' },
  { value: 'feat', title: 'feat:     添加新特性' },
  { value: 'fix', title: 'fix:      修复bug' },
  { value: 'docs', title: 'docs:     仅仅修改文档' },
  { value: 'style', title: 'style:    仅仅修改了空格、格式缩进、逗号等等，不改变代码逻辑' },
  { value: 'refactor', title: 'refactor: 代码重构，没有加新功能或者修复bug' },
  { value: 'perf', title: 'perf:     优化相关，比如提升性能、体验' },
  { value: 'test', title: 'test:     添加测试用例' },
  { value: 'build', title: 'build:    依赖相关的内容' },
  { value: 'ci', title: 'ci:       CI配置相关，例如对k8s，docker的配置文件的修改' },
  { value: 'chore', title: 'chore:    改变构建流程、或者增加依赖库、工具等' },
  { value: 'revert', title: 'revert:   回滚到上一个版本' }
];

export const scopes = [
  ['projects', '项目搭建'],
  ['components', '组件相关'],
  ['hooks', 'hook 相关'],
  ['utils', 'utils 相关'],
  ['types', 'ts类型相关'],
  ['styles', '样式相关'],
  ['deps', '项目依赖'],
  ['auth', '对 auth 修改'],
  ['other', '其他修改']
].map(([value, description]) => {
  return {
    value,
    title: `${value.padEnd(30)} (${description})`
  };
});
