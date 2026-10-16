import * as React from 'react';
import { cn } from '../../index';
import { IconClose } from '../../icons/IconClose';
import { IconCheckCircle } from '../../icons/IconCheckCircle';
import { IconAlertCircle } from '../../icons/IconAlertCircle';
import { IconInfo } from '../../icons/IconInfo';

export type ToastVariant = 'default' | 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  title?: string;
  description?: React.ReactNode;
  variant?: ToastVariant;
  duration?: number;
}

interface ToastContextValue {
  toasts: ToastItem[];
  addToast: (toast: Omit<ToastItem, 'id'>) => string;
  removeToast: (id: string) => void;
}

const ToastContext = React.createContext<ToastContextValue | null>(null);

let toastCount = 0;

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = React.useState<ToastItem[]>([]);

  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = React.useCallback(
    (toast: Omit<ToastItem, 'id'>) => {
      const id = `toast-${++toastCount}`;
      const newToast: ToastItem = { ...toast, id };
      setToasts((prev) => [...prev, newToast]);

      const duration = toast.duration ?? 4000;
      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
      return id;
    },
    [removeToast]
  );

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </ToastContext.Provider>
  );
};

export function useToast() {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

const toastVariantConfig: Record<
  ToastVariant,
  { borderClass: string; icon: React.ReactNode; titleClass: string }
> = {
  default: {
    borderClass: 'border-border-default bg-surface-raised',
    titleClass: 'text-text-primary',
    icon: <IconInfo className="h-5 w-5 text-text-secondary shrink-0" />,
  },
  info: {
    borderClass: 'border-border-default bg-surface-raised',
    titleClass: 'text-accent',
    icon: <IconInfo className="h-5 w-5 text-accent shrink-0" />,
  },
  success: {
    borderClass: 'border-feedback-success/50 bg-surface-raised',
    titleClass: 'text-feedback-success',
    icon: <IconCheckCircle className="h-5 w-5 text-feedback-success shrink-0" />,
  },
  warning: {
    borderClass: 'border-accent/50 bg-surface-raised',
    titleClass: 'text-accent',
    icon: <IconAlertCircle className="h-5 w-5 text-accent shrink-0" />,
  },
  error: {
    borderClass: 'border-feedback-error/50 bg-surface-raised',
    titleClass: 'text-feedback-error',
    icon: <IconAlertCircle className="h-5 w-5 text-feedback-error shrink-0" />,
  },
};

export const ToastContainer: React.FC<{
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}> = ({ toasts, onDismiss }) => {
  return (
    <div
      role="region"
      aria-label="Notificações"
      className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none"
    >
      <div aria-live="polite" aria-atomic="false" className="flex flex-col gap-2">
        {toasts.map((toast) => {
          const config = toastVariantConfig[toast.variant ?? 'default'];
          return (
            <div
              key={toast.id}
              role="status"
              className={cn(
                'pointer-events-auto flex items-start gap-3 p-4 rounded-md border shadow-modal font-mono transition-all duration-200 text-body-14',
                config.borderClass
              )}
            >
              {config.icon}
              <div className="flex-1 space-y-0.5 min-w-0">
                {toast.title && <h5 className={cn('font-bold', config.titleClass)}>{toast.title}</h5>}
                {toast.description && (
                  <div className="text-caption-12 text-text-secondary">{toast.description}</div>
                )}
              </div>
              <button
                type="button"
                onClick={() => onDismiss(toast.id)}
                aria-label="Fechar notificação"
                className="shrink-0 p-1 text-text-muted hover:text-text-primary rounded-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-ink cursor-pointer"
              >
                <IconClose className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
