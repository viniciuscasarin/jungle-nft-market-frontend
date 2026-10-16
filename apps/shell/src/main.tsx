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
  startMocks,
  useSession,
  type ShellContextValue,
} from '@nft/shell-kit';
import {
  tokenStore,
  resumeStore,
  getOrCreateGuestId,
  getSession,
} from '@nft/auth-data-access';
import { SessionController, SessionProvider } from '@nft/auth-feature';
import { router } from './routes';
import './styles.css';

// Validate environment variables on application startup
validateEnv(import.meta.env);

const MocksDevPanel = React.lazy(() => import('./components/mocks-dev-panel'));

// Initialize factories as strict runtime singletons
export const queryClient = singletonRegistry.assertSingleton(
  'queryClient',
  createQueryClient(),
);

export const realtimeClient = singletonRegistry.assertSingleton(
  'realtimeClient',
  createRealtimeClient({ autoConnect: false }),
);

export const sessionController = new SessionController({
  queryClient,
  realtimeClient,
  tokenStore,
  resumeStore,
  navigate: (to: string) => {
    void router.navigate({ to: to as never });
  },
});

export const httpClient = singletonRegistry.assertSingleton(
  'httpClient',
  createHttpClient({
    getAuthToken: () => tokenStore.getToken(),
    getGuestId: () => getOrCreateGuestId(),
    onSessionExpired: () => {
      void sessionController.handleSessionExpired();
    },
  }),
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

async function prepareApp(): Promise<void> {
  if (import.meta.env['VITE_ENABLE_MOCKS'] === 'true') {
    await startMocks();
  }

  // Pre-resolve active session on application boot if a token is present
  if (tokenStore.getToken()) {
    try {
      const session = await getSession(httpClient);
      await sessionController.setSession(session);
    } catch {
      tokenStore.clearToken();
    }
  }
}

function ShellApp() {
  const session = useSession();
  return <RouterProvider router={router} context={{ session }} />;
}

const rootElement = document.getElementById('root');
if (rootElement && !rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);

  void prepareApp().then(() => {
    root.render(
      <React.StrictMode>
        <ShellProvider value={shellValue}>
          <SessionProvider controller={sessionController}>
            <ShellApp />
            {import.meta.env['VITE_ENABLE_MOCKS'] === 'true' && (
              <React.Suspense fallback={null}>
                <MocksDevPanel />
              </React.Suspense>
            )}
          </SessionProvider>
        </ShellProvider>
      </React.StrictMode>,
    );
  });
}
