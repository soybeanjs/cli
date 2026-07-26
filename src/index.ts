#!/usr/bin/env node
import { cac } from 'cac';
import { version } from '../package.json';
import { loadCliOptions } from './config';
import type { Lang } from './locales';
import {
  cleanup,
  configGet,
  configPath,
  configSet,
  genChangelog,
  gitCommit,
  gitCommitVerify,
  ncu,
  release
} from './command';
import type { CliOption } from './types';

type CommandAction<A extends object> = (args?: A) => Promise<void> | void;

interface CommandArg {
  execute?: string;
  push?: boolean;
  total?: boolean;
  cleanupDir?: string;
  lang?: Lang;
}

async function setupCli() {
  const cliOptions = await loadCliOptions();

  const cli = cac('soybean');

  cli
    .version(version)
    .option(
      '-e, --execute [command]',
      "Execute additional command after bumping and before git commit. Defaults to 'pnpm soy changelog'"
    )
    .option('-p, --push', 'Indicates whether to push the git commit and tag')
    .option('-t, --total', 'Generate changelog by total tags')
    .option(
      '-c, --cleanupDir <dir>',
      'The glob pattern of dirs to cleanup, If not set, it will use the default value, Multiple values use "," to separate them'
    )
    .option('-l, --lang <lang>', `display lang of cli (default: ${cliOptions.lang})`, {
      default: cliOptions.lang,
      type: [String]
    })
    .help();

  const simpleCommands: Record<string, { desc: string; action: CommandAction<CommandArg> }> = {
    cleanup: {
      desc: 'delete dirs: node_modules, dist, etc.',
      action: async args => {
        const cleanupDirs = args?.cleanupDir?.split(',') || [];
        const formattedDirs = cleanupDirs.map(dir => dir.trim()).filter(Boolean);

        if (formattedDirs.length) {
          cliOptions.cleanupDirs = formattedDirs;
        }

        await cleanup(cliOptions.cleanupDirs);
      }
    },
    ncu: {
      desc: 'npm-check-updates, it can update package.json dependencies to the latest version',
      action: async () => {
        await ncu(cliOptions.ncuCommandArgs);
      }
    },
    'update-pkg': {
      desc: 'it is deprecated, use "ncu" command instead, it will be removed in future version',
      action: async () => {
        await ncu();
      }
    },
    'git-commit': {
      desc: 'git commit, generate commit message which match Conventional Commits standard',
      action: async args => {
        const lang = args?.lang || cliOptions.lang;
        await gitCommit({
          lang,
          types: cliOptions.gitCommit?.types,
          scopes: cliOptions.gitCommit?.scopes
        });
      }
    },
    'git-commit-verify': {
      desc: 'verify git commit message, make sure it match Conventional Commits standard',
      action: async args => {
        const lang = args?.lang || cliOptions.lang;
        await gitCommitVerify(lang, cliOptions.gitCommitVerifyIgnores);
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
      action: async args => {
        await release(args?.execute, args?.push);
      }
    }
  };

  for (const [cmdName, { desc, action }] of Object.entries(simpleCommands)) {
    cli.command(cmdName, desc).action(action);
  }

  cli
    .command('config <cmd>', 'manage cli configuration (set|get|path)')
    .option('--set-lang <lang>', 'Set default language (zh-cn or en-us)')
    .action(async (cmd: string, options: { setLang?: Lang }) => {
      switch (cmd) {
        case 'set':
          await configSet({ lang: options.setLang });
          break;
        case 'get':
          await configGet();
          break;
        case 'path':
          await configPath();
          break;
        default:
          console.error(`Unknown config subcommand: ${cmd}`);
          console.log('Available subcommands: set, get, path');
          process.exit(1);
      }
    });

  cli.parse();
}

setupCli();

export function defineConfig(config?: Partial<CliOption>) {
  return config;
}

export type { CliOption };
