export interface CartItem {
  id: string;
  name: string;
  tokenId: string;
  imageUrl: string;
  priceEth: string;
  quantity: number;
  maxQuantity: number;
  edition: string;
}

export interface CartOrderSummary {
  subtotalEth: string;
  discountEth: string;
  networkFeeEth: string;
  totalEth: string;
  appliedCoupon?: string | null;
}
