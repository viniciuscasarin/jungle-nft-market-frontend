import * as React from 'react';
import { cn } from '../../index';
import { IconClose } from '../../icons/IconClose';

export interface ModalLayoutProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  onClose?: () => void;
  closeLabel?: string;
  footer?: React.ReactNode;
  className?: string;
  cardClassName?: string;
  children: React.ReactNode;
}

export const ModalLayout: React.FC<ModalLayoutProps> = ({
  title,
  subtitle,
  icon,
  onClose,
  closeLabel = 'Fechar janela',
  footer,
  className,
  cardClassName,
  children,
}) => {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className={cn(
        'fixed inset-0 z-50 flex items-center justify-center bg-ink/85 backdrop-blur-xs p-0 sm:p-4 overflow-y-auto',
        className
      )}
    >
      <div
        className={cn(
          'relative flex flex-col w-full h-full sm:h-auto sm:max-w-md sm:rounded-lg border border-border-default bg-surface-card p-6 sm:p-8 shadow-modal font-mono transition-all',
          cardClassName
        )}
      >
        {/* Close Button */}
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label={closeLabel}
            className="absolute right-4 top-4 rounded-sm p-1.5 text-text-muted hover:text-text-primary hover:bg-surface-raised transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-ink cursor-pointer z-10"
          >
            <IconClose className="h-4 w-4" aria-hidden="true" />
          </button>
        )}

        {/* Modal Header */}
        <div className="flex flex-col items-center text-center pb-6">
          {icon && (
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-raised border border-border-default text-primary mb-3">
              {icon}
            </div>
          )}
          <h2 className="text-heading-24 font-bold text-text-primary tracking-tight leading-tight">
            {title}
          </h2>
          {subtitle && (
            <p className="text-body-14 text-text-secondary mt-1.5 max-w-xs">{subtitle}</p>
          )}
        </div>

        {/* Modal Content */}
        <div className="flex-1 flex flex-col justify-center">{children}</div>

        {/* Optional Footer */}
        {footer && (
          <div className="mt-6 pt-4 border-t border-border-default text-center text-caption-12 text-text-secondary">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

ModalLayout.displayName = 'ModalLayout';
