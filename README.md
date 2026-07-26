# @soybeanjs/cli

SoybeanJS 的命令行工具集，提供 Git 提交规范、依赖更新、Changelog 生成、版本发布等便捷功能。

## 特性

- 📝 **符合 Conventional Commits 规范的 Git 提交** - 交互式选择提交类型和范围
- ✅ **提交信息校验** - 自动校验 commit message 是否符合规范
- 🧹 **清理功能** - 一键清理 node_modules、dist 等目录
- 📦 **依赖更新** - 基于 npm-check-updates 快速升级依赖
- 📋 **Changelog 生成** - 根据 Git tags 自动生成变更日志
- 🚀 **版本发布** - 一键完成版本更新、Changelog 生成、代码提交和推送
- 🌍 **多语言支持** - 支持中文和英文，可持久化设置默认语言
- ⚙️ **灵活配置** - 支持项目级和全局配置，可自定义提交类型和范围

## 安装

```bash
pnpm add -D @soybeanjs/cli
# 或者
npm i -D @soybeanjs/cli
# 或者
yarn add -D @soybeanjs/cli
```

安装后可通过 `pnpm soy` 或 `npx soy` 使用 CLI 命令。

## 快速开始

```bash
# 查看帮助
pnpm soy -h

# 交互式 Git 提交
pnpm soy git-commit
```

## 命令说明

### 全局选项

| 选项                      | 说明                                          | 默认值                                  |
| ------------------------- | --------------------------------------------- | --------------------------------------- |
| `-v, --version`           | 显示版本号                                    | -                                       |
| `-e, --execute [command]` | 版本发布时在 bump 之后、commit 之前执行的命令 | `pnpm soy changelog`                    |
| `-p, --push`              | 发布时是否推送 Git 提交和标签                 | -                                       |
| `-t, --total`             | 生成 Changelog 时基于所有标签                 | -                                       |
| `-c, --cleanupDir <dir>`  | 指定清理目录，多个目录用逗号分隔              | 见配置                                  |
| `-l, --lang <lang>`       | CLI 显示语言 (`zh-cn` / `en-us`)              | `en-us`（可通过 config 命令持久化修改） |
| `-h, --help`              | 显示帮助信息                                  | -                                       |

### 命令列表

| 命令                | 说明                                                             |
| ------------------- | ---------------------------------------------------------------- |
| `cleanup`           | 清理目录（node_modules、dist、lock 文件等）                      |
| `ncu`               | 升级 package.json 中的依赖到最新版本                             |
| `update-pkg`        | [已废弃] 请使用 `ncu` 代替                                       |
| `git-commit`        | 交互式生成符合 Conventional Commits 规范的 Git 提交信息          |
| `git-commit-verify` | 校验 Git 提交信息是否符合规范（通常配合 Git hooks 使用）         |
| `changelog`         | 根据 Git tags 生成 Changelog                                     |
| `release`           | 一键发布：更新版本号 → 生成 Changelog → 提交代码 → 打标签 → 推送 |
| `config <cmd>`      | 管理 CLI 配置                                                    |

### config 子命令

| 命令                           | 说明                                                           |
| ------------------------------ | -------------------------------------------------------------- |
| `config set --set-lang <lang>` | 设置默认语言（`zh-cn` 或 `en-us`），配置会持久化到全局配置文件 |
| `config get`                   | 查看当前配置信息                                               |
| `config path`                  | 显示全局配置文件路径                                           |

#### 使用示例

```bash
# 设置默认语言为中文
pnpm soy config set --set-lang zh-cn

# 设置默认语言为英文
pnpm soy config set --set-lang en-us

# 查看当前配置
pnpm soy config get

# 查看全局配置文件位置
pnpm soy config path
```

### git-commit 命令详解

使用 `pnpm soy git-commit` 进行交互式提交：

1. **选择提交类型 (type)** - 如 feat、fix、docs、style 等
2. **选择提交范围 (scope)** - 如 projects、components、utils 等
3. **输入提交描述** - 在描述前加 `!` 表示破坏性变更（Breaking Change）

生成的提交信息格式：

```
<type>(<scope>)<!>: <description>
```

示例：

```
feat(components): add new Button component
fix(utils)!: change API signature
```

## 配置

支持两层配置：

1. **全局配置** - `~/.soybeanrc`（JSON 格式），通过 `config set` 命令管理
2. **项目配置** - 项目根目录下的配置文件（支持 TS/JS 等格式），优先级高于全局配置

### 配置文件

在项目根目录创建配置文件（支持以下名称）：

- `soybean.config.ts`（推荐）
- `soybean.config.js`
- `soybean.config.mjs`
- `soybean.config.json`
- 在 `package.json` 的 `soybean` 字段中配置

使用 TypeScript 配置时，使用 `defineConfig` 获得类型提示：

```ts
// soybean.config.ts
import { defineConfig } from '@soybeanjs/cli';

export default defineConfig({
  // 配置项
});
```

### 配置项

