import * as React from 'react';
import { ConnectedWallet } from './types';

export interface ConnectedWalletsSectionProps {
  wallets?: ConnectedWallet[] | undefined;
  selectedWalletId?: string | undefined;
  onSelectWallet?: ((walletId: string) => void) | undefined;
  onSwitchWallet?: (() => void) | undefined;
  className?: string | undefined;
}

const DEFAULT_WALLETS: ConnectedWallet[] = [
  {
    id: 'wallet-reserva',
    label: 'Reserva',
    addressOrEns: 'nova.kurio.eth',
    network: 'Rede Polygon',
    isDefault: true,
  },
  {
    id: 'wallet-principal',
    label: 'Principal',
    addressOrEns: '0xA91F...E82C',
    network: 'Rede principal Ethereum',
    isDefault: false,
  },
];

/**
 * Seção "Carteira conectada" para visualização Mobile (#16:748).
 * Apresenta as carteiras do colecionador com status ativo, rede, endereço truncado/ENS
 * e ação de alternância rápida.
 */
export const ConnectedWalletsSection: React.FC<ConnectedWalletsSectionProps> = ({
  wallets = DEFAULT_WALLETS,
  selectedWalletId = 'wallet-reserva',
  onSelectWallet,
  onSwitchWallet,
  className = '',
}) => {
  const [activeId, setActiveId] = React.useState<string>(selectedWalletId);

  const handleSelect = (id: string) => {
    setActiveId(id);
    onSelectWallet?.(id);
  };

  return (
    <section
      data-testid="connected-wallets-section"
      aria-label="Carteira conectada"
      className={`flex flex-col gap-3 font-mono ${className}`}
    >
      {/* Cabeçalho da Seção: Carteira conectada | Trocar carteira */}
      <div className="flex items-center justify-between">
        <h2 className="font-mono font-bold text-text-primary text-body-large-16 tracking-wide">
          Carteira conectada
        </h2>
        <button
          type="button"
          onClick={onSwitchWallet}
          className="text-body-14 text-accent hover:underline cursor-pointer transition-colors"
        >
          Trocar carteira
        </button>
      </div>

      {/* Cards de Carteira */}
      <div className="flex flex-col gap-3">
        {wallets.map((wallet) => {
          const isSelected = activeId === wallet.id;
          return (
            <div
              key={wallet.id}
              role="radio"
              aria-checked={isSelected}
              tabIndex={0}
              data-testid={`connected-wallet-${wallet.id}`}
              onClick={() => handleSelect(wallet.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleSelect(wallet.id);
                }
              }}
              className={`p-4 bg-surface-card border transition-all cursor-pointer rounded-none flex items-start justify-between gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                isSelected ? 'border-accent' : 'border-border-default/60 hover:border-border-soft'
              }`}
            >
              <div className="flex items-start gap-3">
                {/* Radio circular */}
                <span
                  className={`w-4 h-4 rounded-full border mt-1 flex items-center justify-center shrink-0 ${
                    isSelected ? 'border-accent bg-accent' : 'border-border-accessible bg-transparent'
                  }`}
                >
                  {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-ink" />}
                </span>

                <div className="flex flex-col">
                  <span className="font-mono font-bold text-text-primary text-body-large-16">
                    {wallet.label}
                  </span>
                  <span className="font-mono text-body-14 text-text-secondary mt-0.5">
                    {wallet.addressOrEns}
                  </span>
                  <span className="font-mono text-caption-12 text-text-muted mt-0.5">
                    {wallet.network}
                  </span>
                </div>
              </div>

              {/* Menu 3 pontinhos */}
              <button
                type="button"
                aria-label={`Opções da carteira ${wallet.label}`}
                onClick={(e) => {
                  e.stopPropagation();
                  alert(`Opções da carteira ${wallet.label}`);
                }}
                className="text-text-muted hover:text-text-primary p-1 cursor-pointer transition-colors"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <circle cx="12" cy="5" r="2" />
                  <circle cx="12" cy="12" r="2" />
                  <circle cx="12" cy="19" r="2" />
                </svg>
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
};
