import { describe, it, expect } from 'vitest';
import { ROUTES, ANCHORS, Link, createRouter, RouterProvider } from './index';

describe('shared-router constants', () => {
  it('should define canonical ROUTES paths matching the spec', () => {
    expect(ROUTES.HOME).toBe('/');
    expect(ROUTES.NFT_DETAILS).toBe('/nft/$nftId');
    expect(ROUTES.NFT_DETAIL).toBe('/nft/$nftId');
    expect(ROUTES.CART).toBe('/carrinho');
    expect(ROUTES.PAYMENT).toBe('/pagamento');
    expect(ROUTES.PROFILE).toBe('/perfil');
    expect(ROUTES.WALLETS).toBe('/carteiras');
    expect(ROUTES.LOGIN).toBe('/login');
    expect(ROUTES.REGISTER).toBe('/cadastro');
    expect(ROUTES.ORDER_CONFIRMATION).toBe('/pedido/$orderId');
  });

  it('should not contain legacy routes', () => {
    const routeValues = Object.values(ROUTES);
    expect(routeValues).not.toContain('/catalogo');
    expect(routeValues).not.toContain('/checkout');
    expect(routeValues).not.toContain('/pedidos/1/confirmacao');
  });

  it('should define standard ANCHORS', () => {
    expect(ANCHORS.MAIN_CONTENT).toBe('#main-content');
    expect(ANCHORS.SEARCH).toBe('/#busca');
  });

  it('should re-export TanStack Router core primitives', () => {
    expect(Link).toBeDefined();
    expect(createRouter).toBeDefined();
    expect(RouterProvider).toBeDefined();
  });
});
