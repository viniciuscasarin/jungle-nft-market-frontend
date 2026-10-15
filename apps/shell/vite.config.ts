/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import { federation } from '@module-federation/vite';
import path from 'node:path';

export default defineConfig(({ mode }) => {
  const isProduction = mode === 'production' || process.env.NODE_ENV === 'production';

  return {
    root: __dirname,

    plugins: [
      tsconfigPaths({ projects: [path.resolve(__dirname, '../../tsconfig.base.json')] }),
      federation({
        name: 'shell',
        remotes: {
          storefront: {
            type: 'module',
            name: 'storefront',
            entry: isProduction
              ? '/remotes/storefront/remoteEntry.js'
              : 'http://localhost:4201/remoteEntry.js',
            entryGlobalName: 'storefront',
            shareScope: 'default',
          },
        },
        shared: {
          react: { singleton: true, requiredVersion: '^19.0.0', eager: true },
          'react-dom': { singleton: true, requiredVersion: '^19.0.0', eager: true },
          '@tanstack/react-router': { singleton: true, eager: true },
          '@tanstack/react-query': { singleton: true, eager: true },
          '@nft/shell-kit': { singleton: true, eager: true },
        },
      }),
      tailwindcss(),
      react(),
    ],
    server: {
      port: 4200,
      host: 'localhost',
    },
    preview: {
      port: 4200,
      host: 'localhost',
    },
    build: {
      outDir: '../../dist/apps/shell',
      emptyOutDir: true,
      reportCompressedSize: true,
      target: 'chrome89',
    },
    test: {
      globals: true,
      environment: 'jsdom',
      include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
      alias: {
        'storefront/HomePage': path.resolve(__dirname, '../storefront/src/App.tsx'),
      },
    },
  };
});
