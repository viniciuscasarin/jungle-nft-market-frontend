import { http, HttpResponse } from 'msw';
import { mockNfts } from '@nft/mocks-fixtures';

import { authHandlers } from './auth';

export { authHandlers };

export const catalogHandlers = [
  http.get('/api/nfts', () => {
    return HttpResponse.json({ items: mockNfts, total: mockNfts.length });
  }),
  http.get('/api/nfts/:id', ({ params }: { params: Record<string, string | readonly string[] | undefined> }) => {
    const nft = mockNfts.find((item: { id: string }) => item.id === params['id']);
    if (!nft) {
      return new HttpResponse(null, { status: 404 });
    }
    return HttpResponse.json(nft);
  }),
];

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
];

export const handlers = [
  ...authHandlers,
  ...catalogHandlers,
  ...cartHandlers,
  ...checkoutHandlers,
];
