import * as React from 'react';
import { CartItem } from './types';
import { CartQuantityStepper } from './cart-quantity-stepper';

export interface CartItemRowProps {
  item: CartItem;
  onQuantityChange: (id: string, quantity: number) => void;
  onRemove: (id: string) => void;
  className?: string;
}

/**
 * Linha de item da tabela do Carrinho para Desktop (#11:1278).
 * Apresenta miniatura sem borda/radius, metadados do NFT, preço unitário em text-secondary,
 * stepper de edições, total recalculado em destaque âmbar e botão de exclusão.
 * Linha estilizada com background Color Surface Card e sem borda sólida ou raio.
 */
export const CartItemRow: React.FC<CartItemRowProps> = ({
  item,
  onQuantityChange,
  onRemove,
  className = '',
}) => {
  // Cálculo formatado do total da linha se o preço for um valor numérico decimal
  const unitPrice = parseFloat(item.priceEth.replace(' ETH', '').trim()) || 0;
  const lineTotal = (unitPrice * item.quantity).toFixed(2);

  return (
    <tr
      data-testid={`cart-item-row-${item.id}`}
      className={`bg-surface-card hover:bg-surface-raised/70 transition-colors border-none ${className}`}
    >
      {/* Coluna 1: Miniatura (sem borda e sem radius) + Nome + ID do Token */}
      <td className="py-3.5 pl-4 pr-4">
        <div className="flex items-center gap-3.5">
          <div className="w-14 h-14 overflow-hidden bg-surface-raised flex-shrink-0">
            <img
              src={item.imageUrl}
              alt={item.name}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-mono font-bold text-text-primary text-body-large-16 truncate">
              {item.name}
            </span>
            <span className="font-mono text-caption-12 text-text-muted mt-0.5">
              ID do token: {item.tokenId}
            </span>
          </div>
        </div>
      </td>

      {/* Coluna 2: Preço Unitário (em text secondary) */}
      <td className="py-3.5 px-4 font-mono text-body-14 text-text-secondary whitespace-nowrap">
        {item.priceEth.includes('ETH') ? item.priceEth : `${item.priceEth} ETH`}
      </td>

      {/* Coluna 3: Edições (Quantity Stepper) */}
      <td className="py-3.5 px-4 whitespace-nowrap">
        <CartQuantityStepper
          value={item.quantity}
          max={item.maxQuantity}
          onChange={(newQty) => onQuantityChange(item.id, newQty)}
          ariaLabel={`Quantidade de edições para ${item.name}`}
        />
      </td>

      {/* Coluna 4: Total da Linha */}
      <td className="py-3.5 px-4 font-mono font-bold text-accent text-body-large-16 whitespace-nowrap">
        {lineTotal} ETH
      </td>

      {/* Coluna 5: Ação de Exclusão */}
      <td className="py-3.5 pl-4 pr-4 text-right whitespace-nowrap">
        <button
          type="button"
          onClick={() => onRemove(item.id)}
          aria-label={`Remover ${item.name} do carrinho`}
          className="inline-flex items-center justify-center w-9 h-9 text-text-muted hover:text-coral hover:bg-surface-raised/80 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          {/* Ícone de Sacola / Cesto fiel ao Figma #11:1278 */}
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-5 h-5"
          >
            <path d="M6 8h12v11a3 3 0 0 1-3 3H9a3 3 0 0 1-3-3V8Z" />
            <path d="M9 8V6a3 3 0 0 1 6 0v2" />
          </svg>
        </button>
      </td>
    </tr>
  );
};
