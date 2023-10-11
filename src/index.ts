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
  eslintPrettier,
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

const DEPRECATED_MSG = 'the command is deprecated, it will be removed in the next major version 1.0.0';

async function setupCli() {
  const cliOptions = await loadCliOptions();

  const cli = cac('soybean');

  cli.version(version).option('--total', 'Generate changelog by total tags').help();

  const commands: CommandWithAction<CommandArg> = {
    cleanup: {
      desc: 'delete dirs: node_modules, dist, etc.',
      action: async () => {
        await cleanup(cliOptions.cleanupDirs);
      }
    },
    ncu: {
      desc: 'npm-check-updates, it can update package.json dependencies to the latest version',
      action: async () => {
        await ncu(cliOptions.ncuCommandArgs);
      }
    },
    'git-commit': {
      desc: 'git commit, generate commit message which match Conventional Commits standard',
      action: async () => {
        await gitCommit(cliOptions.gitCommitTypes, cliOptions.gitCommitScopes);
      }
    },
    'git-commit-verify': {
      desc: 'verify git commit message, make sure it match Conventional Commits standard',
      action: async () => {
        await gitCommitVerify();
      }
    },
    'prettier-write': {
      desc: 'run prettier --write',
      action: async () => {
        await prettierWrite(cliOptions.prettierWriteGlob);
      }
    },
    'lint-staged': {
      desc: 'run lint-staged',
      action: async () => {
        const passed = await execLintStaged(cliOptions.lintStagedConfig).catch(() => {
          process.exitCode = 1;
        });

        process.exitCode = passed ? 0 : 1;
      }
    },
    changelog: {
      desc: 'generate changelog',
      action: async args => {
        await genChangelog(cliOptions.changelogOptions, args?.total);
      }
    },
    release: {
      desc: 'release: update version, generate changelog, commit code',
      action: async () => {
        await release();
      }
    },
    /**
     * @deprecated
     */
    'init-simple-git-hooks': {
      desc: `init simple-git-hooks and remove husky (${DEPRECATED_MSG})`,
      action: async () => {
        await initSimpleGitHooks(cliOptions.cwd);
      }
    },
    /**
     * @deprecated
     */
    'init-git-hooks': {
      desc: `same as init-simple-git-hooks (${DEPRECATED_MSG})`,
      action: async () => {
        await initSimpleGitHooks(cliOptions.cwd);
      }
    },
    /**
     * @deprecated
     */
    'update-pkg': {
      desc: `same as ncu (${DEPRECATED_MSG})`,
      action: async () => {
        await ncu(cliOptions.ncuCommandArgs);
      }
    },
    /**
     * @deprecated
     */
    'prettier-format': {
      desc: `same as prettier-write (${DEPRECATED_MSG})`,
      action: async () => {
        await prettierWrite(cliOptions.prettierWriteGlob);
      }
    },
    /**
     * @deprecated
     */
    'eslint-prettier': {
      desc: DEPRECATED_MSG,
      action: async () => {
        await eslintPrettier();
      }
    }
  };

  for await (const [command, { desc, action }] of Object.entries(commands)) {
    cli.command(command, desc).action(action);
  }

  cli.parse();
}

setupCli();

export function defineConfig(config?: Partial<CliOption>) {
  return config;
}

export type { CliOption };
