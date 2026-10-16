import * as React from 'react';
import { Eye, EyeOff, Image as ImageIcon } from 'lucide-react';

export const ProfilePageContent: React.FC = () => {
  const [showCurrentPassword, setShowCurrentPassword] = React.useState(false);
  const [showNewPassword, setShowNewPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

  return (
    <div className="w-full font-mono">
      {/* Título da seção */}
      <div className="mb-8">
        <h1 className="text-[16px] font-bold text-text-primary tracking-tight">
          Perfil do colecionador
        </h1>
      </div>

      <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
        {/* Grid de campos principais: 2 colunas no desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
          {/* Nome de exibição */}
          <div className="space-y-2">
            <label htmlFor="displayName" className="block text-[14px] text-text-primary">
              Nome de exibição<span className="text-coral ml-1">*</span>
            </label>
            <input
              id="displayName"
              name="displayName"
              type="text"
              defaultValue="Vinicius Casarin"
              className="w-full h-[46px] rounded-xs border border-border-default bg-transparent px-4 text-[14px] text-text-primary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
            />
          </div>

          {/* Nome de usuário */}
          <div className="space-y-2">
            <label htmlFor="username" className="block text-[14px] text-text-primary">
              Nome de usuário<span className="text-coral ml-1">*</span>
            </label>
            <input
              id="username"
              name="username"
              type="text"
              defaultValue="vinicius_casarin"
              className="w-full h-[46px] rounded-xs border border-border-default bg-transparent px-4 text-[14px] text-text-primary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
            />
          </div>

          {/* E-mail */}
          <div className="space-y-2">
            <label htmlFor="email" className="block text-[14px] text-text-primary">
              E-mail<span className="text-coral ml-1">*</span>
            </label>
            <input
              id="email"
              name="email"
              type="email"
              defaultValue="vinicius@exemplo.com"
              className="w-full h-[46px] rounded-xs border border-border-default bg-transparent px-4 text-[14px] text-text-primary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
            />
          </div>

          {/* Nome ENS */}
          <div className="space-y-2">
            <label htmlFor="ensName" className="block text-[14px] text-text-primary">
              Nome ENS<span className="text-coral ml-1">*</span>
            </label>
            <div className="flex items-center gap-[10px]">
              <select
                id="ensDomain"
                aria-label="Extensão ENS"
                defaultValue=".eth"
                className="h-[46px] w-[78px] min-w-[78px] max-w-[78px] shrink-0 rounded-xs border border-border-default bg-transparent px-2.5 text-[14px] text-text-secondary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors cursor-pointer"
              >
                <option value=".eth" className="bg-[#140d0a] text-text-primary">.eth</option>
                <option value=".xyz" className="bg-[#140d0a] text-text-primary">.xyz</option>
              </select>
              <input
                id="ensName"
                name="ensName"
                type="text"
                defaultValue="vinicius"
                className="w-full h-[46px] rounded-xs border border-border-default bg-transparent px-4 text-[14px] text-text-primary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
              />
            </div>
          </div>

          {/* Apelido da carteira */}
          <div className="space-y-2">
            <label htmlFor="walletNickname" className="block text-[14px] text-text-primary">
              Apelido da carteira<span className="text-coral ml-1">*</span>
            </label>
            <input
              id="walletNickname"
              name="walletNickname"
              type="text"
              defaultValue="Carteira Principal"
              className="w-full h-[46px] rounded-xs border border-border-default bg-transparent px-4 text-[14px] text-text-primary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
            />
          </div>

          {/* Avatar */}
          <div className="space-y-2">
            <span id="avatar-label" className="block text-[14px] text-text-primary">
              Avatar
            </span>
            <div className="flex items-center gap-4 pt-1" role="group" aria-labelledby="avatar-label">
              <div className="flex h-[46px] w-[46px] items-center justify-center rounded-full bg-[#291811] text-text-secondary">
                <ImageIcon className="h-5 w-5 text-text-secondary" aria-hidden="true" />
              </div>
              <label
                htmlFor="avatar-input"
                className="h-[40px] px-5 rounded-xs bg-primary text-ink hover:bg-primary-hover font-bold text-[14px] transition-colors cursor-pointer inline-flex items-center justify-center focus-within:ring-2 focus-within:ring-primary"
              >
                Alterar
                <input
                  id="avatar-input"
                  type="file"
                  accept="image/*"
                  className="sr-only"
                />
              </label>
              <button
                type="button"
                className="h-[40px] px-3 text-[14px] text-text-secondary hover:text-coral transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral"
              >
                Remover
              </button>
            </div>
          </div>
        </div>

        {/* Seção Alterar senha */}
        <div className="space-y-5">
          <h2 className="text-[18px] font-bold text-text-primary">
            Alterar senha
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
            {/* Senha atual */}
            <div className="space-y-2">
              <label htmlFor="currentPassword" className="block text-[14px] text-text-primary">
                Senha atual
              </label>
              <div className="relative">
                <input
                  id="currentPassword"
                  name="currentPassword"
                  type={showCurrentPassword ? 'text' : 'password'}
                  className="w-full h-[46px] rounded-xs border border-border-default bg-transparent px-4 pr-11 text-[14px] text-text-primary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword((prev) => !prev)}
                  aria-label={showCurrentPassword ? 'Ocultar senha atual' : 'Mostrar senha atual'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors cursor-pointer"
                >
                  {showCurrentPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div className="hidden md:block" />

            {/* Nova senha */}
            <div className="space-y-2">
              <label htmlFor="newPassword" className="block text-[14px] text-text-primary">
                Nova senha
              </label>
              <div className="relative">
                <input
                  id="newPassword"
                  name="newPassword"
                  type={showNewPassword ? 'text' : 'password'}
                  className="w-full h-[46px] rounded-xs border border-border-default bg-transparent px-4 pr-11 text-[14px] text-text-primary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword((prev) => !prev)}
                  aria-label={showNewPassword ? 'Ocultar nova senha' : 'Mostrar nova senha'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors cursor-pointer"
                >
                  {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div className="hidden md:block" />

            {/* Confirmar nova senha */}
            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="block text-[14px] text-text-primary">
                Confirmar nova senha
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  className="w-full h-[46px] rounded-xs border border-border-default bg-transparent px-4 pr-11 text-[14px] text-text-primary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  aria-label={showConfirmPassword ? 'Ocultar confirmação de senha' : 'Mostrar confirmação de senha'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors cursor-pointer"
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Botão Salvar */}
        <div className="pt-4">
          <button
            type="submit"
            className="h-[48px] px-10 rounded-xs bg-primary text-ink hover:bg-primary-hover font-bold text-[15px] tracking-wide transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-[#140d0a]"
          >
            Salvar
          </button>
        </div>
      </form>
    </div>
  );
};

ProfilePageContent.displayName = 'ProfilePageContent';
