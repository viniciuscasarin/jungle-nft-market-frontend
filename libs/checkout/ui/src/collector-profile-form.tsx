import * as React from 'react';
import { CollectorProfileData } from './types';

export interface CollectorProfileFormProps {
  initialData?: Partial<CollectorProfileData> | undefined;
  onChange?: ((data: CollectorProfileData) => void) | undefined;
  className?: string | undefined;
}

const DEFAULT_PROFILE_DATA: CollectorProfileData = {
  displayName: '',
  username: '',
  network: '',
  profileName: '',
  walletAddress: '',
  secondaryWallet: '',
  walletType: '',
  referralCode: '',
  email: '',
  ensName: '',
  useAnotherWallet: false,
  collectorNote: '',
};

/**
 * Formulário "Perfil do colecionador" da tela de Pagamento Desktop (#11:2862).
 * Contém os 10 campos em grade de duas colunas, marcador de obrigatório em coral,
 * seletor de extensão ENS (.eth), opção de carteira alternativa e observação.
 */
export const CollectorProfileForm: React.FC<CollectorProfileFormProps> = ({
  initialData,
  onChange,
  className = '',
}) => {
  const [formData, setFormData] = React.useState<CollectorProfileData>({
    ...DEFAULT_PROFILE_DATA,
    ...initialData,
  });

  const updateField = <K extends keyof CollectorProfileData>(field: K, value: CollectorProfileData[K]) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);
    onChange?.(updated);
  };

  return (
    <section
      data-testid="collector-profile-form"
      aria-label="Perfil do colecionador"
      className={`flex flex-col gap-6 font-mono ${className}`}
    >
      <h2 className="font-mono font-bold text-text-primary text-title-20 tracking-wide">
        Perfil do colecionador
      </h2>

      {/* Grade de 2 colunas para os campos de entrada */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
        {/* Campo 1: Nome de exibição* */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="display-name" className="text-body-14 text-text-primary">
            Nome de exibição<span className="text-coral ml-0.5">*</span>
          </label>
          <input
            id="display-name"
            type="text"
            value={formData.displayName}
            onChange={(e) => updateField('displayName', e.target.value)}
            className="w-full h-11 px-4 bg-surface-default border border-border-default text-body-14 text-text-primary placeholder:text-text-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-none transition-colors"
          />
        </div>

        {/* Campo 2: Nome de usuário* */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="username" className="text-body-14 text-text-primary">
            Nome de usuário<span className="text-coral ml-0.5">*</span>
          </label>
          <input
            id="username"
            type="text"
            value={formData.username}
            onChange={(e) => updateField('username', e.target.value)}
            className="w-full h-11 px-4 bg-surface-default border border-border-default text-body-14 text-text-primary placeholder:text-text-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-none transition-colors"
          />
        </div>

        {/* Campo 3: Rede * */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="network-select" className="text-body-14 text-text-primary">
            Rede <span className="text-coral ml-0.5">*</span>
          </label>
          <div className="relative">
            <select
              id="network-select"
              value={formData.network}
              onChange={(e) => updateField('network', e.target.value)}
              className="w-full h-11 px-4 bg-surface-default border border-border-default text-body-14 text-text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-none appearance-none cursor-pointer pr-10"
            >
              <option value="">Selecione uma rede</option>
              <option value="ethereum">Ethereum (Mainnet)</option>
              <option value="polygon">Polygon</option>
              <option value="solana">Solana</option>
            </select>
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="m6 9 6 6 6-6" />
              </svg>
            </div>
          </div>
        </div>

        {/* Campo 4: Nome do perfil* */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="profile-name" className="text-body-14 text-text-primary">
            Nome do perfil<span className="text-coral ml-0.5">*</span>
          </label>
          <input
            id="profile-name"
            type="text"
            value={formData.profileName}
            onChange={(e) => updateField('profileName', e.target.value)}
            className="w-full h-11 px-4 bg-surface-default border border-border-default text-body-14 text-text-primary placeholder:text-text-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-none transition-colors"
          />
        </div>

        {/* Campo 5: Endereço da carteira* */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="wallet-address" className="text-body-14 text-text-primary">
            Endereço da carteira<span className="text-coral ml-0.5">*</span>
          </label>
          <input
            id="wallet-address"
            type="text"
            placeholder="Endereço 0x da carteira"
            value={formData.walletAddress}
            onChange={(e) => updateField('walletAddress', e.target.value)}
            className="w-full h-11 px-4 bg-surface-default border border-border-default text-body-14 text-text-primary placeholder:text-text-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-none transition-colors"
          />
        </div>

        {/* Campo 6: ENS ou carteira secundária (opcional) */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="secondary-wallet" className="text-body-14 text-text-secondary">
            ENS ou carteira secundária (opcional)
          </label>
          <input
            id="secondary-wallet"
            type="text"
            value={formData.secondaryWallet}
            onChange={(e) => updateField('secondaryWallet', e.target.value)}
            className="w-full h-11 px-4 bg-surface-default border border-border-default text-body-14 text-text-primary placeholder:text-text-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-none transition-colors"
          />
        </div>

        {/* Campo 7: Tipo de carteira* */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="wallet-type-select" className="text-body-14 text-text-primary">
            Tipo de carteira<span className="text-coral ml-0.5">*</span>
          </label>
          <div className="relative">
            <select
              id="wallet-type-select"
              value={formData.walletType}
              onChange={(e) => updateField('walletType', e.target.value)}
              className="w-full h-11 px-4 bg-surface-default border border-border-default text-body-14 text-text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-none appearance-none cursor-pointer pr-10"
            >
              <option value="">Selecione uma carteira</option>
              <option value="metamask">MetaMask</option>
              <option value="coinbase">Coinbase Wallet</option>
              <option value="walletconnect">WalletConnect</option>
            </select>
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="m6 9 6 6 6-6" />
              </svg>
            </div>
          </div>
        </div>

        {/* Campo 8: Código de indicação* */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="referral-code" className="text-body-14 text-text-primary">
            Código de indicação<span className="text-coral ml-0.5">*</span>
          </label>
          <input
            id="referral-code"
            type="text"
            value={formData.referralCode}
            onChange={(e) => updateField('referralCode', e.target.value)}
            className="w-full h-11 px-4 bg-surface-default border border-border-default text-body-14 text-text-primary placeholder:text-text-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-none transition-colors"
          />
        </div>

        {/* Campo 9: E-mail* */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="profile-email" className="text-body-14 text-text-primary">
            E-mail<span className="text-coral ml-0.5">*</span>
          </label>
          <input
            id="profile-email"
            type="email"
            value={formData.email}
            onChange={(e) => updateField('email', e.target.value)}
            className="w-full h-11 px-4 bg-surface-default border border-border-default text-body-14 text-text-primary placeholder:text-text-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-none transition-colors"
          />
        </div>

        {/* Campo 10: Nome ENS * com seletor .eth anexado */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="ens-name" className="text-body-14 text-text-primary">
            Nome ENS <span className="text-coral ml-0.5">*</span>
          </label>
          <div className="flex items-center">
            <div className="h-11 px-3.5 bg-surface-raised border border-r-0 border-border-default text-text-secondary flex items-center gap-1.5 text-body-14 select-none">
              <span>.eth</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="m6 9 6 6 6-6" />
              </svg>
            </div>
            <input
              id="ens-name"
              type="text"
              value={formData.ensName}
              onChange={(e) => updateField('ensName', e.target.value)}
              className="w-full h-11 px-4 bg-surface-default border border-border-default text-body-14 text-text-primary placeholder:text-text-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-none transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Opção "Usar outra carteira?" */}
      <div className="flex items-center gap-3 pt-2">
        <button
          type="button"
          role="checkbox"
          aria-checked={formData.useAnotherWallet}
          onClick={() => updateField('useAnotherWallet', !formData.useAnotherWallet)}
          className="flex items-center gap-2.5 text-body-14 text-text-secondary hover:text-text-primary transition-colors cursor-pointer select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
        >
          <span
            className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${
              formData.useAnotherWallet
                ? 'border-accent bg-accent'
                : 'border-border-accessible bg-transparent'
            }`}
          >
            {formData.useAnotherWallet && (
              <span className="w-1.5 h-1.5 rounded-full bg-ink" />
            )}
          </span>
          <span>Usar outra carteira?</span>
        </button>
      </div>

      {/* Textarea: Observação do colecionador (opcional) */}
      <div className="flex flex-col gap-2">
        <label htmlFor="collector-note" className="text-body-14 text-text-secondary">
          Observação do colecionador (opcional)
        </label>
        <textarea
          id="collector-note"
          rows={5}
          value={formData.collectorNote}
          onChange={(e) => updateField('collectorNote', e.target.value)}
          className="w-full p-4 bg-surface-default border border-border-default text-body-14 text-text-primary placeholder:text-text-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-none transition-colors resize-none"
        />
      </div>
    </section>
  );
};
