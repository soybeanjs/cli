import { SOYBEAN_GITHUB_TOKEN } from './src/config';
import type { CliOption } from './src/types';

const config: Partial<CliOption> = {
  changelogOptions: {
    github: {
      repo: '',
      token: SOYBEAN_GITHUB_TOKEN
    }
  }
};

export default config;
