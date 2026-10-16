import { z } from 'zod';
import {
  CatalogNetworkArrayParamSchema,
  CatalogStringArrayParamSchema,
  NftSortOptionSchema,
  NftTabSchema,
} from './catalog';
import { EthAmountSchema } from './common';

export const CatalogSearchParamsSchema = z.object({
  q: z.string().optional().catch(undefined),
  search: z.string().optional().catch(undefined),
  category: z.string().optional().catch(undefined),
  collections: CatalogStringArrayParamSchema.catch(undefined),
  networks: CatalogNetworkArrayParamSchema.catch(undefined),
  minPrice: EthAmountSchema.optional().catch(undefined),
  maxPrice: EthAmountSchema.optional().catch(undefined),
  tab: NftTabSchema.catch('all'),
  sort: NftSortOptionSchema.catch('popular-desc'),
  page: z.coerce.number().int().positive().catch(1),
  pageSize: z.coerce.number().int().positive().catch(9),
});

export type CatalogSearchParams = z.infer<typeof CatalogSearchParamsSchema>;

export function parseCatalogSearchParams(raw: unknown): CatalogSearchParams {
  const result = CatalogSearchParamsSchema.safeParse(raw ?? {});
  if (result.success) {
    return result.data;
  }
  return {
    tab: 'all',
    sort: 'popular-desc',
    page: 1,
    pageSize: 9,
  };
}

export const CartSearchParamsSchema = z.object({
  coupon: z.string().optional().catch(undefined),
  highlight: z.string().optional().catch(undefined),
});

export type CartSearchParams = z.infer<typeof CartSearchParamsSchema>;

export function parseCartSearchParams(raw: unknown): CartSearchParams {
  const result = CartSearchParamsSchema.safeParse(raw ?? {});
  if (result.success) {
    return result.data;
  }
  return {};
}

export const CheckoutStepSchema = z.enum(['review', 'payment', 'confirm']);
export type CheckoutStep = z.infer<typeof CheckoutStepSchema>;

export const CheckoutSearchParamsSchema = z.object({
  step: CheckoutStepSchema.catch('review'),
  quoteId: z.string().optional().catch(undefined),
  orderId: z.string().optional().catch(undefined),
});

export type CheckoutSearchParams = z.infer<typeof CheckoutSearchParamsSchema>;

export function parseCheckoutSearchParams(raw: unknown): CheckoutSearchParams {
  const result = CheckoutSearchParamsSchema.safeParse(raw ?? {});
  if (result.success) {
    return result.data;
  }
  return {
    step: 'review',
  };
}
