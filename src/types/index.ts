import type { ChangelogOption } from '@soybeanjs/changelog';

export interface CliOption {
  name?: string;
  /**
   * options of generate changelog
   * @link https://github.com/soybeanjs/changelog
   */
  changelogOptions?: Partial<ChangelogOption>;
  prettierFormatFiles?: string[];
}
