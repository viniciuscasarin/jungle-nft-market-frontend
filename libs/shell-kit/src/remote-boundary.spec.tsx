import '@testing-library/jest-dom/vitest';
import React, { lazy } from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act, fireEvent } from '@testing-library/react';
import {
  RemoteBoundary,
  DefaultRemoteSkeleton,
  withRemoteTimeout,
} from './remote-boundary';

describe('RemoteBoundary (@nft/shell-kit)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders children when loaded normally', () => {
    render(
      <RemoteBoundary>
        <div>Remote Page Content</div>
      </RemoteBoundary>,
    );

    expect(screen.getByText('Remote Page Content')).toBeInTheDocument();
  });

  it('displays DefaultRemoteSkeleton with accessible attributes and reduced motion classes', () => {
    render(<DefaultRemoteSkeleton />);

    const skeletonWrapper = screen.getByTestId('remote-skeleton');
    expect(skeletonWrapper).toHaveAttribute('aria-busy', 'true');
    expect(skeletonWrapper).toHaveClass('animate-pulse');
    expect(skeletonWrapper).toHaveClass('motion-reduce:animate-none');
    expect(
      screen.getByText('Carregando conteúdo remoto...'),
    ).toBeInTheDocument();
  });

  it('catches render errors and displays accessible ErrorState with retry button', () => {
    const ProblemChild = () => {
      throw new Error('Remote chunk could not be loaded');
    };

    const onError = vi.fn();
    const onRetry = vi.fn();

    render(
      <RemoteBoundary onError={onError} onRetry={onRetry}>
        <ProblemChild />
      </RemoteBoundary>,
    );

    const alert = screen.getByRole('alert');
    expect(alert).toHaveAttribute('aria-live', 'assertive');
    expect(screen.getByText('Falha ao carregar componente remoto')).toBeInTheDocument();
    expect(screen.getByText('Remote chunk could not be loaded')).toBeInTheDocument();

    const retryButton = screen.getByRole('button', { name: /tentar novamente/i });
    expect(retryButton).toBeInTheDocument();

    fireEvent.click(retryButton);
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('triggers timeout error when child stays suspended longer than timeoutMs', async () => {
    // A component that suspends indefinitely
    const NeverResolvingLazy = lazy(
      () => new Promise<{ default: React.ComponentType }>(() => {}),
    );

    render(
      <RemoteBoundary timeoutMs={500}>
        <NeverResolvingLazy />
      </RemoteBoundary>,
    );

    // Initial state: skeleton fallback
    expect(screen.getByTestId('remote-skeleton')).toBeInTheDocument();

    // Advance time past timeout
    act(() => {
      vi.advanceTimersByTime(501);
    });

    // Timeout triggered error state
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(
      screen.getByText(/tempo limite de 500ms excedido/i),
    ).toBeInTheDocument();
  });

  it('withRemoteTimeout rejects when promise exceeds timeout', async () => {
    const hangingPromise = () =>
      new Promise<string>(() => {});

    const timedOutPromise = withRemoteTimeout(hangingPromise, 100);

    const assertion = expect(timedOutPromise).rejects.toThrow(
      'Tempo limite de 100ms excedido ao carregar o módulo remoto.',
    );

    act(() => {
      vi.advanceTimersByTime(150);
    });

    await assertion;
  });

  it('allows retrying without page reload after an error occurs', () => {
    let shouldFail = true;

    const DynamicChild = () => {
      if (shouldFail) {
        throw new Error('Temporary failure');
      }
      return <div>Recovered Remote Content</div>;
    };

    render(
      <RemoteBoundary>
        <DynamicChild />
      </RemoteBoundary>,
    );

    expect(screen.getByRole('alert')).toBeInTheDocument();

    // Fix the error and click retry
    shouldFail = false;
    fireEvent.click(screen.getByRole('button', { name: /tentar novamente/i }));

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.getByText('Recovered Remote Content')).toBeInTheDocument();
  });
});
