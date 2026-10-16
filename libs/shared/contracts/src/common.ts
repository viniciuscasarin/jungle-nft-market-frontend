import { z } from 'zod';

export const EthAmountSchema = z
  .string({
    invalid_type_error: 'Valor em ETH deve ser uma string decimal, não number',
    required_error: 'Valor em ETH é obrigatório',
  })
  .regex(/^(?:0|[1-9]\d*)(?:\.\d+)?$/, 'Valor em ETH deve ser uma string decimal válida');

export const ImageUrlOrPathSchema = z
  .string()
  .min(1, 'Imagem deve ser uma URL válida')
  .refine(
    (value) => value.startsWith('/') || /^https?:\/\//i.test(value),
    'Imagem deve ser uma URL válida',
  );

export const PaginatedResponseSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.object({
    items: z.array(itemSchema),
    total: z.number().int().nonnegative(),
    page: z.number().int().positive(),
    pageSize: z.number().int().positive(),
    totalPages: z.number().int().nonnegative(),
  });

