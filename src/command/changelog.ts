import { generateChangelog } from '../changelog';

export async function genChangelog(total = false) {
  await generateChangelog(total);
}
