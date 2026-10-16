import type {
  User,
  Session,
  SignUpInput,
  SignInInput,
  Wallet,
  UserWallets,
  NftItem,
  NftEdition,
  Review,
  CartItem,
  Cart,
  Quote,
  Collector,
  Order,
  OrderReceiptSnapshot,
  NftUpdatedEvent,
  OrderUpdatedEvent,
  ApiErrorPayload,
} from '../index';

export const mockUser: User = {
  id: 'usr-1',
  displayName: 'Alex Cyber',
  username: 'alex_cyber',
  email: 'alex@jungle.market',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
  bio: 'Cyberpunk & generative art collector.',
  createdAt: '2026-01-10T10:00:00.000Z',
};

export const mockSecondUser: User = {
  id: 'usr-2',
  displayName: 'Elena Vault',
  username: 'elena_vault',
  email: 'elena@jungle.market',
  avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
  bio: 'Web3 investor and digital curator.',
  createdAt: '2026-01-15T14:30:00.000Z',
};

export const mockSession: Session = {
  token: 'jwt-mock-session-token-12345',
  user: mockUser,
  expiresAt: '2026-12-31T23:59:59.000Z',
};

export const mockSignUpInput: SignUpInput = {
  displayName: 'New Collector',
  username: 'new_collector',
  email: 'collector@jungle.market',
  password: 'StrongPassword123!',
};

export const mockSignInInput: SignInInput = {
  identifier: 'alex@jungle.market',
  password: 'Password123!',
};

export const mockPrimaryWallet: Wallet = {
  id: 'wal-1',
  userId: 'usr-1',
  address: '0x1111111111111111111111111111111111111111',
  network: 'ethereum-mainnet',
  ensName: 'alexcyber',
  label: 'Ledger Cold Wallet',
  isPrimary: true,
  createdAt: '2026-01-10T10:05:00.000Z',
};

export const mockSecondaryWallet: Wallet = {
  id: 'wal-2',
  userId: 'usr-1',
  address: '0x2222222222222222222222222222222222222222',
  network: 'polygon',
  ensName: null,
  label: 'Daily Hot Wallet',
  isPrimary: false,
  createdAt: '2026-01-12T11:20:00.000Z',
};

export const mockUserWallets: UserWallets = {
  primary: mockPrimaryWallet,
  secondary: mockSecondaryWallet,
};

export const mockNftEdition: NftEdition = {
  id: 'ed-1',
  editionNumber: 1,
  name: 'First Edition - Cyber Predator',
  maxSupply: 50,
  availableSupply: 12,
  price: '1.7500',
  version: 1,
};

export const mockNftItem: NftItem = {
  id: 'nft-101',
  title: 'Apex Predator #01',
  description: 'Cybernetic feline prowling the neo-tokyo digital canopy.',
  imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
  creator: {
    id: 'cr-1',
    name: 'NeoTokyo Studios',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
    verified: true,
  },
  category: 'Cyberpunk',
  tags: ['3D', 'Cyber', 'Predator', 'Neon'],
  price: '1.7500',
  rating: {
    average: 4.9,
    count: 88,
  },
  editions: [mockNftEdition],
  featured: true,
  version: 1,
  createdAt: '2026-02-01T08:00:00.000Z',
  updatedAt: '2026-02-05T12:00:00.000Z',
};

export const mockReview: Review = {
  id: 'rev-1',
  nftId: 'nft-101',
  author: {
    id: 'usr-2',
    name: 'Elena Vault',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80',
  },
  rating: 5,
  comment: 'Incredible texture and dynamic lighting. One of the best pieces in the marketplace.',
  createdAt: '2026-02-06T15:30:00.000Z',
};

export const mockCartItem: CartItem = {
  id: 'cart-item-1',
  nftId: 'nft-101',
  editionId: 'ed-1',
  title: 'Apex Predator #01',
  editionNumber: 1,
  imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
  unitPrice: '1.7500',
  quantity: 2,
  maxAvailable: 12,
};

export const mockCart: Cart = {
  id: 'cart-100',
  userId: 'usr-1',
  sessionId: null,
  items: [mockCartItem],
  couponCode: 'JUNGLE10',
  updatedAt: '2026-02-10T14:00:00.000Z',
};

