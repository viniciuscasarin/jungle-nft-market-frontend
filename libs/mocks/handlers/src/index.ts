import { http, HttpResponse } from 'msw';
import { getMockDatabase } from '@nft/mocks-core';

import { authHandlers } from './auth';
import { profileHandlers } from './profile';
import { walletsHandlers } from './wallets';
import { catalogHandlers } from './catalog';

export { authHandlers, profileHandlers, walletsHandlers, catalogHandlers };

export const cartHandlers = [
  http.get('/api/cart', () => {
    return HttpResponse.json({ items: [], subtotalEth: '0', totalEth: '0' });
  }),
];

export const checkoutHandlers = [
  http.post('/api/checkout/quote', () => {
    return HttpResponse.json({
      subtotalEth: '0.45',
      discountEth: '0',
      networkFeeEth: '0.005',
      totalEth: '0.455',
    });
  }),
  http.post('/api/orders', () => {
    return HttpResponse.json({
      orderId: 'order_123',
      status: 'confirmed',
    });
  }),
  http.get('/api/orders/:id', ({ params }: { params: Record<string, string | readonly string[] | undefined> }) => {
    const { orders } = getMockDatabase();
    const order = orders.find((o) => o.id === params['id']);
    if (!order) {
      return new HttpResponse(null, { status: 404 });
    }
    return HttpResponse.json(order);
  }),
];

export const handlers = [
  ...authHandlers,
  ...profileHandlers,
  ...walletsHandlers,
  ...catalogHandlers,
  ...cartHandlers,
  ...checkoutHandlers,
];

