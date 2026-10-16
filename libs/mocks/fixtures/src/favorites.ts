export interface MockFavorite {
  id: string;
  userId: string;
  nftId: string;
  createdAt: string;
}

export const mockFavorites: MockFavorite[] = [
  {
    id: 'fav_alice_1',
    userId: 'user_alice',
    nftId: 'nft-01',
    createdAt: '2026-01-01T10:30:00.000Z',
  },
  {
    id: 'fav_alice_2',
    userId: 'user_alice',
    nftId: 'nft-03',
    createdAt: '2026-01-01T10:35:00.000Z',
  },
  {
    id: 'fav_alice_3',
    userId: 'user_alice',
    nftId: 'nft-07',
    createdAt: '2026-01-01T10:40:00.000Z',
  },
  {
    id: 'fav_bob_1',
    userId: 'user_bob',
    nftId: 'nft-02',
    createdAt: '2026-01-02T12:30:00.000Z',
  },
  {
    id: 'fav_bob_2',
    userId: 'user_bob',
    nftId: 'nft-04',
    createdAt: '2026-01-02T12:35:00.000Z',
  },
];
