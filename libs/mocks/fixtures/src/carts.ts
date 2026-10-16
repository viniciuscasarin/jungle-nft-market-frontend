import type { Cart } from '@nft/shared-contracts';
import { mockCatalogNfts } from './nfts';

const nft1 = mockCatalogNfts[0]!;
const nft2 = mockCatalogNfts[1]!;
const nft3 = mockCatalogNfts[2]!;

export const mockCarts: Cart[] = [
  {
    id: 'cart_alice',
    userId: 'user_alice',
    sessionId: null,
    items: [
      {
        id: 'cart_item_alice_1',
        nftId: nft1.id,
        editionId: nft1.editions[0]!.id,
        title: nft1.title,
        editionNumber: nft1.editions[0]!.editionNumber,
        imageUrl: nft1.imageUrl,
        unitPrice: nft1.price,
        quantity: 1,
        maxAvailable: nft1.editions[0]!.availableSupply,
      },
      {
        id: 'cart_item_alice_2',
        nftId: nft2.id,
        editionId: nft2.editions[0]!.id,
        title: nft2.title,
        editionNumber: nft2.editions[0]!.editionNumber,
        imageUrl: nft2.imageUrl,
        unitPrice: nft2.price,
        quantity: 2,
        maxAvailable: nft2.editions[0]!.availableSupply,
      },
    ],
    couponCode: 'JUNGLE10',
    updatedAt: '2026-01-01T11:00:00.000Z',
  },
  {
    id: 'cart_bob',
    userId: 'user_bob',
    sessionId: null,
    items: [
      {
        id: 'cart_item_bob_1',
        nftId: nft3.id,
        editionId: nft3.editions[0]!.id,
        title: nft3.title,
        editionNumber: nft3.editions[0]!.editionNumber,
        imageUrl: nft3.imageUrl,
        unitPrice: nft3.price,
        quantity: 1,
        maxAvailable: nft3.editions[0]!.availableSupply,
      },
    ],
    couponCode: null,
    updatedAt: '2026-01-02T13:00:00.000Z',
  },
];
