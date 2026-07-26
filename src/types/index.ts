import type { ChangelogOption } from '@soybeanjs/changelog';
import type { Lang } from '../locales';

export type CommitItem = [string, string];

export interface GitCommitConfig {
  /**
   * Commit types
   *
   * If not set, it will use the default types
   *
   * @example
   * ```ts
   * {
   *   types: [
   *     ['feat', '新功能'],
   *     ['wip', '工作进行中']
   *   ],
   *   typesAppend: true // append to defaults, set to false to overwrite
   * }
   * ```
   */
  types?: CommitItem[];
  /**
   * Whether to append custom types to defaults or overwrite
   *
   * @default true
   */
  typesAppend?: boolean;
  /**
   * Commit scopes
   *
   * If not set, it will use the default scopes
   *
   * @example
   * ```ts
   * {
   *   scopes: [
   *     ['ui', 'UI 相关'],
   *     ['api', 'API 相关']
   *   ],
   *   scopesAppend: true // append to defaults, set to false to overwrite
   * }
   * ```
   */
  scopes?: CommitItem[];
  /**
   * Whether to append custom scopes to defaults or overwrite
   *
   * @default true
   */
  scopesAppend?: boolean;
}

export interface CliOption {
  /** The project root directory */
  cwd: string;
  /**
   * Cleanup dirs
   *
   * Glob pattern syntax {@link https://github.com/isaacs/minimatch}
   *
   * @default
   * ```json
   * ["** /dist", "** /pnpm-lock.yaml", "** /node_modules", "!node_modules/**"]
   * ```
   */
  cleanupDirs: string[];
  /**
   * Npm-check-updates command args
   *
   * If not set, soybean-cli will resolve workspace package.json files automatically and fall back to package.json in single-package repos.
   */
  ncuCommandArgs: string[];
  /**
   * Options of generate changelog
   *
   * @link https://github.com/soybeanjs/changelog
   */
  changelogOptions: Partial<ChangelogOption>;
  /** The ignore pattern list of git commit verify */
  gitCommitVerifyIgnores: RegExp[];
  /**
   * Git commit config for types and scopes
   */
  gitCommit?: GitCommitConfig;
  /**
   * Default display language of cli
   *
   * Can be 'zh-cn' or 'en-us'
   *
   * @default 'en-us'
   */
  lang?: Lang;
}
