import { existsSync, readFileSync } from 'node:fs';
import process from 'node:process';
import { loadConfig } from 'c12';
import { locales } from '../locales';
import type { CliOption, CommitItem, GitCommitConfig } from '../types';

const defaultGitCommitVerifyIgnores = [
  /^((Merge pull request)|(Merge (.*?) into (.*?)|(Merge branch (.*?)))(?:\r?\n)*$)/m,
  /^(Merge tag (.*?))(?:\r?\n)*$/m,
  /^(R|r)evert (.*)/,
  /^(amend|fixup|squash)!/,
  /^(Merged (.*?)(in|into) (.*)|Merged PR (.*): (.*))/,
  /^Merge remote-tracking branch(\s*)(.*)/,
  /^Automatic merge(.*)/,
  /^Auto-merged (.*?) into (.*)/
];

const defaultOptions: CliOption = {
  cwd: process.cwd(),
  cleanupDirs: [
    '**/dist',
    '**/package-lock.json',
    '**/yarn.lock',
    '**/pnpm-lock.yaml',
    '**/node_modules',
    '!node_modules/**'
  ],
  ncuCommandArgs: [],
  changelogOptions: {},
  gitCommitVerifyIgnores: defaultGitCommitVerifyIgnores,
  gitCommit: {
    typesAppend: true,
    scopesAppend: true
  },
  lang: 'en-us'
};

function mergeCommitItems(defaults: CommitItem[], custom?: CommitItem[], append = true): CommitItem[] {
  if (!custom || custom.length === 0) return defaults;
  if (!append) return custom;

  const existing = new Map(defaults);
  for (const [key, value] of custom) {
    existing.set(key, value);
  }
  return Array.from(existing.entries());
}

function resolveGitCommitConfig(config: Partial<CliOption>, lang: string): GitCommitConfig {
  const gitCommitConfig = config.gitCommit || {};
  const defaultLocale = locales[lang as keyof typeof locales] || locales['en-us'];

  const defaultTypes = defaultLocale.gitCommitTypes;
  const defaultScopes = defaultLocale.gitCommitScopes;

  const types = mergeCommitItems(defaultTypes, gitCommitConfig.types, gitCommitConfig.typesAppend !== false);
  const scopes = mergeCommitItems(defaultScopes, gitCommitConfig.scopes, gitCommitConfig.scopesAppend !== false);

  return {
    types,
    scopes,
    typesAppend: gitCommitConfig.typesAppend !== false,
    scopesAppend: gitCommitConfig.scopesAppend !== false
  };
}

function readGlobalConfig(): Partial<CliOption> {
  const globalConfigPath = getGlobalConfigPath();
  if (!existsSync(globalConfigPath)) {
    return {};
  }
  try {
    const content = readFileSync(globalConfigPath, 'utf8');
    return JSON.parse(content) as Partial<CliOption>;
  } catch {
    return {};
  }
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value) &&
    !(value instanceof RegExp) &&
    !(value instanceof Date)
  );
}

function deepMerge(target: Record<string, unknown>, source: Record<string, unknown>): Record<string, unknown> {
  const result = { ...target };
  for (const key of Object.keys(source)) {
    const sourceVal = source[key];
    const targetVal = result[key];
    if (sourceVal !== undefined) {
      if (isPlainObject(sourceVal) && isPlainObject(targetVal)) {
        result[key] = deepMerge(targetVal, sourceVal);
      } else {
        result[key] = sourceVal;
      }
    }
  }
  return result;
}

export async function loadCliOptions(overrides?: Partial<CliOption>, cwd = process.cwd()) {
  const { config: projectConfig } = await loadConfig<Partial<CliOption>>({
    name: 'soybean',
    defaults: {},
    overrides,
    cwd,
    packageJson: true,
    rcFile: false
  });

  const globalConfig = readGlobalConfig();

  let mergedConfig = deepMerge(
    { ...defaultOptions } as unknown as Record<string, unknown>,
    globalConfig as Record<string, unknown>
  );
  mergedConfig = deepMerge(mergedConfig, projectConfig as Record<string, unknown>);

  const resolvedConfig = mergedConfig as unknown as CliOption;

  if (resolvedConfig.gitCommitVerifyIgnores) {
    resolvedConfig.gitCommitVerifyIgnores = [
      ...defaultGitCommitVerifyIgnores,
      ...resolvedConfig.gitCommitVerifyIgnores.filter(
        item => !defaultGitCommitVerifyIgnores.some(def => def.toString() === item.toString())
      )
    ];
  }

  const lang = resolvedConfig.lang || 'en-us';
  resolvedConfig.gitCommit = resolveGitCommitConfig(resolvedConfig, lang);
  resolvedConfig.lang = lang;

  return resolvedConfig;
}

export function getGlobalConfigPath(): string {
  const homeDir = process.env.HOME || process.env.USERPROFILE || '.';
  return `${homeDir}/.soybeanrc`;
}
