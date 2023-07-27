import { loadConfig } from 'c12';
import { readFile } from 'fs/promises';
import type { CliOption } from '../types';

const eslintExt = '*.{js,jsx,mjs,cjs,json,ts,tsx,mts,cts,vue,svelte,astro}';

const defaultOptions: CliOption = {
  cwd: process.cwd(),
  cleanupDirs: [
    '**/dist',
    '**/package-lock.json',
    '**/yarn.lock',
    '**/pnpm-lock.yaml',
    '**/node_modules',
    '!node_modules/**'
  ],
  gitCommitTypes: [
    ['init', '项目初始化'],
    ['feat', '添加新特性'],
    ['fix', '修复bug'],
    ['docs', '仅仅修改文档'],
    ['style', '仅仅修改了空格、格式缩进、逗号等等，不改变代码逻辑'],
    ['refactor', '代码重构，没有加新功能或者修复bug'],
    ['perf', '优化相关，比如提升性能、体验'],
    ['test', '添加测试用例'],
    ['build', '依赖相关的内容'],
    ['ci', 'CI配置相关，例如对k8s，docker的配置文件的修改'],
    ['chore', '改变构建流程、或者增加依赖库、工具等'],
    ['revert', '回滚到上一个版本']
  ],
  gitCommitScopes: [
    ['projects', '项目搭建'],
    ['components', '组件相关'],
    ['hooks', 'hook 相关'],
    ['utils', 'utils 相关'],
    ['types', 'ts类型相关'],
    ['styles', '样式相关'],
    ['deps', '项目依赖'],
    ['auth', '对 auth 修改'],
    ['release', '版本发布'],
    ['other', '其他修改']
  ],
  ncuCommandArgs: ['--deep', '-u'],
  changelogOptions: {},
  prettierWriteGlob: [
    `!**/${eslintExt}`,
    '!*.min.*',
    '!CHANGELOG.md',
    '!dist',
    '!LICENSE*',
    '!output',
    '!coverage',
    '!public',
    '!temp',
    '!package-lock.json',
    '!pnpm-lock.yaml',
    '!yarn.lock',
    '!.github',
    '!__snapshots__',
    '!node_modules'
  ],
  lintStagedConfig: {
    [eslintExt]: 'eslint --fix',
    '*': 'soy prettier-write'
  }
};

const SOYBEAN_GITHUB_TOKEN = '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';

export async function loadCliOptions(overrides?: Partial<CliOption>, cwd = process.cwd()) {
  const { config } = await loadConfig<Partial<CliOption>>({
    name: 'soybean',
    defaults: defaultOptions,
    overrides,
    cwd,
    packageJson: true
  });

  const has = await hasSoybeanInfoFromPkgJson(cwd);

  if (config && has) {
    config.changelogOptions = { ...config.changelogOptions, github: { repo: '', token: SOYBEAN_GITHUB_TOKEN } };
  }

  return config as CliOption;
}

async function hasSoybeanInfoFromPkgJson(cwd: string) {
  let hasSoybeanInfo = false;

  const REG = 'soybean';

  try {
    const pkgJson = await readFile(`${cwd}/package.json`, 'utf-8');
    const pkg = JSON.parse(pkgJson);
    hasSoybeanInfo =
      pkg.name?.includes(REG) ||
      pkg.repository?.url?.includes(REG) ||
      pkg.author?.includes(REG) ||
      pkg.author?.name?.includes(REG) ||
      pkg.author?.url?.includes(REG);
  } catch {}

  return hasSoybeanInfo;
}
