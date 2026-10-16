import { z } from 'zod';
import { UserSchema } from './auth';

export const ProfileSchema = UserSchema;
export type Profile = z.infer<typeof ProfileSchema>;

export const UpdateProfileInputSchema = z.object({
  displayName: z.string().min(1, 'Nome de exibição é obrigatório').optional(),
  bio: z.string().max(300, 'Bio deve ter no máximo 300 caracteres').optional().nullable(),
  avatarUrl: z.string().url('Avatar deve ser uma URL válida').optional().nullable(),
});

export type UpdateProfileInput = z.infer<typeof UpdateProfileInputSchema>;

export const ChangePasswordInputSchema = z
  .object({
    currentPassword: z.string().min(1, 'Senha atual é obrigatória'),
    newPassword: z.string().min(8, 'Nova senha deve ter no mínimo 8 caracteres'),
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: 'A nova senha deve ser diferente da senha atual',
    path: ['newPassword'],
  });

export type ChangePasswordInput = z.infer<typeof ChangePasswordInputSchema>;
