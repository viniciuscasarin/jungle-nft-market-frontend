import type { SetupWorker } from 'msw/browser';

import type { MockControls } from '@nft/mocks-core';

let startMocksPromise: Promise<{
  worker: SetupWorker;
  controls: MockControls;
}> | null = null;

let activeWorker: SetupWorker | null = null;

export interface StartMocksOptions {
  serviceWorkerUrl?: string;
  onUnhandledRequest?: 'bypass' | 'warn' | 'error';
}

export async function startMocks(options: StartMocksOptions = {}): Promise<{
  worker: SetupWorker;
  controls: MockControls;
}> {
  if (startMocksPromise) {
    return startMocksPromise;
  }

  const startPromise = (async () => {
    const [
      { setupWorker },
      { resolveActiveScenario, applyScenario, exposeMockControls, mocksPingHandler },
      { handlers },
      { socketHandler },
    ] = await Promise.all([
      import('msw/browser'),
      import('@nft/mocks-core'),
      import('@nft/mocks-handlers'),
      import('@nft/mocks-socket'),
    ]);

    // 1. Resolve active scenario from URL params, storage, or env
    const { scenarioId } = resolveActiveScenario();
    applyScenario(scenarioId);

    // 2. Expose window.__mocks for automation and dev panel
    const controls = exposeMockControls();

    // 3. Setup and start MSW browser worker
    const allHandlers = [mocksPingHandler, ...handlers, socketHandler];
    activeWorker ??= setupWorker(...allHandlers);

    const swUrl = options.serviceWorkerUrl ?? '/mockServiceWorker.js';

    await activeWorker.start({
      onUnhandledRequest: options.onUnhandledRequest ?? 'bypass',
      serviceWorker: {
        url: swUrl,
      },
    });

    return { worker: activeWorker, controls };
  })();
  startMocksPromise = startPromise;

  try {
    return await startPromise;
  } catch (error) {
    activeWorker?.stop();
    if (startMocksPromise === startPromise) startMocksPromise = null;
    throw error;
  }
}

export function stopMocks(): void {
  if (activeWorker) {
    activeWorker.stop();
    activeWorker = null;
    startMocksPromise = null;
  }
}
