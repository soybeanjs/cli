#!/usr/bin/env node
import { program } from 'commander';
import { blue } from 'kolorist';
import pkg from '../package.json';
import { gitCommit, verifyGitCommit } from './command';

program
  .command('git-commit')
  .description('生成符合 Angular 规范的 git commit')
  .action(() => {
    gitCommit();
  });

program
  .command('git-commit-verify')
  .description('校验git的commit是否符合 Angular 规范')
  .action(() => {
    verifyGitCommit();
  });

// 配置options
// program
//   .option('-t, --transform <package name or path>', '插件路径或者npm包名称,支持多个插件，逗号分隔')
//   .option('-o, --out <path>', '输出文件路径')
//   .option('-s, --src <path>', '需要转换的源文件路径');

program.version(pkg.version).description(blue('soybeanjs https://soybean.pro'));

// 接管命令行输入，参数处理
program.parse(process.argv);
