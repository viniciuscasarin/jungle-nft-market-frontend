import * as React from 'react';
import { cn } from '../../index';
import { IconAlertCircle } from '../../icons/IconAlertCircle';
import { IconCheckCircle } from '../../icons/IconCheckCircle';
import { IconInfo } from '../../icons/IconInfo';
import { IconClose } from '../../icons/IconClose';

export type AlertVariant = 'info' | 'success' | 'warning' | 'error' | 'default';

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: AlertVariant;
  title?: string;
  description?: React.ReactNode;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  onClose?: () => void;
  closeLabel?: string;
}

const variantConfig: Record<
  AlertVariant,
  {
    containerClass: string;
    titleColor: string;
    role: 'alert' | 'status';
  }
> = {
  default: {
    containerClass: 'bg-surface-raised border-border-default text-text-primary',
    titleColor: 'text-text-primary',
    role: 'status',
  },
  info: {
    containerClass: 'bg-surface-raised border-border-default text-text-primary',
    titleColor: 'text-accent',
    role: 'status',
  },
  success: {
    containerClass: 'bg-surface-raised border-feedback-success/40 text-text-primary',
    titleColor: 'text-feedback-success',
    role: 'status',
  },
  warning: {
    containerClass: 'bg-surface-raised border-accent/40 text-text-primary',
    titleColor: 'text-accent',
    role: 'alert',
  },
  error: {
    containerClass: 'bg-surface-raised border-feedback-error/40 text-text-primary',
    titleColor: 'text-feedback-error',
    role: 'alert',
  },
};

function getDefaultAlertIcon(variant: AlertVariant): React.ReactNode {
  switch (variant) {
    case 'default':
      return <IconInfo className="h-5 w-5 text-text-secondary shrink-0 mt-0.5" />;
    case 'info':
      return <IconInfo className="h-5 w-5 text-accent shrink-0 mt-0.5" />;
    case 'success':
      return <IconCheckCircle className="h-5 w-5 text-feedback-success shrink-0 mt-0.5" />;
    case 'warning':
      return <IconAlertCircle className="h-5 w-5 text-accent shrink-0 mt-0.5" />;
    case 'error':
      return <IconAlertCircle className="h-5 w-5 text-feedback-error shrink-0 mt-0.5" />;
  }
}

export const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  (
    {
      variant = 'info',
      title,
      description,
      icon,
      action,
      onClose,
      closeLabel = 'Fechar alerta',
      className,
      children,
      ...props
    },
    ref
  ) => {
    const config = variantConfig[variant];
    const renderedIcon = icon ?? getDefaultAlertIcon(variant);

    return (
      <div
        ref={ref}
        role={config.role}
        aria-live="polite"
        className={cn(
          'relative flex items-start gap-3 rounded-md border p-4 font-mono text-body-14 transition-colors',
          config.containerClass,
          className
        )}
        {...props}
      >
        {renderedIcon && <div className="shrink-0">{renderedIcon}</div>}

        <div className="flex-1 space-y-1 min-w-0">
          {title && <h5 className={cn('font-bold leading-tight', config.titleColor)}>{title}</h5>}
          {description && <div className="text-caption-12 text-text-secondary">{description}</div>}
          {children && <div className="text-caption-12 text-text-secondary">{children}</div>}
          {action && <div className="pt-2">{action}</div>}
        </div>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label={closeLabel}
            className="shrink-0 p-1 rounded-sm text-text-muted hover:text-text-primary hover:bg-surface-dark transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-ink cursor-pointer"
          >
            <IconClose className="h-4 w-4" />
          </button>
        )}
      </div>
    );
  }
);

Alert.displayName = 'Alert';
