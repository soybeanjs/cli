# @soybeanjs/cli

<p align="center">
  <img src="https://r2.soybeanjs.tech/soybeanjs/logo-soybeanjs.svg" alt="SoybeanJS" width="96" />
</p>

简体中文 | [English](./README.en-US.md)

SoybeanJS 的命令行工具集，用于统一 Git 提交、依赖升级、Changelog 生成、版本发布和项目清理等日常工作流。

## 目录

- [安装](#安装)
- [常用工作流](#常用工作流)
- [命令参考](#命令参考)
- [配置](#配置)
- [AI Skill](#ai-skill)

## 安装

```bash
pnpm add -D @soybeanjs/cli
# 或者
npm i -D @soybeanjs/cli
# 或者
yarn add -D @soybeanjs/cli
```

安装后，推荐通过 `pnpm soy <command>` 调用命令；也可使用 `npx soy <command>`。

## 常用工作流

### 提交代码

```bash
pnpm soy git-commit
```

依次选择提交类型、提交范围并填写描述，即可生成符合 Conventional Commits 的提交信息。描述以 `!` 开头时会标记为破坏性变更。

### 升级依赖

```bash
pnpm soy ncu
pnpm install
```

`ncu` 使用 npm-check-updates 更新 `package.json` 中的依赖版本；在 workspace 项目中会自动启用 workspace 模式。完成后重新安装依赖，并运行项目的构建和测试命令验证变更。

### 生成 Changelog

```bash
# 根据最近的 tag 生成变更日志
pnpm soy changelog

# 基于所有 tag 重建变更日志
pnpm soy changelog --total
```

### 发布版本

```bash
pnpm soy release
```

发布流程会交互式更新版本号、执行 `pnpm soy changelog`、创建 `chore(projects): release v<version>` 提交和 Git tag，并推送到远端。执行前确保工作区干净且待发布的改动均已提交。

> [!WARNING]
> 当前 `release` 命令默认推送提交和 tag。请在执行前确认分支、远端和发布内容均正确。

### 清理项目产物

```bash
pnpm soy cleanup
```

默认清理规则包含 `dist`、`node_modules` 以及 npm、Yarn、pnpm 的 lock 文件。若只想清理指定目录，可通过 `--cleanupDir` 传入逗号分隔的 glob：

```bash
pnpm soy cleanup --cleanupDir "**/dist,**/coverage"
```

## 命令参考

### 命令

| 命令                      | 说明                                                             |
| ------------------------- | ---------------------------------------------------------------- |
| `cleanup`                 | 按 glob 清理目录和文件。默认包含构建产物、依赖目录和 lock 文件。 |
| `ncu`                     | 使用 npm-check-updates 升级依赖；workspace 项目会自动传入 `-w`。 |
| `git-commit`              | 交互式创建符合 Conventional Commits 的 Git 提交。                |
| `git-commit-verify`       | 校验 `.git/COMMIT_EDITMSG`，适合配置在 `commit-msg` hook 中。    |
| `changelog`               | 从 Git tag 和提交历史生成 `CHANGELOG.md`。                       |
| `release`                 | 交互式更新版本、生成 Changelog、创建提交和 tag，并推送到远端。   |
| `config <set\|get\|path>` | 设置、查看或定位全局配置。                                       |
| `update-pkg`              | 已废弃，请使用 `ncu`。                                           |

### 选项

| 选项                      | 适用命令                          | 说明                                                                |
| ------------------------- | --------------------------------- | ------------------------------------------------------------------- |
| `-e, --execute [command]` | `release`                         | 指定版本更新后、创建提交前执行的命令；默认是 `pnpm soy changelog`。 |
| `-t, --total`             | `changelog`                       | 使用全部 Git tag 生成 Changelog。                                   |
| `-c, --cleanupDir <dir>`  | `cleanup`                         | 覆盖本次执行的清理 glob；多个值用逗号分隔。                         |
| `-l, --lang <lang>`       | `git-commit`、`git-commit-verify` | 将本次 CLI 输出设为 `zh-cn` 或 `en-us`。                            |
| `-v, --version`           | 全局                              | 显示版本号。                                                        |
| `-h, --help`              | 全局                              | 显示帮助信息。                                                      |

### 提交信息格式

`git-commit` 生成的格式如下。`scope` 可以省略；若描述以 `!` 开头，则会在冒号前保留 `!` 以标记破坏性变更。

```text
<type>(<scope>)<!>: <description>
```

```bash
feat(components): add new Button component
fix(utils)!: change API signature
```

默认提交类型：`feat`、`fix`、`docs`、`style`、`refactor`、`perf`、`optimize`、`test`、`build`、`ci`、`chore`、`revert`。

默认提交范围：`projects`、`packages`、`components`、`hooks`、`utils`、`types`、`styles`、`deps`、`release`、`other`。

### 全局配置命令

| 命令                                            | 说明                                |
| ----------------------------------------------- | ----------------------------------- |
| `pnpm soy config set --set-lang <zh-cn\|en-us>` | 将默认显示语言写入 `~/.soybeanrc`。 |
| `pnpm soy config get`                           | 输出当前合并后的配置。              |
| `pnpm soy config path`                          | 输出全局配置文件路径。              |

## 配置

配置按以下优先级合并：命令行参数、项目配置、全局配置、内置默认值。项目配置可使用以下文件名，推荐 TypeScript：

- `soybean.config.ts`
- `soybean.config.js`
- `soybean.config.mjs`
- `soybean.config.json`
- `package.json` 中的 `soybean` 字段

使用 `defineConfig` 可获得类型提示：

```ts
// soybean.config.ts
import { defineConfig } from '@soybeanjs/cli';

export default defineConfig({
  lang: 'zh-cn',
  cleanupDirs: ['**/dist', '**/.cache', '**/coverage', '**/node_modules', '!node_modules/**'],
  gitCommit: {
    types: [['wip', '工作进行中']],
    scopes: [
      ['ui', 'UI 组件'],
      ['api', 'API 接口']
    ]
  }
});
```

### 配置项

| 配置项                   | 类型                       | 说明                                                              |
| ------------------------ | -------------------------- | ----------------------------------------------------------------- |
| `cwd`                    | `string`                   | 项目根目录，默认为 `process.cwd()`。                              |
| `lang`                   | `'zh-cn' \| 'en-us'`       | CLI 默认显示语言。                                                |
| `cleanupDirs`            | `string[]`                 | `cleanup` 使用的 glob 规则。                                      |
| `ncuCommandArgs`         | `string[]`                 | 传递给 npm-check-updates 的参数；设置后会覆盖自动生成的默认参数。 |
| `changelogOptions`       | `Partial<ChangelogOption>` | 传递给 Changelog 生成器的选项。                                   |
| `gitCommitVerifyIgnores` | `RegExp[]`                 | 追加到默认忽略列表的提交信息校验规则。                            |
| `gitCommit.types`        | `[string, string][]`       | 自定义提交类型；默认追加到内置类型。                              |
| `gitCommit.typesAppend`  | `boolean`                  | 设为 `false` 时，完全替换内置提交类型。                           |
| `gitCommit.scopes`       | `[string, string][]`       | 自定义提交范围；默认追加到内置范围。                              |
| `gitCommit.scopesAppend` | `boolean`                  | 设为 `false` 时，完全替换内置提交范围。                           |

### 推荐脚本

```json
{
  "scripts": {
    "commit": "soy git-commit",
    "commit:zh": "soy git-commit -l=zh-cn",
    "cleanup": "soy cleanup",
    "ncu": "soy ncu",
    "changelog": "soy changelog",
    "release": "soy release"
  }
}
```

## AI Skill

本仓库提供 `soybean-cli` skill，帮助 AI 编程助手在 SoybeanJS 项目中正确使用 `soy` 命令处理提交、发布、Changelog、依赖升级和清理等日常任务。

发布到 GitHub 后，通过以下命令安装：

```bash
npx skills add soybeanjs/cli
```

安装时选择 `soybean-cli`。Skill 源码位于 [skills/soybean-cli](./skills/soybean-cli)。

## License

[MIT](./LICENSE)
