import * as React from 'react';
import { cn } from '../../index';

export type BadgeVariant =
  | 'default'
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'success'
  | 'warning'
  | 'error'
  | 'edition'
  | 'rarity';

export type BadgeSize = 'sm' | 'md';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
}

const variantClasses: Record<BadgeVariant, string> = {
  default: 'bg-surface-raised text-text-primary border-border-default',
  primary: 'bg-primary/20 text-primary border-primary/40',
  secondary: 'bg-surface-card text-text-secondary border-border-default',
  outline: 'bg-transparent text-text-secondary border-border-default',
  success: 'bg-feedback-success/20 text-feedback-success border-feedback-success/40',
  warning: 'bg-accent/20 text-accent border-accent/40',
  error: 'bg-feedback-error/20 text-feedback-error border-feedback-error/40',
  edition: 'bg-surface-dark text-text-accent border-border-soft',
  rarity: 'bg-surface-card text-accent border-accent/30 uppercase tracking-wide',
};

const sizeClasses: Record<BadgeSize, string> = {
  sm: 'text-tiny-10 px-2 py-0.5 rounded-xs',
  md: 'text-caption-12 px-2.5 py-1 rounded-sm',
};

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ variant = 'default', size = 'md', className, children, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center font-mono font-medium border select-none whitespace-nowrap',
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';
