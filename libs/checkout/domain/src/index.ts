// Public API for @nft/checkout-domain
import { WalletNetworkSchema } from '@nft/shared-contracts';
import type {
  CartItem,
  Collector,
  ItemAvailability,
  Profile,
  Quote,
  Wallet,
  WalletNetwork,
  WalletType,
} from '@nft/shared-contracts';
import { compare, parse } from '@nft/shared-money';

export type CheckoutSummaryItem = Pick<
  CartItem,
  'id' | 'title' | 'editionNumber' | 'imageUrl' | 'quantity'
> & Pick<ItemAvailability, 'currentPrice'> & { currentPriceText: string };

export type CheckoutCollector = Collector;
export type CheckoutWallet = Pick<
  Wallet,
  'id' | 'address' | 'network' | 'walletType' | 'ensName' | 'label' | 'displayName' | 'isPrimary'
>;
export type CheckoutWalletProvider = WalletType;

export function parseWalletNetwork(value: string): WalletNetwork | undefined {
  const parsed = WalletNetworkSchema.safeParse(value);
  return parsed.success ? parsed.data : undefined;
}

export interface MapProfileAndWalletToCollectorInput {
  profile?: Profile | null | undefined;
  primaryWallet?: Wallet | null | undefined;
  defaultNetwork?: WalletNetwork | undefined;
  defaultWalletType?: WalletType | undefined;
}

export function mapProfileAndWalletToCollector(
  input: MapProfileAndWalletToCollectorInput
): Partial<Collector> {
  const { profile, primaryWallet, defaultNetwork = 'ethereum-mainnet', defaultWalletType = 'metamask' } = input;

  const rawEns = profile?.ensName ?? primaryWallet?.ensName ?? '';
  // Collector contract specifies ensName without .eth suffix
  const sanitizedEns = rawEns.toLowerCase().endsWith('.eth')
    ? rawEns.slice(0, -4)
    : rawEns;

  return {
    fullName: profile?.displayName ?? '',
    email: profile?.email ?? '',
    walletAddress: primaryWallet?.address ?? '',
    walletType: primaryWallet?.walletType ?? defaultWalletType,
    network: primaryWallet?.network ?? defaultNetwork,
    ensName: sanitizedEns || undefined,
    useSecondaryWallet: false,
    secondaryWallet: null,
    note: '',
  };
}

export function hasQuoteChanged(
  previousQuote: Quote | null | undefined,
  currentQuote: Quote | null | undefined
): boolean {
  if (!previousQuote || !currentQuote) {
    return false;
  }

  // If quote ID differs
  if (previousQuote.quoteId !== currentQuote.quoteId) {
    return true;
  }

  // If monetary totals differ (compare using shared/money without numbers)
  if (compare(parse(previousQuote.total), parse(currentQuote.total)) !== 0) {
    return true;
  }
  if (compare(parse(previousQuote.subtotal), parse(currentQuote.subtotal)) !== 0) {
    return true;
  }
  if (compare(parse(previousQuote.discount), parse(currentQuote.discount)) !== 0) {
    return true;
  }
  if (compare(parse(previousQuote.networkFee), parse(currentQuote.networkFee)) !== 0) {
    return true;
  }

  // Check if any items have priceChanged flag or different prices
  const prevItems = previousQuote.itemsAvailability ?? [];
  const currItems = currentQuote.itemsAvailability ?? [];

  if (prevItems.length !== currItems.length) {
    return true;
  }

  for (const currItem of currItems) {
    if (currItem.priceChanged) {
      return true;
    }
    const matchingPrev = prevItems.find(
      (p) => p.nftId === currItem.nftId && p.editionId === currItem.editionId
    );
    if (!matchingPrev) {
      return true;
    }
    if (compare(parse(matchingPrev.currentPrice), parse(currItem.currentPrice)) !== 0) {
      return true;
    }
  }

  return false;
}

export const CHECKOUT_DOMAIN_MODULE = '@nft/checkout-domain';
