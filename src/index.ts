#!/usr/bin/env node
import process from 'node:process';
import cac from 'cac';
import { version } from '../package.json';
import {
  cleanup,
  eslintPrettier,
  execLintStaged,
  genChangelog,
  gitCommit,
  gitCommitVerify,
  initSimpleGitHooks,
  ncu,
  prettierWrite,
  release,
  syncNpmmirror
} from './command';
import { loadCliOptions } from './config';
import type { CliOption } from './types';

type Command =
  | 'cleanup'
  | 'ncu'
  | 'git-commit'
  | 'git-commit-verify'
  | 'changelog'
  | 'release'
  | 'sync-npmmirror'
  // @deprecated
  | 'prettier-format'
  | 'prettier-write'
  | 'eslint-prettier'
  | 'lint-staged'
  | 'init-git-hooks'
  | 'init-simple-git-hooks'
  | 'update-pkg';

type CommandAction<A extends object> = (args?: A) => Promise<void> | void;

type CommandWithAction<A extends object = object> = Record<Command, { desc: string; action: CommandAction<A> }>;

interface CommandArg {
  /** Execute additional command after bumping and before git commit. Defaults to 'npx soy changelog' */
  // execute?: string;
  /** Indicates whether to push the git commit and tag. Defaults to true */
  // push?: boolean;
  /** Generate changelog by total tags */
  total?: boolean;
  /** The package name of sync npmmirror */
  syncName?: string;
  /** Whether show sync package log */
  syncLog?: boolean;
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
    'sync-npmmirror': {
      desc: 'sync npmmirror',
      action: async args => {
        await syncNpmmirror(args?.syncName, args?.syncLog);
      }
    },
    /** @deprecated */
    'prettier-write': {
      desc: `run prettier --write (${DEPRECATED_MSG})`,
      action: async () => {
        await prettierWrite(cliOptions.prettierWriteGlob);
      }
    },
    /** @deprecated */
    'lint-staged': {
      desc: `run lint-staged (${DEPRECATED_MSG})`,
      action: async () => {
        const passed = await execLintStaged(cliOptions.lintStagedConfig).catch(() => {
          process.exitCode = 1;
        });

        process.exitCode = passed ? 0 : 1;
      }
    },
    /** @deprecated */
    'init-simple-git-hooks': {
      desc: `init simple-git-hooks and remove husky (${DEPRECATED_MSG})`,
      action: async () => {
        await initSimpleGitHooks(cliOptions.cwd);
      }
    },
    /** @deprecated */
    'init-git-hooks': {
      desc: `same as init-simple-git-hooks (${DEPRECATED_MSG})`,
      action: async () => {
        await initSimpleGitHooks(cliOptions.cwd);
      }
    },
    /** @deprecated */
    'update-pkg': {
      desc: `same as ncu (${DEPRECATED_MSG})`,
      action: async () => {
        await ncu(cliOptions.ncuCommandArgs);
      }
    },
    /** @deprecated */
    'prettier-format': {
      desc: `same as prettier-write (${DEPRECATED_MSG})`,
      action: async () => {
        await prettierWrite(cliOptions.prettierWriteGlob);
      }
    },
    /** @deprecated */
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
