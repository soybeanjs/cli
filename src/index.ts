#!/usr/bin/env node
import cac from 'cac';
import { version } from '../package.json';
import {
  gitCommit,
  gitCommitVerify,
  cleanup,
  initSimpleGitHooks,
  updatePkg,
  prettierFormat,
  eslintPretter,
  lintStaged,
  genChangelog
} from './command';

const cli = cac('soybean');

cli.version(version).option('--total', 'Generate changelog by total tags').help();

type Command =
  | 'git-commit'
  | 'git-commit-verify'
  | 'cleanup'
  | 'init-git-hooks'
  | 'update-pkg'
  | 'prettier-format'
  | 'eslint-prettier'
  | 'lint-staged'
  | 'changelog';

type CommandAction<A extends object> = (args?: A) => Promise<void> | void;

type CommandWithAction<A extends object = object> = Record<Command, { desc: string; action: CommandAction<A> }>;

interface CommandArg {
  total?: boolean;
}

const commands: CommandWithAction<CommandArg> = {
  'git-commit': {
    desc: '生成符合 Angular 规范的 git commit',
    action: gitCommit
  },
  'git-commit-verify': {
    desc: '校验git的commit是否符合 Angular 规范',
    action: gitCommitVerify
  },
  cleanup: {
    desc: '清空依赖和构建产物',
    action: cleanup
  },
  'init-git-hooks': {
    desc: '初始化simple-git-hooks钩子',
    action: initSimpleGitHooks
  },
  'update-pkg': {
    desc: '升级依赖',
    action: updatePkg
  },
  'prettier-format': {
    desc: 'prettier格式化',
    action: prettierFormat
  },
  'eslint-prettier': {
    desc: 'eslint和prettier格式化',
    action: eslintPretter
  },
  'lint-staged': {
    desc: '执行lint-staged',
    action: lintStaged
  },
  changelog: {
    desc: '生成changelog',
    action: async args => {
      await genChangelog(args?.total);
    }
  }
};

Object.entries(commands).forEach(([command, { desc, action }]) => {
  cli.command(command, desc).action(action);
});

cli.parse();
