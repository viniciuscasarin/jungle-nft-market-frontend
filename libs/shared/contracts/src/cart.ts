import { z } from 'zod';
import { EthAmountSchema, ImageUrlOrPathSchema } from './common';

export const CartItemSchema = z.object({
  id: z.string().min(1, 'ID do item é obrigatório'),
  nftId: z.string().min(1, 'ID do NFT é obrigatório'),
  editionId: z.string().min(1, 'ID da edição é obrigatório'),
  title: z.string().min(1, 'Título é obrigatório'),
  editionNumber: z.number().int().positive().optional(),
  imageUrl: ImageUrlOrPathSchema,
  unitPrice: EthAmountSchema,
  quantity: z
    .number({
      required_error: 'Quantidade é obrigatória',
      invalid_type_error: 'Quantidade deve ser um número',
    })
    .int('Quantidade deve ser um número inteiro')
    .positive('Quantidade deve ser maior que zero'),
  maxAvailable: z.number().int().nonnegative().optional(),
});

export type CartItem = z.infer<typeof CartItemSchema>;

export const AddToCartInputSchema = z.object({
  nftId: z.string().min(1, 'ID do NFT é obrigatório'),
  editionId: z.string().min(1, 'ID da edição é obrigatório'),
  quantity: z
    .number({
      required_error: 'Quantidade é obrigatória',
      invalid_type_error: 'Quantidade deve ser um número',
    })
    .int('Quantidade deve ser um número inteiro')
    .positive('Quantidade deve ser maior que zero'),
});

export type AddToCartInput = z.infer<typeof AddToCartInputSchema>;

export const UpdateCartItemInputSchema = z.object({
  quantity: z
    .number({
      required_error: 'Quantidade é obrigatória',
      invalid_type_error: 'Quantidade deve ser um número',
    })
    .int('Quantidade deve ser um número inteiro')
    .positive('Quantidade deve ser maior que zero'),
});

export type UpdateCartItemInput = z.infer<typeof UpdateCartItemInputSchema>;

export const CartSchema = z.object({
  id: z.string().min(1, 'ID do carrinho é obrigatório'),
  userId: z.string().optional().nullable(),
  sessionId: z.string().optional().nullable(),
  items: z.array(CartItemSchema).default([]),
  couponCode: z.string().optional().nullable(),
  updatedAt: z.string().optional(),
});

export type Cart = z.infer<typeof CartSchema>;
