import { describe, it, expect, vi } from 'vitest';
import type { HttpClient } from '@nft/shared-http';
import { createQueryClient, clearPrivateCache } from '@nft/shared-query';
import {
  getProfile,
  profileQueryOptions,
  updateProfile,
  uploadAvatar,
  deleteAvatar,
  changePassword,
} from './index';

describe('Profile Data Access (@nft/profile-data-access)', () => {
  const mockClient: HttpClient = {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  } as unknown as HttpClient;

  it('generates private query options keyed by userId and verifies clearPrivateCache', () => {
    const userId = 'user_alice';
    const options = profileQueryOptions(mockClient, userId);

    expect(options.queryKey).toEqual(['user', 'user_alice', 'profile']);
    expect(options.staleTime).toBe(300000);

    const queryClient = createQueryClient();
    queryClient.setQueryData(options.queryKey, { id: userId, displayName: 'Alice' });
    expect(queryClient.getQueryData(options.queryKey)).toBeDefined();

    // Isolates by clearing private cache of user_alice
    clearPrivateCache(queryClient, userId);
    expect(queryClient.getQueryData(options.queryKey)).toBeUndefined();
  });

  it('calls getProfile and validates profile schema', async () => {
    vi.mocked(mockClient.get).mockResolvedValueOnce({
      data: {
        id: 'user_alice',
        displayName: 'Alice Silva',
        username: 'alice',
        email: 'alice@example.com',
        ensName: 'alice',
        walletNickname: 'Carteira Principal',
        avatarUrl: null,
        bio: null,
        createdAt: '2026-01-01T00:00:00Z',
      },
    } as never);

    const result = await getProfile(mockClient);
    expect(result.id).toBe('user_alice');
    expect(mockClient.get).toHaveBeenCalledWith('/api/profile');
  });

  it('calls updateProfile with validated payload', async () => {
    vi.mocked(mockClient.put).mockResolvedValueOnce({
      data: {
        id: 'user_alice',
        displayName: 'Alice Updated',
        username: 'alice',
        email: 'alice@example.com',
        avatarUrl: null,
        bio: 'New bio',
        createdAt: '2026-01-01T00:00:00Z',
      },
    } as never);

    const result = await updateProfile(mockClient, {
      displayName: 'Alice Updated',
      bio: 'New bio',
    });

    expect(result.displayName).toBe('Alice Updated');
    expect(mockClient.put).toHaveBeenCalledWith('/api/profile', {
      displayName: 'Alice Updated',
      bio: 'New bio',
    });
  });

  it('calls uploadAvatar and deleteAvatar', async () => {
    vi.mocked(mockClient.post).mockResolvedValueOnce({
      data: {
        id: 'user_alice',
        displayName: 'Alice',
        username: 'alice',
        email: 'alice@example.com',
        avatarUrl: 'https://example.com/avatar.png',
        createdAt: '2026-01-01T00:00:00Z',
      },
    } as never);

    const uploadRes = await uploadAvatar(mockClient, {
      avatarUrl: 'https://example.com/avatar.png',
    });
    expect(uploadRes.avatarUrl).toBe('https://example.com/avatar.png');

    vi.mocked(mockClient.delete).mockResolvedValueOnce({
      data: {
        id: 'user_alice',
        displayName: 'Alice',
        username: 'alice',
        email: 'alice@example.com',
        avatarUrl: null,
        createdAt: '2026-01-01T00:00:00Z',
      },
    } as never);

    const deleteRes = await deleteAvatar(mockClient);
    expect(deleteRes.avatarUrl).toBeNull();
  });

  it('calls changePassword with validated payload', async () => {
    vi.mocked(mockClient.post).mockResolvedValueOnce({
      data: { success: true },
    } as never);

    const res = await changePassword(mockClient, {
      currentPassword: 'OldPassword123!',
      newPassword: 'BrandNewPassword123!',
    });

    expect(res.success).toBe(true);
    expect(mockClient.post).toHaveBeenCalledWith('/api/profile/password', {
      currentPassword: 'OldPassword123!',
      newPassword: 'BrandNewPassword123!',
    });
  });
});
