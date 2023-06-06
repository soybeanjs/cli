import { generateChangelog, generateTotalChangelog } from '@soybeanjs/changelog';

export function genChangelog(total = false) {
  if (total) {
    generateTotalChangelog();
  } else {
    generateChangelog();
  }
}
