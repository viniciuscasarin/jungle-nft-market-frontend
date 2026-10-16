import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import {
  ShellPageChromeProvider,
  usePageChrome,
} from './page-chrome';

describe('usePageChrome (@nft/shell-kit)', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <ShellPageChromeProvider>{children}</ShellPageChromeProvider>
  );

  it('throws an error if used outside of ShellPageChromeProvider', () => {
    expect(() => {
      renderHook(() => usePageChrome());
    }).toThrow('usePageChrome must be used within a ShellPageChromeProvider');
  });

  it('manages breadcrumbLabel dynamically and resets on unmount', () => {
    const { result, unmount } = renderHook(
      () => usePageChrome({ breadcrumbLabel: 'Cyber Kongz #42' }),
      { wrapper }
    );

    expect(result.current.breadcrumbLabel).toBe('Cyber Kongz #42');

    unmount();

    // Check with a new hook under the same provider
    const { result: afterUnmount } = renderHook(() => usePageChrome(), { wrapper });
    expect(afterUnmount.current.breadcrumbLabel).toBeNull();
  });

  it('manages filtersHandler dynamically and resets on unmount', () => {
    const handleFilters = vi.fn();

    const { result, unmount } = renderHook(
      () => usePageChrome({ onOpenFilters: handleFilters }),
      { wrapper }
    );

    expect(result.current.filtersHandler).toBe(handleFilters);

    unmount();

    const { result: afterUnmount } = renderHook(() => usePageChrome(), { wrapper });
    expect(afterUnmount.current.filtersHandler).toBeNull();
  });

  it('allows manual updates via setBreadcrumbLabel and setFiltersHandler', () => {
    const { result } = renderHook(() => usePageChrome(), { wrapper });

    act(() => {
      result.current.setBreadcrumbLabel('Manual Label');
    });
    expect(result.current.breadcrumbLabel).toBe('Manual Label');

    const fn = vi.fn();
    act(() => {
      result.current.setFiltersHandler(fn);
    });
    expect(result.current.filtersHandler).toBe(fn);
  });
});
