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
    base: isProduction ? '/remotes/storefront/' : '/',

    plugins: [
      tsconfigPaths({ projects: [path.resolve(__dirname, '../../tsconfig.base.json')] }),
      federation({
        name: 'storefront',
        filename: 'remoteEntry.js',
        exposes: {
          './HomePage': path.resolve(__dirname, 'src/App.tsx'),
        },
        shared: {
          react: { singleton: true, requiredVersion: '^19.0.0' },
          'react-dom': { singleton: true, requiredVersion: '^19.0.0' },
          '@tanstack/react-router': { singleton: true },
          '@tanstack/react-query': { singleton: true },
          '@nft/shell-kit': { singleton: true },
        },
      }),
      tailwindcss(),
      react(),
    ],
    server: {
      port: 4201,
      host: 'localhost',
      origin: 'http://localhost:4201',
      cors: true,
    },
    preview: {
      port: 4201,
      host: 'localhost',
      cors: true,
    },
    build: {
      outDir: '../../dist/apps/storefront',
      emptyOutDir: true,
      reportCompressedSize: true,
      target: 'chrome89',
    },
    test: {
      globals: true,
      environment: 'jsdom',
      include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    },
  };
});
