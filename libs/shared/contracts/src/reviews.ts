import { z } from 'zod';
import { PaginatedResponseSchema } from './common';

export const ReviewAuthorSchema = z.object({
  id: z.string().min(1, 'ID do autor é obrigatório'),
  name: z.string().min(1, 'Nome do autor é obrigatório'),
  avatarUrl: z.string().url().optional().nullable(),
});

export type ReviewAuthor = z.infer<typeof ReviewAuthorSchema>;

export const ReviewSchema = z.object({
  id: z.string().min(1, 'ID da avaliação é obrigatório'),
  nftId: z.string().optional(),
  author: z.union([z.string().min(1), ReviewAuthorSchema]),
  rating: z
    .number({
      required_error: 'Nota da avaliação é obrigatória',
      invalid_type_error: 'Nota da avaliação deve ser um número',
    })
    .int('Nota deve ser um número inteiro')
    .min(1, 'Nota deve ser no mínimo 1')
    .max(5, 'Nota deve ser no máximo 5'),
  comment: z.string().min(1, 'Comentário é obrigatório'),
  createdAt: z.string(),
});

export type Review = z.infer<typeof ReviewSchema>;

export const ReviewListQuerySchema = z.object({
  nftId: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().default(10),
});

export type ReviewListQuery = z.infer<typeof ReviewListQuerySchema>;

export const ReviewListResponseSchema = PaginatedResponseSchema(ReviewSchema);
export type ReviewListResponse = z.infer<typeof ReviewListResponseSchema>;
