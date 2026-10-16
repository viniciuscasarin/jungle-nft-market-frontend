import type { SetupWorker } from 'msw/browser';

export interface MockControls {
  getScenario: () => string;
  setScenario: (id: string) => void;
  getScenarios: () => readonly string[];
  getDatabase: () => unknown;
  reset: () => void;
  getNetwork: () => unknown;
  setNetwork: (patch: unknown) => void;
  getClock: () => unknown;
  advanceClock: (ms: number) => void;
  setClock: (isoOrDate: string | Date) => void;
}

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
    ] = await Promise.all([
      import('msw/browser'),
      import('@nft/mocks-core'),
      import('@nft/mocks-handlers'),
    ]);

    // 1. Resolve active scenario from URL params, storage, or env
    const { scenarioId } = resolveActiveScenario();
    applyScenario(scenarioId);

    // 2. Expose window.__mocks for automation and dev panel
    const controls = exposeMockControls();

    // 3. Setup and start MSW browser worker
    const allHandlers = [mocksPingHandler, ...handlers];
    activeWorker = setupWorker(...allHandlers);

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

  return startPromise;
}

export function stopMocks(): void {
  if (activeWorker) {
    activeWorker.stop();
    activeWorker = null;
    startMocksPromise = null;
  }
}
