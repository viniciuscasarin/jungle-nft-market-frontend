import { http, HttpResponse } from 'msw';
import { mockNfts, mockUsers } from '@nft/mocks-fixtures';

export const authHandlers = [
  http.get('/api/session', () => {
    return HttpResponse.json({ user: mockUsers[0] });
  }),
  http.post('/api/auth/login', () => {
    return HttpResponse.json({ token: 'mock-session-token', user: mockUsers[0] });
  }),
  http.post('/api/auth/logout', () => {
    return HttpResponse.json({ success: true });
  }),
];

export const catalogHandlers = [
  http.get('/api/nfts', () => {
    return HttpResponse.json({ items: mockNfts, total: mockNfts.length });
  }),
  http.get('/api/nfts/:id', ({ params }) => {
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
