import { SOYBEAN_GITHUB_TOKEN } from '@soybeanjs/cli';
import type { CliOption } from '@soybeanjs/cli';

const config: Partial<CliOption> = {
  changelogOptions: {
    github: {
      repo: '',
      token: SOYBEAN_GITHUB_TOKEN
    }
  }
};

export default config;
