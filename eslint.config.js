import nxPlugin from '@nx/eslint-plugin';
import tsPlugin from 'typescript-eslint';
import jsxA11yPlugin from 'eslint-plugin-jsx-a11y';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';

const baseRestrictedPaths = [
  {
    name: 'axios',
    message: 'Direct import of axios is prohibited outside @nft/shared-http.',
  },
  {
    name: 'socket.io-client',
    message: 'Direct import of socket.io-client is prohibited outside @nft/shared-realtime.',
  },
  {
    name: 'decimal.js',
    message: 'Direct import of decimal.js is prohibited outside @nft/shared-money.',
  },
  {
    name: 'msw',
    message: 'Direct import of msw is prohibited outside mocks, shell-kit, and web-e2e.',
  },
  {
    name: '@mswjs/socket.io-binding',
    message: 'Direct import of @mswjs/socket.io-binding is prohibited outside mocks, shell-kit, and web-e2e.',
  },
  {
    name: '@tanstack/react-query',
    message: 'Direct import of @tanstack/react-query is prohibited outside shared-query, data-access, and feature.',
  },
  {
    name: '@nft/shared-testing',
    message: 'Direct import of @nft/shared-testing is restricted to test and story files (*.spec.*, *.test.*, *.stories.*).',
  },
];


const baseRestrictedPatterns = [
  {
    group: ['@radix-ui/*'],
    message: 'Direct import of @radix-ui/* is prohibited outside @nft/shared-ui.',
  },
];

function buildRestrictedImports({ allow = [] } = {}) {
  const allowedSet = new Set(allow);
  const paths = baseRestrictedPaths.filter(p => !allowedSet.has(p.name));
  const patterns = allowedSet.has('@radix-ui/*') ? [] : baseRestrictedPatterns;
  return [
    'error',
    {
      paths,
      patterns,
    },
  ];
}

