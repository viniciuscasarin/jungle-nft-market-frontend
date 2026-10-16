import { afterEach, describe, expect, it, vi } from 'vitest';
import { WebSocketHandler } from 'msw';
import { startMocks, stopMocks } from './mocks';

const worker = vi.hoisted(() => ({
  start: vi.fn().mockResolvedValue(undefined),
  stop: vi.fn(),
}));

vi.mock('msw/browser', () => ({ setupWorker: vi.fn(() => worker) }));

describe('browser mock bootstrap', () => {
  it('retries a rejected worker start using the same worker and shares the recovered promise', async () => {
    const { setupWorker } = await import('msw/browser');
    worker.start.mockRejectedValueOnce(new Error('Registration unavailable'));
    await expect(startMocks()).rejects.toThrow('Registration unavailable');
    const [first, second] = await Promise.all([startMocks(), startMocks()]);
    expect(first).toBe(second);
    expect(setupWorker).toHaveBeenCalledOnce();
    expect(worker.start).toHaveBeenCalledTimes(2);
    expect(worker.stop).toHaveBeenCalledOnce();
  });
  afterEach(() => {
    stopMocks();
    vi.clearAllMocks();
  });

  it('registers a WebSocket handler and exposes the real mock controls once', async () => {
    const { setupWorker } = await import('msw/browser');
    const first = await startMocks();
    const second = await startMocks();

    expect(second).toBe(first);
    expect(setupWorker).toHaveBeenCalledOnce();
    expect(vi.mocked(setupWorker).mock.calls[0]?.some((handler) => handler instanceof WebSocketHandler)).toBe(true);
    expect(worker.start).toHaveBeenCalledWith({
      onUnhandledRequest: 'bypass',
      serviceWorker: { url: '/mockServiceWorker.js' },
    });
    expect(first.controls.getScenario()).toBe('default');
    expect(first.controls.getState().scenarioId).toBe('default');
    expect(first.controls.getNetworkProfile()).toBeDefined();
  });
});
