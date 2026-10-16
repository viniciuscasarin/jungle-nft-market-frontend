import React from 'react';
import { OrderConfirmationFeaturePage } from '@nft/orders-feature';

export function ConfirmationPage() {
  return (
    <div data-testid="checkout-confirmation-page">
      <OrderConfirmationFeaturePage />
    </div>
  );
}

export default ConfirmationPage;
