import { join } from 'path';
import { existsSync } from 'fs';
import { generateChangelog, generateTotalChangelog } from '@soybeanjs/changelog';
import type { ChangelogOption } from '@soybeanjs/changelog';
import { execCommand } from '../shared';

export async function genChangelog(options?: Partial<ChangelogOption>, total = false) {
  const changelogPath = join(process.cwd(), 'CHANGELOG.md');
  const hasChangelog = existsSync(changelogPath);

  if (total) {
    await generateTotalChangelog(options);
  } else {
    await generateChangelog(options);
  }

  if (!hasChangelog) {
    await execCommand('git', ['add', 'CHANGELOG.md']);
  }
}
