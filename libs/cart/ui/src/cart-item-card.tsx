import * as React from 'react';
import { CartItem } from './types';
import { CartQuantityStepper } from './cart-quantity-stepper';

export interface CartItemCardProps {
  item: CartItem;
  onQuantityChange: (id: string, quantity: number) => void;
  onRemove: (id: string) => void;
  className?: string;
}

/**
 * Card de item do carrinho para visualização Mobile (#16:360).
 * Renderiza miniatura sem borda/radius, nome do NFT, edição com stepper compacto,
 * preço em text-secondary e total em destaque âmbar.
 */
export const CartItemCard: React.FC<CartItemCardProps> = ({
  item,
  onQuantityChange,
  onRemove,
  className = '',
}) => {
  const unitPrice = parseFloat(item.priceEth.replace(' ETH', '').trim()) || 0;
  const lineTotal = (unitPrice * item.quantity).toFixed(2);

  return (
    <article
      data-testid={`cart-item-card-${item.id}`}
      className={`bg-surface-card border-none rounded-none p-3.5 flex gap-3.5 items-center transition-all ${className}`}
    >
      {/* Miniatura quadrada sem borda e sem radius */}
      <div className="w-20 h-20 overflow-hidden bg-surface-raised flex-shrink-0">
        <img
          src={item.imageUrl}
          alt={item.name}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>

      {/* Conteúdo à direita */}
      <div className="flex-1 min-w-0 flex flex-col justify-between self-stretch py-0.5">
        {/* Nome do NFT */}
        <div className="flex items-start justify-between gap-2">
          <h2 className="font-mono font-bold text-text-primary text-body-large-16 truncate">
            {item.name}
          </h2>

          {/* Botão de exclusão mobile */}
          <button
            type="button"
            onClick={() => onRemove(item.id)}
            aria-label={`Remover ${item.name} do carrinho`}
            className="text-text-muted hover:text-coral transition-colors p-1 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M6 8h12v11a3 3 0 0 1-3 3H9a3 3 0 0 1-3-3V8Z" />
              <path d="M9 8V6a3 3 0 0 1 6 0v2" />
            </svg>
          </button>
        </div>

        {/* Linha com Edição e Stepper */}
        <div className="flex items-center justify-between gap-2 my-1">
          <span className="font-mono text-caption-12 text-text-secondary">
            Edição: {item.edition}
          </span>
          <CartQuantityStepper
            value={item.quantity}
            max={item.maxQuantity}
            size="sm"
            onChange={(newQty) => onQuantityChange(item.id, newQty)}
            ariaLabel={`Quantidade para ${item.name}`}
          />
        </div>

        {/* Preço em destaque âmbar */}
        <div className="font-mono font-bold text-accent text-body-large-16">
          {lineTotal} ETH
        </div>
      </div>
    </article>
  );
};
