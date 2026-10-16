import { describe, it, expect } from 'vitest';
import {
  UserSchema,
  SessionSchema,
  SignUpInputSchema,
  SignInInputSchema,
  WalletSchema,
  UserWalletsSchema,
  NftEditionSchema,
  NftItemSchema,
  ReviewSchema,
  CartItemSchema,
  CartSchema,
  QuoteSchema,
  CollectorSchema,
  OrderReceiptSnapshotSchema,
  OrderSchema,
  RealtimeEnvelopeSchema,
  ApiErrorSchema,
} from '../index';
import {
  mockUser,
  mockSecondUser,
  mockSession,
  mockSignUpInput,
  mockSignInInput,
  mockPrimaryWallet,
  mockSecondaryWallet,
  mockUserWallets,
  mockNftEdition,
  mockNftItem,
  mockReview,
  mockCartItem,
  mockCart,
  mockQuote,
  mockCollector,
  mockCollectorWithSecondary,
  mockOrderReceipt,
  mockOrder,
  mockNftUpdatedEvent,
  mockOrderUpdatedEvent,
  mockValidationError,
} from './index';

describe('Canonical Fixtures Validation (@nft/shared-contracts)', () => {
  it('validates 100% of exported canonical fixtures against their schemas', () => {
    // Auth & Session
    expect(UserSchema.parse(mockUser)).toEqual(mockUser);
    expect(UserSchema.parse(mockSecondUser)).toEqual(mockSecondUser);
    expect(SessionSchema.parse(mockSession)).toEqual(mockSession);
    expect(SignUpInputSchema.parse(mockSignUpInput)).toEqual(mockSignUpInput);
    expect(SignInInputSchema.parse(mockSignInInput)).toEqual(mockSignInInput);

    // Wallets
    expect(WalletSchema.parse(mockPrimaryWallet)).toEqual(mockPrimaryWallet);
    expect(WalletSchema.parse(mockSecondaryWallet)).toEqual(mockSecondaryWallet);
    expect(UserWalletsSchema.parse(mockUserWallets)).toEqual(mockUserWallets);

    // Catalog & Reviews
    expect(NftEditionSchema.parse(mockNftEdition)).toEqual(mockNftEdition);
    expect(NftItemSchema.parse(mockNftItem)).toEqual(mockNftItem);
    expect(ReviewSchema.parse(mockReview)).toEqual(mockReview);

    // Cart & Quote
    expect(CartItemSchema.parse(mockCartItem)).toEqual(mockCartItem);
    expect(CartSchema.parse(mockCart)).toEqual(mockCart);
    expect(QuoteSchema.parse(mockQuote)).toEqual(mockQuote);

    // Collector & Orders
    expect(CollectorSchema.parse(mockCollector)).toEqual(mockCollector);
    expect(CollectorSchema.parse(mockCollectorWithSecondary)).toEqual(mockCollectorWithSecondary);
    expect(OrderReceiptSnapshotSchema.parse(mockOrderReceipt)).toEqual(mockOrderReceipt);
    expect(OrderSchema.parse(mockOrder)).toEqual(mockOrder);

    // Realtime Envelopes
    expect(RealtimeEnvelopeSchema.parse(mockNftUpdatedEvent)).toEqual(mockNftUpdatedEvent);
    expect(RealtimeEnvelopeSchema.parse(mockOrderUpdatedEvent)).toEqual(mockOrderUpdatedEvent);

    // Errors
    expect(ApiErrorSchema.parse(mockValidationError)).toEqual(mockValidationError);
  });
});
