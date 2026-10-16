import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cn } from '../../index';
import { Spinner } from './spinner';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  loadingLabel?: string;
  asChild?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-primary text-text-primary hover:bg-primary-hover active:bg-primary-hover disabled:bg-action-disabled disabled:text-text-muted',
  secondary:
    'bg-surface-raised text-text-primary border border-border-default hover:border-border-soft hover:bg-surface-dark active:border-border-accessible',
  outline:
    'bg-transparent text-text-primary border border-border-default hover:bg-surface-raised hover:border-border-soft',
  ghost:
    'bg-transparent text-text-secondary hover:text-text-primary hover:bg-surface-raised',
  destructive:
    'bg-feedback-error text-text-primary hover:opacity-90 active:opacity-100',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-caption-12 gap-1.5 rounded-sm',
  md: 'h-10 px-4 text-body-14 gap-2 rounded-md',
  lg: 'h-12 px-6 text-body-large-16 gap-2.5 rounded-md',
  icon: 'h-10 w-10 p-0 rounded-md',
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      loadingLabel,
      asChild = false,
      leftIcon,
      rightIcon,
      className,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;
    const spinnerSize = size === 'lg' ? 'md' : 'sm';

    const commonClasses = cn(
      'inline-flex items-center justify-center font-mono font-medium select-none transition-colors motion-reduce:transition-none cursor-pointer',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-ink',
      'disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed',
      variantClasses[variant],
      sizeClasses[size],
      className
    );

    if (asChild) {
      return (
        <Slot
          ref={ref}
          aria-busy={loading ? 'true' : undefined}
          className={commonClasses}
          {...props}
        >
          {children}
        </Slot>
      );
    }

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        aria-busy={loading ? 'true' : undefined}
        className={commonClasses}
        {...props}
      >
        {loading ? (
          <>
            <Spinner size={spinnerSize} ariaLabel={loadingLabel ? '' : 'Carregando...'} />
            {loadingLabel ? <span>{loadingLabel}</span> : children}
          </>
        ) : (
          <>
            {leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>}
            {children}
            {rightIcon && <span className="inline-flex shrink-0">{rightIcon}</span>}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
