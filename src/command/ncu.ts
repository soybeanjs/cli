import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import process from 'node:process';
import { execCommand } from '../shared';

export async function ncu(args?: string[]) {
  // When no explicit args are provided, auto-detect workspace mode so that
  // `-w` is only added for projects that actually declare workspaces.
  const finalArgs = args && args.length > 0 ? args : hasWorkspaces() ? ['-u', '-w'] : ['-u'];
  await execCommand('pnpm', ['npm-check-updates', ...finalArgs], { stdio: 'inherit' });
}

/**
 * Detect whether the current project is a workspace/monorepo.
 *
 * npm-check-updates' `-w` flag recognizes workspaces from either:
 *   1. the `workspaces` field in package.json (npm/yarn format), or
 *   2. the `packages` field in pnpm-workspace.yaml (pnpm format, used as
 *      fallback when `workspaces` is absent from package.json).
 *
 * Applying `-w` to a non-workspace project causes ncu to fail with:
 * "workspaces property missing from package.json".
 */
function hasWorkspaces(cwd: string = process.cwd()): boolean {
  // 1. Check `workspaces` in package.json (npm/yarn format)
  const pkgPath = join(cwd, 'package.json');
  if (existsSync(pkgPath)) {
    try {
      const pkg = JSON.parse(readFileSync(pkgPath, 'utf8')) as { workspaces?: unknown };
      if (pkg.workspaces) return true;
    } catch {}
  }

  // 2. Check `packages` in pnpm-workspace.yaml (pnpm format)
  const wsPath = join(cwd, 'pnpm-workspace.yaml');
  if (existsSync(wsPath)) {
    try {
      // `packages` is a top-level key in pnpm-workspace.yaml. Match it at the
      // start of a line (no indentation) to avoid matching nested keys.
      const content = readFileSync(wsPath, 'utf8');
      if (/^packages\s*:/m.test(content)) return true;
    } catch {}
  }

  return false;
}
