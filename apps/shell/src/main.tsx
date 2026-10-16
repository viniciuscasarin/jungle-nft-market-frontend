import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from '@tanstack/react-router';
import { validateEnv } from '@nft/shared-contracts';
import { createQueryClient } from '@nft/shared-query';
import { createHttpClient } from '@nft/shared-http';
import { createRealtimeClient } from '@nft/shared-realtime';
import {
  ShellProvider,
  singletonRegistry,
  type ShellContextValue,
} from '@nft/shell-kit';
import { router } from './routes';
import './styles.css';

// Validate environment variables on application startup
validateEnv(import.meta.env);

// Initialize factories as strict runtime singletons
export const queryClient = singletonRegistry.assertSingleton(
  'queryClient',
  createQueryClient(),
);

export const httpClient = singletonRegistry.assertSingleton(
  'httpClient',
  createHttpClient(),
);

export const realtimeClient = singletonRegistry.assertSingleton(
  'realtimeClient',
  createRealtimeClient({ autoConnect: false }),
);

export const shellValue: ShellContextValue = {
  queryClient,
  httpClient,
  realtimeClient,
  session: null,
  navigate: (to: string) => {
    void router.navigate({ to });
  },
};

const rootElement = document.getElementById('root');
if (rootElement && !rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <ShellProvider value={shellValue}>
        <RouterProvider router={router} />
      </ShellProvider>
    </React.StrictMode>,
  );
}
