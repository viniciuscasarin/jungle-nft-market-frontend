import type { StorybookConfig } from '@storybook/react-vite';
import tailwindcss from '@tailwindcss/vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import path from 'node:path';

const config: StorybookConfig = {
  stories: [
    '../src/**/*.mdx',
    '../../../libs/shared/ui/src/**/*.stories.@(js|jsx|mjs|ts|tsx)',
    '../../../libs/shared/ui/src/**/*.mdx',
    '../../../libs/profile/ui/src/**/*.stories.@(js|jsx|mjs|ts|tsx)',
  ],
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
    '@storybook/addon-a11y',
    '@storybook/addon-designs',
    'storybook-addon-pseudo-states',
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  core: {
    disableTelemetry: true,
  },
  staticDirs: [
    '../../shell/public',
    { from: '../../../design/assets', to: '/assets' },
  ],
  async viteFinal(config) {
    config.plugins = config.plugins || [];
    config.plugins.push(
      tsconfigPaths({ projects: [path.resolve(__dirname, '../../../tsconfig.base.json')] }),
      tailwindcss()
    );
    return config;
  },
};

export default config;
