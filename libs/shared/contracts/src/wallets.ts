import { z } from 'zod';

export const WalletNetworkSchema = z.enum([
  'ethereum-mainnet',
  'sepolia',
  'polygon',
  'arbitrum',
  'optimism',
]);

export type WalletNetwork = z.infer<typeof WalletNetworkSchema>;

export const WalletTypeSchema = z.enum(['metamask', 'coinbase', 'walletconnect']);

export type WalletType = z.infer<typeof WalletTypeSchema>;

export const WalletAddressSchema = z
  .string()
  .regex(/^0x[a-fA-F0-9]{40}$/, 'Endereço deve ser hexadecimal de 42 caracteres (0x...)');

export const EnsNameSchema = z
  .string()
  .refine((val) => !val.toLowerCase().endsWith('.eth'), {
    message: 'Nome ENS não deve conter o sufixo .eth',
  });

export const WalletSchema = z.object({
  id: z.string().min(1, 'ID da carteira é obrigatório'),
  userId: z.string().min(1, 'ID do usuário é obrigatório').optional(),
  address: WalletAddressSchema,
  network: WalletNetworkSchema.default('ethereum-mainnet'),
  walletType: WalletTypeSchema.optional().nullable(),
  ensName: EnsNameSchema.optional().nullable(),
  label: z.string().max(50, 'Label deve ter no máximo 50 caracteres').optional().nullable(),
  displayName: z
    .string()
    .max(80, 'Nome de exibição deve ter no máximo 80 caracteres')
    .optional()
    .nullable(),
  email: z.string().email('Email inválido').optional().nullable(),
  referralCode: z
    .string()
    .max(50, 'Código de indicação deve ter no máximo 50 caracteres')
    .optional()
    .nullable(),
  notes: z
    .string()
    .max(200, 'Observações devem ter no máximo 200 caracteres')
    .optional()
    .nullable(),
  isPrimary: z.boolean().default(false),
  createdAt: z.string().optional(),
});

export type Wallet = z.infer<typeof WalletSchema>;

export const CreateWalletInputSchema = z.object({
  address: WalletAddressSchema,
  network: WalletNetworkSchema.default('ethereum-mainnet'),
  walletType: WalletTypeSchema.optional().nullable(),
  ensName: EnsNameSchema.optional().nullable(),
  label: z.string().max(50, 'Label deve ter no máximo 50 caracteres').optional().nullable(),
  displayName: z
    .string()
    .max(80, 'Nome de exibição deve ter no máximo 80 caracteres')
    .optional()
    .nullable(),
  email: z.string().email('Email inválido').optional().nullable(),
  referralCode: z
    .string()
    .max(50, 'Código de indicação deve ter no máximo 50 caracteres')
    .optional()
    .nullable(),
  notes: z
    .string()
    .max(200, 'Observações devem ter no máximo 200 caracteres')
    .optional()
    .nullable(),
  isPrimary: z.boolean().default(false),
});

export type CreateWalletInput = z.infer<typeof CreateWalletInputSchema>;

export const UpdateWalletInputSchema = CreateWalletInputSchema;
export type UpdateWalletInput = z.infer<typeof UpdateWalletInputSchema>;

export const UserWalletsSchema = z.object({
  primary: WalletSchema,
  secondary: WalletSchema.optional().nullable(),
});

export type UserWallets = z.infer<typeof UserWalletsSchema>;

