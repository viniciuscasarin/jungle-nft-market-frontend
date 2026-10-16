import React from 'react';
import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { createQueryClient } from '@nft/shared-query';
import { createHttpClient } from '@nft/shared-http';
import { createRealtimeClient } from '@nft/shared-realtime';
import {
  ShellProvider,
  useShell,
  useSession,
  useFeedback,
  type ShellContextValue,
} from './context';

describe('ShellContext (@nft/shell-kit)', () => {
  const mockContextValue: ShellContextValue = {
    queryClient: createQueryClient(),
    httpClient: createHttpClient(),
    realtimeClient: createRealtimeClient({ autoConnect: false }),
    session: {
      userId: 'user-123',
      name: 'Vinicius',
      email: 'vinicius@example.com',
      avatarUrl: 'https://example.com/avatar.png',
    },
    navigate: () => {},
    feedback: {
      notify: () => {},
      announce: () => {},
    },
  };

  it('throws an explicit error when useShell is called outside ShellProvider', () => {
    expect(() => {
      renderHook(() => useShell());
    }).toThrow(
      'useShell must be used within a ShellProvider. Never create standalone client instances.',
    );
  });

  it('throws an explicit error when useSession is called outside ShellProvider', () => {
    expect(() => {
      renderHook(() => useSession());
    }).toThrow(
      'useShell must be used within a ShellProvider. Never create standalone client instances.',
    );
  });

  it('provides the singleton context when wrapped in ShellProvider', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ShellProvider value={mockContextValue}>{children}</ShellProvider>
    );

    const { result } = renderHook(() => useShell(), { wrapper });

    expect(result.current.session?.userId).toBe('user-123');
    expect(result.current.session?.name).toBe('Vinicius');
    expect(result.current.queryClient).toBe(mockContextValue.queryClient);
    expect(result.current.httpClient).toBe(mockContextValue.httpClient);
    expect(result.current.realtimeClient).toBe(mockContextValue.realtimeClient);
  });

  it('provides the current session via useSession()', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ShellProvider value={mockContextValue}>{children}</ShellProvider>
    );

    const { result } = renderHook(() => useSession(), { wrapper });

    expect(result.current).toEqual({
      userId: 'user-123',
      name: 'Vinicius',
      email: 'vinicius@example.com',
      avatarUrl: 'https://example.com/avatar.png',
    });
  });

  it('returns null for useSession when unauthenticated', () => {
    const unauthenticatedValue: ShellContextValue = {
      ...mockContextValue,
      session: null,
    };

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ShellProvider value={unauthenticatedValue}>{children}</ShellProvider>
    );

    const { result } = renderHook(() => useSession(), { wrapper });

    expect(result.current).toBeNull();
  });

  it('provides the feedback singleton via useFeedback()', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ShellProvider value={mockContextValue}>{children}</ShellProvider>
    );

    const { result } = renderHook(() => useFeedback(), { wrapper });

    expect(result.current).toBe(mockContextValue.feedback);
  });
});
