import '@testing-library/jest-dom/vitest';
import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { waitFor } from '@testing-library/react';
import { bootstrapStandalone } from './bootstrap';
import { useShell, useSession } from './context';
import { singletonRegistry } from './singleton-registry';

describe('bootstrapStandalone (@nft/shell-kit)', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    container.id = 'root';
    document.body.appendChild(container);
    singletonRegistry.reset();
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  it('mounts the component inside the container and provides ShellContext', async () => {
    const TestComponent = () => {
      const { queryClient, httpClient, realtimeClient } = useShell();
      const session = useSession();

      return (
        <div>
          <h1>Standalone App</h1>
          <p data-testid="user">{session?.name}</p>
          <p data-testid="client-check">
            {queryClient && httpClient && realtimeClient ? 'clients-ready' : 'missing'}
          </p>
        </div>
      );
    };

    const root = await bootstrapStandalone(TestComponent, {
      mountPoint: container,
      session: {
        userId: 'test-user',
        name: 'Test Standalone User',
        email: 'test@example.com',
      },
    });

    expect(root).not.toBeNull();

    await waitFor(() => {
      expect(container.querySelector('h1')).toHaveTextContent('Standalone App');
      expect(container.querySelector('[data-testid="user"]')).toHaveTextContent(
        'Test Standalone User',
      );
      expect(
        container.querySelector('[data-testid="client-check"]'),
      ).toHaveTextContent('clients-ready');
    });
  });

  it('awaits initMsw before mounting when provided', async () => {
    let mswInitialized = false;

    const initMsw = vi.fn().mockImplementation(async () => {
      await new Promise((resolve) => setTimeout(resolve, 50));
      mswInitialized = true;
    });

    const TestComponent = () => (
      <div>MSW Ready: {mswInitialized ? 'yes' : 'no'}</div>
    );

    await bootstrapStandalone(TestComponent, {
      mountPoint: container,
      initMsw,
    });

    expect(initMsw).toHaveBeenCalledTimes(1);

    await waitFor(() => {
      expect(container).toHaveTextContent('MSW Ready: yes');
    });
  });

  it('returns null and does not mount if mount point element is not found', async () => {
    const TestComponent = () => <div>Ghost Component</div>;

    const root = await bootstrapStandalone(TestComponent, {
      mountPoint: '#non-existent-element',
    });

    expect(root).toBeNull();
  });
});
