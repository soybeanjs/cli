# @soybeanjs/cli

<p align="center">
  <img src="https://r2.soybeanjs.tech/soybeanjs/logo-soybeanjs.svg" alt="SoybeanJS" width="96" />
</p>

[简体中文](./README.md) | English

The SoybeanJS command-line toolkit for consistent Git commits, dependency upgrades, changelog generation, releases, and project cleanup.

## Contents

- [Install](#install)
- [Common workflows](#common-workflows)
- [Command reference](#command-reference)
- [Configuration](#configuration)
- [AI Skill](#ai-skill)

## Install

```bash
pnpm add -D @soybeanjs/cli
# or
npm i -D @soybeanjs/cli
# or
yarn add -D @soybeanjs/cli
```

After installation, we recommend running commands as `pnpm soy <command>`. `npx soy <command>` is also supported.

## Common Workflows

### Commit code

```bash
pnpm soy git-commit
```

Choose a commit type and scope, then provide a description to create a Conventional Commit. Start the description with `!` to mark a breaking change.

### Upgrade dependencies

```bash
pnpm soy ncu
pnpm install
```

`ncu` uses npm-check-updates to update versions in `package.json`. It automatically enables workspace mode in workspace projects. Reinstall dependencies afterward, then run the project's build and test commands to validate the update.

### Generate a changelog

```bash
# Generate from the most recent tag
pnpm soy changelog

# Rebuild from all tags
pnpm soy changelog --total
```

### Release a version

```bash
pnpm soy release
```

The release flow interactively bumps the version, runs `pnpm soy changelog`, creates a `chore(projects): release v<version>` commit and Git tag, then pushes them to the remote. Ensure the working tree is clean and all release changes have already been committed.

> [!WARNING]
> The current `release` command pushes the commit and tag by default. Confirm the branch, remote, and release contents before running it.

### Clean project artifacts

```bash
pnpm soy cleanup
```

Default cleanup patterns include `dist`, `node_modules`, and npm, Yarn, and pnpm lockfiles. To clean only selected paths, pass comma-separated globs with `--cleanupDir`:

```bash
pnpm soy cleanup --cleanupDir "**/dist,**/coverage"
```

## Command Reference

### Commands

| Command                   | Description                                                                                        |
| ------------------------- | -------------------------------------------------------------------------------------------------- |
| `cleanup`                 | Removes files and directories by glob. Defaults include build output, dependencies, and lockfiles. |
| `ncu`                     | Upgrades dependencies through npm-check-updates; workspace projects automatically receive `-w`.    |
| `git-commit`              | Interactively creates a Conventional Commit.                                                       |
| `git-commit-verify`       | Validates `.git/COMMIT_EDITMSG`; suitable for a `commit-msg` hook.                                 |
| `changelog`               | Generates `CHANGELOG.md` from Git tags and commit history.                                         |
| `release`                 | Interactively bumps the version, generates the changelog, creates a commit and tag, then pushes.   |
| `config <set\|get\|path>` | Sets, reads, or locates global configuration.                                                      |
| `update-pkg`              | Deprecated. Use `ncu` instead.                                                                     |

### Options

| Option                    | Applies to                        | Description                                                                                            |
| ------------------------- | --------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `-e, --execute [command]` | `release`                         | Runs a command after the version bump and before the release commit. Defaults to `pnpm soy changelog`. |
| `-t, --total`             | `changelog`                       | Generates the changelog from all Git tags.                                                             |
| `-c, --cleanupDir <dir>`  | `cleanup`                         | Overrides cleanup globs for this run. Separate multiple values with commas.                            |
| `-l, --lang <lang>`       | `git-commit`, `git-commit-verify` | Sets output language for this invocation to `zh-cn` or `en-us`.                                        |
| `-v, --version`           | Global                            | Displays the version.                                                                                  |
| `-h, --help`              | Global                            | Displays help.                                                                                         |

### Commit message format

`git-commit` produces the following format. The `scope` is optional. When the description starts with `!`, the marker is kept before the colon to identify a breaking change.

```text
<type>(<scope>)<!>: <description>
```

```bash
feat(components): add new Button component
fix(utils)!: change API signature
```

Default types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `optimize`, `test`, `build`, `ci`, `chore`, `revert`.

Default scopes: `projects`, `packages`, `components`, `hooks`, `utils`, `types`, `styles`, `deps`, `release`, `other`.

### Global configuration commands

| Command                                         | Description                                    |
| ----------------------------------------------- | ---------------------------------------------- |
| `pnpm soy config set --set-lang <zh-cn\|en-us>` | Writes the default language to `~/.soybeanrc`. |
| `pnpm soy config get`                           | Prints the current merged configuration.       |
| `pnpm soy config path`                          | Prints the global configuration file path.     |

## Configuration

Configuration is merged in this order: command-line arguments, project configuration, global configuration, then built-in defaults. Project configuration can use the following names; TypeScript is recommended:

- `soybean.config.ts`
- `soybean.config.js`
- `soybean.config.mjs`
- `soybean.config.json`
- the `soybean` field in `package.json`

Use `defineConfig` for type hints:

```ts
// soybean.config.ts
import { defineConfig } from '@soybeanjs/cli';

export default defineConfig({
  lang: 'zh-cn',
  cleanupDirs: ['**/dist', '**/.cache', '**/coverage', '**/node_modules', '!node_modules/**'],
  gitCommit: {
    types: [['wip', 'Work in progress']],
    scopes: [
      ['ui', 'UI components'],
      ['api', 'API integration']
    ]
  }
});
```

### Options

| Option                   | Type                       | Description                                                                                  |
| ------------------------ | -------------------------- | -------------------------------------------------------------------------------------------- |
| `cwd`                    | `string`                   | Project root. Defaults to `process.cwd()`.                                                   |
| `lang`                   | `'zh-cn' \| 'en-us'`       | Default CLI output language.                                                                 |
| `cleanupDirs`            | `string[]`                 | Glob patterns used by `cleanup`.                                                             |
| `ncuCommandArgs`         | `string[]`                 | Arguments passed to npm-check-updates. When set, it replaces automatically derived defaults. |
| `changelogOptions`       | `Partial<ChangelogOption>` | Options passed to the changelog generator.                                                   |
| `gitCommitVerifyIgnores` | `RegExp[]`                 | Commit-message validation patterns appended to the built-in ignore list.                     |
| `gitCommit.types`        | `[string, string][]`       | Custom commit types. Appended to built-in types by default.                                  |
| `gitCommit.typesAppend`  | `boolean`                  | Set to `false` to replace built-in commit types.                                             |
| `gitCommit.scopes`       | `[string, string][]`       | Custom commit scopes. Appended to built-in scopes by default.                                |
| `gitCommit.scopesAppend` | `boolean`                  | Set to `false` to replace built-in commit scopes.                                            |

### Recommended scripts

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

This repository includes the `soybean-cli` skill, which helps AI coding assistants use `soy` correctly for commits, releases, changelog generation, dependency upgrades, and cleanup in SoybeanJS projects.

After the repository is published on GitHub, install it with:

```bash
npx skills add soybeanjs/cli
```

Select `soybean-cli` during installation. The skill source is in [skills/soybean-cli](./skills/soybean-cli).

## License

[MIT](./LICENSE)
