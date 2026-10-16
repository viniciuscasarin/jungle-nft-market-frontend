import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { ShellProvider, type ShellContextValue } from './context';
import { useUnavailable, UNAVAILABLE_MESSAGE } from './use-unavailable';
import { createQueryClient } from '@nft/shared-query';
import { createHttpClient } from '@nft/shared-http';
import { createRealtimeClient } from '@nft/shared-realtime';

describe('useUnavailable (@nft/shell-kit)', () => {
  const notifyMock = vi.fn();
  const announceMock = vi.fn();

  const mockContextValue: ShellContextValue = {
    queryClient: createQueryClient(),
    httpClient: createHttpClient(),
    realtimeClient: createRealtimeClient({ autoConnect: false }),
    session: null,
    navigate: () => {},
    feedback: {
      notify: notifyMock,
      announce: announceMock,
    },
  };

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <ShellProvider value={mockContextValue}>{children}</ShellProvider>
  );

  it('triggers standard unavailable message when no label is provided', () => {
    notifyMock.mockClear();

    const { result } = renderHook(() => useUnavailable(), { wrapper });

    act(() => {
      result.current.notifyUnavailable();
    });

    expect(notifyMock).toHaveBeenCalledWith({
      message: UNAVAILABLE_MESSAGE,
      tone: 'info',
      politeness: 'polite',
    });
  });

  it('triggers custom label unavailable message when label is provided', () => {
    notifyMock.mockClear();

    const { result } = renderHook(() => useUnavailable(), { wrapper });

    act(() => {
      result.current.notifyUnavailable('Rede social');
    });

    expect(notifyMock).toHaveBeenCalledWith({
      message: 'Rede social está indisponível nesta demonstração.',
      tone: 'info',
      politeness: 'polite',
    });
  });
});
