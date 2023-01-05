import { $ } from 'zx';

export async function updatePkg() {
  await $`ncu --deep -u`;
}
