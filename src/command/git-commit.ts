import enquirer from 'enquirer';
import { execCommand } from '../shared';
import type { CliOption } from '../types';

interface PromptObject {
  types: string;
  scopes: string;
  description: string;
}

export async function gitCommit(
  gitCommitTypes: CliOption['gitCommitTypes'],
  gitCommitScopes: CliOption['gitCommitScopes']
) {
  const typesChoices = gitCommitTypes.map(([name, title]) => {
    const nameWithSuffix = `${name}:`;

    const message = `${nameWithSuffix.padEnd(12)}${title}`;

    return {
      name,
      message
    };
  });

  const scopesChoices = gitCommitScopes.map(([name, title]) => ({
    name,
    message: `${name.padEnd(30)} (${title})`
  }));

  const result = await enquirer.prompt<PromptObject>([
    {
      name: 'types',
      type: 'select',
      message: '请选择提交的类型',
      choices: typesChoices
    },
    {
      name: 'scopes',
      type: 'select',
      message: '选择一个scope',
      choices: scopesChoices
    },
    {
      name: 'description',
      type: 'text',
      message: '请输入提交描述'
    }
  ]);

  const commitMsg = `${result.types}(${result.scopes}): ${result.description}`;

  execCommand('git', ['commit', '-m', commitMsg], { stdio: 'inherit' });
}
