import type { HttpClient } from '@nft/shared-http';
import { SessionSchema, type Session } from '@nft/shared-contracts';
import { mockUsers } from '@nft/mocks-fixtures';

export interface StandaloneDevAuthCredentials {
  identifier?: string | undefined;
  password?: string | undefined;
}

export interface StandaloneDevSession {
  token: string;
  user: Session['user'];
  session: Session;
  isDevelopment: true;
}

export const DEFAULT_STANDALONE_DEV_CREDENTIALS: {
  readonly identifier: string;
  readonly password: string;
} = {
  identifier: mockUsers[0]?.email ?? 'alice@example.com',
  password: 'Password123!',
};

export function isStandaloneMocksEnabled(): boolean {
  if (typeof process !== 'undefined' && process.env?.VITE_ENABLE_MOCKS === 'false') {
    return false;
  }
  const metaEnv = (import.meta as unknown as { env?: { VITE_ENABLE_MOCKS?: string; MODE?: string } }).env;
  if (metaEnv?.VITE_ENABLE_MOCKS === 'false') {
    return false;
  }
  return true;
}

export function isStandaloneDevEnvironment(): boolean {
  if (typeof process !== 'undefined' && process.env?.NODE_ENV === 'production') {
    return false;
  }
  const metaEnv = (import.meta as unknown as { env?: { PROD?: boolean } }).env;
  if (metaEnv?.PROD) {
    return false;
  }
  return true;
}

/**
 * Development session adapter for standalone remote execution.
 * Restricted to development mode with network simulation (MSW) enabled.
 * Uses the standard HttpClient to authenticate deterministically against the simulated API.
 */
export async function authenticateStandaloneDevSession(
  httpClient: HttpClient,
  credentials?: StandaloneDevAuthCredentials,
): Promise<StandaloneDevSession> {
  if (!isStandaloneMocksEnabled()) {
    throw new Error(
      'Autenticação de desenvolvimento indisponível com mocks desabilitados. Utilize o Shell integrado para efetuar login.',
    );
  }

  if (!isStandaloneDevEnvironment()) {
    throw new Error(
      'Autenticação automática de desenvolvimento é restrita ao ambiente de desenvolvimento.',
    );
  }

  const payload = {
    identifier: credentials?.identifier ?? DEFAULT_STANDALONE_DEV_CREDENTIALS.identifier,
    password: credentials?.password ?? DEFAULT_STANDALONE_DEV_CREDENTIALS.password,
  };

  const response = await httpClient.post<unknown>('/api/auth/login', payload);
  const session = SessionSchema.parse(response.data);

  return {
    token: session.token,
    user: session.user,
    session,
    isDevelopment: true,
  };
}
