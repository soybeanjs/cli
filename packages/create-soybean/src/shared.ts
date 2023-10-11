import { readdirSync, existsSync, rmSync, mkdirSync, statSync, copyFileSync } from 'node:fs';
import path from 'node:path';

export function formatTargetDir(targetDir?: string) {
  return targetDir?.trim()?.replace(/\/+$/g, '');
}

export function isPathEmpty($path: string) {
  const files = readdirSync($path);
  return files.length === 0 || (files.length === 1 && files[0] === '.git');
}

export function isValidPackageName(projectName: string) {
  return /^(?:@[a-z\d\-*~][a-z\d\-*._~]*\/)?[a-z\d\-~][a-z\d\-._~]*$/.test(projectName);
}

export function toValidPackageName(projectName: string) {
  return projectName
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/^[._]/, '')
    .replace(/[^a-z\d\-~]+/g, '-');
}

export function emptyDir(dir: string) {
  const isExist = existsSync(dir);

  if (!isExist) {
    return;
  }

  const files = readdirSync(dir);

  for (const file of files) {
    if (file !== '.git') {
      const filePath = path.resolve(dir, file);

      rmSync(filePath, { recursive: true, force: true });
    }
  }
}

function copyDir(srcDir: string, destDir: string) {
  mkdirSync(destDir, { recursive: true });

  const files = readdirSync(srcDir);

  for (const file of files) {
    const srcFile = path.resolve(srcDir, file);
    const destFile = path.resolve(destDir, file);

    copy(srcFile, destFile);
  }
}

export function copy(src: string, dest: string) {
  const stat = statSync(src);

  if (stat.isDirectory()) {
    copyDir(src, dest);
  } else {
    copyFileSync(src, dest);
  }
}
