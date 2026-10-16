import { z } from 'zod';
import { UserSchema } from './auth';
import { EnsNameSchema } from './wallets';

export const ProfileSchema = UserSchema.extend({
  ensName: EnsNameSchema.optional().nullable(),
  walletNickname: z
    .string()
    .max(50, 'Apelido da carteira deve ter no máximo 50 caracteres')
    .optional()
    .nullable(),
});
export type Profile = z.infer<typeof ProfileSchema>;

export const UpdateProfileInputSchema = z.object({
  displayName: z.string().min(1, 'Nome de exibição é obrigatório').optional(),
  username: z
    .string()
    .min(3, 'Username deve ter pelo menos 3 caracteres')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username deve conter apenas letras, números e underscore')
    .optional(),
  email: z.string().email('Email inválido').optional(),
  ensName: EnsNameSchema.optional().nullable(),
  walletNickname: z
    .string()
    .max(50, 'Apelido da carteira deve ter no máximo 50 caracteres')
    .optional()
    .nullable(),
  bio: z.string().max(300, 'Bio deve ter no máximo 300 caracteres').optional().nullable(),
  avatarUrl: z.string().url('Avatar deve ser uma URL válida').optional().nullable(),
});

export type UpdateProfileInput = z.infer<typeof UpdateProfileInputSchema>;

export const UploadAvatarInputSchema = z.object({
  avatarUrl: z.string().url('Avatar deve ser uma URL válida'),
});

export type UploadAvatarInput = z.infer<typeof UploadAvatarInputSchema>;

export const ChangePasswordInputSchema = z
  .object({
    currentPassword: z.string().min(1, 'Senha atual é obrigatória'),
    newPassword: z.string().min(8, 'Nova senha deve ter no mínimo 8 caracteres'),
    confirmPassword: z.string().min(1, 'Confirmação de senha é obrigatória').optional(),
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: 'A nova senha deve ser diferente da senha atual',
    path: ['newPassword'],
  })
  .refine(
    (data) => data.confirmPassword === undefined || data.newPassword === data.confirmPassword,
    {
      message: 'A confirmação de senha não confere',
      path: ['confirmPassword'],
    }
  );

export type ChangePasswordInput = z.infer<typeof ChangePasswordInputSchema>;

