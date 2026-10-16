import type { HttpClient } from '@nft/shared-http';
import {
  queryOptions,
  queryKeys,
  useMutation,
  useQuery,
  type UseMutationResult,
  type UseQueryResult,
} from '@nft/shared-query';
import {
  SessionSchema,
  SignUpInputSchema,
  SignInInputSchema,
  type Session,
  type SignUpInput,
  type SignInInput,
} from '@nft/shared-contracts';

/**
 * Pure API call to fetch active user session.
 */
export async function getSession(client: HttpClient): Promise<Session> {
  const response = await client.get<Session>('/api/auth/session');
  return SessionSchema.parse(response.data);
}

/**
 * Query options factory for session query with public key ['session'].
 */
export function sessionQueryOptions(client: HttpClient) {
  return queryOptions({
    queryKey: queryKeys.session(),
    queryFn: () => getSession(client),
    staleTime: 30 * 1000,
    retry: false,
  });
}

/**
 * Hook to inspect current session.
 */
export function useSessionQuery(client: HttpClient): UseQueryResult<Session> {
  return useQuery(sessionQueryOptions(client));
}

/**
 * Pure API call for login.
 */
export async function login(client: HttpClient, input: SignInInput): Promise<Session> {
  const validated = SignInInputSchema.parse(input);
  const response = await client.post<Session>('/api/auth/login', validated);
  return SessionSchema.parse(response.data);
}

/**
 * Mutation hook for login without automatic retry.
 */
export function useLogin(
  client: HttpClient,
): UseMutationResult<Session, Error, SignInInput> {
  return useMutation({
    mutationFn: (credentials: SignInInput) => login(client, credentials),
    retry: false,
  });
}

/**
 * Pure API call for registration.
 */
export async function register(client: HttpClient, input: SignUpInput): Promise<Session> {
  const validated = SignUpInputSchema.parse(input);
  const response = await client.post<Session>('/api/auth/signup', validated);
  return SessionSchema.parse(response.data);
}

/**
 * Mutation hook for user registration without automatic retry.
 */
export function useRegister(
  client: HttpClient,
): UseMutationResult<Session, Error, SignUpInput> {
  return useMutation({
    mutationFn: (input: SignUpInput) => register(client, input),
    retry: false,
  });
}

/**
 * Pure API call for logout.
 */
export async function logout(client: HttpClient): Promise<{ success: boolean }> {
  const response = await client.post<{ success: boolean }>('/api/auth/logout');
  return response.data;
}

/**
 * Mutation hook for logout.
 */
export function useLogout(
  client: HttpClient,
): UseMutationResult<{ success: boolean }, Error, void> {
  return useMutation({
    mutationFn: () => logout(client),
    retry: false,
  });
}
