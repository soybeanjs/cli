import path from 'path';
import { readFileSync } from 'fs';
import { bgRed, red, green } from 'kolorist';
import { execCommand } from '../shared';

export async function gitCommitVerify() {
  const gitPath = await execCommand('git', ['rev-parse', '--show-toplevel']);

  const gitMsgPath = path.join(gitPath, '.git/COMMIT_EDITMSG');

  const commitMsg = readFileSync(gitMsgPath, 'utf-8').trim();

  const REG_EXP = /(?<type>[a-z]+)(\((?<scope>.+)\))?(?<breaking>!)?: (?<description>.+)/i;

  if (!REG_EXP.test(commitMsg)) {
    throw new Error(
      `${bgRed(' ERROR ')} ${red('Git提交信息不符合 Angular 规范!\n\n')}${green(
        '推荐使用命令 pnpm commit 生成符合规范的Git提交信息'
      )}`
    );
  }
}
