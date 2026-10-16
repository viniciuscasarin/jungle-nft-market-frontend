import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  cn,
} from '@nft/shared-ui';

export interface AuthModalLayoutProps {
  title: string;
  description: string;
  isOpen?: boolean;
  onClose: () => void;
  className?: string;
  children: React.ReactNode;
}

export const AuthModalLayout: React.FC<AuthModalLayoutProps> = ({
  title,
  description,
  isOpen = true,
  onClose,
  className,
  children,
}) => {
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose();
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-surface-default overflow-hidden">
      {/* Decorative marketplace background (aria-hidden for screen readers) */}
      <div
        aria-hidden="true"
        data-testid="auth-decorative-bg"
        className="fixed inset-0 pointer-events-none opacity-25 overflow-hidden select-none"
      >
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute top-1/2 -right-40 w-96 h-96 rounded-full bg-accent/20 blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293d_1px,transparent_1px),linear-gradient(to_bottom,#1f293d_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-30" />
      </div>

      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogContent
          hideCloseButton={false}
          closeLabel="Fechar modal de autenticação"
          className={cn(
            'fixed left-[50%] top-[50%] z-50 grid w-full translate-x-[-50%] translate-y-[-50%]',
            // Desktop (>= 768px): modal 500px, rounded, bordered, shadow
            'sm:max-w-[500px] sm:rounded-lg sm:border sm:border-border-default sm:p-8 sm:shadow-modal sm:h-auto sm:max-h-[90vh]',
            // Mobile (< 768px): full screen dedicated surface
            'h-full min-h-screen sm:min-h-0 border-0 p-6 rounded-none bg-surface-card overflow-y-auto font-mono',
            className
          )}
        >
          <DialogTitle asChild>
            <h1 className="sr-only">{title}</h1>
          </DialogTitle>
          <DialogDescription className="sr-only">{description}</DialogDescription>

          <div className="flex flex-col justify-center h-full w-full py-4">
            {children}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

AuthModalLayout.displayName = 'AuthModalLayout';
