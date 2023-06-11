#!/usr/bin/env node
import cac from 'cac';
import { version } from '../package.json';
import {
  gitCommit,
  gitCommitVerify,
  cleanup,
  initSimpleGitHooks,
  ncu,
  prettierWrite,
  eslintPretter,
  execLintStaged,
  genChangelog,
  release
} from './command';
import { loadCliOptions } from './config';
import type { CliOption } from './types';

type Command =
  | 'git-commit'
  | 'git-commit-verify'
  | 'cleanup'
  | 'init-git-hooks'
  | 'init-simple-git-hooks'
  | 'update-pkg'
  | 'ncu'
  | 'prettier-format'
  | 'prettier-write'
  | 'eslint-prettier'
  | 'lint-staged'
  | 'changelog'
  | 'release';

type CommandAction<A extends object> = (args?: A) => Promise<void> | void;

type CommandWithAction<A extends object = object> = Record<Command, { desc: string; action: CommandAction<A> }>;

interface CommandArg {
  total?: boolean;
}

async function setupCli() {
  const cliOptions = await loadCliOptions();

  const cli = cac('soybean');

  cli.version(version).option('--total', 'Generate changelog by total tags').help();

  const commands: CommandWithAction<CommandArg> = {
    'git-commit': {
      desc: '生成符合 Angular 规范的 git commit',
      action: () => {
        gitCommit(cliOptions.gitCommitTypes, cliOptions.gitCommitScopes);
      }
    },
    'git-commit-verify': {
      desc: '校验 git 的 commit 是否符合 Angular 规范',
      action: () => {
        gitCommitVerify();
      }
    },
    cleanup: {
      desc: '清空依赖和构建产物',
      action: () => {
        cleanup(cliOptions.cleanupDirs);
      }
    },
    'init-simple-git-hooks': {
      desc: '初始化 simple-git-hooks 钩子',
      action: () => {
        initSimpleGitHooks(cliOptions.cwd);
      }
    },
    ncu: {
      desc: '命令 npm-check-updates, 升级依赖',
      action: () => {
        ncu(cliOptions.ncuCommandArgs);
      }
    },
    'prettier-write': {
      desc: '执行 prettier --write 格式化',
      action: () => {
        prettierWrite(cliOptions.prettierWriteGlob);
      }
    },
    'lint-staged': {
      desc: '执行lint-staged',
      action: () => {
        execLintStaged(cliOptions.lintStagedConfig)
          .then(passed => {
            process.exitCode = passed ? 0 : 1;
          })
          .catch(() => {
            process.exitCode = 1;
          });
      }
    },
    changelog: {
      desc: '生成changelog',
      action: async args => {
        await genChangelog(cliOptions.changelogOptions, args?.total);
      }
    },
    release: {
      desc: '发布：更新版本号、生成changelog、提交代码',
      action: release
    },
    /**
     * @deprecated
     */
    'init-git-hooks': {
      desc: '该命令已废弃，请使用 init-simple-git-hooks',
      action: () => {
        initSimpleGitHooks(cliOptions.cwd);
      }
    },
    /**
     * @deprecated
     */
    'update-pkg': {
      desc: '该命令已废弃，请使用 ncu',
      action: () => {
        ncu(cliOptions.ncuCommandArgs);
      }
    },
    /**
     * @deprecated
     */
    'prettier-format': {
      desc: '该命令已废弃，请使用 prettier-write',
      action: () => {
        prettierWrite(cliOptions.prettierWriteGlob);
      }
    },
    /**
     * @deprecated
     */
    'eslint-prettier': {
      desc: '该命令已废弃',
      action: eslintPretter
    }
  };

  Object.entries(commands).forEach(([command, { desc, action }]) => {
    cli.command(command, desc).action(action);
  });

  cli.parse();
}

setupCli();

export function defineConfig(config?: Partial<CliOption>) {
  return config;
}

export type { CliOption };
