import { HttpResponse } from 'msw';
import {
  AddToCartInputSchema,
  UpdateCartItemInputSchema,
  CartCouponInputSchema,
  ApiErrorCode,
  type Cart,
} from '@nft/shared-contracts';
import {
  defineHandler,
  apiError,
  parseBody,
  requireSession,
  getMockDatabase,
  getClock,
  transaction,
} from '@nft/mocks-core';

type CartOwner = Pick<Cart, 'userId' | 'sessionId'>;

function resolveCartOwner(request: Request): CartOwner | Response {
  // A rejected token must never fall back to a guest cart.
  if (request.headers.has('authorization')) {
    const { session, response } = requireSession(request);
    return session
      ? { userId: session.user.id, sessionId: null }
      : (response ?? apiError(ApiErrorCode.UNAUTHENTICATED));
  }
  const sessionId = request.headers.get('x-session-id')?.trim();
  return sessionId ? { userId: null, sessionId } : apiError(ApiErrorCode.UNAUTHENTICATED);
}

function belongsToOwner(cart: Cart, owner: CartOwner): boolean {
  return owner.userId
    ? cart.userId === owner.userId
    : !cart.userId && cart.sessionId === owner.sessionId;
}

function emptyCart(owner: CartOwner): Cart {
  return {
    id: owner.userId ? `cart_${owner.userId}` : `cart_guest_${owner.sessionId}`,
    ...owner,
    items: [],
    couponCode: null,
    updatedAt: getClock().toISOString(),
  };
}

const getCart = defineHandler('GET', '/cart', ({ request }) => {
  const owner = resolveCartOwner(request);
  if (owner instanceof Response) return owner;
  const cart = getMockDatabase().carts.find(candidate => belongsToOwner(candidate, owner));
  return HttpResponse.json(cart ?? emptyCart(owner));
});

const addToCart = defineHandler('POST', '/cart/items', async ({ request }) => {
  const owner = resolveCartOwner(request);
  if (owner instanceof Response) return owner;
  const result = await parseBody(request, AddToCartInputSchema);
  if (!result.success) return result.response;
  const input = result.data;
  const db = getMockDatabase();
  const nft = db.nfts.find(candidate => candidate.id === input.nftId);
  const edition = nft?.editions.find(candidate => candidate.id === input.editionId);
  if (!nft || !edition) return apiError(ApiErrorCode.NOT_FOUND);
  if (input.quantity > edition.availableSupply) {
    return apiError(ApiErrorCode.AVAILABILITY_CONFLICT, { message: 'Estoque insuficiente.' });
  }

  return transaction(state => {
    let cart = state.carts.find(candidate => belongsToOwner(candidate, owner));
    if (!cart) {
      cart = emptyCart(owner);
      state.carts.push(cart);
    }
    const existing = cart.items.find(
      item => item.nftId === input.nftId && item.editionId === input.editionId,
    );
    if (existing) {
      existing.quantity = Math.min(existing.quantity + input.quantity, edition.availableSupply);
      existing.maxAvailable = edition.availableSupply;
    } else {
      cart.items.push({
        id: `item_${cart.id}_${input.nftId}_${input.editionId}`,
        nftId: nft.id,
        editionId: edition.id,
        title: nft.title,
        editionNumber: edition.editionNumber,
        imageUrl: nft.imageUrl,
        unitPrice: edition.price,
        quantity: input.quantity,
        maxAvailable: edition.availableSupply,
      });
    }
    cart.updatedAt = getClock().toISOString();
    return HttpResponse.json(cart);
  });
});

const updateCartItem = defineHandler('PUT', '/cart/items/:itemId', async ({ request, params }) => {
  const owner = resolveCartOwner(request);
  if (owner instanceof Response) return owner;
  const result = await parseBody(request, UpdateCartItemInputSchema);
  if (!result.success) return result.response;
  const cart = getMockDatabase().carts.find(candidate => belongsToOwner(candidate, owner));
  const item = cart?.items.find(candidate => candidate.id === params['itemId']);
  if (!cart || !item) return apiError(ApiErrorCode.NOT_FOUND);
  // Revalidate against current stock, which may have changed since the item was added.
  const nft = getMockDatabase().nfts.find(candidate => candidate.id === item.nftId);
  const edition = nft?.editions.find(candidate => candidate.id === item.editionId);
  if (!edition) return apiError(ApiErrorCode.NOT_FOUND);
  if (result.data.quantity > edition.availableSupply) {
    return apiError(ApiErrorCode.AVAILABILITY_CONFLICT, { message: 'Estoque insuficiente.' });
  }
  return transaction(() => {
    item.quantity = result.data.quantity;
    item.maxAvailable = edition.availableSupply;
    cart.updatedAt = getClock().toISOString();
    return HttpResponse.json(cart);
  });
});

const removeCartItem = defineHandler('DELETE', '/cart/items/:itemId', ({ request, params }) => {
  const owner = resolveCartOwner(request);
  if (owner instanceof Response) return owner;
  const cart = getMockDatabase().carts.find(candidate => belongsToOwner(candidate, owner));
  const index = cart?.items.findIndex(item => item.id === params['itemId']) ?? -1;
  if (!cart || index === -1) return apiError(ApiErrorCode.NOT_FOUND);
  return transaction(() => {
    cart.items.splice(index, 1);
    cart.updatedAt = getClock().toISOString();
    return HttpResponse.json(cart);
  });
});

const clearCart = defineHandler('DELETE', '/cart', ({ request }) => {
  const owner = resolveCartOwner(request);
  if (owner instanceof Response) return owner;
  const cart = getMockDatabase().carts.find(candidate => belongsToOwner(candidate, owner));
  if (!cart) return HttpResponse.json(emptyCart(owner));
  return transaction(() => {
    cart.items = [];
    cart.updatedAt = getClock().toISOString();
    return HttpResponse.json(cart);
  });
});

const updateCoupon = defineHandler('PUT', '/cart/coupon', async ({ request }) => {
  const owner = resolveCartOwner(request);
  if (owner instanceof Response) return owner;
  const result = await parseBody(request, CartCouponInputSchema);
  if (!result.success) return result.response;
  const cart = getMockDatabase().carts.find(candidate => belongsToOwner(candidate, owner));
  if (!cart) return apiError(ApiErrorCode.NOT_FOUND);
  const code = result.data.couponCode?.toUpperCase() ?? null;
  const coupon = getMockDatabase().coupons.find(candidate => candidate.code === code);
  if (code && (!coupon?.isValid || Date.parse(coupon.expiresAt) <= getClock().nowMs())) {
    return apiError(ApiErrorCode.VALIDATION_ERROR, {
      message: coupon?.message ?? 'Cupom inválido ou expirado.',
      fieldErrors: { couponCode: coupon?.message ?? 'Cupom inválido ou expirado.' },
    });
  }
  return transaction(() => {
    cart.couponCode = code;
    cart.updatedAt = getClock().toISOString();
    return HttpResponse.json(cart);
  });
});

export const cartHandlers = [getCart, addToCart, updateCartItem, removeCartItem, clearCart, updateCoupon];
