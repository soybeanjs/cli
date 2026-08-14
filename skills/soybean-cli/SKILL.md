---
name: soybean-cli
description: >-
  Use the SoybeanJS CLI (the `soy` / `soybean` command from @soybeanjs/cli) for daily project chores in SoybeanJS-based projects: interactive Conventional Commits git commits, commit-message verification, dependency upgrades via ncu, changelog generation from git tags, one-step version release, and cleanup of node_modules/dist/lockfiles. Use this skill whenever the user wants to commit code, write or validate a commit message, release or publish a new version, generate a changelog, upgrade dependencies, or clean build artifacts in a project that uses (or should use) @soybeanjs/cli — even if they just say "commit this", "帮我提交代码", "发个版本", "生成 changelog", "升级依赖" without explicitly mentioning the soy command.
---

# SoybeanJS CLI (`soy`)

The SoybeanJS ecosystem shares a single CLI package, `@soybeanjs/cli`, which exposes the `soy` command (alias `soybean`). It standardizes the repetitive chores every SoybeanJS project needs: Conventional Commits, commit verification, dependency upgrades, changelogs, releases, and cleanup. Prefer it over hand-rolled git/npm commands in any project that has it, because the project's hooks, CI, and changelog tooling all assume its conventions.

## Detect availability first

Before running anything, check whether the project actually uses the CLI:

- `@soybeanjs/cli` in `devDependencies`, or scripts like `"commit": "soy git-commit"` in package.json → use `pnpm soy <cmd>` (or `npx soy` / `yarn soy`, matching the project's package manager).
- A `soybean.config.ts` / `soybean.config.js` / `soybean` field in package.json → also means the CLI is in play, and its config tells you custom commit types/scopes.
- Not installed and the user clearly wants these workflows → suggest `pnpm add -D @soybeanjs/cli` rather than silently substituting plain git commands, since the conventional-commit format is usually enforced by hooks.

## Command cheat sheet

| Task                                                      | Command                                        |
| --------------------------------------------------------- | ---------------------------------------------- |
| Interactive conventional commit                           | `pnpm soy git-commit`                          |
| Verify the last commit message (hooks/CI)                 | `pnpm soy git-commit-verify`                   |
| Upgrade dependencies to latest                            | `pnpm soy ncu`                                 |
| Generate CHANGELOG.md from git tags                       | `pnpm soy changelog`                           |
| Changelog across all tags                                 | `pnpm soy changelog -t`                        |
| One-step release (bump → changelog → commit → tag → push) | `pnpm soy release`                             |
| Delete dist / node_modules / lockfiles                    | `pnpm soy cleanup`                             |
| Set default language persistently                         | `pnpm soy config set --set-lang zh-cn`         |
| Show config / config file path                            | `pnpm soy config get` / `pnpm soy config path` |

## Committing code

`pnpm soy git-commit` is interactive: it prompts for type, scope, and description, and needs a human at the keyboard. Two consequences:

- Hand the command to the user (e.g., tell them to run `pnpm soy git-commit`) instead of trying to drive its prompts yourself.
- If you are committing autonomously, use plain `git commit` but write the message in exactly the format the CLI enforces — `<type>(<scope>): <description>` — because `git-commit-verify` (usually wired into the `commit-msg` hook) will reject anything else.

Default types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `optimize`, `test`, `build`, `ci`, `chore`, `revert`.
Default scopes: `projects`, `packages`, `components`, `hooks`, `utils`, `types`, `styles`, `deps`, `release`, `other`. The project's `soybean.config.ts` may append or override both lists — read it before choosing.

Breaking changes: insert `!` before the colon, e.g. `fix(utils)!: change API signature`.

## Releasing a new version

`pnpm soy release` runs the whole flow in one shot:

1. Interactive version bump (updates every `package.json` in the workspace via bumpp).
2. Runs a post-bump command — default `pnpm soy changelog`; override with `-e, --execute <command>` if the project needs a build/test between bump and commit.
3. Commits as `chore(projects): release v<version>` and creates the git tag.
4. Pushes the commit and tag.

⚠️ Push is effectively always on in current versions: the `-p/--push` flag exists, but the release action defaults `push` to true even when the flag is omitted. Warn the user before running `soy release` on a branch that shouldn't be pushed, and confirm the working tree is clean first.

The usual prerequisite is that everything intended for the release is already committed, so the changelog (generated from conventional commits since the last tag) is complete.

## Generating the changelog

`pnpm soy changelog` regenerates `CHANGELOG.md` from git tags (powered by `@soybeanjs/changelog`). By default it works from the latest tag; pass `-t/--total` to rebuild from all tags. Because it derives from commit messages, its quality depends on commits following the conventional format above.

## Upgrading dependencies

`pnpm soy ncu` wraps npm-check-updates and auto-detects pnpm workspaces. Extra ncu flags go in `ncuCommandArgs` in the config file. After it rewrites package.json, remind the user to reinstall (`pnpm install`) and verify the project still builds before committing.

## Cleanup

`pnpm soy cleanup` deletes directories matching the configured globs. The defaults include `**/dist`, `**/node_modules`, and the lockfiles (`package-lock.json`, `yarn.lock`, `pnpm-lock.yaml`) — point this out, because deleting lockfiles is not always what people expect from "cleanup". Custom dirs: `-c "dir1,dir2"` or the `cleanupDirs` config option.

## Project configuration

Per-project config lives in `soybean.config.ts` (recommended), `.js`/`.mjs`/`.json`, or the `soybean` field in package.json. Project config overrides the global config (`~/.soybeanrc`, managed via `soy config set`).

```ts
// soybean.config.ts
import { defineConfig } from '@soybeanjs/cli';

export default defineConfig({
  lang: 'zh-cn', // CLI output language, 'zh-cn' | 'en-us'
  gitCommit: {
    // Appended to the defaults by default; set typesAppend/scopesAppend: false to replace them
    types: [['wip', '工作进行中']],
    scopes: [
      ['ui', 'UI 组件'],
      ['api', 'API 接口']
    ]
  }
});
```

Other options: `cleanupDirs` (glob list), `ncuCommandArgs` (string[]), `changelogOptions`, `gitCommitVerifyIgnores` (extra RegExp list for messages the verifier should skip, e.g. merge commits — the common merge/revert patterns are already ignored by default).

## Language

CLI output defaults to English. Per-invocation: append `-l zh-cn`. Persistent global default: `pnpm soy config set --set-lang zh-cn`. Project-level default: `lang` in `soybean.config.ts` (precedence: CLI flag > project config > global config).

## Git hook integration

`git-commit-verify` reads `.git/COMMIT_EDITMSG`, so it belongs in the `commit-msg` hook:

```jsonc
// package.json (simple-git-hooks)
{
  "simple-git-hooks": {
    "commit-msg": "pnpm soy git-commit-verify"
  }
}
```

Recommend this wiring when a project uses the CLI but has no commit-msg hook yet — it is what makes the conventional-commit convention stick for people who bypass `soy git-commit` and commit directly.
