import { z } from 'zod';

export const UserSchema = z.object({
  id: z.string().min(1, 'ID do usuário é obrigatório'),
  displayName: z.string().min(1, 'Nome de exibição é obrigatório'),
  username: z
    .string()
    .min(3, 'Username deve ter pelo menos 3 caracteres')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username deve conter apenas letras, números e underscore'),
  email: z.string().email('Email inválido'),
  avatarUrl: z.string().url('Avatar deve ser uma URL válida').optional().nullable(),
  bio: z.string().max(300, 'Bio deve ter no máximo 300 caracteres').optional().nullable(),
  createdAt: z.string(),
});

export type User = z.infer<typeof UserSchema>;

export const SignUpInputSchema = z.object({
  displayName: z.string().min(1, 'Nome de exibição é obrigatório'),
  username: z
    .string()
    .min(3, 'Username deve ter pelo menos 3 caracteres')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username deve conter apenas letras, números e underscore'),
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'Senha deve ter no mínimo 8 caracteres'),
});

export type SignUpInput = z.infer<typeof SignUpInputSchema>;

export const SignInInputSchema = z.object({
  identifier: z.string().min(1, 'Informe seu email ou username'),
  password: z.string().min(1, 'Informe sua senha'),
});

export type SignInInput = z.infer<typeof SignInInputSchema>;

export const SessionSchema = z.object({
  token: z.string().min(1, 'Token de sessão é obrigatório'),
  user: UserSchema,
  expiresAt: z.string(),
});

export type Session = z.infer<typeof SessionSchema>;
