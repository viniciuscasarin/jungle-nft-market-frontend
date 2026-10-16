import * as React from 'react';
import { WalletProviderOption } from './types';

export interface WalletAndNetworkSelectorProps {
  selected?: WalletProviderOption | undefined;
  onSelect?: ((option: WalletProviderOption) => void) | undefined;
  isMobile?: boolean | undefined;
  className?: string | undefined;
}

/**
 * Seção de seleção de carteira e protocolo de rede ("Carteira e rede")
 * fiel ao Figma Desktop (#11:2862) e Mobile (#16:748).
 */
export const WalletAndNetworkSelector: React.FC<WalletAndNetworkSelectorProps> = ({
  selected = 'coinbase',
  onSelect,
  isMobile = false,
  className = '',
}) => {
  const [current, setCurrent] = React.useState<WalletProviderOption>(selected);

  React.useEffect(() => {
    setCurrent(selected);
  }, [selected]);

  const handleChoose = (opt: WalletProviderOption) => {
    setCurrent(opt);
    onSelect?.(opt);
  };

  if (isMobile) {
    return (
      <section
        data-testid="wallet-network-selector-mobile"
        aria-label="Seleção de carteira e rede"
        className={`flex flex-col gap-3 font-mono ${className}`}
      >
        <h2 className="font-mono font-bold text-text-primary text-body-large-16 tracking-wide">
          Carteira e rede
        </h2>

        {/* Opção 1: WalletConnect */}
        <button
          type="button"
          role="radio"
          aria-checked={current === 'walletconnect'}
          onClick={() => handleChoose('walletconnect')}
          className={`w-full p-4 flex items-center justify-between bg-surface-card border transition-all cursor-pointer rounded-none text-left ${
            current === 'walletconnect' ? 'border-accent' : 'border-border-default/60 hover:border-border-soft'
          }`}
        >
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-full bg-surface-raised flex items-center justify-center font-bold text-accent text-body-14">
              W
            </span>
            <span className="font-mono text-body-14 text-text-primary">
              WalletConnect
            </span>
          </div>

          <span
            className={`w-4 h-4 rounded-full border flex items-center justify-center ${
              current === 'walletconnect' ? 'border-accent bg-accent' : 'border-border-accessible bg-transparent'
            }`}
          >
            {current === 'walletconnect' && <span className="w-1.5 h-1.5 rounded-full bg-ink" />}
          </span>
        </button>

        {/* Opção 2: MetaMask */}
        <button
          type="button"
          role="radio"
          aria-checked={current === 'metamask'}
          onClick={() => handleChoose('metamask')}
          className={`w-full p-4 flex items-center justify-between bg-surface-card border transition-all cursor-pointer rounded-none text-left ${
            current === 'metamask' ? 'border-accent' : 'border-border-default/60 hover:border-border-soft'
          }`}
        >
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-full bg-surface-raised flex items-center justify-center font-bold text-accent text-body-14">
              M
            </span>
            <span className="font-mono text-body-14 text-text-primary">
              MetaMask
            </span>
          </div>

          <span
            className={`w-4 h-4 rounded-full border flex items-center justify-center ${
              current === 'metamask' ? 'border-accent bg-accent' : 'border-border-accessible bg-transparent'
            }`}
          >
            {current === 'metamask' && <span className="w-1.5 h-1.5 rounded-full bg-ink" />}
          </span>
        </button>

        {/* Opção 3: Coinbase Wallet (selecionada no Figma) */}
        <button
          type="button"
          role="radio"
          aria-checked={current === 'coinbase'}
          onClick={() => handleChoose('coinbase')}
          className={`w-full p-4 flex items-center justify-between bg-surface-card border transition-all cursor-pointer rounded-none text-left ${
            current === 'coinbase' ? 'border-accent' : 'border-border-default/60 hover:border-border-soft'
          }`}
        >
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-full bg-surface-raised flex items-center justify-center text-accent">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="5" width="20" height="14" rx="2" />
                <path d="M16 12h.01" />
              </svg>
            </span>
            <span className="font-mono text-body-14 text-text-primary">
              Coinbase Wallet
            </span>
          </div>

          <span
            className={`w-4 h-4 rounded-full border flex items-center justify-center ${
              current === 'coinbase' ? 'border-accent bg-accent' : 'border-border-accessible bg-transparent'
            }`}
          >
            {current === 'coinbase' && <span className="w-1.5 h-1.5 rounded-full bg-ink" />}
          </span>
        </button>
      </section>
    );
  }

  // Visualização Desktop (#11:2862)
  return (
    <section
      data-testid="wallet-network-selector-desktop"
      aria-label="Seleção de carteira e rede"
      className={`flex flex-col gap-3.5 font-mono ${className}`}
    >
      <h2 className="font-mono font-bold text-text-primary text-body-large-16 tracking-wide text-center">
        Carteira e rede
      </h2>

      {/* Opção 1: METAMASK · WALLETCONNECT · COINBASE */}
      <button
        type="button"
        role="radio"
        aria-checked={current === 'metamask-bundle'}
        onClick={() => handleChoose('metamask-bundle')}
        className={`w-full px-4 py-3 flex items-center gap-3 bg-surface-default border transition-all cursor-pointer rounded-none text-left ${
          current === 'metamask-bundle' ? 'border-accent' : 'border-border-default/60 hover:border-border-soft'
        }`}
      >
        <span
          className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
            current === 'metamask-bundle' ? 'border-accent bg-accent' : 'border-border-accessible bg-transparent'
          }`}
        >
          {current === 'metamask-bundle' && <span className="w-1.5 h-1.5 rounded-full bg-ink" />}
        </span>

        <span className="font-mono text-tiny-10 tracking-widest text-text-muted uppercase">
          METAMASK · WALLETCONNECT · COINBASE
        </span>
      </button>

      {/* Opção 2: MetaMask */}
      <button
        type="button"
        role="radio"
        aria-checked={current === 'metamask'}
        onClick={() => handleChoose('metamask')}
        className={`w-full px-4 py-3 flex items-center gap-3 bg-surface-default border transition-all cursor-pointer rounded-none text-left ${
          current === 'metamask' ? 'border-accent' : 'border-border-default/60 hover:border-border-soft'
        }`}
      >
        <span
          className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
            current === 'metamask' ? 'border-accent bg-accent' : 'border-border-accessible bg-transparent'
          }`}
        >
          {current === 'metamask' && <span className="w-1.5 h-1.5 rounded-full bg-ink" />}
        </span>

        <span className="font-mono text-body-14 text-text-primary">
          MetaMask
        </span>
      </button>

      {/* Opção 3: Coinbase Wallet (ativo no Figma) */}
      <button
        type="button"
        role="radio"
        aria-checked={current === 'coinbase'}
        onClick={() => handleChoose('coinbase')}
        className={`w-full px-4 py-3 flex items-center gap-3 bg-surface-default border transition-all cursor-pointer rounded-none text-left ${
          current === 'coinbase' ? 'border-accent' : 'border-border-default/60 hover:border-border-soft'
        }`}
      >
        <span
          className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
            current === 'coinbase' ? 'border-accent bg-accent' : 'border-border-accessible bg-transparent'
          }`}
        >
          {current === 'coinbase' && <span className="w-1.5 h-1.5 rounded-full bg-ink" />}
        </span>

        <span className="font-mono text-body-14 text-text-primary">
          Coinbase Wallet
        </span>
      </button>
    </section>
  );
};
