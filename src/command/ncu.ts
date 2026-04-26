import { readFile } from 'node:fs/promises';
import { join, posix } from 'node:path';
import process from 'node:process';
import { glob } from 'tinyglobby';
import { execCommand } from '../shared';

interface PackageJsonWorkspace {
  workspaces?: string[] | { packages?: string[] };
}

export async function ncu(args: string[] = []) {
  const ncuArgs = args.length ? args : await resolveDefaultNcuArgs();

  await execCommand('pnpm', ['npm-check-updates', ...ncuArgs], { stdio: 'inherit' });
}

function parsePnpmWorkspacePackages(content: string) {
  const lines = content.split(/\r?\n/u);
  const packages: string[] = [];
  let inPackages = false;

  for (const line of lines) {
    const trimmedLine = line.trim();

    if (!inPackages) {
      if (trimmedLine === 'packages:') {
        inPackages = true;
      }

      continue;
    }

    if (!trimmedLine || trimmedLine.startsWith('#')) {
      continue;
    }

    if (/^\S/u.test(line)) {
      break;
    }

    const match = line.match(/^\s*-\s*['"]?(.+?)['"]?\s*$/u);

    if (match?.[1]) {
      packages.push(match[1]);
    }
  }

  return packages;
}

function resolveWorkspacePatterns(packageJson: PackageJsonWorkspace | null, pnpmWorkspaceContent: string | null) {
  const workspaces = Array.isArray(packageJson?.workspaces)
    ? packageJson.workspaces
    : (packageJson?.workspaces?.packages ?? []);

  const pnpmWorkspacePackages = pnpmWorkspaceContent ? parsePnpmWorkspacePackages(pnpmWorkspaceContent) : [];

  return [...new Set([...workspaces, ...pnpmWorkspacePackages])];
}

function toPackageFilePattern(pattern: string) {
  const normalizedPattern = pattern.trim();

  if (!normalizedPattern) {
    return '';
  }

  const isNegated = normalizedPattern.startsWith('!');
  const rawPattern = isNegated ? normalizedPattern.slice(1) : normalizedPattern;
  const cleanPattern = rawPattern.replace(/\/$/u, '');
  const packageFilePattern = cleanPattern.endsWith('package.json')
    ? cleanPattern
    : posix.join(cleanPattern, 'package.json');

  return isNegated ? `!${packageFilePattern}` : packageFilePattern;
}

async function resolveDefaultNcuArgs(cwd = process.cwd()) {
  const [packageJsonContent, pnpmWorkspaceContent] = await Promise.all([
    readFile(join(cwd, 'package.json'), 'utf8').catch(() => null),
    readFile(join(cwd, 'pnpm-workspace.yaml'), 'utf8').catch(() => null)
  ]);

  const packageJson = packageJsonContent ? (JSON.parse(packageJsonContent) as PackageJsonWorkspace) : null;
  const workspacePatterns = resolveWorkspacePatterns(packageJson, pnpmWorkspaceContent)
    .map(toPackageFilePattern)
    .filter(Boolean);

  if (!workspacePatterns.length) {
    return ['-u', '--packageFile', 'package.json'];
  }

  const packageFiles = await glob(['package.json', ...workspacePatterns], {
    cwd,
    followSymbolicLinks: false,
    onlyFiles: true
  });

  const uniquePackageFiles = [...new Set(packageFiles)].sort((left, right) => {
    if (left === 'package.json') {
      return -1;
    }

    if (right === 'package.json') {
      return 1;
    }

    return left.localeCompare(right);
  });

  if (!uniquePackageFiles.length) {
    return ['-u', '--packageFile', 'package.json'];
  }

  return ['-u', '--packageFile', `{${uniquePackageFiles.join(',')}}`];
}
