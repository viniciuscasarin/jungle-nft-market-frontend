import React, { createContext, useContext, type ReactNode } from 'react';
import type { QueryClient } from '@nft/shared-query';
import type { HttpClient } from '@nft/shared-http';
import type { RealtimeClient } from '@nft/shared-realtime';

export interface ShellUserSession {
  userId: string;
  name: string;
  email: string;
  avatarUrl?: string;
}

export interface ShellContextValue {
  queryClient: QueryClient;
  httpClient: HttpClient;
  realtimeClient: RealtimeClient;
  session: ShellUserSession | null;
  navigate: (to: string) => void;
}

const ShellContext = createContext<ShellContextValue | null>(null);

export interface ShellProviderProps {
  value: ShellContextValue;
  children: ReactNode;
}

export function ShellProvider({ value, children }: ShellProviderProps) {
  return React.createElement(ShellContext.Provider, { value }, children);
}

/**
 * Access the Shell-injected singletons (QueryClient, HttpClient, RealtimeClient, Session).
 * Throws an explicit error if called outside of ShellProvider to prevent duplicate instances.
 */
export function useShell(): ShellContextValue {
  const context = useContext(ShellContext);
  if (!context) {
    throw new Error(
      'useShell must be used within a ShellProvider. Never create standalone client instances.',
    );
  }
  return context;
}

export interface StandaloneBootstrapConfig {
  mountPoint?: HTMLElement;
  initialRoute?: string;
}

/**
 * Bootstrap contract for standalone remote execution in development
 */
export function bootstrapStandalone(
  component: React.ComponentType,
  config: StandaloneBootstrapConfig = {},
): void {
  void config;
  // Standalone bootstrap implementation contract for remotes
  if (typeof window !== 'undefined') {
    window.__NFT_STANDALONE_PAGE__ = component;
  }
}

declare global {
  interface Window {
    __NFT_STANDALONE_PAGE__?: React.ComponentType;
  }
}
