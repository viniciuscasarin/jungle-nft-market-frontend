import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import {
  GlobalLiveRegions,
  ShellToastProvider,
  globalFeedback,
  GLOBAL_LIVE_REGIONS_KEY,
  TOAST_PROVIDER_KEY,
} from './feedback';
import { singletonRegistry } from './singleton-registry';

describe('Shell Feedback & Global Live Regions (@nft/shell-kit)', () => {
  beforeEach(() => {
    singletonRegistry.reset();
    document.body.innerHTML = '';
  });

  it('renders polite and assertive global live regions with correct attributes', () => {
    render(<GlobalLiveRegions />);

    const politeRegion = document.getElementById('shell-live-polite');
    const assertiveRegion = document.getElementById('shell-live-assertive');

    expect(politeRegion).toBeInTheDocument();
    expect(politeRegion).toHaveAttribute('role', 'status');
    expect(politeRegion).toHaveAttribute('aria-live', 'polite');

    expect(assertiveRegion).toBeInTheDocument();
    expect(assertiveRegion).toHaveAttribute('role', 'alert');
    expect(assertiveRegion).toHaveAttribute('aria-live', 'assertive');
  });

  it('announces text to polite live region by default', () => {
    render(<GlobalLiveRegions />);

    act(() => {
      globalFeedback.announce('Item adicionado ao carrinho');
    });

    const politeRegion = document.getElementById('shell-live-polite');
    expect(politeRegion).toHaveTextContent('Item adicionado ao carrinho');
  });

  it('announces critical text to assertive live region when politeness is assertive', () => {
    render(<GlobalLiveRegions />);

    act(() => {
      globalFeedback.announce('Falha crítica na conexão', 'assertive');
    });

    const assertiveRegion = document.getElementById('shell-live-assertive');
    expect(assertiveRegion).toHaveTextContent('Falha crítica na conexão');
  });

  it('notifies with both visual toast and live region announcement', async () => {
    render(
      <ShellToastProvider>
        <GlobalLiveRegions />
      </ShellToastProvider>
    );

    act(() => {
      globalFeedback.notify({
        message: 'Pedido confirmado com sucesso!',
        tone: 'success',
        politeness: 'polite',
      });
    });

    const politeRegion = document.getElementById('shell-live-polite');
    expect(politeRegion).toHaveTextContent('Pedido confirmado com sucesso!');

    const matchingElements = await screen.findAllByText('Pedido confirmado com sucesso!');
    expect(matchingElements.length).toBeGreaterThanOrEqual(2);
  });

  it('enforces single instance of GlobalLiveRegions in runtime via singletonRegistry', () => {
    render(<GlobalLiveRegions />);
    expect(singletonRegistry.has(GLOBAL_LIVE_REGIONS_KEY)).toBe(true);

    // Attempting to register another different instance of liveRegion fails
    expect(() => {
      singletonRegistry.assertSingleton(GLOBAL_LIVE_REGIONS_KEY, 'another-liveRegion');
    }).toThrow(
      'Duplicate singleton detected for "liveRegion". Exactly one instance is allowed in the runtime.'
    );
  });

  it('enforces single instance of ShellToastProvider in runtime via singletonRegistry', () => {
    render(
      <ShellToastProvider>
        <div>App 1</div>
      </ShellToastProvider>
    );
    expect(singletonRegistry.has(TOAST_PROVIDER_KEY)).toBe(true);

    expect(() => {
      singletonRegistry.assertSingleton(TOAST_PROVIDER_KEY, 'another-toast-provider');
    }).toThrow(
      'Duplicate singleton detected for "toastProvider". Exactly one instance is allowed in the runtime.'
    );
  });
});
