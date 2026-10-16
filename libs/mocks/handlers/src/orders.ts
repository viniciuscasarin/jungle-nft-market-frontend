import { http, HttpResponse } from 'msw';
import {
  type Order,
  type OrderItem,
  type OrderReceiptSnapshot,
  type Quote,
  type ItemAvailability,
  type CreateQuoteInput,
  type CreateOrderInput,
  CreateQuoteInputSchema,
  CreateOrderInputSchema,
  ApiErrorCode,
} from '@nft/shared-contracts';
import {
  parse,
  add,
  sub,
  mul,
  sum,
  percent,
  compare,
  ZERO_ETH,
} from '@nft/shared-money';
import {
  apiPath,
  apiError,
  parseBody,
  requireSession,
  getMockDatabase,
  transaction,
  getClock,
  getPrng,
  defineHandler,
  emitOrderUpdated,
} from '@nft/mocks-core';

function arePayloadsEqual(a: CreateOrderInput, b: CreateOrderInput): boolean {
  if (a.quoteId !== b.quoteId) {
    return false;
  }
  const colA = a.collector;
  const colB = b.collector;
  if (
    colA.fullName !== colB.fullName ||
    colA.email !== colB.email ||
    colA.walletAddress.toLowerCase() !== colB.walletAddress.toLowerCase() ||
    colA.walletType !== colB.walletType ||
    colA.network !== colB.network ||
    (colA.ensName ?? '') !== (colB.ensName ?? '') ||
    Boolean(colA.useSecondaryWallet) !== Boolean(colB.useSecondaryWallet)
  ) {
    return false;
  }
  if (colA.useSecondaryWallet) {
    if (
      colA.secondaryWallet?.address.toLowerCase() !==
      colB.secondaryWallet?.address.toLowerCase()
    ) {
      return false;
    }
    if (colA.secondaryWallet?.network !== colB.secondaryWallet?.network) {
      return false;
    }
  }
  return true;
}

const NETWORK_FEE = '0.0050';

// In-memory cache for quotes generated during user session
const generatedQuotes = new Map<string, Quote>();

export function getGeneratedQuotes(): Map<string, Quote> {
  return generatedQuotes;
}

export function clearGeneratedQuotes(): void {
  generatedQuotes.clear();
}

/**
 * Builds authoritative Quote from items and optional coupon.
 * Calculation is done strictly via @nft/shared-money.
 */
export function calculateQuote(
  db = getMockDatabase(),
  input: CreateQuoteInput
): { quote: Quote | null; conflictError?: Response } {
  const itemsAvailability: ItemAvailability[] = [];
  const itemPrices: string[] = [];

  for (const requestedItem of input.items) {
    const nft = db.nfts.find((n) => n.id === requestedItem.nftId);
    if (!nft) {
      return {
        quote: null,
        conflictError: apiError(ApiErrorCode.NOT_FOUND, {
          message: `NFT ${requestedItem.nftId} não encontrado.`,
          status: 404,
        }),
      };
    }

    const edition = nft.editions.find((e) => e.id === requestedItem.editionId);
    if (!edition) {
      return {
        quote: null,
        conflictError: apiError(ApiErrorCode.NOT_FOUND, {
          message: `Edição ${requestedItem.editionId} não encontrada.`,
          status: 404,
        }),
      };
    }

    const isAvailable = edition.availableSupply >= requestedItem.quantity;
    itemsAvailability.push({
      nftId: nft.id,
      editionId: edition.id,
      requestedQuantity: requestedItem.quantity,
      availableQuantity: edition.availableSupply,
      isAvailable,
      currentPrice: edition.price,
      lineSubtotal: mul(parse(edition.price), requestedItem.quantity).toString(),
      priceChanged: false,
    });

    // Subtotal for this line: edition.price * quantity
    const lineTotal = mul(parse(edition.price), requestedItem.quantity);
    itemPrices.push(lineTotal.toString());
  }

  // Calculate subtotal
  const subtotalEth = sum(itemPrices.map((p) => parse(p)));

  // Coupon handling
  let discountEth = ZERO_ETH;
  let couponData = null;

  if (input.couponCode) {
    const coupon = db.coupons.find((c) => c.code.toUpperCase() === input.couponCode?.toUpperCase());
    if (coupon && coupon.isValid) {
      if (coupon.type === 'percentage' && coupon.discountPercent) {
        discountEth = percent(subtotalEth, coupon.discountPercent);
      } else if (coupon.type === 'fixed' && coupon.discountAmount) {
        discountEth = parse(coupon.discountAmount);
      }
      couponData = {
        code: coupon.code,
        discountPercent: coupon.discountPercent,
        discountAmount: discountEth.toString(),
        isValid: true,
        message: coupon.message,
      };
    } else {
      couponData = {
        code: input.couponCode,
        isValid: false,
        message: coupon?.message ?? 'Cupom inválido ou expirado.',
      };
    }
  }

  const networkFeeEth = parse(NETWORK_FEE);
  const totalEth = add(sub(subtotalEth, discountEth), networkFeeEth);

  const clock = getClock();
  const quoteId = `quote_${getPrng().uuid()}`;
  const expiresAt = new Date(clock.nowMs() + 1000 * 60 * 30).toISOString();

  const quote: Quote = {
    quoteId,
    subtotal: subtotalEth.toString(),
    discount: discountEth.toString(),
    networkFee: networkFeeEth.toString(),
    total: totalEth.toString(),
    coupon: couponData,
    itemsAvailability,
    isExpired: false,
    expiresAt,
  };

  generatedQuotes.set(quoteId, quote);
  return { quote };
}

