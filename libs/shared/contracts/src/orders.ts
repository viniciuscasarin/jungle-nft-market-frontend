import { z } from 'zod';
import { EthAmountSchema } from './common';
import { WalletNetworkSchema } from './wallets';

export const OrderStatusSchema = z.enum(['pending', 'confirmed', 'rejected']);
export type OrderStatus = z.infer<typeof OrderStatusSchema>;

export const SecondaryWalletDataSchema = z.object({
  address: z
    .string()
    .regex(/^0x[a-fA-F0-9]{40}$/, 'Endereço deve ser hexadecimal de 42 caracteres (0x...)'),
  network: WalletNetworkSchema.default('ethereum-mainnet'),
  type: z.string().optional(),
});

export type SecondaryWalletData = z.infer<typeof SecondaryWalletDataSchema>;

const HEX_WALLET_REGEX = /^0x[a-fA-F0-9]{40}$/;

export const CollectorBaseSchema = z.object({
  fullName: z.string().min(1, 'Nome completo é obrigatório'),
  email: z.string().email('Email inválido'),
  walletAddress: z.string().min(1, 'Endereço da carteira é obrigatório'),
  network: WalletNetworkSchema.default('ethereum-mainnet'),
  ensName: z.string().optional().nullable(),
  useSecondaryWallet: z.boolean().default(false),
  secondaryWallet: SecondaryWalletDataSchema.optional().nullable(),
});

export const CollectorSchema = CollectorBaseSchema.superRefine((data, ctx) => {
  // Validate primary wallet address format
  if (!HEX_WALLET_REGEX.test(data.walletAddress)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Endereço deve ser hexadecimal de 42 caracteres (0x...)',
      path: ['walletAddress'],
    });
  }

  // Validate ENS name (must NOT contain .eth suffix)
  if (data.ensName && data.ensName.trim() !== '') {
    if (data.ensName.toLowerCase().endsWith('.eth')) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Nome ENS não deve conter o sufixo .eth',
        path: ['ensName'],
      });
    }
  }

  // Validate conditional secondary wallet
  if (data.useSecondaryWallet) {
    if (!data.secondaryWallet || !data.secondaryWallet.address) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Carteira secundária é obrigatória quando selecionada',
        path: ['secondaryWallet'],
      });
    } else if (data.secondaryWallet.address.toLowerCase() === data.walletAddress.toLowerCase()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'A carteira secundária deve ser diferente da principal',
        path: ['secondaryWallet', 'address'],
      });
    }
  }
});

export type Collector = z.infer<typeof CollectorSchema>;

export const OrderItemSchema = z.object({
  nftId: z.string().min(1),
  editionId: z.string().min(1),
  editionNumber: z.number().int().positive().optional(),
  title: z.string().min(1),
  imageUrl: z.string().url(),
  unitPrice: EthAmountSchema,
  quantity: z.number().int().positive(),
  subtotal: EthAmountSchema,
});

export type OrderItem = z.infer<typeof OrderItemSchema>;

export const OrderReceiptSnapshotSchema = z.object({
  orderId: z.string().min(1),
  transactionHash: z.string().min(1),
  collector: CollectorBaseSchema,
  items: z.array(OrderItemSchema).min(1),
  quoteId: z.string().min(1),
  subtotal: EthAmountSchema,
  discount: EthAmountSchema,
  networkFee: EthAmountSchema,
  total: EthAmountSchema,
  confirmedAt: z.string(),
  blockNumber: z.number().int().positive().optional(),
});

export type OrderReceiptSnapshot = z.infer<typeof OrderReceiptSnapshotSchema>;

export const OrderSchema = z.object({
  id: z.string().min(1, 'ID do pedido é obrigatório'),
  userId: z.string().min(1, 'ID do usuário é obrigatório'),
  quoteId: z.string().min(1, 'ID da cotação é obrigatório'),
  idempotencyKey: z.string().min(1, 'Idempotency-Key é obrigatória'),
  status: OrderStatusSchema,
  collector: CollectorBaseSchema,
  items: z.array(OrderItemSchema).min(1),
  subtotal: EthAmountSchema,
  discount: EthAmountSchema,
  networkFee: EthAmountSchema,
  total: EthAmountSchema,
  receipt: OrderReceiptSnapshotSchema.optional().nullable(),
  rejectionReason: z.string().optional().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type Order = z.infer<typeof OrderSchema>;

export const CreateOrderInputSchema = z.object({
  quoteId: z.string().min(1, 'ID da cotação é obrigatório'),
  collector: CollectorSchema,
});

export type CreateOrderInput = z.infer<typeof CreateOrderInputSchema>;
