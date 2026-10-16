import * as React from 'react';
import { cn } from '../../index';

export interface WalletOptionProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  title: string;
  description?: string;
  icon: React.ReactNode;
  badge?: string;
}

export const WalletOption = React.forwardRef<HTMLInputElement, WalletOptionProps>(
  (
    {
      title,
      description,
      icon,
      badge,
      id,
      checked,
      defaultChecked,
      disabled,
      className,
      onChange,
      ...props
    },
    ref
  ) => {
    const generatedId = React.useId();
    const inputId = id ?? generatedId;

    const [internalChecked, setInternalChecked] = React.useState(defaultChecked ?? false);
    const isControlled = checked !== undefined;
    const isChecked = isControlled ? checked : internalChecked;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!isControlled) {
        setInternalChecked(e.target.checked);
      }
      onChange?.(e);
    };

    return (
      <div className={cn('relative font-mono select-none w-full', className)}>
        <input
          ref={ref}
          type="radio"
          id={inputId}
          checked={checked}
          defaultChecked={defaultChecked}
          disabled={disabled}
          onChange={handleChange}
          className="peer sr-only"
          {...props}
        />
        <label
          htmlFor={inputId}
          className={cn(
            'flex items-center justify-between p-4 rounded-lg border bg-surface-card transition-all cursor-pointer',
            'peer-focus-visible:ring-2 peer-focus-visible:ring-primary peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-ink',
            disabled && 'opacity-50 cursor-not-allowed pointer-events-none',
            isChecked
              ? 'border-primary bg-surface-raised shadow-card'
              : 'border-border-default hover:border-border-soft hover:bg-surface-dark'
          )}
        >
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-surface-raised border border-border-default text-text-primary p-2">
              {icon}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-bold text-body-14 text-text-primary truncate">{title}</span>
              {description && (
                <span className="text-caption-12 text-text-secondary truncate mt-0.5">
                  {description}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 ml-3">
            {badge && (
              <span className="rounded-xs bg-accent/20 px-2 py-0.5 text-tiny-10 font-bold text-accent uppercase">
                {badge}
              </span>
            )}
            <div
              className={cn(
                'flex h-5 w-5 items-center justify-center rounded-full border transition-colors',
                isChecked ? 'border-primary bg-primary' : 'border-border-default bg-surface-raised'
              )}
            >
              {isChecked && <span className="h-2 w-2 rounded-full bg-text-primary" aria-hidden="true" />}
            </div>
          </div>
        </label>
      </div>
    );
  }
);

WalletOption.displayName = 'WalletOption';
