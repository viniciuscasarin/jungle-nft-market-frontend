import * as React from 'react';
import { IconMinus, IconPlus } from '@nft/shared-ui';

export interface CartQuantityStepperProps {
  value: number;
  onChange: (nextValue: number) => void;
  min?: number | undefined;
  max?: number | undefined;
  disabled?: boolean | undefined;
  size?: ('sm' | 'md') | undefined;
  ariaLabel?: string | undefined;
  className?: string | undefined;
}

/**
 * Stepper circular fiel aos frames do Figma para Carrinho (Desktop #11:1278 e Mobile #16:360).
 * Renderiza bot├Áes circulares escuros com glifos ├ómbar e indicador de quantidade central.
 */
export const CartQuantityStepper: React.FC<CartQuantityStepperProps> = ({
  value,
  onChange,
  min = 1,
  max = 99,
  disabled = false,
  size = 'md',
  ariaLabel = 'Quantidade de edi├º├Áes',
  className = '',
}) => {
  const canDecrement = !disabled && value > min;
  const canIncrement = !disabled && value < max;

  const handleDecrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (canDecrement) {
      onChange(value - 1);
    }
  };

  const handleIncrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (canIncrement) {
      onChange(value + 1);
    }
  };

  const buttonSizeClasses = size === 'sm' ? 'w-6 h-6 text-xs' : 'w-7 h-7 text-sm';
  const iconSize = size === 'sm' ? 12 : 14;

  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className={`inline-flex items-center gap-2.5 select-none font-mono ${className}`}
    >
      <button
        type="button"
        onClick={handleDecrement}
        disabled={!canDecrement}
        aria-label="Diminuir quantidade"
        className={`flex items-center justify-center rounded-full bg-surface-raised hover:bg-surface-dark border border-border-default/60 text-accent transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${buttonSizeClasses}`}
      >
        <IconMinus width={iconSize} height={iconSize} />
      </button>

      <span
        role="spinbutton"
        aria-valuenow={value}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-label={ariaLabel}
        className="min-w-[1.25rem] text-center font-mono font-bold text-text-primary text-body-14"
      >
        {value}
      </span>

      <button
        type="button"
        onClick={handleIncrement}
        disabled={!canIncrement}
        aria-label="Aumentar quantidade"
        className={`flex items-center justify-center rounded-full bg-surface-raised hover:bg-surface-dark border border-border-default/60 text-accent transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${buttonSizeClasses}`}
      >
        <IconPlus width={iconSize} height={iconSize} />
      </button>
    </div>
  );
};
