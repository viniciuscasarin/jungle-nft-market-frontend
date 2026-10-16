import { z } from 'zod';
import { EthAmountSchema, PaginatedResponseSchema } from './common';

export const NftRatingSchema = z.object({
  average: z.number().min(0, 'Nota média não pode ser negativa').max(5, 'Nota média não pode ser maior que 5'),
  count: z.number().int('Quantidade de avaliações deve ser inteira').nonnegative('Quantidade não pode ser negativa'),
});

export type NftRating = z.infer<typeof NftRatingSchema>;

export const NftEditionSchema = z.object({
  id: z.string().min(1, 'ID da edição é obrigatório'),
  editionNumber: z.number().int().positive('Número da edição deve ser positivo'),
  name: z.string().optional(),
  maxSupply: z.number().int().positive('Supply total deve ser positivo'),
  availableSupply: z.number().int().nonnegative('Supply disponível não pode ser negativo'),
  price: EthAmountSchema,
  version: z.number().int().nonnegative('Versão da edição deve ser um inteiro não negativo'),
});

export type NftEdition = z.infer<typeof NftEditionSchema>;

export const NftCreatorSchema = z.object({
  id: z.string().min(1, 'ID do criador é obrigatório'),
  name: z.string().min(1, 'Nome do criador é obrigatório'),
  avatarUrl: z.string().url().optional().nullable(),
  verified: z.boolean().default(false),
});

export type NftCreator = z.infer<typeof NftCreatorSchema>;

export const NftItemSchema = z.object({
  id: z.string().min(1, 'ID do NFT é obrigatório'),
  title: z.string().min(1, 'Título é obrigatório'),
  description: z.string().optional(),
  imageUrl: z.string().url('Imagem deve ser uma URL válida'),
  creator: NftCreatorSchema,
  category: z.string().optional(),
  tags: z.array(z.string()).default([]),
  price: EthAmountSchema,
  rating: NftRatingSchema,
  editions: z.array(NftEditionSchema).default([]),
  featured: z.boolean().default(false),
  version: z.number().int().nonnegative().default(1),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export type NftItem = z.infer<typeof NftItemSchema>;

export const NftSortOptionSchema = z.enum([
  'price-asc',
  'price-desc',
  'rating-desc',
  'created-desc',
  'popular-desc',
]);

export type NftSortOption = z.infer<typeof NftSortOptionSchema>;

export const NftListQuerySchema = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
  minPrice: EthAmountSchema.optional(),
  maxPrice: EthAmountSchema.optional(),
  sort: NftSortOptionSchema.default('popular-desc'),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().default(12),
});

export type NftListQuery = z.infer<typeof NftListQuerySchema>;

export const NftListResponseSchema = PaginatedResponseSchema(NftItemSchema);
export type NftListResponse = z.infer<typeof NftListResponseSchema>;
