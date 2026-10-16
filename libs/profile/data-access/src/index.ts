import type { HttpClient } from '@nft/shared-http';
import {
  queryOptions,
  queryKeys,
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
  type UseQueryResult,
} from '@nft/shared-query';
import {
  ProfileSchema,
  UpdateProfileInputSchema,
  UploadAvatarInputSchema,
  ChangePasswordInputSchema,
  type Profile,
  type UpdateProfileInput,
  type UploadAvatarInput,
  type ChangePasswordInput,
} from '@nft/shared-contracts';

/**
 * Pure API call to fetch profile for authenticated user.
 */
export async function getProfile(client: HttpClient): Promise<Profile> {
  const response = await client.get<Profile>('/api/profile');
  return ProfileSchema.parse(response.data);
}

/**
 * Query options factory for profile query with private key ['user', userId, 'profile'].
 */
export function profileQueryOptions(client: HttpClient, userId: string) {
  return queryOptions({
    queryKey: queryKeys.user(userId, 'profile'),
    queryFn: () => getProfile(client),
    staleTime: 5 * 60 * 1000,
    enabled: Boolean(userId),
  });
}

/**
 * Hook to fetch user profile using private query key.
 */
export function useProfileQuery(
  client: HttpClient,
  userId: string
): UseQueryResult<Profile> {
  return useQuery(profileQueryOptions(client, userId));
}

/**
 * Pure API call to update profile.
 */
export async function updateProfile(
  client: HttpClient,
  input: UpdateProfileInput
): Promise<Profile> {
  const validated = UpdateProfileInputSchema.parse(input);
  const response = await client.put<Profile>('/api/profile', validated);
  return ProfileSchema.parse(response.data);
}

/**
 * Mutation hook to update profile, invalidating profile and session caches.
 */
export function useUpdateProfile(
  client: HttpClient,
  userId: string
): UseMutationResult<Profile, Error, UpdateProfileInput> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateProfileInput) => updateProfile(client, input),
    onSuccess: (updatedProfile) => {
      queryClient.setQueryData(queryKeys.user(userId, 'profile'), updatedProfile);
      queryClient.invalidateQueries({ queryKey: queryKeys.user(userId, 'profile') });
      queryClient.invalidateQueries({ queryKey: queryKeys.session() });
    },
  });
}

/**
 * Pure API call to upload/update avatar.
 */
export async function uploadAvatar(
  client: HttpClient,
  input: UploadAvatarInput
): Promise<Profile> {
  const validated = UploadAvatarInputSchema.parse(input);
  const response = await client.post<Profile>('/api/profile/avatar', validated);
  return ProfileSchema.parse(response.data);
}

/**
 * Mutation hook to upload avatar.
 */
export function useUploadAvatar(
  client: HttpClient,
  userId: string
): UseMutationResult<Profile, Error, UploadAvatarInput> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UploadAvatarInput) => uploadAvatar(client, input),
    onSuccess: (updatedProfile) => {
      queryClient.setQueryData(queryKeys.user(userId, 'profile'), updatedProfile);
      queryClient.invalidateQueries({ queryKey: queryKeys.user(userId, 'profile') });
      queryClient.invalidateQueries({ queryKey: queryKeys.session() });
    },
  });
}

/**
 * Pure API call to remove avatar.
 */
export async function deleteAvatar(client: HttpClient): Promise<Profile> {
  const response = await client.delete<Profile>('/api/profile/avatar');
  return ProfileSchema.parse(response.data);
}

/**
 * Mutation hook to remove avatar.
 */
export function useDeleteAvatar(
  client: HttpClient,
  userId: string
): UseMutationResult<Profile, Error, void> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => deleteAvatar(client),
    onSuccess: (updatedProfile) => {
      queryClient.setQueryData(queryKeys.user(userId, 'profile'), updatedProfile);
      queryClient.invalidateQueries({ queryKey: queryKeys.user(userId, 'profile') });
      queryClient.invalidateQueries({ queryKey: queryKeys.session() });
    },
  });
}

/**
 * Pure API call to change password.
 */
export async function changePassword(
  client: HttpClient,
  input: ChangePasswordInput
): Promise<{ success: boolean }> {
  const validated = ChangePasswordInputSchema.parse(input);
  const response = await client.post<{ success: boolean }>('/api/profile/password', validated);
  return response.data;
}

/**
 * Mutation hook to change password.
 */
export function useChangePassword(
  client: HttpClient
): UseMutationResult<{ success: boolean }, Error, ChangePasswordInput> {
  return useMutation({
    mutationFn: (input: ChangePasswordInput) => changePassword(client, input),
    retry: false,
  });
}
