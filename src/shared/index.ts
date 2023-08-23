import { AES, enc } from 'crypto-js';
import type { Options } from 'execa';

export async function execCommand(cmd: string, args: string[], options?: Options) {
  const { execa } = await import('execa');
  const res = await execa(cmd, args, options);
  return res?.stdout?.trim() || '';
}

export function notNullish<T>(v?: T | null): v is NonNullable<T> {
  return v !== null && v !== undefined;
}

type PartitionFilter<T> = (i: T, idx: number, arr: readonly T[]) => any;

/**
 * Divide an array into two parts by a filter function
 * @category Array
 * @example const [odd, even] = partition([1, 2, 3, 4], i => i % 2 != 0)
 */
export function partition<T>(array: readonly T[], f1: PartitionFilter<T>): [T[], T[]];
export function partition<T>(array: readonly T[], f1: PartitionFilter<T>, f2: PartitionFilter<T>): [T[], T[], T[]];
export function partition<T>(
  array: readonly T[],
  f1: PartitionFilter<T>,
  f2: PartitionFilter<T>,
  f3: PartitionFilter<T>
): [T[], T[], T[], T[]];
export function partition<T>(
  array: readonly T[],
  f1: PartitionFilter<T>,
  f2: PartitionFilter<T>,
  f3: PartitionFilter<T>,
  f4: PartitionFilter<T>
): [T[], T[], T[], T[], T[]];
export function partition<T>(
  array: readonly T[],
  f1: PartitionFilter<T>,
  f2: PartitionFilter<T>,
  f3: PartitionFilter<T>,
  f4: PartitionFilter<T>,
  f5: PartitionFilter<T>
): [T[], T[], T[], T[], T[], T[]];
export function partition<T>(
  array: readonly T[],
  f1: PartitionFilter<T>,
  f2: PartitionFilter<T>,
  f3: PartitionFilter<T>,
  f4: PartitionFilter<T>,
  f5: PartitionFilter<T>,
  f6: PartitionFilter<T>
): [T[], T[], T[], T[], T[], T[], T[]];
export function partition<T>(array: readonly T[], ...filters: PartitionFilter<T>[]): any {
  const result: T[][] = new Array(filters.length + 1).fill(null).map(() => []);

  array.forEach((e, idx, arr) => {
    let i = 0;
    for (const filter of filters) {
      if (filter(e, idx, arr)) {
        result[i].push(e);
        return;
      }
      i += 1;
    }
    result[i].push(e);
  });
  return result;
}

export function groupBy<T>(items: T[], key: string, groups: Record<string, T[]> = {}) {
  for (const item of items) {
    const v = (item as any)[key] as string;
    groups[v] = groups[v] || [];
    groups[v].push(item);
  }
  return groups;
}

export function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function join(array?: string[], glue = ', ', finalGlue = ' and '): string {
  if (!array || array.length === 0) return '';

  if (array.length === 1) return array[0];

  if (array.length === 2) return array.join(finalGlue);

  return `${array.slice(0, -1).join(glue)}${finalGlue}${array.slice(-1)}`;
}

export function upperFirst(string?: string) {
  return !string ? '' : string[0].toUpperCase() + string.slice(1);
}

export class Crypto<T> {
  secret: string;

  constructor(secret: string) {
    this.secret = secret;
  }

  enCrypto(data: T) {
    const newData = JSON.stringify(data);
    return AES.encrypt(newData, this.secret).toString();
  }

  /**
   * @param cipherText
   */
  deCrypto(cipherText: string) {
    const bytes = AES.decrypt(cipherText, this.secret);
    const originalText = bytes.toString(enc.Utf8);
    if (originalText) {
      try {
        const result = JSON.parse(originalText);

        return result as T;
      } catch {
        return null;
      }
    }
    return null;
  }
}
