/// <reference types="vitest" />
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import { federation } from '@module-federation/vite';
import path from 'node:path';

function resolveRemoteEntry(
  envVar: string | undefined,
  defaultDev: string,
  defaultProd: string,
  isDev: boolean,
): string {
  if (isDev) {
    const raw = envVar || defaultDev;
    return raw.endsWith('.js') ? raw : `${raw.replace(/\/+$/, '')}/remoteEntry.js`;
  }
  if (!envVar || envVar.includes('localhost') || envVar.includes('127.0.0.1')) {
    return defaultProd;
  }
  return envVar.endsWith('.js') ? envVar : `${envVar.replace(/\/+$/, '')}/remoteEntry.js`;
}

export default defineConfig(({ command, mode }) => {
  const isDev = command === 'serve';
  const env = loadEnv(mode, path.resolve(__dirname, '../..'), 'VITE_');

  const storefrontUrl = resolveRemoteEntry(
    env['VITE_REMOTE_STOREFRONT_URL'],
    'http://localhost:4201/remoteEntry.js',
    '/remotes/storefront/remoteEntry.js',
    isDev,
  );

  const checkoutUrl = resolveRemoteEntry(
    env['VITE_REMOTE_CHECKOUT_URL'],
    'http://localhost:4202/remoteEntry.js',
    '/remotes/checkout/remoteEntry.js',
    isDev,
  );

  const accountUrl = resolveRemoteEntry(
    env['VITE_REMOTE_ACCOUNT_URL'],
    'http://localhost:4203/remoteEntry.js',
    '/remotes/account/remoteEntry.js',
    isDev,
  );

  return {
    root: __dirname,
    cacheDir: path.resolve(__dirname, '../../node_modules/.vite/shell'),
    envDir: path.resolve(__dirname, '../..'),
    optimizeDeps: {
      // Seed dynamic mock imports before Federation consumes shared modules.
      include: [
        'zod', 'decimal.js', 'axios', 'msw', 'msw/browser', '@mswjs/socket.io-binding',
        '@radix-ui/react-slot', '@radix-ui/react-dropdown-menu', '@radix-ui/react-dialog',
        'lucide-react', 'clsx', 'tailwind-merge', 'react-hook-form', '@hookform/resolvers/zod',
      ],
      exclude: ['@tailwindcss/oxide'],
    },

    plugins: [
      tsconfigPaths({ projects: [path.resolve(__dirname, '../../tsconfig.base.json')] }),
      federation({
        name: 'shell',
        shareStrategy: isDev ? 'loaded-first' : 'version-first',
        remotes: {
          storefront: {
            type: 'module',
            name: 'storefront',
            entry: storefrontUrl,
            entryGlobalName: 'storefront',
            shareScope: 'default',
          },
          checkout: {
            type: 'module',
            name: 'checkout',
            entry: checkoutUrl,
            entryGlobalName: 'checkout',
            shareScope: 'default',
          },
          account: {
            type: 'module',
            name: 'account',
            entry: accountUrl,
            entryGlobalName: 'account',
            shareScope: 'default',
          },
        },
        shared: {
          'react/jsx-runtime': { singleton: true, requiredVersion: '^19.0.0', eager: true },
          'react/jsx-dev-runtime': { singleton: true, requiredVersion: '^19.0.0', eager: true },
          react: { singleton: true, requiredVersion: '^19.0.0', eager: true },
          'react-dom': { singleton: true, requiredVersion: '^19.0.0', eager: true },
          '@tanstack/react-router': { singleton: true, eager: true },
          '@tanstack/react-query': { singleton: true, eager: true },
          'socket.io-client': { singleton: true, eager: true },
          '@nft/shell-kit': { singleton: true, eager: true },
        },
      }),
      tailwindcss(),
      react(),
    ],
    server: {
      port: 4200,
      strictPort: true,
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
        'storefront/HomePage': path.resolve(__dirname, '../storefront/src/HomePage.tsx'),
        'storefront/PdpPage': path.resolve(__dirname, '../storefront/src/PdpPage.tsx'),
        'checkout/CartPage': path.resolve(__dirname, '../checkout/src/CartPage.tsx'),
        'checkout/PaymentPage': path.resolve(__dirname, '../checkout/src/PaymentPage.tsx'),
        'checkout/ConfirmationPage': path.resolve(__dirname, '../checkout/src/ConfirmationPage.tsx'),
        'account/ProfilePage': path.resolve(__dirname, '../account/src/ProfilePage.tsx'),
        'account/WalletsPage': path.resolve(__dirname, '../account/src/WalletsPage.tsx'),
      },
    },
  };
});
