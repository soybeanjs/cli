import enquirer from 'enquirer';
import { execCommand } from '../shared';
import { gitCommitTypes, gitCommitScopes } from '../configs';

interface PromptObject {
  types: string;
  scopes: string;
  description: string;
}

export async function gitCommit() {
  const result = await enquirer.prompt<PromptObject>([
    {
      name: 'types',
      type: 'select',
      message: '请选择提交的类型',
      choices: gitCommitTypes.map(item => ({ name: item.value, message: item.title }))
    },
    {
      name: 'scopes',
      type: 'select',
      message: '选择一个scope',
      choices: gitCommitScopes.map(item => ({ name: item.value, message: item.title }))
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
