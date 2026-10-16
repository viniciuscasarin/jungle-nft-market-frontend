import { http, HttpResponse } from 'msw';
import { authHandlers } from './auth';
import { profileHandlers } from './profile';
import { walletsHandlers } from './wallets';
import { catalogHandlers } from './catalog';
import { orderHandlers } from './orders';

export { authHandlers, profileHandlers, walletsHandlers, catalogHandlers, orderHandlers };

export const cartHandlers = [
  http.get('/api/cart', () => {
    return HttpResponse.json({ items: [], subtotalEth: '0', totalEth: '0' });
  }),
];

export const checkoutHandlers = orderHandlers;

export const handlers = [
  ...authHandlers,
  ...profileHandlers,
  ...walletsHandlers,
  ...catalogHandlers,
  ...cartHandlers,
  ...checkoutHandlers,
];
