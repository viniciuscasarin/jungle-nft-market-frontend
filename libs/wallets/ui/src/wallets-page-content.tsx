import * as React from 'react';
import { Plus } from 'lucide-react';
import type { Wallet, WalletNetwork, WalletType } from '@nft/shared-contracts';
import {
  type WalletFormData,
  walletToFormData,
  formatWalletAddress,
} from '@nft/wallets-domain';

export interface WalletsPageContentProps {
  primaryWallet?: Wallet | null;
  secondaryWallet?: Wallet | null;
  onSubmitPrimaryWallet?: (data: WalletFormData) => Promise<void> | void;
  onSubmitSecondaryWallet?: (data: WalletFormData) => Promise<void> | void;
  onSelectSecondarySameAsPrimary?: () => Promise<void> | void;
  isSaving?: boolean;
  fieldErrors?: Record<string, string>;
  successMessage?: string | null;
}

export const WalletsPageContent: React.FC<WalletsPageContentProps> = ({
  primaryWallet,
  secondaryWallet,
  onSubmitPrimaryWallet,
  onSubmitSecondaryWallet,
  onSelectSecondarySameAsPrimary,
  isSaving = false,
  fieldErrors = {},
  successMessage,
}) => {
  const [displayName, setDisplayName] = React.useState('');
  const [label, setLabel] = React.useState('');
  const [network, setNetwork] = React.useState<WalletNetwork>('ethereum-mainnet');
  const [profileName, setProfileName] = React.useState('');
  const [address, setAddress] = React.useState('');
  const [secondaryEns, setSecondaryEns] = React.useState('');
  const [walletType, setWalletType] = React.useState<WalletType>('metamask');
  const [referralCode, setReferralCode] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [ensName, setEnsName] = React.useState('');
  const [ensDomain, setEnsDomain] = React.useState<'.eth' | '.xyz'>('.eth');

  const [isAddingSecondary, setIsAddingSecondary] = React.useState(false);
  const [secondaryAddress, setSecondaryAddress] = React.useState('');
  const [secondaryNetwork, setSecondaryNetwork] = React.useState<WalletNetwork>('polygon');
  const [secondaryType] = React.useState<WalletType>('walletconnect');

  React.useEffect(() => {
    if (primaryWallet) {
      const formData = walletToFormData(primaryWallet, true);
      setDisplayName(formData.displayName);
      setLabel(formData.label);
      setNetwork(formData.network);
      setProfileName(formData.profileName ?? '');
      setAddress(formData.address);
      setWalletType(formData.walletType);
      setReferralCode(formData.referralCode ?? '');
      setEmail(formData.email ?? '');
      setEnsName(formData.ensName ?? '');
    }
  }, [primaryWallet]);

  const handlePrimarySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmitPrimaryWallet?.({
      displayName,
      label,
      network,
      profileName,
      address,
      secondaryEns,
      walletType,
      referralCode,
      email,
      ensName,
      ensDomain,
      isPrimary: true,
    });
  };

  const handleSecondarySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmitSecondaryWallet?.({
      displayName: 'Carteira Secundária',
      label: 'Carteira Secundária',
      network: secondaryNetwork,
      profileName: '',
      address: secondaryAddress,
      secondaryEns: '',
      walletType: secondaryType,
      referralCode: '',
      email: '',
      ensName: '',
      ensDomain: '.eth',
      isPrimary: false,
    });
    setIsAddingSecondary(false);
  };

  return (
    <div className="w-full font-mono">
      {/* Cabeçalho da seção */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-[16px] font-bold text-text-primary tracking-tight">
            Carteira principal
          </h1>
          <p className="mt-1 text-[14px] text-text-muted">
            Estas carteiras ficam disponíveis no pagamento e para receber NFTs comprados.
          </p>
        </div>
        {!isAddingSecondary && (
          <button
            type="button"
            onClick={() => setIsAddingSecondary(true)}
            className="inline-flex items-center gap-1.5 text-[15px] font-bold text-text-accent hover:text-primary transition-colors cursor-pointer self-start md:self-auto"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            <span>Adicionar</span>
          </button>
        )}
      </div>

      {successMessage && (
        <div
          role="status"
          aria-live="polite"
          className="mb-6 p-4 rounded-xs border border-primary/40 bg-surface-raised text-primary text-[14px]"
        >
          {successMessage}
        </div>
      )}

      {/* Formulário de Carteira Principal */}
      <form onSubmit={handlePrimarySubmit} className="space-y-6" noValidate>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
          {/* Nome de exibição */}
          <div className="space-y-2">
            <label htmlFor="walletDisplayName" className="block text-[14px] text-text-primary">
              Nome de exibição<span className="text-coral ml-1">*</span>
            </label>
            <input
              id="walletDisplayName"
              name="walletDisplayName"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              aria-invalid={Boolean(fieldErrors['displayName'])}
              aria-describedby={fieldErrors['displayName'] ? 'displayName-error' : undefined}
              className="w-full h-[46px] rounded-xs border border-border-default bg-transparent px-4 text-[14px] text-text-primary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors aria-[invalid=true]:border-coral"
            />
            {fieldErrors['displayName'] && (
              <p id="displayName-error" role="alert" className="text-coral text-[12px]">
                {fieldErrors['displayName']}
              </p>
            )}
          </div>

          {/* Apelido da carteira */}
          <div className="space-y-2">
            <label htmlFor="walletAlias" className="block text-[14px] text-text-primary">
              Apelido da carteira<span className="text-coral ml-1">*</span>
            </label>
            <input
              id="walletAlias"
              name="walletAlias"
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              aria-invalid={Boolean(fieldErrors['label'])}
              aria-describedby={fieldErrors['label'] ? 'walletAlias-error' : undefined}
              className="w-full h-[46px] rounded-xs border border-border-default bg-transparent px-4 text-[14px] text-text-primary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors aria-[invalid=true]:border-coral"
            />
            {fieldErrors['label'] && (
              <p id="walletAlias-error" role="alert" className="text-coral text-[12px]">
                {fieldErrors['label']}
              </p>
            )}
          </div>

          {/* Rede */}
          <div className="space-y-2">
            <label htmlFor="network" className="block text-[14px] text-text-primary">
              Rede<span className="text-coral ml-1">*</span>
            </label>
            <select
              id="network"
              name="network"
              value={network}
              onChange={(e) => setNetwork(e.target.value as WalletNetwork)}
              className="w-full h-[46px] rounded-xs border border-border-default bg-surface-card px-4 text-[14px] text-text-primary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors cursor-pointer"
            >
              <option value="ethereum-mainnet" className="bg-surface-card text-text-primary">Ethereum Mainnet</option>
              <option value="sepolia" className="bg-surface-card text-text-primary">Sepolia Testnet</option>
              <option value="polygon" className="bg-surface-card text-text-primary">Polygon</option>
              <option value="arbitrum" className="bg-surface-card text-text-primary">Arbitrum</option>
              <option value="optimism" className="bg-surface-card text-text-primary">Optimism</option>
            </select>
          </div>

          {/* Nome do perfil */}
          <div className="space-y-2">
            <label htmlFor="profileName" className="block text-[14px] text-text-primary">
              Nome do perfil<span className="text-coral ml-1">*</span>
            </label>
            <input
              id="profileName"
              name="profileName"
              type="text"
              value={profileName}
              onChange={(e) => setProfileName(e.target.value)}
              className="w-full h-[46px] rounded-xs border border-border-default bg-transparent px-4 text-[14px] text-text-primary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
            />
          </div>

          {/* Endereço da carteira */}
          <div className="space-y-2">
            <label htmlFor="walletAddress" className="block text-[14px] text-text-primary">
              Endereço da carteira<span className="text-coral ml-1">*</span>
            </label>
            <input
              id="walletAddress"
              name="walletAddress"
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              aria-invalid={Boolean(fieldErrors['address'])}
              aria-describedby={fieldErrors['address'] ? 'walletAddress-error' : undefined}
              className="w-full h-[46px] rounded-xs border border-border-default bg-transparent px-4 text-[14px] text-text-primary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors aria-[invalid=true]:border-coral"
            />
            {fieldErrors['address'] && (
              <p id="walletAddress-error" role="alert" className="text-coral text-[12px]">
                {fieldErrors['address']}
              </p>
            )}
          </div>

          {/* ENS ou carteira secundária */}
          <div className="space-y-2">
            <label htmlFor="secondaryEns" className="block text-[14px] text-text-primary">
              ENS ou carteira secundária (opcional)
            </label>
            <input
              id="secondaryEns"
              name="secondaryEns"
              type="text"
              value={secondaryEns}
              onChange={(e) => setSecondaryEns(e.target.value)}
              className="w-full h-[46px] rounded-xs border border-border-default bg-transparent px-4 text-[14px] text-text-primary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
            />
          </div>

          {/* Tipo de carteira */}
          <div className="space-y-2">
            <label htmlFor="walletType" className="block text-[14px] text-text-primary">
              Tipo de carteira<span className="text-coral ml-1">*</span>
            </label>
            <select
              id="walletType"
              name="walletType"
              value={walletType}
              onChange={(e) => setWalletType(e.target.value as WalletType)}
              className="w-full h-[46px] rounded-xs border border-border-default bg-surface-card px-4 text-[14px] text-text-primary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors cursor-pointer"
            >
              <option value="metamask" className="bg-surface-card text-text-primary">MetaMask</option>
              <option value="coinbase" className="bg-surface-card text-text-primary">Coinbase Wallet</option>
              <option value="walletconnect" className="bg-surface-card text-text-primary">WalletConnect</option>
            </select>
          </div>

          {/* Código de indicação */}
          <div className="space-y-2">
            <label htmlFor="referralCode" className="block text-[14px] text-text-primary">
              Código de indicação<span className="text-coral ml-1">*</span>
            </label>
            <input
              id="referralCode"
              name="referralCode"
              type="text"
              value={referralCode}
              onChange={(e) => setReferralCode(e.target.value)}
              className="w-full h-[46px] rounded-xs border border-border-default bg-transparent px-4 text-[14px] text-text-primary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
            />
          </div>

          {/* E-mail */}
          <div className="space-y-2">
            <label htmlFor="walletEmail" className="block text-[14px] text-text-primary">
              E-mail<span className="text-coral ml-1">*</span>
            </label>
            <input
              id="walletEmail"
              name="walletEmail"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-[46px] rounded-xs border border-border-default bg-transparent px-4 text-[14px] text-text-primary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
            />
          </div>

          {/* Nome ENS */}
          <div className="space-y-2">
            <label htmlFor="walletEnsName" className="block text-[14px] text-text-primary">
              Nome ENS<span className="text-coral ml-1">*</span>
            </label>
            <div className="flex items-center gap-[10px]">
              <select
                id="walletEnsDomain"
                aria-label="Extensão ENS"
                value={ensDomain}
                onChange={(e) => setEnsDomain(e.target.value as '.eth' | '.xyz')}
                className="h-[46px] w-[78px] min-w-[78px] max-w-[78px] shrink-0 rounded-xs border border-border-default bg-surface-card px-2.5 text-[14px] text-text-secondary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors cursor-pointer"
              >
                <option value=".eth" className="bg-surface-card text-text-primary">.eth</option>
                <option value=".xyz" className="bg-surface-card text-text-primary">.xyz</option>
              </select>
              <input
                id="walletEnsName"
                name="walletEnsName"
                type="text"
                value={ensName}
                onChange={(e) => setEnsName(e.target.value)}
                aria-invalid={Boolean(fieldErrors['ensName'])}
                aria-describedby={fieldErrors['ensName'] ? 'walletEnsName-error' : undefined}
                className="w-full h-[46px] rounded-xs border border-border-default bg-transparent px-4 text-[14px] text-text-primary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors aria-[invalid=true]:border-coral"
              />
            </div>
            {fieldErrors['ensName'] && (
              <p id="walletEnsName-error" role="alert" className="text-coral text-[12px]">
                {fieldErrors['ensName']}
              </p>
            )}
          </div>
        </div>

        {/* Botão Salvar carteira */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isSaving}
            className="h-[48px] px-8 rounded-xs bg-primary text-ink hover:bg-primary-hover font-bold text-[15px] tracking-wide transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-ink disabled:opacity-50"
          >
            {isSaving ? 'Salvando...' : 'Salvar carteira'}
          </button>
        </div>
      </form>

      {/* Carteira secundária */}
      <div className="mt-8 pt-8 border-t border-border-default/50 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-[18px] font-bold text-text-primary">
              Carteira secundária
            </h2>
            <p className="mt-1 text-[14px] text-text-muted">
              {secondaryWallet
                ? `Carteira conectada: ${formatWalletAddress(secondaryWallet.address)} (${secondaryWallet.network})`
                : 'Você ainda não adicionou uma carteira secundária.'}
            </p>
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-[14px] text-text-secondary cursor-pointer">
              <input
                type="radio"
                name="secondaryWalletOption"
                onChange={() => onSelectSecondarySameAsPrimary?.()}
                className="accent-primary"
              />
              <span>Igual à carteira principal</span>
            </label>

            {!isAddingSecondary && (
              <button
                type="button"
                onClick={() => setIsAddingSecondary(true)}
                className="text-[14px] font-bold text-text-accent hover:text-primary transition-colors cursor-pointer"
              >
                Adicionar
              </button>
            )}
          </div>
        </div>

        {/* Formulário de adicionar carteira secundária */}
        {isAddingSecondary && (
          <form
            onSubmit={handleSecondarySubmit}
            className="mt-4 p-4 rounded-xs border border-border-default bg-surface-card space-y-4"
          >
            <h3 className="text-[15px] font-bold text-text-primary">
              Nova carteira secundária
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label htmlFor="secondaryAddress" className="block text-[13px] text-text-secondary">
                  Endereço hexadecimal (0x...)*
                </label>
                <input
                  id="secondaryAddress"
                  type="text"
                  value={secondaryAddress}
                  onChange={(e) => setSecondaryAddress(e.target.value)}
                  placeholder="0x..."
                  className="w-full h-[40px] rounded-xs border border-border-default bg-transparent px-3 text-[14px] text-text-primary focus:border-primary focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="secondaryNetwork" className="block text-[13px] text-text-secondary">
                  Rede*
                </label>
                <select
                  id="secondaryNetwork"
                  value={secondaryNetwork}
                  onChange={(e) => setSecondaryNetwork(e.target.value as WalletNetwork)}
                  className="w-full h-[40px] rounded-xs border border-border-default bg-surface-card px-3 text-[14px] text-text-primary focus:border-primary focus:outline-none"
                >
                  <option value="polygon">Polygon</option>
                  <option value="ethereum-mainnet">Ethereum Mainnet</option>
                  <option value="arbitrum">Arbitrum</option>
                  <option value="optimism">Optimism</option>
                  <option value="sepolia">Sepolia</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={isSaving}
                className="h-[38px] px-5 rounded-xs bg-primary text-ink hover:bg-primary-hover font-bold text-[13px] transition-colors"
              >
                Salvar secundária
              </button>
              <button
                type="button"
                onClick={() => setIsAddingSecondary(false)}
                className="h-[38px] px-4 rounded-xs border border-border-default text-text-secondary hover:text-text-primary text-[13px]"
              >
                Cancelar
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

WalletsPageContent.displayName = 'WalletsPageContent';
