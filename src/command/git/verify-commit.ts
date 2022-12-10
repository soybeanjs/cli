import { readFileSync } from 'fs';
import { bgRed, red, green } from 'kolorist';
import { types, scopes } from './config';

export function verifyGitCommit() {
  const gitMsgPath = './.git/COMMIT_EDITMSG';

  const commitMsg = readFileSync(gitMsgPath, 'utf-8').trim();

  const RELEASE_MSG = 'chore: release';

  const REG_EXP = new RegExp(
    `(${types.map(item => item.value).join('|')})\\((${scopes.map(item => item.value).join('|')})\\):\\s.{1,50}`
  );

  if (!REG_EXP.test(commitMsg) && !commitMsg.includes(RELEASE_MSG)) {
    throw new Error(
      `${bgRed(' ERROR ')} ${red('Git提交信息不符合 Angular 规范!\n\n')}${green(
        '推荐使用命令 pnpm commit 生成符合规范的Git提交信息'
      )}`
    );
  }
}
