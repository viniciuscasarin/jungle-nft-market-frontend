export interface MockCoupon {
  code: string;
  type: 'percentage' | 'fixed';
  discountPercent?: number;
  discountAmount?: string;
  isValid: boolean;
  expiresAt: string;
  message?: string;
}

export const mockCoupons: MockCoupon[] = [
  {
    code: 'JUNGLE10',
    type: 'percentage',
    discountPercent: 10,
    isValid: true,
    expiresAt: '2026-12-31T23:59:59.000Z',
    message: '10% de desconto aplicado com sucesso!',
  },
  {
    code: 'SAVE50',
    type: 'fixed',
    discountAmount: '0.05',
    isValid: true,
    expiresAt: '2026-12-31T23:59:59.000Z',
    message: 'Desconto fixo de 0.05 ETH aplicado com sucesso!',
  },
  {
    code: 'EXPIRED20',
    type: 'percentage',
    discountPercent: 20,
    isValid: false,
    expiresAt: '2025-01-01T00:00:00.000Z',
    message: 'Este cupom expirou em 01/01/2025.',
  },
  {
    code: 'INACTIVE',
    type: 'percentage',
    discountPercent: 5,
    isValid: false,
    expiresAt: '2026-12-31T23:59:59.000Z',
    message: 'Cupom inativo nesta demonstração.',
  },
];
