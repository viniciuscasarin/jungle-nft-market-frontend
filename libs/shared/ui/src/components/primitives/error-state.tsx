import * as React from 'react';
import { cn } from '../../index';
import { IconAlertCircle } from '../../icons/IconAlertCircle';
import { Button } from './button';

export interface ErrorStateProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  message?: React.ReactNode;
  description?: React.ReactNode;
  onRetry?: (() => void) | undefined;
  retryLabel?: string;
  isRetrying?: boolean;
  icon?: React.ReactNode;
}

export const ErrorState = React.forwardRef<HTMLDivElement, ErrorStateProps>(
  (
    {
      title = 'Ocorreu um erro',
      message,
      description,
      onRetry,
      retryLabel = 'Tentar novamente',
      isRetrying = false,
      icon,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const errorDescription = message ?? description;

    return (
      <div
        ref={ref}
        role="alert"
        aria-live="assertive"
        className={cn(
          'flex flex-col items-center justify-center text-center p-8 rounded-lg border border-feedback-error/40 bg-surface-card font-mono',
          className
        )}
        {...props}
      >
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-surface-raised text-feedback-error mb-4">
          {icon ?? <IconAlertCircle className="h-8 w-8 text-feedback-error" />}
        </div>

        <h3 className="text-title-20 font-bold text-text-primary mb-2">{title}</h3>

        {errorDescription && (
          <p className="text-body-14 text-text-secondary max-w-md mb-6">{errorDescription}</p>
        )}

        {children && <div className="max-w-md mb-6">{children}</div>}

        {onRetry && (
          <Button
            type="button"
            variant="primary"
            onClick={onRetry}
            loading={isRetrying}
            loadingLabel="Tentando..."
          >
            {retryLabel}
          </Button>
        )}
      </div>
    );
  }
);

ErrorState.displayName = 'ErrorState';
