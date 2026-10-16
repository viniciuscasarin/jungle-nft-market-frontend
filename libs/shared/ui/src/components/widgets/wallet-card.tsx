import * as React from 'react';
import { cn } from '../../index';
import { IconEthereum } from '../../icons/IconEthereum';
import { IconCopy } from '../../icons/IconCopy';
import { IconCheck } from '../../icons/IconCheck';
import { Badge } from '../primitives/badge';
import { Button } from '../primitives/button';

export interface WalletCardProps {
  address: string;
  fullAddress?: string;
  walletName: string;
  network?: string;
  balanceEth?: string;
  isDefault?: boolean;
  icon?: React.ReactNode;
  onCopyAddress?: (address: string) => void;
  onSetDefault?: (address: string) => void;
  onDisconnect?: (address: string) => void;
  className?: string;
}

export const WalletCard: React.FC<WalletCardProps> = ({
  address,
  fullAddress,
  walletName,
  network = 'Ethereum Mainnet',
  balanceEth,
  isDefault = false,
  icon,
  onCopyAddress,
  onSetDefault,
  onDisconnect,
  className,
}) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    const textToCopy = fullAddress ?? address;
    if (onCopyAddress) {
      onCopyAddress(textToCopy);
    } else if (navigator.clipboard) {
      void navigator.clipboard.writeText(textToCopy);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={cn(
        'flex flex-col rounded-lg border border-border-default bg-surface-card p-5 font-mono shadow-card transition-all',
        isDefault && 'border-primary/50 bg-surface-raised',
        className
      )}
    >
      {/* Top Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          {icon && (
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-border-default bg-surface-raised p-2 text-text-primary">
              {icon}
            </div>
          )}
          <div className="flex flex-col">
            <span className="font-bold text-body-14 text-text-primary">{walletName}</span>
            <span className="text-tiny-10 text-text-secondary">{network}</span>
          </div>
        </div>

        {isDefault && (
          <Badge variant="primary" size="sm">
            Principal
          </Badge>
        )}
      </div>

      {/* Address & Copy row */}
      <div className="mt-4 flex items-center justify-between rounded-md border border-border-default bg-surface-raised px-3 py-2 text-caption-12">
        <span className="font-medium text-text-primary truncate">{address}</span>
        <button
          type="button"
          onClick={handleCopy}
          aria-label={copied ? 'Endereço copiado' : 'Copiar endereço da carteira'}
          className="ml-2 flex items-center gap-1 text-text-muted hover:text-text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-ink rounded-xs p-1 cursor-pointer"
        >
          {copied ? (
            <span className="flex items-center gap-1 text-feedback-success text-tiny-10 font-bold">
              <IconCheck className="h-3.5 w-3.5" aria-hidden="true" />
              Copiado
            </span>
          ) : (
            <IconCopy className="h-4 w-4" aria-hidden="true" />
          )}
        </button>
      </div>

      {/* Balance & Actions */}
      <div className="mt-4 flex items-center justify-between border-t border-border-default/60 pt-3">
        {balanceEth !== undefined && (
          <div className="flex flex-col">
            <span className="text-tiny-10 text-text-muted">Saldo</span>
            <div className="flex items-center gap-1">
              <IconEthereum className="h-3.5 w-3.5 text-text-primary shrink-0" aria-hidden="true" />
              <span className="font-bold text-body-14 text-accent">{balanceEth} ETH</span>
            </div>
          </div>
        )}

        <div className="flex items-center gap-2 ml-auto">
          {!isDefault && onSetDefault && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onSetDefault(address)}
              className="text-caption-12 h-8"
            >
              Definir Principal
            </Button>
          )}

          {onDisconnect && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onDisconnect(address)}
              className="text-caption-12 h-8 text-text-muted hover:text-feedback-error"
            >
              Desconectar
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

WalletCard.displayName = 'WalletCard';
