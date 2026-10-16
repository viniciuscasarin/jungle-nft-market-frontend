import * as React from 'react';
import { cn } from '../../index';
import { IconMinus } from '../../icons/IconMinus';
import { IconPlus } from '../../icons/IconPlus';

export interface QuantityStepperProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  ariaLabel?: string;
  className?: string;
}

export const QuantityStepper = React.forwardRef<HTMLDivElement, QuantityStepperProps>(
  (
    {
      value,
      onChange,
      min = 1,
      max = 99,
      step = 1,
      disabled = false,
      ariaLabel = 'Quantidade',
      className,
    },
    ref
  ) => {
    const isDecrementDisabled = disabled || value <= min;
    const isIncrementDisabled = disabled || value >= max;

    const handleDecrement = () => {
      if (isDecrementDisabled) return;
      const next = Math.max(min, Math.floor(value - step));
      onChange(next);
    };

    const handleIncrement = () => {
      if (isIncrementDisabled) return;
      const next = Math.min(max, Math.floor(value + step));
      onChange(next);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const parsed = parseInt(e.target.value, 10);
      if (Number.isNaN(parsed)) return;
      const clamped = Math.max(min, Math.min(max, Math.floor(parsed)));
      onChange(clamped);
    };

    return (
      <div
        ref={ref}
        className={cn(
          'inline-flex items-center h-10 rounded-md border border-border-default bg-surface-raised font-mono select-none',
          disabled && 'opacity-50 cursor-not-allowed',
          className
        )}
      >
        <button
          type="button"
          onClick={handleDecrement}
          disabled={isDecrementDisabled}
          aria-label="Diminuir quantidade"
          className={cn(
            'flex h-10 w-10 items-center justify-center text-text-secondary hover:text-text-primary hover:bg-surface-dark transition-colors cursor-pointer rounded-l-md',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-ink',
            'disabled:opacity-40 disabled:pointer-events-none disabled:cursor-not-allowed'
          )}
        >
          <IconMinus className="h-4 w-4" aria-hidden="true" />
        </button>

        <input
          type="number"
          role="spinbutton"
          aria-label={ariaLabel}
          aria-valuenow={value}
          aria-valuemin={min}
          aria-valuemax={max}
          value={value}
          onChange={handleInputChange}
          disabled={disabled}
          min={min}
          max={max}
          step={step}
          className={cn(
            'w-12 h-10 text-center font-bold text-body-14 text-text-primary bg-transparent border-x border-border-default appearance-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 focus-visible:ring-offset-ink [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none',
            disabled && 'cursor-not-allowed'
          )}
        />

        <button
          type="button"
          onClick={handleIncrement}
          disabled={isIncrementDisabled}
          aria-label="Aumentar quantidade"
          className={cn(
            'flex h-10 w-10 items-center justify-center text-text-secondary hover:text-text-primary hover:bg-surface-dark transition-colors cursor-pointer rounded-r-md',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-ink',
            'disabled:opacity-40 disabled:pointer-events-none disabled:cursor-not-allowed'
          )}
        >
          <IconPlus className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    );
  }
);

QuantityStepper.displayName = 'QuantityStepper';
