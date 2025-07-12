import process from 'node:process';
import path from 'node:path';
import { readFile, writeFile } from 'node:fs/promises';
import { globSync } from 'tinyglobby';

async function updateTemplateVersion() {
  const cwd = process.cwd();

  const globs = globSync(path.join(cwd, 'packages/create-soybean/template-*/package.json'), {
    onlyFiles: true
  });

  const pkgJson = await readFile(path.join(cwd, 'package.json'), 'utf-8');

  const { version: newVersion } = JSON.parse(pkgJson);

  const pkgVersionReg = /"version": "\d+\.\d+\.\d+(-(beta|alpha)\.\d+)?"/;

  const soybeanJsCliVersionReg = /"@soybeanjs\/cli": "\d+\.\d+\.\d+(-(beta|alpha)\.\d+)?"/;

  for await (const glob of globs) {
    const json = await readFile(glob, 'utf-8');

    const newPkgJson = json
      .replace(pkgVersionReg, `"version": "0.0.0"`)
      .replace(soybeanJsCliVersionReg, `"@soybeanjs/cli": "${newVersion}"`);

    await writeFile(glob, newPkgJson);
  }
}

updateTemplateVersion();