export const mockQuote: Quote = {
  quoteId: 'quote-999',
  subtotal: '3.5000',
  discount: '0.3500',
  networkFee: '0.0050',
  total: '3.1550',
  coupon: {
    code: 'JUNGLE10',
    discountPercent: 10,
    discountAmount: '0.3500',
    isValid: true,
    message: '10% de desconto de boas-vindas aplicado.',
  },
  itemsAvailability: [
    {
      nftId: 'nft-101',
      editionId: 'ed-1',
      requestedQuantity: 2,
      availableQuantity: 12,
      isAvailable: true,
      currentPrice: '1.7500',
      priceChanged: false,
    },
  ],
  isExpired: false,
  expiresAt: '2026-12-31T23:59:59.000Z',
};

export const mockCollector: Collector = {
  fullName: 'Alex Cyber',
  email: 'alex@jungle.market',
  walletAddress: '0x1111111111111111111111111111111111111111',
  network: 'ethereum-mainnet',
  ensName: 'alexcyber',
  useSecondaryWallet: false,
};

export const mockCollectorWithSecondary: Collector = {
  fullName: 'Alex Cyber',
  email: 'alex@jungle.market',
  walletAddress: '0x1111111111111111111111111111111111111111',
  network: 'ethereum-mainnet',
  ensName: 'alexcyber',
  useSecondaryWallet: true,
  secondaryWallet: {
    address: '0x2222222222222222222222222222222222222222',
    network: 'polygon',
    type: 'backup',
  },
};

export const mockOrderReceipt: OrderReceiptSnapshot = {
  orderId: 'ord-888',
  transactionHash: '0xabcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789',
  collector: mockCollector,
  items: [
    {
      nftId: 'nft-101',
      editionId: 'ed-1',
      editionNumber: 1,
      title: 'Apex Predator #01',
      imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
      unitPrice: '1.7500',
      quantity: 2,
      subtotal: '3.5000',
    },
  ],
  quoteId: 'quote-999',
  subtotal: '3.5000',
  discount: '0.3500',
  networkFee: '0.0050',
  total: '3.1550',
  confirmedAt: '2026-02-10T14:05:00.000Z',
  blockNumber: 19283746,
};

export const mockOrder: Order = {
  id: 'ord-888',
  userId: 'usr-1',
  quoteId: 'quote-999',
  idempotencyKey: 'idemp-55555-66666',
  status: 'confirmed',
  collector: mockCollector,
  items: mockOrderReceipt.items,
  subtotal: '3.5000',
  discount: '0.3500',
  networkFee: '0.0050',
  total: '3.1550',
  receipt: mockOrderReceipt,
  rejectionReason: null,
  createdAt: '2026-02-10T14:02:00.000Z',
  updatedAt: '2026-02-10T14:05:00.000Z',
};

export const mockNftUpdatedEvent: NftUpdatedEvent = {
  id: 'evt-nft-update-01',
  type: 'nft.updated',
  resource: 'nft',
  resourceId: 'nft-101',
  version: 2,
  timestamp: '2026-02-10T14:10:00.000Z',
  payload: {
    nftId: 'nft-101',
    editionId: 'ed-1',
    price: '1.8000',
    availableSupply: 10,
    maxSupply: 50,
  },
};

export const mockOrderUpdatedEvent: OrderUpdatedEvent = {
  id: 'evt-ord-update-01',
  type: 'order.updated',
  resource: 'order',
  resourceId: 'ord-888',
  version: 2,
  timestamp: '2026-02-10T14:05:00.000Z',
  userId: 'usr-1',
  payload: {
    orderId: 'ord-888',
    userId: 'usr-1',
    status: 'confirmed',
    transactionHash: '0xabcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789',
    confirmedAt: '2026-02-10T14:05:00.000Z',
  },
};

export const mockValidationError: ApiErrorPayload = {
  code: 'VALIDATION_ERROR',
  message: 'Invalid input payload',
  retryable: false,
  fieldErrors: {
    email: 'Formato de email inválido',
  },
};
