import { authHandlers } from './auth';
import { profileHandlers } from './profile';
import { walletsHandlers } from './wallets';
import { catalogHandlers } from './catalog';
import { orderHandlers } from './orders';
import { cartHandlers } from './cart';

export {
  authHandlers,
  profileHandlers,
  walletsHandlers,
  catalogHandlers,
  orderHandlers,
  cartHandlers,
};

export const checkoutHandlers = orderHandlers;

export const handlers = [
  ...authHandlers,
  ...profileHandlers,
  ...walletsHandlers,
  ...catalogHandlers,
  ...cartHandlers,
  ...checkoutHandlers,
];
