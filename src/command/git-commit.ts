import { readFileSync } from 'node:fs';
import path from 'node:path';
import enquirer from 'enquirer';
import { execCommand } from '../shared';
import { locales } from '../locales';
import type { Lang } from '../locales';
import type { CommitItem } from '../types';

interface PromptObject {
  types: string;
  scopes: string;
  description: string;
}

interface GitCommitOptions {
  lang?: Lang;
  types?: CommitItem[];
  scopes?: CommitItem[];
}

/**
 * Git commit with Conventional Commits standard
 *
 * @param options
 */
export async function gitCommit(options: GitCommitOptions = {}) {
  const lang = options.lang || 'en-us';
  const { gitCommitMessages } = locales[lang];

  const types = options.types || locales[lang].gitCommitTypes;
  const scopes = options.scopes || locales[lang].gitCommitScopes;

  const typesChoices = types.map(([value, msg]) => {
    const nameWithSuffix = `${value}:`;
    const message = `${nameWithSuffix.padEnd(12)}${msg}`;

    return {
      name: value,
      message
    };
  });

  const scopesChoices = scopes.map(([value, msg]) => ({
    name: value,
    message: `${value.padEnd(30)} (${msg})`
  }));

  const result = await enquirer.prompt<PromptObject>([
    {
      name: 'types',
      type: 'select',
      message: gitCommitMessages.types,
      choices: typesChoices
    },
    {
      name: 'scopes',
      type: 'select',
      message: gitCommitMessages.scopes,
      choices: scopesChoices
    },
    {
      name: 'description',
      type: 'text',
      message: gitCommitMessages.description
    }
  ]);

  const breaking = result.description.startsWith('!') ? '!' : '';
  const description = result.description.replace(/^!/, '').trim();
  const commitMsg = `${result.types}(${result.scopes})${breaking}: ${description}`;

  await execCommand('git', ['commit', '-m', commitMsg], { stdio: 'inherit' });
}

/** Git commit message verify */
export async function gitCommitVerify(lang: Lang = 'en-us', ignores: RegExp[] = []) {
  const gitPath = await execCommand('git', ['rev-parse', '--show-toplevel']);
  const gitMsgPath = path.join(gitPath, '.git', 'COMMIT_EDITMSG');
  const commitMsg = readFileSync(gitMsgPath, 'utf8').trim();

  if (ignores.some(regExp => regExp.test(commitMsg))) return;

  const REG_EXP = /(?<type>[a-z]+)(?:\((?<scope>.+)\))?(?<breaking>!)?: (?<description>.+)/i;

  if (!REG_EXP.test(commitMsg)) {
    const errorMsg = locales[lang].gitCommitVerify;
    throw new Error(errorMsg);
  }
}
