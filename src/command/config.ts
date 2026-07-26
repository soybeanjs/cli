import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { consola } from 'consola';
import { green, yellow } from 'kolorist';
import { getGlobalConfigPath, loadCliOptions } from '../config';
import type { Lang } from '../locales';

interface ConfigSetOptions {
  lang?: Lang;
}

function readGlobalConfig(): Record<string, unknown> {
  const filePath = getGlobalConfigPath();
  if (!existsSync(filePath)) {
    return {};
  }
  try {
    const content = readFileSync(filePath, 'utf8');
    return JSON.parse(content);
  } catch {
    consola.warn(`Failed to parse global config at ${filePath}, will create new one.`);
    return {};
  }
}

function writeGlobalConfig(config: Record<string, unknown>) {
  const filePath = getGlobalConfigPath();
  writeFileSync(filePath, JSON.stringify(config, null, 2), 'utf8');
}

export async function configSet(options: ConfigSetOptions) {
  const config = readGlobalConfig();

  if (options.lang) {
    if (options.lang !== 'zh-cn' && options.lang !== 'en-us') {
      consola.error(`Invalid language: ${options.lang}. Supported values: 'zh-cn', 'en-us'`);
      return;
    }
    config.lang = options.lang;
    writeGlobalConfig(config);
    consola.success(`Default language set to ${green(options.lang)}`);
    consola.info(`Config file: ${yellow(getGlobalConfigPath())}`);
  }
}

export async function configGet() {
  const config = await loadCliOptions();

  consola.log('\nCurrent configuration:');
  consola.log(`  ${green('lang')}:         ${config.lang}`);
  consola.log(`  ${green('cwd')}:          ${config.cwd}`);
  consola.log(`  ${green('global config')}: ${getGlobalConfigPath()}\n`);
}

export async function configPath() {
  consola.log(getGlobalConfigPath());
}