export default [
  {
    ignores: [
      '**/dist',
      '**/tmp',
      '**/node_modules',
      '**/coverage',
      '**/.nx',
      '**/*.gen.ts',
      '**/@mf-types/**',
      '**/public/**',
      'dist',
      'build',
    ],
  },
  ...tsPlugin.configs.recommended,
  jsxA11yPlugin.flatConfigs.recommended,
  {
    plugins: {
      '@nx': nxPlugin,
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
    },
    rules: {
      ...reactHooksPlugin.configs.recommended.rules,
      'react/react-in-jsx-scope': 'off',
      '@nx/enforce-module-boundaries': [
        'error',
        {
          enforceBuildableLibDependency: true,
          allowCircularSelfDependency: false,
          checkDynamicDependenciesExceptions: [
            '@nft/mocks-core',
            '@nft/mocks-handlers',
            'msw/browser',
          ],
          allow: [],
          depConstraints: [
            // 1. Cross-app imports prohibited
            {
              sourceTag: 'type:app',
              notDependOnLibsWithTags: ['type:app'],
            },

            // 2. Cross-flow imports prohibited
            {
              sourceTag: 'flow:shell',
              onlyDependOnLibsWithTags: ['flow:shell', 'flow:shared'],
            },
            {
              sourceTag: 'flow:storefront',
              onlyDependOnLibsWithTags: ['flow:storefront', 'flow:shared'],
            },
            {
              sourceTag: 'flow:checkout',
              onlyDependOnLibsWithTags: ['flow:checkout', 'flow:shared'],
            },
            {
              sourceTag: 'flow:account',
              onlyDependOnLibsWithTags: ['flow:account', 'flow:shared'],
            },
            {
              sourceTag: 'flow:shared',
              onlyDependOnLibsWithTags: ['flow:shared'],
            },
            {
              sourceTag: 'flow:tooling',
              onlyDependOnLibsWithTags: ['type:ui', 'flow:shared'],
            },
            {
              sourceTag: 'flow:tooling',
              notDependOnLibsWithTags: [
                'type:app',
                'type:feature',
                'type:data-access',
                'scope:mocks',
              ],
            },

            // 3. Layer hierarchy enforcement (app -> feature -> ui / data-access -> domain -> shared)
            {
              sourceTag: 'type:domain',
              onlyDependOnLibsWithTags: ['scope:contracts', 'scope:money'],
            },
            {
              sourceTag: 'type:ui',
              notDependOnLibsWithTags: [
                'type:app',
                'type:feature',
                'type:data-access',
                'scope:mocks',
              ],
            },
            {
              sourceTag: 'type:data-access',
              notDependOnLibsWithTags: [
                'type:app',
                'type:feature',
                'type:ui',
                'scope:mocks',
              ],
            },
            {
              sourceTag: 'type:feature',
              notDependOnLibsWithTags: ['type:app', 'scope:mocks'],
            },

            // 4. Mock isolation: only shell, shell-kit, and web-e2e can import mocks
            {
              sourceTag: 'scope:storefront',
              notDependOnLibsWithTags: ['scope:mocks'],
            },
            {
              sourceTag: 'scope:checkout',
              notDependOnLibsWithTags: ['scope:mocks'],
            },
            {
              sourceTag: 'scope:account',
              notDependOnLibsWithTags: ['scope:mocks'],
            },
            {
              sourceTag: 'scope:testing',
              notDependOnLibsWithTags: ['type:app', 'type:feature'],
            },
            {
              sourceTag: 'scope:shared',
              notDependOnLibsWithTags: ['scope:mocks', 'type:app', 'type:feature'],
            },
            {
              sourceTag: 'scope:tooling',
              notDependOnLibsWithTags: [
                'scope:mocks',
                'type:app',
                'type:feature',
                'type:data-access',
              ],
            },
          ],
        },
      ],
      'no-restricted-imports': buildRestrictedImports(),
    },
  },
  // Overrides for encapsulated third-party libraries
  {
    files: ['libs/shared/http/**/*.{ts,tsx,js,jsx}'],
    rules: {
      'no-restricted-imports': buildRestrictedImports({ allow: ['axios'] }),
    },
  },
  {
    files: ['libs/shared/realtime/**/*.{ts,tsx,js,jsx}'],
    rules: {
      'no-restricted-imports': buildRestrictedImports({ allow: ['socket.io-client'] }),
    },
  },
  {
    files: ['libs/shared/money/**/*.{ts,tsx,js,jsx}'],
    rules: {
      'no-restricted-imports': buildRestrictedImports({ allow: ['decimal.js'] }),
    },
  },
  {
    files: ['libs/shared/ui/**/*.{ts,tsx,js,jsx}'],
    rules: {
      'no-restricted-imports': buildRestrictedImports({ allow: ['@radix-ui/*'] }),
    },
  },
  {
    files: [
      'libs/shared/query/**/*.{ts,tsx,js,jsx}',
      'libs/**/data-access/**/*.{ts,tsx,js,jsx}',
      'libs/**/feature/**/*.{ts,tsx,js,jsx}',
    ],
    rules: {
      'no-restricted-imports': buildRestrictedImports({
        allow: ['@tanstack/react-query'],
      }),
    },
  },
  {
    files: [
      '**/*.{spec,test}.{ts,tsx,js,jsx}',
      '**/*.stories.{ts,tsx,js,jsx}',
      '.storybook/**/*.{ts,tsx,js,jsx}',
      'apps/storybook/**/*.{ts,tsx,js,jsx}',
    ],
    rules: {
      'no-restricted-imports': buildRestrictedImports({
        allow: ['@nft/shared-testing'],
      }),
    },
  },
  {
    files: [
      'libs/mocks/**/*.{ts,tsx,js,jsx}',
      'libs/shell-kit/**/*.{ts,tsx,js,jsx}',
      'libs/shared/testing/**/*.{ts,tsx,js,jsx}',
      'apps/web-e2e/**/*.{ts,tsx,js,jsx}',
    ],
    rules: {
      'no-restricted-imports': buildRestrictedImports({
        allow: ['msw', '@mswjs/socket.io-binding', '@nft/shared-testing'],
      }),
    },
  },
];

