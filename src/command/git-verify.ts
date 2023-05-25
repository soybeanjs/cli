import { readFileSync } from 'fs';
import { bgRed, red, green } from 'kolorist';
import { gitCommitTypes, gitCommitScopes } from '../configs';

export function gitCommitVerify() {
  const gitMsgPath = './.git/COMMIT_EDITMSG';

  const commitMsg = readFileSync(gitMsgPath, 'utf-8').trim();

  const types = gitCommitTypes.map(item => item.value).join('|');

  const scopes = gitCommitScopes.map(item => item.value).join('|');

  const REG_EXP = new RegExp(`(${types})!*(\\((${scopes})\\))*!*:\\s.{1,100}`);

  if (!REG_EXP.test(commitMsg)) {
    throw new Error(
      `${bgRed(' ERROR ')} ${red('Git提交信息不符合 Angular 规范!\n\n')}${green(
        '推荐使用命令 pnpm commit 生成符合规范的Git提交信息'
      )}`
    );
  }
}
