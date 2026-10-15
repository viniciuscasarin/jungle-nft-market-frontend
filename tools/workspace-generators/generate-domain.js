import fs from 'node:fs';
import path from 'node:path';

export const DOMAIN_FLOW_CONFIGS = {
  auth: {
    domain: 'flow:shell',
    'data-access': 'flow:shell',
    feature: 'flow:shell',
    ui: 'flow:shell',
  },
  catalog: {
    domain: 'flow:storefront',
    'data-access': 'flow:storefront',
    feature: 'flow:storefront',
    ui: 'flow:storefront',
  },
  favorites: {
    domain: 'flow:storefront',
    'data-access': 'flow:storefront',
    feature: 'flow:storefront',
    ui: 'flow:storefront',
  },
  cart: {
    domain: 'flow:shared',
    'data-access': 'flow:shared',
    feature: 'flow:checkout',
    ui: 'flow:checkout',
  },
  checkout: {
    domain: 'flow:checkout',
    'data-access': 'flow:checkout',
    feature: 'flow:checkout',
    ui: 'flow:checkout',
  },
  orders: {
    domain: 'flow:checkout',
    'data-access': 'flow:checkout',
    feature: 'flow:checkout',
    ui: 'flow:checkout',
  },
  profile: {
    domain: 'flow:account',
    'data-access': 'flow:account',
    feature: 'flow:account',
    ui: 'flow:account',
  },
  wallets: {
    domain: 'flow:shared',
    'data-access': 'flow:shared',
    feature: 'flow:account',
    ui: 'flow:account',
  },
};

export const LAYERS = ['domain', 'data-access', 'feature', 'ui'];

function toConstCase(str) {
  return str.replace(/[^a-zA-Z0-9]/g, '_').toUpperCase();
}

/**
 * Generate 4 layers (domain, data-access, feature, ui) for a given domain
 */
export function generateDomainLibraries(domain, options = {}) {
  const rootDir = options.rootDir || process.cwd();
  const domainDir = options.baseDir || path.join(rootDir, 'libs', domain);
  const flowConfig =
    options.flowConfig || DOMAIN_FLOW_CONFIGS[domain] || {
      domain: options.defaultFlow || 'flow:shared',
      'data-access': options.defaultFlow || 'flow:shared',
      feature: options.defaultFlow || 'flow:shared',
      ui: options.defaultFlow || 'flow:shared',
    };

  const results = [];

  for (const layer of LAYERS) {
    const layerDir = path.join(domainDir, layer);
    const srcDir = path.join(layerDir, 'src');
    fs.mkdirSync(srcDir, { recursive: true });

    const projectName = `${domain}-${layer}`;
    const flowTag = flowConfig[layer] || 'flow:shared';
    const tags = [`scope:${domain}`, `type:${layer}`, flowTag];

    const projectJson = {
      name: projectName,
      $schema: '../../../node_modules/nx/schemas/project-schema.json',
      sourceRoot: `libs/${domain}/${layer}/src`,
      projectType: 'library',
      tags,
      targets: {
        lint: {
          executor: '@nx/eslint:lint',
          options: {
            lintFilePatterns: [`libs/${domain}/${layer}/**/*.{ts,tsx,js,jsx}`],
          },
        },
        test: {
          executor: '@nx/vitest:test',
          outputs: ['{options.reportsDirectory}'],
          options: {
            config: `libs/${domain}/${layer}/vite.config.ts`,
          },
        },
        typecheck: {
          executor: 'nx:run-commands',
          options: {
            command: `tsc -p libs/${domain}/${layer}/tsconfig.json --noEmit`,
          },
        },
      },
    };

    fs.writeFileSync(
      path.join(layerDir, 'project.json'),
      JSON.stringify(projectJson, null, 2) + '\n',
    );

    const tsconfigJson = {
      extends: '../../../tsconfig.base.json',
      compilerOptions: {
        outDir: '../../../dist/out-tsc',
        declaration: true,
        types: ['node'],
      },
      include: ['src/**/*.ts', 'src/**/*.tsx'],
      exclude: ['src/**/*.spec.ts', 'src/**/*.spec.tsx', 'src/**/*.test.ts', 'src/**/*.test.tsx'],
    };

    fs.writeFileSync(
      path.join(layerDir, 'tsconfig.json'),
      JSON.stringify(tsconfigJson, null, 2) + '\n',
    );

    const tsconfigSpecJson = {
      extends: './tsconfig.json',
      compilerOptions: {
        outDir: '../../../dist/out-tsc',
        types: ['vitest/globals', 'vitest/importMeta', 'vite/client', 'node'],
      },
      include: [
        'src/**/*.spec.ts',
        'src/**/*.spec.tsx',
        'src/**/*.test.ts',
        'src/**/*.test.tsx',
        'src/**/*.d.ts',
      ],
    };

    fs.writeFileSync(
      path.join(layerDir, 'tsconfig.spec.json'),
      JSON.stringify(tsconfigSpecJson, null, 2) + '\n',
    );

    const viteConfigTs = `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import path from 'node:path';

export default defineConfig({
  root: __dirname,
  plugins: [
    react(),
    tsconfigPaths({ projects: [path.resolve(__dirname, '../../../tsconfig.base.json')] }),
  ],
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    passWithNoTests: true,
  },
});
`;

    fs.writeFileSync(path.join(layerDir, 'vite.config.ts'), viteConfigTs);

    const constName = `${toConstCase(domain)}_${toConstCase(layer)}_MODULE`;
    const indexTs = `// Public API for @nft/${projectName}
export const ${constName} = '@nft/${projectName}';
`;

    fs.writeFileSync(path.join(srcDir, 'index.ts'), indexTs);

    results.push({
      domain,
      layer,
      projectName,
      path: layerDir,
      tags,
    });
  }

  return results;
}

if (process.argv[1] && process.argv[1].endsWith('generate-domain.js')) {
  const arg = process.argv[2];
  if (!arg || arg === '--all') {
    const domains = Object.keys(DOMAIN_FLOW_CONFIGS);
    console.log(`Scaffolding all ${domains.length} domains...`);
    for (const d of domains) {
      generateDomainLibraries(d);
      console.log(`✓ Domain '${d}' generated (4 layers)`);
    }
  } else {
    generateDomainLibraries(arg);
    console.log(`✓ Domain '${arg}' generated (4 layers)`);
  }
}
