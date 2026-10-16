import * as React from 'react';
import { cn } from '../../index';

export interface SwitchProps {
  id?: string;
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  label?: React.ReactNode;
  description?: React.ReactNode;
  className?: string;
  ariaLabel?: string;
}

export const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(
  (
    {
      id,
      checked,
      defaultChecked = false,
      onCheckedChange,
      disabled = false,
      label,
      description,
      className,
      ariaLabel,
      ...props
    },
    ref
  ) => {
    const generatedId = React.useId();
    const switchId = id ?? generatedId;

    const [internalChecked, setInternalChecked] = React.useState(defaultChecked);
    const isControlled = checked !== undefined;
    const isChecked = isControlled ? checked : internalChecked;

    const handleToggle = () => {
      if (disabled) return;
      const next = !isChecked;
      if (!isControlled) {
        setInternalChecked(next);
      }
      onCheckedChange?.(next);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        handleToggle();
      }
    };

    return (
      <div className={cn('flex items-start gap-3 font-mono select-none', className)}>
        <button
          ref={ref}
          id={switchId}
          type="button"
          role="switch"
          aria-checked={isChecked}
          aria-label={ariaLabel}
          disabled={disabled}
          onClick={handleToggle}
          onKeyDown={handleKeyDown}
          className={cn(
            'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full p-0.5 transition-colors duration-200 ease-in-out motion-reduce:transition-none',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-ink',
            disabled && 'opacity-50 cursor-not-allowed pointer-events-none',
            isChecked ? 'bg-primary' : 'bg-surface-raised border border-border-default'
          )}
          {...props}
        >
          <span
            aria-hidden="true"
            className={cn(
              'pointer-events-none inline-block h-5 w-5 rounded-full bg-text-primary shadow-sm transform transition-transform duration-200 ease-in-out motion-reduce:transition-none',
              isChecked ? 'translate-x-5' : 'translate-x-0'
            )}
          />
        </button>

        {(label || description) && (
          <label htmlFor={switchId} className="flex flex-col text-body-14 cursor-pointer">
            {label && (
              <span
                className={cn('font-medium text-text-primary', disabled && 'opacity-50 cursor-not-allowed')}
              >
                {label}
              </span>
            )}
            {description && (
              <span className="text-caption-12 text-text-secondary mt-0.5">
                {description}
              </span>
            )}
          </label>
        )}
      </div>
    );
  }
);

Switch.displayName = 'Switch';