export const orderHandlers = [
  // 1. POST /api/checkout/quote
  defineHandler('POST', '/checkout/quote', async ({ request }) => {
    const parseResult = await parseBody(request, CreateQuoteInputSchema);
    if (!parseResult.success) {
      return parseResult.response;
    }

    const db = getMockDatabase();
    const { quote, conflictError } = calculateQuote(db, parseResult.data);
    if (conflictError) {
      return conflictError;
    }

    return HttpResponse.json(quote);
  }),

  // 2. GET /api/checkout/quote/:quoteId
  http.get(apiPath('/checkout/quote/:quoteId'), ({ params }) => {
    const quoteId = params['quoteId'] as string;
    const quote = generatedQuotes.get(quoteId);

    if (quote) {
      return HttpResponse.json(quote);
    }

    // Default fallback quote for initial testing/fixtures
    const fallbackQuote: Quote = {
      quoteId,
      subtotal: '2.5000',
      discount: '0.0000',
      networkFee: '0.0050',
      total: '2.5050',
      coupon: null,
      itemsAvailability: [
        {
          nftId: 'nft-01',
          editionId: 'ed-01',
          requestedQuantity: 1,
          availableQuantity: 5,
          isAvailable: true,
          currentPrice: '2.5000',
          priceChanged: false,
        },
      ],
      isExpired: false,
      expiresAt: '2026-12-31T23:59:59.000Z',
    };

    generatedQuotes.set(quoteId, fallbackQuote);
    return HttpResponse.json(fallbackQuote);
  }),

  // 3. POST /api/orders
  defineHandler('POST', '/orders', async ({ request }) => {
    // A. Require session
    const { session, response: sessionError } = requireSession(request);
    if (sessionError || !session) {
      return sessionError ?? apiError(ApiErrorCode.UNAUTHENTICATED);
    }
    const userId = session.user.id;

    // B. Validate Idempotency-Key header
    const idempotencyKey =
      request.headers.get('idempotency-key') ??
      request.headers.get('Idempotency-Key');

    if (!idempotencyKey || idempotencyKey.trim() === '') {
      return apiError(ApiErrorCode.VALIDATION_ERROR, {
        message: 'O cabeçalho Idempotency-Key é obrigatório.',
        status: 400,
      });
    }

    // C. Validate body
    const bodyResult = await parseBody(request, CreateOrderInputSchema);
    if (!bodyResult.success) {
      return bodyResult.response;
    }
    const orderInput = bodyResult.data;

    const db = getMockDatabase();

    // D. Check for existing order with identical idempotencyKey
    const existingOrder = db.orders.find((o) => o.idempotencyKey === idempotencyKey);
    if (existingOrder) {
      if (existingOrder.userId !== userId) return apiError(ApiErrorCode.FORBIDDEN);
      // Compare payloads
      const existingInput = {
        quoteId: existingOrder.quoteId,
        collector: existingOrder.collector,
      };

      if (!arePayloadsEqual(orderInput, existingInput)) {
        return apiError(ApiErrorCode.IDEMPOTENCY_CONFLICT, {
          message: 'Uma tentativa com a mesma Idempotency-Key já foi enviada com parâmetros diferentes.',
          status: 409,
        });
      }

      // Re-return identical order without re-processing or re-debiting
      return HttpResponse.json(existingOrder);
    }

    // E. Retrieve Quote and revalidate
    const quote = generatedQuotes.get(orderInput.quoteId);
    if (!quote) {
      return apiError(ApiErrorCode.NOT_FOUND, {
        message: 'Cotação não encontrada ou expirada.',
        status: 404,
      });
    }
    if (quote.isExpired || Date.parse(quote.expiresAt) <= getClock().nowMs()) {
      return apiError(ApiErrorCode.PRICE_CHANGED, {
        message: 'Cotação expirada. Revise uma nova cotação antes de confirmar.', status: 409,
      });
    }

    // Check availability & price changes in DB
    const orderItems: OrderItem[] = [];

    for (const itemAvail of quote.itemsAvailability) {
      const nft = db.nfts.find((n) => n.id === itemAvail.nftId);
      const edition = nft?.editions.find((e) => e.id === itemAvail.editionId);

      if (!nft || !edition) {
        return apiError(ApiErrorCode.NOT_FOUND, {
          message: `NFT ou edição ${itemAvail.nftId} não encontrado.`,
          status: 404,
        });
      }

      // Check stock availability
      if (edition.availableSupply < itemAvail.requestedQuantity) {
        return apiError(ApiErrorCode.AVAILABILITY_CONFLICT, {
          message: `Quantidade solicitada de "${nft.title}" não está mais disponível.`,
          status: 409,
        });
      }

      // Check price change
      if (compare(parse(edition.price), parse(itemAvail.currentPrice)) !== 0) {
        return apiError(ApiErrorCode.PRICE_CHANGED, {
          message: `O preço de "${nft.title}" foi alterado de ${itemAvail.currentPrice} ETH para ${edition.price} ETH.`,
          status: 409,
        });
      }

      const itemSubtotal = mul(parse(edition.price), itemAvail.requestedQuantity);
      orderItems.push({
        nftId: nft.id,
        editionId: edition.id,
        editionNumber: edition.editionNumber,
        title: nft.title,
        imageUrl: nft.imageUrl,
        unitPrice: edition.price,
        quantity: itemAvail.requestedQuantity,
        subtotal: itemSubtotal.toString(),
      });
    }

    // F. Execute order creation inside transaction
    const clock = getClock();
    const timestamp = clock.toISOString();
    const orderId = `order_${getPrng().uuid()}`;

    // Check scenario outcome: if scenario is 'payment-rejected'
    const isPaymentRejected = db.scenarioId === 'payment-rejected';
    const status = isPaymentRejected ? 'rejected' : 'confirmed';

    const resultOrder = transaction((txDb): Order => {
      let receipt: OrderReceiptSnapshot | null = null;

      if (status === 'confirmed') {
        // 1. Debit stock
        for (const item of orderItems) {
          const targetNft = txDb.nfts.find((n) => n.id === item.nftId);
          const targetEd = targetNft?.editions.find((e) => e.id === item.editionId);
          if (targetEd) {
            targetEd.availableSupply = Math.max(0, targetEd.availableSupply - item.quantity);
          }
        }

        // 2. Clear purchased items from user's cart
        const userCart = txDb.carts.find((c) => c.userId === userId);
        if (userCart) {
          userCart.items = userCart.items.flatMap((cartItem) => {
            const purchased = orderItems.find(
              (oi) => oi.nftId === cartItem.nftId && oi.editionId === cartItem.editionId
            );
            if (!purchased) return [cartItem];
            const quantity = cartItem.quantity - purchased.quantity;
            return quantity > 0 ? [{ ...cartItem, quantity }] : [];
          });
          if (userCart.items.length === 0) {
            userCart.couponCode = null;
          }
          userCart.updatedAt = timestamp;
        }

        // 3. Create immutable snapshot receipt
        receipt = {
          orderId,
          transactionHash: `0x${orderId.replace(/[^a-fA-F0-9]/g, 'a').padEnd(64, '0').slice(0, 64)}`,
          collector: orderInput.collector,
          items: orderItems,
          quoteId: quote.quoteId,
          subtotal: quote.subtotal,
          discount: quote.discount,
          networkFee: quote.networkFee,
          total: quote.total,
          confirmedAt: timestamp,
          blockNumber: 19842000,
        };
      }

      const createdOrder: Order = {
        id: orderId,
        userId,
        quoteId: quote.quoteId,
        idempotencyKey,
        status,
        collector: orderInput.collector,
        items: orderItems,
        subtotal: quote.subtotal,
        discount: quote.discount,
        networkFee: quote.networkFee,
        total: quote.total,
        receipt,
        rejectionReason: isPaymentRejected
          ? 'Pagamento recusado pela rede simulada ou saldo insuficiente.'
          : null,
        createdAt: timestamp,
        updatedAt: timestamp,
      };

      txDb.orders.push(createdOrder);
      return createdOrder;
    });

    // G. Emit order.updated realtime event if socket infrastructure connected
    try {
      emitOrderUpdated({
        orderId: resultOrder.id,
        userId,
        status: resultOrder.status,
        transactionHash: resultOrder.receipt?.transactionHash,
        rejectionReason: resultOrder.rejectionReason ?? undefined,
        confirmedAt: resultOrder.receipt?.confirmedAt,
      });
    } catch {
      // Ignore if event bus not listening in specific test environments
    }

    return HttpResponse.json(resultOrder, { status: 201 });
  }),

  // 4. GET /api/orders/:orderId
  http.get(apiPath('/orders/:orderId'), ({ request, params }) => {
    const { session, response: sessionError } = requireSession(request);
    if (sessionError || !session) {
      return sessionError ?? apiError(ApiErrorCode.UNAUTHENTICATED);
    }

    const orderId = params['orderId'] as string;
    const db = getMockDatabase();
    const order = db.orders.find((o) => o.id === orderId);

    if (!order) {
      return apiError(ApiErrorCode.NOT_FOUND, {
        message: 'Pedido não encontrado.',
        status: 404,
      });
    }

    // Isolate by user
    if (order.userId !== session.user.id) {
      return apiError(ApiErrorCode.FORBIDDEN, {
        message: 'Você não tem permissão para visualizar este pedido.',
        status: 403,
      });
    }

    return HttpResponse.json(order);
  }),
];
