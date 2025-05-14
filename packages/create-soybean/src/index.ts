#!/usr/bin/env node
import process from 'node:process';
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { blue, green, red, reset, yellow } from 'kolorist';
import minimist from 'minimist';
import prompts from 'prompts';
import type { Answers } from 'prompts';
import { consola } from 'consola';
import { copy, emptyDir, formatTargetDir, isPathEmpty, isValidPackageName, toValidPackageName } from './shared';

type TemplateType = 'ts-lib-tsup' | 'ts-lib-unbuild' | 'pnpm-monorepo' | 'vue';

type ColorFunc = (str: string | number) => string;

interface Template {
  type: TemplateType;
  name: string;
  color: ColorFunc;
}

const templates: Template[] = [
  {
    type: 'ts-lib-tsup',
    name: 'TypeScript library by tsup',
    color: blue
  },
  {
    type: 'ts-lib-unbuild',
    name: 'TypeScript library by unbuild',
    color: blue
  },
  {
    type: 'pnpm-monorepo',
    name: 'Pnpm monorepo',
    color: yellow
  },
  {
    type: 'vue',
    name: 'Vue 3',
    color: green
  }
];

const TEMPLATES = templates.map(t => t.type);

const renameFiles: Record<string, string | undefined> = {
  _editorconfig: '.editorconfig',
  _gitattributes: '.gitattributes',
  _gitignore: '.gitignore',
  _npmrc: '.npmrc',
  _prettierrc: '.prettierrc'
};

const defaultTargetDir = 'create-soybean-project';

interface CliArgs {
  t?: string;
  template?: string;
}

async function setupCli() {
  const cwd = process.cwd();

  const argv = minimist<CliArgs>(process.argv.slice(2), { string: ['_'] });

  const argTargetDir = formatTargetDir(argv._[0]);
  const argTemplate = (argv.template || argv.t) as TemplateType | undefined;

  let targetDir = argTargetDir || defaultTargetDir;

  function getProjectName() {
    return targetDir === '.' ? path.basename(path.resolve()) : targetDir;
  }

  let result: Answers<'projectName' | 'overwrite' | 'packageName' | 'template'> | null = null;

  try {
    result = await prompts([
      {
        type: argTargetDir ? null : 'text',
        name: 'projectName',
        message: reset('Project name:'),
        initial: defaultTargetDir,
        onState: state => {
          targetDir = formatTargetDir(state.value) || defaultTargetDir;
        }
      },
      {
        type: () => (!existsSync(targetDir) || isPathEmpty(targetDir) ? null : 'confirm'),
        name: 'overwrite',
        message: () =>
          `${
            targetDir === '.' ? 'Current directory' : `Target directory "${targetDir}"`
          } is not empty. Remove existing files and continue?`
      },
      {
        type: (_, { overwrite }: { overwrite?: boolean }) => {
          if (overwrite === false) {
            throw new Error(`${red('✖')} Operation cancelled`);
          }

          return null;
        },
        name: 'overwriteChecker'
      },
      {
        type: () => (isValidPackageName(getProjectName()) ? null : 'text'),
        name: 'packageName',
        message: reset('Package name:'),
        initial: () => toValidPackageName(getProjectName()),
        validate: dir => isValidPackageName(dir) || 'Invalid package.json name'
      },
      {
        type: argTemplate && TEMPLATES.includes(argTemplate) ? null : 'select',
        name: 'template',
        message:
          typeof argTemplate === 'string' && !TEMPLATES.includes(argTemplate)
            ? reset(`"${argTemplate}" isn't a valid template. Please choose from below: `)
            : reset('Select a template:'),
        initial: 0,
        choices: templates.map(({ type, name, color }) => ({
          title: color(name),
          value: type
        }))
      }
    ]);
  } catch (error) {
    consola.error(error);
  }

  if (!result) {
    return;
  }

  const { template, overwrite, packageName } = result;

  const root = path.join(cwd, targetDir);

  if (overwrite) {
    emptyDir(root);
  } else if (!existsSync(root)) {
    mkdirSync(root, { recursive: true });
  }

  const $template: string = template || argTemplate;

  consola.info(`\nScaffolding project in ${root}...`);

  const templateDir = path.resolve(fileURLToPath(import.meta.url), '../..', `template-${$template}`);

  const write = (file: string, content?: string) => {
    const targetPath = path.join(root, renameFiles[file] ?? file);
    if (content) {
      writeFileSync(targetPath, content);
    } else {
      copy(path.join(templateDir, file), targetPath);
    }
  };

  const files = readdirSync(templateDir);
  for (const file of files.filter(f => f !== 'package.json')) {
    write(file);
  }

  const pkg = JSON.parse(readFileSync(path.join(templateDir, `package.json`), 'utf-8'));

  pkg.name = packageName || getProjectName();

  write('package.json', `${JSON.stringify(pkg, null, 2)}\n`);

  const cdProjectName = path.relative(cwd, root);

  consola.info(`\nDone. Now run:\n`);

  if (root !== cwd) {
    consola.info(`  cd ${cdProjectName.includes(' ') ? `"${cdProjectName}"` : cdProjectName}`);
  }
}

setupCli();
