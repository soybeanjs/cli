import { ofetch } from 'ofetch';
import { consola } from 'consola';
import pkg from '../../package.json';

/**
 * Sync npmmirror
 *
 * @default package name in package.json
 * @param pkgName Package name
 * @param showLog Show log. Defaults to true
 */
export async function syncNpmmirror(pkgName: string = pkg.name, showLog = true) {
  const url = `https://registry-direct.npmmirror.com/${pkgName}/sync?sync_upstream=true`;

  const { logId = '' } = await ofetch<{ logId: string }>(url, { method: 'PUT' });

  if (!logId) return;

  const logUrl = `https://registry.npmmirror.com/-/package/${pkgName}/syncs/${logId}/log`;

  const SUCCESS_LOG = `Sync ${pkgName} success`;

  let log = '';

  let intervalId: NodeJS.Timeout | null = setInterval(async () => {
    try {
      log = await ofetch<string>(logUrl, { method: 'GET' });

      if (showLog) {
        consola.log(log);
      }

      if (log.includes(SUCCESS_LOG) && intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
    } catch {}
  }, 2000);
}
