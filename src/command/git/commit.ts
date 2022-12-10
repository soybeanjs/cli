import prompts from 'prompts';
import execa from 'execa';
import { types, scopes } from './config';

export async function gitCommit() {
  const result = await prompts([
    {
      name: 'types',
      type: 'select',
      message: '请选择提交的类型',
      choices: types
    },
    {
      name: 'scopes',
      type: 'select',
      message: '选择一个scope',
      choices: scopes
    },
    {
      name: 'description',
      type: 'text',
      message: '请输入提交描述'
    }
  ]);

  const commitMsg = `${result.types}(${result.scopes}): ${result.description}`;

  execa('git', ['commit', '-m', commitMsg], { stdio: 'inherit' });
}
