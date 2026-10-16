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
