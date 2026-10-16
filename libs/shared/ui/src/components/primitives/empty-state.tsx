import * as React from 'react';
import { cn } from '../../index';
import { IconSearch } from '../../icons/IconSearch';

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: React.ReactNode;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

export const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(
  ({ title, description, icon, action, className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        role="region"
        aria-label={title}
        className={cn(
          'flex flex-col items-center justify-center text-center p-8 rounded-lg border border-border-default bg-surface-card font-mono',
          className
        )}
        {...props}
      >
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-surface-raised text-text-secondary mb-4">
          {icon ?? <IconSearch className="h-8 w-8 text-text-muted" />}
        </div>

        <h3 className="text-title-20 font-bold text-text-primary mb-2">{title}</h3>

        {description && (
          <p className="text-body-14 text-text-secondary max-w-md mb-6">{description}</p>
        )}

        {children && <div className="max-w-md mb-6">{children}</div>}

        {action && <div className="flex items-center gap-3">{action}</div>}
      </div>
    );
  }
);

EmptyState.displayName = 'EmptyState';
