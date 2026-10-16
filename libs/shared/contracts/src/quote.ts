import { z } from 'zod';
import { EthAmountSchema } from './common';

export const ItemAvailabilitySchema = z.object({
  nftId: z.string().min(1, 'ID do NFT é obrigatório'),
  editionId: z.string().min(1, 'ID da edição é obrigatório'),
  requestedQuantity: z.number().int('Quantidade solicitada deve ser inteira').positive(),
  availableQuantity: z.number().int('Quantidade disponível deve ser inteira').nonnegative(),
  isAvailable: z.boolean(),
  currentPrice: EthAmountSchema,
  priceChanged: z.boolean().default(false),
});

export type ItemAvailability = z.infer<typeof ItemAvailabilitySchema>;

export const QuoteCouponSchema = z.object({
  code: z.string().min(1, 'Código do cupom é obrigatório'),
  discountPercent: z.number().min(0).max(100).optional(),
  discountAmount: EthAmountSchema.optional(),
  isValid: z.boolean(),
  message: z.string().optional(),
});

export type QuoteCoupon = z.infer<typeof QuoteCouponSchema>;

export const QuoteSchema = z.object({
  quoteId: z.string().min(1, 'ID da cotação é obrigatório'),
  subtotal: EthAmountSchema,
  discount: EthAmountSchema,
  networkFee: EthAmountSchema,
  total: EthAmountSchema,
  coupon: QuoteCouponSchema.optional().nullable(),
  itemsAvailability: z.array(ItemAvailabilitySchema),
  isExpired: z.boolean().default(false),
  expiresAt: z.string(),
});

export type Quote = z.infer<typeof QuoteSchema>;

export const CreateQuoteInputSchema = z.object({
  items: z
    .array(
      z.object({
        nftId: z.string().min(1),
        editionId: z.string().min(1),
        quantity: z.number().int().positive(),
      })
    )
    .min(1, 'Carrinho não pode estar vazio para gerar cotação'),
  couponCode: z.string().optional().nullable(),
  walletAddress: z.string().optional().nullable(),
});

export type CreateQuoteInput = z.infer<typeof CreateQuoteInputSchema>;
