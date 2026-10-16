import * as React from 'react';
import { CheckoutNftItem } from './types';

export interface CheckoutNftsSummaryProps {
  items?: CheckoutNftItem[] | undefined;
  subtotalEth?: string | undefined;
  discountEth?: string | undefined;
  networkFeeEth?: string | undefined;
  totalEth?: string | undefined;
  className?: string | undefined;
}

const DEFAULT_CHECKOUT_ITEMS: CheckoutNftItem[] = [
  {
    id: 'emerald-ape-042',
    name: 'Emerald Ape #042',
    tokenId: '#0042',
    imageUrl: '/assets/images/nft-03-emerald-ape.png',
    quantity: 2,
    subtotalEth: '2.38 ETH',
  },
  {
    id: 'violet-nomad-314',
    name: 'Violet Nomad #314',
    tokenId: '#0314',
    imageUrl: '/assets/images/nft-07-violet-nomad.png',
    quantity: 6,
    subtotalEth: '8.34 ETH',
  },
  {
    id: 'ivory-baron-088',
    name: 'Ivory Baron #088',
    tokenId: '#0088',
    imageUrl: '/assets/images/nft-08-ivory-baron.png',
    quantity: 9,
    subtotalEth: '16.11 ETH',
  },
];

/**
 * Bloco "Seus NFTs" e discriminação de cotação da tela de Pagamento Desktop (#11:2862).
 */
export const CheckoutNftsSummary: React.FC<CheckoutNftsSummaryProps> = ({
  items = DEFAULT_CHECKOUT_ITEMS,
  subtotalEth = '26.83 ETH',
  discountEth = '(-) 00.00',
  networkFeeEth = '0.016 ETH',
  totalEth = '26.846 ETH',
  className = '',
}) => {
  const [showCouponInput, setShowCouponInput] = React.useState(false);
  const [couponCode, setCouponCode] = React.useState('');

  return (
    <aside
      data-testid="checkout-nfts-summary"
      aria-label="Seus NFTs e resumo do pedido"
      className={`flex flex-col gap-5 font-mono ${className}`}
    >
      <h2 className="font-mono font-bold text-text-primary text-title-20 tracking-wide">
        Seus NFTs
      </h2>

      {/* Cabeçalho da Lista: NFTs | Subtotal */}
      <div className="flex items-center justify-between text-body-14 text-text-secondary font-medium px-1">
        <span>NFTs</span>
        <span>Subtotal</span>
      </div>

      {/* Lista de itens adquiridos com gap 12px e bg-surface-card (sem borda/radius) */}
      <div className="flex flex-col gap-[12px]">
        {items.map((item) => (
          <div
            key={item.id}
            data-testid={`checkout-summary-item-${item.id}`}
            className="bg-surface-card border-none rounded-none p-3 flex items-center justify-between gap-4 transition-colors hover:bg-surface-raised/60"
          >
            {/* Miniatura quadrada + Metadados */}
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-14 h-14 overflow-hidden bg-surface-raised flex-shrink-0 border-none rounded-none">
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>

              <div className="flex flex-col min-w-0">
                <span className="font-mono font-bold text-text-primary text-body-14 truncate">
                  {item.name} <span className="text-text-muted font-normal text-caption-12">(x {item.quantity})</span>
                </span>
                <span className="font-mono text-caption-12 text-text-muted mt-0.5">
                  ID do token: {item.tokenId}
                </span>
              </div>
            </div>

            {/* Subtotal do item em destaque âmbar */}
            <span className="font-mono font-bold text-accent text-body-large-16 whitespace-nowrap">
              {item.subtotalEth}
            </span>
          </div>
        ))}
      </div>

      {/* Linha de Código Promocional */}
      <div className="pt-2 text-center text-body-14">
        {showCouponInput ? (
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Digite o cupom..."
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              className="w-full h-10 px-3 bg-surface-default border border-border-default text-body-14 text-text-primary rounded-none"
            />
            <button
              type="button"
              onClick={() => setShowCouponInput(false)}
              className="px-4 h-10 bg-primary text-ink font-bold text-body-14 rounded-none cursor-pointer"
            >
              Aplicar
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowCouponInput(true)}
            className="text-text-secondary hover:text-accent transition-colors text-body-14 cursor-pointer underline"
          >
            Tem um código promocional? Aplique aqui
          </button>
        )}
      </div>

      {/* Linhas discriminadas de valores */}
      <div className="flex flex-col gap-3.5 pt-2 text-body-14">
        {/* Subtotal */}
        <div className="flex items-center justify-between text-text-secondary">
          <span>Subtotal</span>
          <span className="font-bold text-text-primary">{subtotalEth}</span>
        </div>

        {/* Desconto do lançamento */}
        <div className="flex items-center justify-between text-text-secondary">
          <span>Desconto do lançamento</span>
          <span className="text-text-secondary">{discountEth}</span>
        </div>

        {/* Taxa de rede */}
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center justify-between text-text-secondary">
            <span>Taxa de rede</span>
            <span className="font-bold text-text-primary">{networkFeeEth}</span>
          </div>
          <span className="text-right text-[11px] text-accent tracking-normal">
            Taxa estimada
          </span>
        </div>
      </div>

      <div className="h-px bg-border-default/60 my-1" />

      {/* Total em destaque âmbar */}
      <div className="flex items-center justify-between">
        <span className="text-body-large-16 font-bold text-text-primary">
          Total
        </span>
        <span className="text-heading-24 font-bold text-accent">
          {totalEth}
        </span>
      </div>
    </aside>
  );
};
