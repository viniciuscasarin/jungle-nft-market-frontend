import { z } from 'zod';
import {
  WalletNetworkSchema,
  WalletTypeSchema,
  WalletAddressSchema,
  EnsNameSchema,
  type Wallet,
  type CreateWalletInput,
} from '@nft/shared-contracts';

export const EnsDomainExtensionSchema = z.enum(['.eth', '.xyz']);
export type EnsDomainExtension = z.infer<typeof EnsDomainExtensionSchema>;

export const WalletFormSchema = z.object({
  displayName: z
    .string()
    .min(1, 'Nome de exibição é obrigatório')
    .max(80, 'Nome de exibição deve ter no máximo 80 caracteres'),
  label: z
    .string()
    .min(1, 'Apelido da carteira é obrigatório')
    .max(50, 'Apelido da carteira deve ter no máximo 50 caracteres'),
  network: WalletNetworkSchema.default('ethereum-mainnet'),
  profileName: z.string().max(50).optional().or(z.literal('')),
  address: WalletAddressSchema,
  secondaryEns: z.string().max(100).optional().or(z.literal('')),
  walletType: WalletTypeSchema.default('metamask'),
  referralCode: z.string().max(50).optional().or(z.literal('')),
  email: z
    .string()
    .email('E-mail informado é inválido')
    .optional()
    .or(z.literal('')),
  ensName: EnsNameSchema.optional().or(z.literal('')),
  ensDomain: EnsDomainExtensionSchema.default('.eth'),
  isPrimary: z.boolean().default(true),
});

export type WalletFormData = z.infer<typeof WalletFormSchema>;

export function isValidWalletAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

export function isValidEnsName(ensName: string): boolean {
  if (!ensName) return true;
  return !ensName.toLowerCase().endsWith('.eth') && !ensName.toLowerCase().endsWith('.xyz');
}

export function formatWalletAddress(address: string): string {
  if (!address || address.length < 10) return address;
  return `${address.slice(0, 5)}...${address.slice(-4)}`;
}

export function walletToFormData(wallet?: Partial<Wallet> | null, defaultPrimary = true): WalletFormData {
  return {
    displayName: wallet?.displayName ?? (wallet?.isPrimary ?? defaultPrimary ? 'Minha MetaMask' : 'Carteira Secundária'),
    label: wallet?.label ?? (wallet?.isPrimary ?? defaultPrimary ? 'Carteira Principal' : 'Carteira Secundária'),
    network: wallet?.network ?? 'ethereum-mainnet',
    profileName: wallet?.ensName ? `${wallet.ensName}.eth` : '',
    address: wallet?.address ?? '',
    secondaryEns: '',
    walletType: (wallet?.walletType as 'metamask' | 'coinbase' | 'walletconnect') ?? 'metamask',
    referralCode: wallet?.referralCode ?? '',
    email: wallet?.email ?? '',
    ensName: wallet?.ensName ?? '',
    ensDomain: '.eth',
    isPrimary: wallet?.isPrimary ?? defaultPrimary,
  };
}

export function formDataToCreateWalletInput(
  data: WalletFormData,
  isPrimary = true
): CreateWalletInput {
  return {
    address: data.address.trim(),
    network: data.network,
    walletType: data.walletType,
    ensName: data.ensName?.trim() || null,
    label: data.label.trim(),
    displayName: data.displayName.trim() || null,
    email: data.email?.trim() || null,
    referralCode: data.referralCode?.trim() || null,
    notes: null,
    isPrimary,
  };
}
