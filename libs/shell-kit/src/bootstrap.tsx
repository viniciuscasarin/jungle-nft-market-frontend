import React from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { createQueryClient } from '@nft/shared-query';
import { createHttpClient } from '@nft/shared-http';
import { createRealtimeClient } from '@nft/shared-realtime';
import {
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
  createMemoryHistory,
} from '@nft/shared-router';
import {
  ShellProvider,
  type ShellContextValue,
  type ShellUserSession,
} from './context';
import { singletonRegistry } from './singleton-registry';

export interface StandaloneBootstrapConfig {
  mountPoint?: HTMLElement | string | null;
  initialRoute?: string;
  initMsw?: () => Promise<void>;
  session?: ShellUserSession | null;
  onNavigate?: (to: string) => void;
}

/**
 * Bootstrap contract for standalone remote execution in development.
 * Provides ShellProvider with mock clients, a minimal TanStack Router,
 * and an asynchronous extension point for MSW initialization.
 */
export async function bootstrapStandalone(
  Component: React.ComponentType,
  config: StandaloneBootstrapConfig = {},
): Promise<Root | null> {
  const {
    mountPoint = '#root',
    initialRoute = '/',
    initMsw,
    session = {
      userId: 'mock-standalone-user',
      name: 'Standalone User',
      email: 'standalone@jungle.test',
    },
    onNavigate,
  } = config;

  if (initMsw) {
    await initMsw();
  }

  let element: HTMLElement | null = null;
  if (typeof mountPoint === 'string') {
    if (typeof document !== 'undefined') {
      try {
        element = document.querySelector<HTMLElement>(mountPoint);
      } catch {
        element = document.getElementById(mountPoint.replace(/^#/, ''));
      }
    }
  } else if (mountPoint instanceof HTMLElement) {
    element = mountPoint;
  }

  if (!element) {
    return null;
  }

  const queryClient = singletonRegistry.has('queryClient')
    ? (singletonRegistry.get('queryClient') as ReturnType<typeof createQueryClient>)
    : singletonRegistry.assertSingleton('queryClient', createQueryClient());

  const httpClient = singletonRegistry.has('httpClient')
    ? (singletonRegistry.get('httpClient') as ReturnType<typeof createHttpClient>)
    : singletonRegistry.assertSingleton('httpClient', createHttpClient());

  const realtimeClient = singletonRegistry.has('realtimeClient')
    ? (singletonRegistry.get('realtimeClient') as ReturnType<typeof createRealtimeClient>)
    : singletonRegistry.assertSingleton(
        'realtimeClient',
        createRealtimeClient({ autoConnect: false }),
      );

  const RootView = () => <Component />;

  const rootRoute = createRootRoute({
    component: RootView,
  });

  const indexRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/',
    component: RootView,
  });

  const routeTree = rootRoute.addChildren([indexRoute]);

  const router = createRouter({
    routeTree,
    history: createMemoryHistory({
      initialEntries: [initialRoute],
    }),
  });

  const shellValue: ShellContextValue = {
    queryClient,
    httpClient,
    realtimeClient,
    session,
    navigate: (to: string) => {
      onNavigate?.(to);
      void router.navigate({ to });
    },
  };

  const root = createRoot(element);
  root.render(
    <React.StrictMode>
      <ShellProvider value={shellValue}>
        <RouterProvider router={router} />
      </ShellProvider>
    </React.StrictMode>,
  );

  return root;
}
