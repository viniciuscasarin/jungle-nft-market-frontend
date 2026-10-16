import { describe, it, expect } from 'vitest';
import { REMOTE_MANIFESTS, type RemoteName } from './contracts';

describe('Remote Contracts (@nft/shell-kit)', () => {
  it('defines manifests for all 3 remotes with correct ports and bases', () => {
    expect(REMOTE_MANIFESTS.storefront).toEqual({
      name: 'storefront',
      port: 4201,
      base: '/remotes/storefront/',
      routes: ['/', '/catalogo', '/nft/$nftId'],
      pages: ['HomePage', 'PdpPage'],
    });

    expect(REMOTE_MANIFESTS.checkout).toEqual({
      name: 'checkout',
      port: 4202,
      base: '/remotes/checkout/',
      routes: ['/carrinho', '/checkout', '/pedidos/$orderId/confirmacao'],
      pages: ['CartPage', 'PaymentPage', 'ConfirmationPage'],
    });

    expect(REMOTE_MANIFESTS.account).toEqual({
      name: 'account',
      port: 4203,
      base: '/remotes/account/',
      routes: ['/perfil', '/carteiras'],
      pages: ['ProfilePage', 'WalletsPage'],
    });
  });

  it('covers all 7 required remote pages across the 3 manifests', () => {
    const allPages = (Object.keys(REMOTE_MANIFESTS) as RemoteName[]).flatMap(
      (key) => REMOTE_MANIFESTS[key].pages,
    );

    expect(allPages).toEqual([
      'HomePage',
      'PdpPage',
      'CartPage',
      'PaymentPage',
      'ConfirmationPage',
      'ProfilePage',
      'WalletsPage',
    ]);
  });
});
