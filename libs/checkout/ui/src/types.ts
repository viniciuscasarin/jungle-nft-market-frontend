export interface CheckoutNftItem {
  id: string;
  name: string;
  tokenId: string;
  imageUrl: string;
  quantity: number;
  subtotalEth: string;
}

export interface ConnectedWallet {
  id: string;
  label: string; // 'Reserva', 'Principal'
  addressOrEns: string; // 'nova.kurio.eth', '0xA91F...E82C'
  network: string; // 'Rede Polygon', 'Rede principal Ethereum'
  isDefault?: boolean;
}

export type WalletProviderOption = 'metamask-bundle' | 'metamask' | 'coinbase' | 'walletconnect';

export interface CollectorProfileData {
  displayName: string;
  username: string;
  network: string;
  profileName: string;
  walletAddress: string;
  secondaryWallet?: string;
  walletType: string;
  referralCode: string;
  email: string;
  ensName: string;
  useAnotherWallet: boolean;
  collectorNote?: string;
}

export interface OrderConfirmationItem {
  id: string;
  name: string;
  tokenId: string;
  imageUrl: string;
  quantity: number;
  subtotalEth: string;
}

export interface OrderConfirmationData {
  transactionId: string;
  date: string;
  totalEth: string;
  walletName: string;
  items: OrderConfirmationItem[];
  networkFeeEth: string;
  networkName?: string;
  etherscanUrl?: string;
}

