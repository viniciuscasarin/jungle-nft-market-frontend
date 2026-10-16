import * as React from 'react';
import { Eye, EyeOff, Image as ImageIcon } from 'lucide-react';
import type { ProfileFormData, PasswordFormData } from '@nft/profile-domain';

export interface ProfilePageContentProps {
  initialValues?: Partial<ProfileFormData>;
  avatarUrl?: string | null;
  onSubmitProfile?: (data: ProfileFormData) => Promise<void> | void;
  onSubmitPassword?: (data: PasswordFormData) => Promise<void> | void;
  onUploadAvatar?: (file: File) => Promise<void> | void;
  onRemoveAvatar?: () => Promise<void> | void;
  isSavingProfile?: boolean;
  isSavingPassword?: boolean;
  fieldErrors?: Record<string, string>;
  passwordFieldErrors?: Record<string, string>;
  successMessage?: string | null;
  passwordSuccessMessage?: string | null;
}

export const ProfilePageContent: React.FC<ProfilePageContentProps> = ({
  initialValues,
  avatarUrl,
  onSubmitProfile,
  onSubmitPassword,
  onUploadAvatar,
  onRemoveAvatar,
  isSavingProfile = false,
  isSavingPassword = false,
  fieldErrors = {},
  passwordFieldErrors = {},
  successMessage,
  passwordSuccessMessage,
}) => {
  const [showCurrentPassword, setShowCurrentPassword] = React.useState(false);
  const [showNewPassword, setShowNewPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

  // Form states
  const [displayName, setDisplayName] = React.useState(initialValues?.displayName ?? '');
  const [username, setUsername] = React.useState(initialValues?.username ?? '');
  const [email, setEmail] = React.useState(initialValues?.email ?? '');
  const [ensName, setEnsName] = React.useState(initialValues?.ensName ?? '');
  const [ensDomain, setEnsDomain] = React.useState<'.eth' | '.xyz'>(initialValues?.ensDomain ?? '.eth');
  const [walletNickname, setWalletNickname] = React.useState(initialValues?.walletNickname ?? 'Carteira Principal');
  const [bio, setBio] = React.useState(initialValues?.bio ?? '');

  // Password states
  const [currentPassword, setCurrentPassword] = React.useState('');
  const [newPassword, setNewPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');

  React.useEffect(() => {
    if (initialValues) {
      if (initialValues.displayName !== undefined) setDisplayName(initialValues.displayName);
      if (initialValues.username !== undefined) setUsername(initialValues.username);
      if (initialValues.email !== undefined) setEmail(initialValues.email);
      if (initialValues.ensName !== undefined) setEnsName(initialValues.ensName);
      if (initialValues.ensDomain !== undefined) setEnsDomain(initialValues.ensDomain);
      if (initialValues.walletNickname !== undefined) setWalletNickname(initialValues.walletNickname);
      if (initialValues.bio !== undefined) setBio(initialValues.bio ?? '');
    }
  }, [initialValues]);

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmitProfile?.({
      displayName,
      username,
      email,
      ensName,
      ensDomain,
      walletNickname,
      bio,
    });
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmitPassword?.({
      currentPassword,
      newPassword,
      confirmPassword,
    });
  };

  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUploadAvatar?.(file);
    }
  };

  return (
    <div className="w-full font-mono">
      {/* Título da seção */}
      <div className="mb-8">
        <h1 className="text-[16px] font-bold text-text-primary tracking-tight">
          Perfil do colecionador
        </h1>
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

      {/* Formulário de Perfil */}
      <form onSubmit={handleProfileSubmit} className="space-y-6" noValidate>
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

          {/* Nome de usuário */}
          <div className="space-y-2">
            <label htmlFor="username" className="block text-[14px] text-text-primary">
              Nome de usuário<span className="text-coral ml-1">*</span>
            </label>
            <input
              id="username"
              name="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              aria-invalid={Boolean(fieldErrors['username'])}
              aria-describedby={fieldErrors['username'] ? 'username-error' : undefined}
              className="w-full h-[46px] rounded-xs border border-border-default bg-transparent px-4 text-[14px] text-text-primary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors aria-[invalid=true]:border-coral"
            />
            {fieldErrors['username'] && (
              <p id="username-error" role="alert" className="text-coral text-[12px]">
                {fieldErrors['username']}
              </p>
            )}
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
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-invalid={Boolean(fieldErrors['email'])}
              aria-describedby={fieldErrors['email'] ? 'email-error' : undefined}
              className="w-full h-[46px] rounded-xs border border-border-default bg-transparent px-4 text-[14px] text-text-primary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors aria-[invalid=true]:border-coral"
            />
            {fieldErrors['email'] && (
              <p id="email-error" role="alert" className="text-coral text-[12px]">
                {fieldErrors['email']}
              </p>
            )}
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
                value={ensDomain}
                onChange={(e) => setEnsDomain(e.target.value as '.eth' | '.xyz')}
                className="h-[46px] w-[78px] min-w-[78px] max-w-[78px] shrink-0 rounded-xs border border-border-default bg-surface-card px-2.5 text-[14px] text-text-secondary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors cursor-pointer"
              >
                <option value=".eth" className="bg-surface-card text-text-primary">.eth</option>
                <option value=".xyz" className="bg-surface-card text-text-primary">.xyz</option>
              </select>
              <input
                id="ensName"
                name="ensName"
                type="text"
                value={ensName}
                onChange={(e) => setEnsName(e.target.value)}
                aria-invalid={Boolean(fieldErrors['ensName'])}
                aria-describedby={fieldErrors['ensName'] ? 'ensName-error' : undefined}
                className="w-full h-[46px] rounded-xs border border-border-default bg-transparent px-4 text-[14px] text-text-primary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors aria-[invalid=true]:border-coral"
              />
            </div>
            {fieldErrors['ensName'] && (
              <p id="ensName-error" role="alert" className="text-coral text-[12px]">
                {fieldErrors['ensName']}
              </p>
            )}
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
              value={walletNickname}
              onChange={(e) => setWalletNickname(e.target.value)}
              aria-invalid={Boolean(fieldErrors['walletNickname'])}
              aria-describedby={fieldErrors['walletNickname'] ? 'walletNickname-error' : undefined}
              className="w-full h-[46px] rounded-xs border border-border-default bg-transparent px-4 text-[14px] text-text-primary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors aria-[invalid=true]:border-coral"
            />
            {fieldErrors['walletNickname'] && (
              <p id="walletNickname-error" role="alert" className="text-coral text-[12px]">
                {fieldErrors['walletNickname']}
              </p>
            )}
          </div>

          {/* Avatar */}
          <div className="space-y-2">
            <span id="avatar-label" className="block text-[14px] text-text-primary">
              Avatar
            </span>
            <div className="flex items-center gap-4 pt-1" role="group" aria-labelledby="avatar-label">
              <div className="flex h-[46px] w-[46px] items-center justify-center rounded-full bg-surface-raised text-text-secondary overflow-hidden">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="Avatar do perfil"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <ImageIcon className="h-5 w-5 text-text-secondary" aria-hidden="true" />
                )}
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
                  onChange={handleAvatarFileChange}
                  className="sr-only"
                />
              </label>
              <button
                type="button"
                onClick={() => onRemoveAvatar?.()}
                className="h-[40px] px-3 text-[14px] text-text-secondary hover:text-coral transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral"
              >
                Remover
              </button>
            </div>
          </div>
        </div>

        {/* Botão Salvar Perfil */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isSavingProfile}
            className="h-[48px] px-10 rounded-xs bg-primary text-ink hover:bg-primary-hover font-bold text-[15px] tracking-wide transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-ink disabled:opacity-50"
          >
            {isSavingProfile ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </form>

      {/* Seção Alterar senha */}
      <form onSubmit={handlePasswordSubmit} className="mt-12 space-y-5" noValidate>
        <h2 className="text-[18px] font-bold text-text-primary">
          Alterar senha
        </h2>

        {passwordSuccessMessage && (
          <div
            role="status"
            aria-live="polite"
            className="p-4 rounded-xs border border-primary/40 bg-surface-raised text-primary text-[14px]"
          >
            {passwordSuccessMessage}
          </div>
        )}

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
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                aria-invalid={Boolean(passwordFieldErrors['currentPassword'])}
                aria-describedby={passwordFieldErrors['currentPassword'] ? 'currentPassword-error' : undefined}
                className="w-full h-[46px] rounded-xs border border-border-default bg-transparent px-4 pr-11 text-[14px] text-text-primary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors aria-[invalid=true]:border-coral"
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
            {passwordFieldErrors['currentPassword'] && (
              <p id="currentPassword-error" role="alert" className="text-coral text-[12px]">
                {passwordFieldErrors['currentPassword']}
              </p>
            )}
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
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                aria-invalid={Boolean(passwordFieldErrors['newPassword'])}
                aria-describedby={passwordFieldErrors['newPassword'] ? 'newPassword-error' : undefined}
                className="w-full h-[46px] rounded-xs border border-border-default bg-transparent px-4 pr-11 text-[14px] text-text-primary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors aria-[invalid=true]:border-coral"
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
            {passwordFieldErrors['newPassword'] && (
              <p id="newPassword-error" role="alert" className="text-coral text-[12px]">
                {passwordFieldErrors['newPassword']}
              </p>
            )}
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
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                aria-invalid={Boolean(passwordFieldErrors['confirmPassword'])}
                aria-describedby={passwordFieldErrors['confirmPassword'] ? 'confirmPassword-error' : undefined}
                className="w-full h-[46px] rounded-xs border border-border-default bg-transparent px-4 pr-11 text-[14px] text-text-primary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors aria-[invalid=true]:border-coral"
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
            {passwordFieldErrors['confirmPassword'] && (
              <p id="confirmPassword-error" role="alert" className="text-coral text-[12px]">
                {passwordFieldErrors['confirmPassword']}
              </p>
            )}
          </div>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={isSavingPassword}
            className="h-[48px] px-8 rounded-xs bg-surface-card border border-border-default hover:border-primary text-text-primary font-bold text-[14px] tracking-wide transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50"
          >
            {isSavingPassword ? 'Atualizando...' : 'Alterar senha'}
          </button>
        </div>
      </form>
    </div>
  );
};

ProfilePageContent.displayName = 'ProfilePageContent';
