import type { User } from '@nft/shared-contracts';

export interface MockStoredUser extends User {
  passwordHash: string;
  passwordSalt: string;
}

export const mockUsers: MockStoredUser[] = [
  {
    id: 'user_alice',
    displayName: 'Alice Silva',
    username: 'alice',
    email: 'alice@example.com',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop',
    bio: 'Digital art enthusiast and premier NFT collector exploring neon aesthetics.',
    createdAt: '2026-01-01T10:00:00.000Z',
    passwordHash: '3f60c0a8da4dedb4f8a4e90ffddec339a38c209aa7a63ed19b46fced61d4aa87',
    passwordSalt: 'a11ce000000000000000000000000001',
  },
  {
    id: 'user_bob',
    displayName: 'Bob Santos',
    username: 'bob',
    email: 'bob@example.com',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop',
    bio: 'Crypto strategist, metaverse curator, and early adopter of cross-chain assets.',
    createdAt: '2026-01-02T12:00:00.000Z',
    passwordHash: 'ae3e2f72e3b205f3f3e9c413842a970c03b6205baf2bef0ffcdea87e54bd39ad',
    passwordSalt: 'b0b00000000000000000000000000002',
  },
];

