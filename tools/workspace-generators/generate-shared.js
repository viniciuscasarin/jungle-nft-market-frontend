import fs from 'node:fs';
import path from 'node:path';

const SHARED_LIBS = [
  'contracts',
  'money',
  'http',
  'query',
  'router',
  'realtime',
  'ui',
  'testing',
];

export function generateSharedLibs(rootDir = process.cwd()) {
  const sharedBaseDir = path.join(rootDir, 'libs', 'shared');

  for (const lib of SHARED_LIBS) {
    const libDir = path.join(sharedBaseDir, lib);
    const srcDir = path.join(libDir, 'src');
    fs.mkdirSync(srcDir, { recursive: true });

    const projectName = `shared-${lib}`;
    const projectJson = {
      name: projectName,
      $schema: '../../../node_modules/nx/schemas/project-schema.json',
      sourceRoot: `libs/shared/${lib}/src`,
      projectType: 'library',
      tags: ['scope:shared', 'type:util', 'flow:shared'],
      targets: {
        lint: {
          executor: '@nx/eslint:lint',
          options: {
            lintFilePatterns: [`libs/shared/${lib}/**/*.{ts,tsx,js,jsx}`],
          },
        },
        test: {
          executor: '@nx/vitest:test',
          outputs: ['{options.reportsDirectory}'],
          options: {
            config: `libs/shared/${lib}/vite.config.ts`,
          },
        },
        typecheck: {
          executor: 'nx:run-commands',
          options: {
            command: `tsc -p libs/shared/${lib}/tsconfig.json --noEmit`,
          },
        },
      },
    };

    fs.writeFileSync(
      path.join(libDir, 'project.json'),
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
      path.join(libDir, 'tsconfig.json'),
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
      path.join(libDir, 'tsconfig.spec.json'),
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

    fs.writeFileSync(path.join(libDir, 'vite.config.ts'), viteConfigTs);
  }

  console.log(`✓ Scaffolded ${SHARED_LIBS.length} shared libraries`);
}

if (process.argv[1] && process.argv[1].endsWith('generate-shared.js')) {
  generateSharedLibs();
}
