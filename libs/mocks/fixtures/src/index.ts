export interface MockNftItem {
  id: string;
  title: string;
  priceEth: string;
  creator: string;
  imageUrl: string;
  edition: number;
  totalEditions: number;
  available: boolean;
}

export interface MockUserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
}

export interface MockWalletItem {
  id: string;
  address: string;
  name: string;
  isDefault: boolean;
}

export const mockUsers: MockUserProfile[] = [
  {
    id: 'user_alice',
    name: 'Alice Silva',
    email: 'alice@example.com',
  },
  {
    id: 'user_bob',
    name: 'Bob Santos',
    email: 'bob@example.com',
  },
];

export const mockNfts: MockNftItem[] = [
  {
    id: 'nft_1',
    title: 'Cyber Ape #001',
    priceEth: '0.45',
    creator: 'CryptoJungle',
    imageUrl: '/assets/nfts/cyber-ape-001.webp',
    edition: 1,
    totalEditions: 10,
    available: true,
  },
  {
    id: 'nft_2',
    title: 'Neon Jaguar #042',
    priceEth: '1.20',
    creator: 'NeonLabs',
    imageUrl: '/assets/nfts/neon-jaguar-042.webp',
    edition: 42,
    totalEditions: 50,
    available: true,
  },
];

export const mockWallets: MockWalletItem[] = [
  {
    id: 'wallet_1',
    address: '0x1111111111111111111111111111111111111111',
    name: 'Main Vault',
    isDefault: true,
  },
];
