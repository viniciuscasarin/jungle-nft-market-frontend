import * as React from 'react';
import { cn } from '../../index';

export interface EditionChipProps extends React.HTMLAttributes<HTMLSpanElement> {
  current: number;
  total: number;
  prefix?: string;
  variant?: 'default' | 'accent';
}

export const EditionChip = React.forwardRef<HTMLSpanElement, EditionChipProps>(
  ({ current, total, prefix = '#', variant = 'default', className, ...props }, ref) => {
    // Pad current number with zero if less than 100 and total >= 100
    const formattedCurrent = total >= 100 ? String(current).padStart(3, '0') : String(current);
    const editionText = `${prefix}${formattedCurrent}/${total}`;

    return (
      <span
        ref={ref}
        aria-label={`Edição ${current} de ${total}`}
        className={cn(
          'inline-flex items-center font-mono text-tiny-10 font-bold px-2 py-0.5 rounded-xs border select-none whitespace-nowrap',
          variant === 'default' && 'bg-surface-raised border-border-soft text-text-secondary',
          variant === 'accent' && 'bg-surface-card border-accent/40 text-text-accent',
          className
        )}
        {...props}
      >
        {editionText}
      </span>
    );
  }
);

EditionChip.displayName = 'EditionChip';
