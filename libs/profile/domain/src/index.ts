import { z } from 'zod';
import type { Profile, UpdateProfileInput } from '@nft/shared-contracts';

export const EnsDomainSchema = z.enum(['.eth', '.xyz']);
export type EnsDomain = z.infer<typeof EnsDomainSchema>;

export const ProfileFormSchema = z.object({
  displayName: z
    .string()
    .min(1, 'Nome de exibição é obrigatório')
    .max(80, 'Nome de exibição deve ter no máximo 80 caracteres'),
  username: z
    .string()
    .min(3, 'Nome de usuário deve ter pelo menos 3 caracteres')
    .max(30, 'Nome de usuário deve ter no máximo 30 caracteres')
    .regex(/^[a-zA-Z0-9_]+$/, 'Nome de usuário deve conter apenas letras, números e sublinhado (_)'),
  email: z
    .string()
    .min(1, 'E-mail é obrigatório')
    .email('E-mail informado é inválido'),
  ensName: z
    .string()
    .min(1, 'Nome ENS é obrigatório')
    .max(50, 'Nome ENS deve ter no máximo 50 caracteres')
    .refine((val) => !val.toLowerCase().endsWith('.eth') && !val.toLowerCase().endsWith('.xyz'), {
      message: 'Nome ENS não deve conter extensão (.eth ou .xyz)',
    }),
  ensDomain: EnsDomainSchema.default('.eth'),
  walletNickname: z
    .string()
    .min(1, 'Apelido da carteira é obrigatório')
    .max(50, 'Apelido da carteira deve ter no máximo 50 caracteres'),
  bio: z
    .string()
    .max(300, 'Bio deve ter no máximo 300 caracteres')
    .optional()
    .or(z.literal('')),
});

export type ProfileFormData = z.infer<typeof ProfileFormSchema>;

export const PasswordFormSchema = z
  .object({
    currentPassword: z.string().min(1, 'Senha atual é obrigatória'),
    newPassword: z
      .string()
      .min(8, 'Nova senha deve ter no mínimo 8 caracteres')
      .regex(/[a-zA-Z]/, 'Nova senha deve conter pelo menos uma letra')
      .regex(/[0-9]/, 'Nova senha deve conter pelo menos um número'),
    confirmPassword: z.string().min(1, 'Confirmação de senha é obrigatória'),
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: 'A nova senha deve ser diferente da senha atual',
    path: ['newPassword'],
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'A confirmação de senha não confere',
    path: ['confirmPassword'],
  });

export type PasswordFormData = z.infer<typeof PasswordFormSchema>;

export function profileToFormData(profile?: Partial<Profile> | null): ProfileFormData {
  return {
    displayName: profile?.displayName ?? '',
    username: profile?.username ?? '',
    email: profile?.email ?? '',
    ensName: profile?.ensName ?? '',
    ensDomain: '.eth',
    walletNickname: profile?.walletNickname ?? 'Carteira Principal',
    bio: profile?.bio ?? '',
  };
}

export function formDataToUpdateInput(data: ProfileFormData): UpdateProfileInput {
  return {
    displayName: data.displayName.trim(),
    username: data.username.trim(),
    email: data.email.trim(),
    ensName: data.ensName.trim() || null,
    walletNickname: data.walletNickname.trim() || null,
    bio: data.bio?.trim() || null,
  };
}