| 配置项                   | 类型                       | 说明                                   | 默认值                                                     |
| ------------------------ | -------------------------- | -------------------------------------- | ---------------------------------------------------------- |
| `cwd`                    | `string`                   | 项目根目录                             | `process.cwd()`                                            |
| `lang`                   | `'zh-cn' \| 'en-us'`       | 默认显示语言                           | `'en-us'`                                                  |
| `cleanupDirs`            | `string[]`                 | 需要清理的目录 glob 模式               | `['**/dist', '**/node_modules', '**/pnpm-lock.yaml', ...]` |
| `ncuCommandArgs`         | `string[]`                 | ncu 命令参数                           | 自动解析 workspace                                         |
| `changelogOptions`       | `Partial<ChangelogOption>` | Changelog 生成选项                     | `{}`                                                       |
| `gitCommitVerifyIgnores` | `RegExp[]`                 | 提交信息校验忽略规则（追加到默认规则） | 见源码                                                     |
| `gitCommit`              | `GitCommitConfig`          | Git 提交配置                           | 见下方                                                     |

### Git 提交配置 (gitCommit)

用于自定义 commit types 和 scopes：

| 配置项                   | 类型                 | 说明                                                      | 默认值      |
| ------------------------ | -------------------- | --------------------------------------------------------- | ----------- |
| `gitCommit.types`        | `[string, string][]` | 自定义提交类型                                            | 默认 types  |
| `gitCommit.typesAppend`  | `boolean`            | 自定义 types 是否追加到默认 types（`false` 则完全覆盖）   | `true`      |
| `gitCommit.scopes`       | `[string, string][]` | 自定义提交范围                                            | 默认 scopes |
| `gitCommit.scopesAppend` | `boolean`            | 自定义 scopes 是否追加到默认 scopes（`false` 则完全覆盖） | `true`      |

**默认提交类型 (types)：**

| type       | 说明 (中文)                           | 说明 (English)                                                |
| ---------- | ------------------------------------- | ------------------------------------------------------------- |
| `feat`     | 新功能                                | A new feature                                                 |
| `fix`      | 修复 Bug                              | A bug fix                                                     |
| `docs`     | 文档更新                              | Documentation only changes                                    |
| `style`    | 代码风格修改（不影响代码含义）        | Changes that do not affect the meaning of the code            |
| `refactor` | 代码重构（既不修复 bug 也不添加功能） | A code change that neither fixes a bug nor adds a feature     |
| `perf`     | 性能优化                              | A code change that improves performance                       |
| `optimize` | 代码质量优化                          | A code change that optimizes code quality                     |
| `test`     | 测试相关                              | Adding missing tests or correcting existing tests             |
| `build`    | 构建系统或外部依赖变更                | Changes that affect the build system or external dependencies |
| `ci`       | CI 配置变更                           | Changes to CI configuration files and scripts                 |
| `chore`    | 其他不修改 src/测试文件的变更         | Other changes that don't modify src or test files             |
| `revert`   | 还原先前的提交                        | Reverts a previous commit                                     |

**默认提交范围 (scopes)：**

| scope        | 说明 (中文)    | 说明 (English)       |
| ------------ | -------------- | -------------------- |
| `projects`   | 项目           | project              |
| `packages`   | 包             | packages             |
| `components` | 组件           | components           |
| `hooks`      | 钩子函数       | hook functions       |
| `utils`      | 工具函数       | utils functions      |
| `types`      | TS 类型声明    | TS declaration       |
| `styles`     | 代码风格       | style                |
| `deps`       | 项目依赖       | project dependencies |
| `release`    | 发布项目新版本 | release project      |
| `other`      | 其他变更       | other changes        |

### 配置示例

#### 1. 追加自定义提交类型和范围

```ts
// soybean.config.ts
import { defineConfig } from '@soybeanjs/cli';

export default defineConfig({
  lang: 'zh-cn', // 项目默认使用中文

  gitCommit: {
    // 追加自定义 types（在默认 types 基础上添加）
    types: [
      ['wip', '工作进行中'],
      ['merge', '合并分支'],
      ['i18n', '国际化相关']
    ],

    // 追加自定义 scopes
    scopes: [
      ['ui', 'UI 组件'],
      ['store', '状态管理'],
      ['api', 'API 接口']
    ]
  }
});
```

#### 2. 完全覆盖默认提交类型和范围

```ts
// soybean.config.ts
import { defineConfig } from '@soybeanjs/cli';

export default defineConfig({
  gitCommit: {
    // 完全覆盖默认 types
    types: [
      ['feat', '新功能'],
      ['fix', '修复'],
      ['docs', '文档']
    ],
    typesAppend: false, // 不追加，完全覆盖

    // 完全覆盖默认 scopes
    scopes: [
      ['frontend', '前端'],
      ['backend', '后端'],
      ['shared', '共享代码']
    ],
    scopesAppend: false
  }
});
```

#### 3. 修改默认清理目录

```ts
// soybean.config.ts
import { defineConfig } from '@soybeanjs/cli';

export default defineConfig({
  cleanupDirs: ['**/dist', '**/.cache', '**/coverage', '**/node_modules', '!node_modules/**']
});
```

### package.json 脚本配置示例

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

## License

[MIT](./LICENSE)
