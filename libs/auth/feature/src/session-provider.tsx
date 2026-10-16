import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
  type ReactNode,
} from 'react';
import type { Session, User, SignInInput, SignUpInput } from '@nft/shared-contracts';
import { login, register, logout } from '@nft/auth-data-access';
import {
  SessionController,
  type SessionState,
  type SessionStatus,
} from './session-controller';
import {
  useShell,
  ShellProvider,
  toShellUserSession,
  type ShellContextValue,
} from '@nft/shell-kit';

export interface AuthContextValue {
  session: Session | null;
  user: User | null;
  status: SessionStatus;
  controller: SessionController;
  login: (credentials: SignInInput) => Promise<Session>;
  register: (input: SignUpInput) => Promise<Session>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export interface SessionProviderProps {
  controller: SessionController;
  children: ReactNode;
}

/**
 * React Provider integrating SessionController with React Context.
 * Re-emits an updated ShellContext to synchronize useSession() across all remote and host components.
 */
export function SessionProvider({ controller, children }: SessionProviderProps) {
  const [sessionState, setSessionState] = useState<SessionState>(controller.getState());
  const shell = useShell();

  useEffect(() => {
    const unsubscribe = controller.subscribe((nextState) => {
      setSessionState(nextState);
    });
    return unsubscribe;
  }, [controller]);

  const authValue = useMemo<AuthContextValue>(() => {
    return {
      session: sessionState.session,
      user: sessionState.session?.user ?? null,
      status: sessionState.status,
      controller,
      login: async (credentials: SignInInput) => {
        const session = await login(shell.httpClient, credentials);
        await controller.setSession(session);
        return session;
      },
      register: async (input: SignUpInput) => {
        const session = await register(shell.httpClient, input);
        await controller.setSession(session);
        return session;
      },
      logout: async () => {
        try {
          await logout(shell.httpClient);
        } finally {
          await controller.logout();
        }
      },
    };
  }, [sessionState, controller, shell.httpClient]);

  const updatedShellValue = useMemo<ShellContextValue>(() => {
    return {
      ...shell,
      session: toShellUserSession(sessionState.session),
    };
  }, [shell, sessionState.session]);

  return (
    <AuthContext.Provider value={authValue}>
      <ShellProvider value={updatedShellValue}>{children}</ShellProvider>
    </AuthContext.Provider>
  );
}

/**
 * Access the active authentication state, user, controller, and auth actions.
 */
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within a SessionProvider.');
  }
  return ctx;
}

/**
 * Access the active authentication state if within a SessionProvider, otherwise null.
 */
export function useOptionalAuth(): AuthContextValue | null {
  return useContext(AuthContext);
}

