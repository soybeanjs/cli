# @soybeanjs/cli

SoybeanJS 的命令行工具

## 用法

### 安装

```bash
pnpm i -D @soybeanjs/cli
```

### 使用

示例：

```bash
pnpm soy -h
```

## 命令介绍

| 命令              | 作用                                                                                 |
| ----------------- | ------------------------------------------------------------------------------------ |
| help(-h)          | 查看全部命令用法                                                                     |
| git-commit        | 生成符合 Angular 规范的 git 提交信息 (在提交信息添加前缀`!`可以表示破坏性更新的提交) |
| git-commit-verify | 校验 git 的提交信息是否符合 Angular 规范                                             |
| cleanup           | 清空依赖和构建产物                                                                   |
| ncu               | 命令 npm-check-updates, 升级依赖                                                     |
| changelog         | 根据两次 tag 生成 changelog (--total: 根据所有 tag 生成 changelog)                   |
| release           | 发布：更新版本号、生成 changelog、提交代码                                           |

## 更多自定义配置

- 在项目根目录新建 soybean-config.ts

- 导入 defineConfig 函数

  ```ts
  import { defineConfig } from '@soybeanjs/cli';

  export default defineConfig({
    // options
  });
  ```

- 配置参考

  ```ts
  import type { CliOption } from '@soybeanjs/cli';
  ```
