import { ofetch } from 'ofetch';
import { consola } from 'consola';
import pkg from '../../package.json';

/**
 * Sync npmmirror
 *
 * @param pkgName Package name, id has multiple packages, you can use ',' to separate them.
 * @param showLog Show log. Defaults to true
 */
export async function syncNpmmirror(pkgName?: string, showLog = true) {
  if (!pkgName) {
    await syncNpmmirrorAction(pkg.name, showLog);

    return;
  }

  const names = (pkgName?.split?.(',') || []).filter(Boolean).map(item => item.trim());

  const pkgNames = [...new Set(names)];

  for await (const name of pkgNames) {
    await syncNpmmirrorAction(name, showLog);
  }
}

/**
 * Sync npmmirror action
 *
 * @param pkgName Package name. Defaults to package name in package.json
 * @param showLog Show log. Defaults to true
 */
export async function syncNpmmirrorAction(pkgName: string = pkg.name, showLog = true) {
  const url = `https://registry-direct.npmmirror.com/${pkgName}/sync?sync_upstream=true`;

  const { logId = '' } = await ofetch<{ logId: string }>(url, { method: 'PUT' });

  if (!logId) return;

  const logUrl = `https://registry.npmmirror.com/-/package/${pkgName}/syncs/${logId}/log`;

  const SUCCESS_LOG = `Sync ${pkgName} success`;

  const DURATION = 1000 * 60;

  const now = Date.now();

  let log = '';

  let intervalId: NodeJS.Timeout | null = setInterval(async () => {
    try {
      log = await ofetch<string>(logUrl, { method: 'GET' });

      if (showLog) {
        consola.log(log);
      }

      const isTimeout = Date.now() - now > DURATION;

      if (intervalId && (log.includes(SUCCESS_LOG) || isTimeout)) {
        clearInterval(intervalId);
        intervalId = null;
      }
    } catch {}
  }, 2000);
}
