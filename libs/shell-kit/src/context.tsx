import React, { createContext, useContext, type ReactNode } from 'react';
import type { QueryClient } from '@nft/shared-query';
import type { HttpClient } from '@nft/shared-http';
import type { RealtimeClient } from '@nft/shared-realtime';

import type { Session } from '@nft/shared-contracts';

export interface ShellUserSession {
  userId: string;
  name: string;
  email: string;
  avatarUrl?: string | undefined;
}

export function toShellUserSession(
  session: Session | null | undefined,
): ShellUserSession | null {
  if (!session) return null;
  const userSession: ShellUserSession = {
    userId: session.user.id,
    name: session.user.displayName,
    email: session.user.email,
  };
  if (session.user.avatarUrl) {
    userSession.avatarUrl = session.user.avatarUrl;
  }
  return userSession;
}

export interface ShellFeedbackNotifyOptions {
  message: string;
  duration?: number | undefined;
  tone?: 'info' | 'success' | 'warning' | 'error' | undefined;
  politeness?: 'polite' | 'assertive' | undefined;
}

export interface ShellFeedback {
  notify: (options: ShellFeedbackNotifyOptions) => void;
  announce: (message: string, politeness?: 'polite' | 'assertive') => void;
}

export interface ShellContextValue {
  queryClient: QueryClient;
  httpClient: HttpClient;
  realtimeClient: RealtimeClient;
  session: ShellUserSession | null;
  navigate: (to: string) => void;
  feedback: ShellFeedback;
}

export const SHELL_CONTEXT_KEY = Symbol.for('nft.shell.context');

type ShellContextHolder = {
  [SHELL_CONTEXT_KEY]?: React.Context<ShellContextValue | null>;
};

const holder = globalThis as unknown as ShellContextHolder;

const ShellContext: React.Context<ShellContextValue | null> =
  holder[SHELL_CONTEXT_KEY] ??
  (holder[SHELL_CONTEXT_KEY] = createContext<ShellContextValue | null>(null));

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

/**
 * Access the current user session from the Shell context.
 * Returns `null` if unauthenticated.
 */
export function useSession(): ShellUserSession | null {
  return useShell().session;
}

/**
 * Access the accessible feedback system (toast and live regions) from the Shell context.
 */
export function useFeedback(): ShellFeedback {
  return useShell().feedback;
}
