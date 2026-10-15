import React from 'react';
import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { createQueryClient } from '@nft/shared-query';
import { createHttpClient } from '@nft/shared-http';
import { createRealtimeClient } from '@nft/shared-realtime';
import { ShellProvider, useShell, type ShellContextValue } from './index';

describe('ShellKit (@nft/shell-kit)', () => {
  const mockContextValue: ShellContextValue = {
    queryClient: createQueryClient(),
    httpClient: createHttpClient(),
    realtimeClient: createRealtimeClient({ autoConnect: false }),
    session: {
      userId: 'user-123',
      name: 'Vinicius',
      email: 'vinicius@example.com',
    },
    navigate: () => {},
  };

  it('throws an error if useShell is called outside ShellProvider', () => {
    expect(() => {
      renderHook(() => useShell());
    }).toThrow('useShell must be used within a ShellProvider');
  });

  it('provides the singleton context when wrapped in ShellProvider', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ShellProvider value={mockContextValue}>{children}</ShellProvider>
    );

    const { result } = renderHook(() => useShell(), { wrapper });

    expect(result.current.session?.userId).toBe('user-123');
    expect(result.current.session?.name).toBe('Vinicius');
  });
});
