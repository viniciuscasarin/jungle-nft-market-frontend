import * as React from 'react';
import { ToastProvider, useToast } from '@nft/shared-ui';
import { singletonRegistry } from './singleton-registry';
import type { ShellFeedback, ShellFeedbackNotifyOptions } from './context';

export const GLOBAL_LIVE_REGIONS_KEY = 'liveRegion';
export const TOAST_PROVIDER_KEY = 'toastProvider';

export function announceToLiveRegion(
  message: string,
  politeness: 'polite' | 'assertive' = 'polite'
) {
  if (typeof document === 'undefined') return;
  const id = politeness === 'assertive' ? 'shell-live-assertive' : 'shell-live-polite';
  const el = document.getElementById(id);
  if (el) {
    el.textContent = '';
    el.textContent = message;
  }
}

type ToastDispatcher =
  | ((options: {
      description: React.ReactNode;
      variant?: 'default' | 'info' | 'success' | 'warning' | 'error';
    }) => string)
  | null;

let activeAddToast: ToastDispatcher = null;

export function registerToastDispatcher(dispatcher: ToastDispatcher) {
  activeAddToast = dispatcher;
}

export function getToastDispatcher(): ToastDispatcher {
  return activeAddToast;
}

export const globalFeedback: ShellFeedback = {
  notify: ({ message, tone = 'info', politeness = 'polite' }: ShellFeedbackNotifyOptions) => {
    if (activeAddToast) {
      activeAddToast({ description: message, variant: tone });
    }
    announceToLiveRegion(message, politeness);
  },
  announce: (message: string, politeness: 'polite' | 'assertive' = 'polite') => {
    announceToLiveRegion(message, politeness);
  },
};

export interface GlobalLiveRegionsProps {
  className?: string;
}

export const GlobalLiveRegions: React.FC<GlobalLiveRegionsProps> = ({ className }) => {
  React.useEffect(() => {
    singletonRegistry.assertSingleton(GLOBAL_LIVE_REGIONS_KEY, 'liveRegion-singleton');
  }, []);

  return (
    <div className={className ?? 'sr-only'} aria-hidden="false">
      <div
        role="status"
        aria-live="polite"
        id="shell-live-polite"
        className="sr-only"
      />
      <div
        role="alert"
        aria-live="assertive"
        id="shell-live-assertive"
        className="sr-only"
      />
    </div>
  );
};

function ToastBridge({ children }: { children: React.ReactNode }) {
  const { addToast } = useToast();

  React.useEffect(() => {
    registerToastDispatcher(addToast);
    return () => {
      registerToastDispatcher(null);
    };
  }, [addToast]);

  return <>{children}</>;
}

export const ShellToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  React.useEffect(() => {
    singletonRegistry.assertSingleton(TOAST_PROVIDER_KEY, 'toastProvider-singleton');
  }, []);

  return (
    <ToastProvider>
      <ToastBridge>{children}</ToastBridge>
    </ToastProvider>
  );
};
