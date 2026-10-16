import type { ComponentType } from 'react';

export type RemoteName = 'storefront' | 'checkout' | 'account';

export interface StorefrontPages {
  HomePage: ComponentType;
  PdpPage: ComponentType;
}

export interface CheckoutPages {
  CartPage: ComponentType;
  PaymentPage: ComponentType;
  ConfirmationPage: ComponentType;
}

export interface AccountPages {
  ProfilePage: ComponentType;
  WalletsPage: ComponentType;
}

export interface RemotePages {
  storefront: StorefrontPages;
  checkout: CheckoutPages;
  account: AccountPages;
}

export type RemotePageName =
  | 'HomePage'
  | 'PdpPage'
  | 'CartPage'
  | 'PaymentPage'
  | 'ConfirmationPage'
  | 'ProfilePage'
  | 'WalletsPage';

export interface RemoteManifest {
  name: RemoteName;
  port: number;
  base: string;
  routes: readonly string[];
  pages: readonly string[];
}

export const REMOTE_MANIFESTS: Record<RemoteName, RemoteManifest> = {
  storefront: {
    name: 'storefront',
    port: 4201,
    base: '/remotes/storefront/',
    routes: ['/', '/nft/$nftId'],
    pages: ['HomePage', 'PdpPage'],
  },
  checkout: {
    name: 'checkout',
    port: 4202,
    base: '/remotes/checkout/',
    routes: ['/carrinho', '/pagamento', '/pedido/$orderId'],
    pages: ['CartPage', 'PaymentPage', 'ConfirmationPage'],
  },
  account: {
    name: 'account',
    port: 4203,
    base: '/remotes/account/',
    routes: ['/perfil', '/carteiras'],
    pages: ['ProfilePage', 'WalletsPage'],
  },
} as const;
