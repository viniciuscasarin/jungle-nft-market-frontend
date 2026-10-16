import * as React from 'react';
import { Plus } from 'lucide-react';

export const WalletsPageContent: React.FC = () => {
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
        <button
          type="button"
          className="inline-flex items-center gap-1.5 text-[15px] font-bold text-text-accent hover:text-primary transition-colors cursor-pointer self-start md:self-auto"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          <span>Adicionar</span>
        </button>
      </div>

      <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
        {/* Grid de campos da carteira principal */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
          {/* Nome de exibição */}
          <div className="space-y-2">
            <label htmlFor="walletDisplayName" className="block text-[14px] text-text-primary">
              Nome de exibição<span className="text-coral ml-1">*</span>
            </label>
            <input
              id="walletDisplayName"
              type="text"
              defaultValue="Minha MetaMask"
              className="w-full h-[46px] rounded-xs border border-border-default bg-transparent px-4 text-[14px] text-text-primary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
            />
          </div>

          {/* Apelido da carteira */}
          <div className="space-y-2">
            <label htmlFor="walletAlias" className="block text-[14px] text-text-primary">
              Apelido da carteira<span className="text-coral ml-1">*</span>
            </label>
            <input
              id="walletAlias"
              type="text"
              defaultValue="MetaMask Hot Wallet"
              className="w-full h-[46px] rounded-xs border border-border-default bg-transparent px-4 text-[14px] text-text-primary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
            />
          </div>

          {/* Rede */}
          <div className="space-y-2">
            <label htmlFor="network" className="block text-[14px] text-text-primary">
              Rede<span className="text-coral ml-1">*</span>
            </label>
            <select
              id="network"
              defaultValue="ethereum"
              className="w-full h-[46px] rounded-xs border border-border-default bg-transparent px-4 text-[14px] text-text-primary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors cursor-pointer"
            >
              <option value="ethereum" className="bg-[#140d0a] text-text-primary">Ethereum Mainnet</option>
              <option value="sepolia" className="bg-[#140d0a] text-text-primary">Sepolia Testnet</option>
              <option value="polygon" className="bg-[#140d0a] text-text-primary">Polygon</option>
            </select>
          </div>

          {/* Nome do perfil */}
          <div className="space-y-2">
            <label htmlFor="profileName" className="block text-[14px] text-text-primary">
              Nome do perfil<span className="text-coral ml-1">*</span>
            </label>
            <input
              id="profileName"
              type="text"
              defaultValue="vinicius.eth"
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
              type="text"
              defaultValue="0x71C...3948"
              className="w-full h-[46px] rounded-xs border border-border-default bg-transparent px-4 text-[14px] text-text-primary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
            />
          </div>

          {/* ENS ou carteira secundária */}
          <div className="space-y-2">
            <label htmlFor="secondaryEns" className="block text-[14px] text-text-primary">
              ENS ou carteira secundária (opcional)
            </label>
            <input
              id="secondaryEns"
              type="text"
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
              defaultValue="metamask"
              className="w-full h-[46px] rounded-xs border border-border-default bg-transparent px-4 text-[14px] text-text-primary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors cursor-pointer"
            >
              <option value="metamask" className="bg-[#140d0a] text-text-primary">MetaMask</option>
              <option value="coinbase" className="bg-[#140d0a] text-text-primary">Coinbase Wallet</option>
              <option value="walletconnect" className="bg-[#140d0a] text-text-primary">WalletConnect</option>
            </select>
          </div>

          {/* Código de indicação */}
          <div className="space-y-2">
            <label htmlFor="referralCode" className="block text-[14px] text-text-primary">
              Código de indicação<span className="text-coral ml-1">*</span>
            </label>
            <input
              id="referralCode"
              type="text"
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
              type="email"
              defaultValue="vinicius@exemplo.com"
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
                defaultValue=".eth"
                className="h-[46px] w-[78px] min-w-[78px] max-w-[78px] shrink-0 rounded-xs border border-border-default bg-transparent px-2.5 text-[14px] text-text-secondary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors cursor-pointer"
              >
                <option value=".eth" className="bg-[#140d0a] text-text-primary">.eth</option>
                <option value=".xyz" className="bg-[#140d0a] text-text-primary">.xyz</option>
              </select>
              <input
                id="walletEnsName"
                type="text"
                defaultValue="vinicius"
                className="w-full h-[46px] rounded-xs border border-border-default bg-transparent px-4 text-[14px] text-text-primary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Botão Salvar carteira */}
        <div className="pt-2">
          <button
            type="submit"
            className="h-[48px] px-8 rounded-xs bg-primary text-ink hover:bg-primary-hover font-bold text-[15px] tracking-wide transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-[#140d0a]"
          >
            Salvar carteira
          </button>
        </div>

        {/* Carteira secundária */}
        <div className="pt-8 border-t border-border-default/50 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-[18px] font-bold text-text-primary">
                Carteira secundária
              </h2>
              <p className="mt-1 text-[14px] text-text-muted">
                Você ainda não adicionou uma carteira secundária.
              </p>
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-[14px] text-text-secondary cursor-pointer">
                <input
                  type="radio"
                  name="secondaryWalletOption"
                  className="accent-primary"
                />
                <span>Igual à carteira principal</span>
              </label>

              <button
                type="button"
                className="text-[14px] font-bold text-text-accent hover:text-primary transition-colors cursor-pointer"
              >
                Adicionar
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

WalletsPageContent.displayName = 'WalletsPageContent';
