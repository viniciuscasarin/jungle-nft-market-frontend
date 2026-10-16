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
    base: isProduction ? '/remotes/checkout/' : '/',

    plugins: [
      tsconfigPaths({ projects: [path.resolve(__dirname, '../../tsconfig.base.json')] }),
      federation({
        name: 'checkout',
        filename: 'remoteEntry.js',
        exposes: {
          './CartPage': path.resolve(__dirname, 'src/CartPage.tsx'),
          './PaymentPage': path.resolve(__dirname, 'src/PaymentPage.tsx'),
          './ConfirmationPage': path.resolve(__dirname, 'src/ConfirmationPage.tsx'),
        },
        shared: {
          react: { singleton: true, requiredVersion: '^19.0.0' },
          'react-dom': { singleton: true, requiredVersion: '^19.0.0' },
          '@tanstack/react-router': { singleton: true },
          '@tanstack/react-query': { singleton: true },
          'socket.io-client': { singleton: true },
          '@nft/shell-kit': { singleton: true },
        },
      }),
      tailwindcss(),
      react(),
    ],
    optimizeDeps: {
      exclude: ['@tailwindcss/vite', '@tailwindcss/oxide'],
      esbuildOptions: {
        loader: {
          '.node': 'empty',
        },
      },
    },
    server: {
      port: 4202,
      host: 'localhost',
      origin: 'http://localhost:4202',
      cors: true,
    },
    preview: {
      port: 4202,
      host: 'localhost',
      cors: true,
    },
    build: {
      outDir: '../../dist/apps/checkout',
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
