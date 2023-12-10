import { createRequire } from 'node:module';
import type { Options } from 'execa';

export async function execCommand(cmd: string, args: string[], options?: Options) {
  const { execa } = await import('execa');
  const res = await execa(cmd, args, options);
  return res?.stdout?.trim() || '';
}

const require = createRequire(import.meta.url);

const CryptoJS = require('crypto-js');

export class Crypto<T> {
  secret: string;

  constructor(secret: string) {
    this.secret = secret;
  }

  enCrypto(data: T) {
    const newData = JSON.stringify(data);
    return CryptoJS.AES.encrypt(newData, this.secret).toString();
  }

  /** @param cipherText */
  deCrypto(cipherText: string) {
    const bytes = CryptoJS.AES.decrypt(cipherText, this.secret);
    const originalText = bytes.toString(CryptoJS.enc.Utf8);
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
