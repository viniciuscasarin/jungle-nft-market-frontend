import * as React from 'react';
import { useShell, useSession, useUnavailable } from '@nft/shell-kit';
import { ROUTES, useNavigate } from '@nft/shared-router';
import { ApiError } from '@nft/shared-contracts';
import { clearPrivateCache, queryKeys } from '@nft/shared-query';
import { Skeleton } from '@nft/shared-ui';
import {
  AccountLayout,
  AccountNavigation,
  AccountMobileHeader,
  ProfilePageContent,
  type AccountMenuId,
} from '@nft/profile-ui';
import {
  profileToFormData,
  formDataToUpdateInput,
  type ProfileFormData,
  type PasswordFormData,
} from '@nft/profile-domain';
import {
  useProfileQuery,
  useUpdateProfile,
  useUploadAvatar,
  useDeleteAvatar,
  useChangePassword,
} from '@nft/profile-data-access';

export function ProfileFeaturePage() {
  const { httpClient, queryClient, feedback } = useShell();
  const session = useSession();
  const userId = session?.userId ?? (session as { id?: string } | null)?.id ?? 'user_alice';


  const { notifyUnavailable } = useUnavailable();

  let navigateFn: ((path: string) => void) | null = null;
  try {
    const nav = useNavigate();
    navigateFn = (path: string) => nav({ href: path });
  } catch {
    navigateFn = (path: string) => {
      if (typeof window !== 'undefined') {
        window.location.assign(path);
      }
    };
  }

  const {
    data: profile,
    isLoading,
    isError,
    refetch,
  } = useProfileQuery(httpClient, userId);

  const updateProfileMutation = useUpdateProfile(httpClient, userId);
  const uploadAvatarMutation = useUploadAvatar(httpClient, userId);
  const deleteAvatarMutation = useDeleteAvatar(httpClient, userId);
  const changePasswordMutation = useChangePassword(httpClient);

  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string>>({});
  const [passwordFieldErrors, setPasswordFieldErrors] = React.useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);
  const [passwordSuccessMessage, setPasswordSuccessMessage] = React.useState<string | null>(null);

  const handleMenuSelect = async (menuId: AccountMenuId) => {
    switch (menuId) {
      case 'profile':
        navigateFn?.(ROUTES.PROFILE);
        break;
      case 'wallets':
        navigateFn?.(ROUTES.WALLETS);
        break;
      case 'logout':
        try {
          await httpClient.post('/api/auth/logout');
        } catch {
          // ignore
        }
        clearPrivateCache(queryClient, userId);
        queryClient.removeQueries({ queryKey: queryKeys.session() });
        if (typeof window !== 'undefined') {
          window.location.assign(ROUTES.LOGIN);
        }
        break;
      case 'activity':
        notifyUnavailable('Atividade');
        break;
      case 'wishlist':
        notifyUnavailable('Lista de interesse');
        break;
      case 'offers':
        notifyUnavailable('Ofertas');
        break;
      case 'downloads':
        notifyUnavailable('Arquivos baixados');
        break;
      case 'support':
        notifyUnavailable('Suporte');
        break;
      default:
        notifyUnavailable();
        break;
    }
  };

  const handleSubmitProfile = async (formData: ProfileFormData) => {
    setFieldErrors({});
    setSuccessMessage(null);
    try {
      const input = formDataToUpdateInput(formData);
      await updateProfileMutation.mutateAsync(input);
      setSuccessMessage('Perfil atualizado com sucesso!');
      feedback.announce('Perfil atualizado com sucesso!', 'polite');
    } catch (err: unknown) {
      if (err instanceof ApiError && err.fieldErrors) {
        setFieldErrors(err.fieldErrors);
      } else {
        feedback.announce('Erro ao atualizar perfil.', 'assertive');
      }
    }
  };

  const handleSubmitPassword = async (passwordData: PasswordFormData) => {
    setPasswordFieldErrors({});
    setPasswordSuccessMessage(null);
    try {
      await changePasswordMutation.mutateAsync(passwordData);
      setPasswordSuccessMessage('Senha alterada com sucesso!');
      feedback.announce('Senha alterada com sucesso!', 'polite');
    } catch (err: unknown) {
      if (err instanceof ApiError && err.fieldErrors) {
        setPasswordFieldErrors(err.fieldErrors);
      } else {
        feedback.announce('Erro ao alterar senha.', 'assertive');
      }
    }
  };

  const handleUploadAvatar = (file: File) => {
    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      try {
        await uploadAvatarMutation.mutateAsync({ avatarUrl: dataUrl });
        feedback.announce('Avatar atualizado com sucesso!', 'polite');
      } catch {
        feedback.announce('Erro ao atualizar avatar.', 'assertive');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAvatar = async () => {
    try {
      await deleteAvatarMutation.mutateAsync();
      feedback.announce('Avatar removido com sucesso!', 'polite');
    } catch {
      feedback.announce('Erro ao remover avatar.', 'assertive');
    }
  };

  const initialFormData = React.useMemo(() => {
    return profileToFormData(profile);
  }, [profile]);

  return (
    <AccountLayout
      sidebar={
        <AccountNavigation activeMenu="profile" onSelectMenu={handleMenuSelect} />
      }
      mobileHeader={
        <AccountMobileHeader
          title="Dados do perfil"
          activeMenu="profile"
          onSelectMenu={handleMenuSelect}
        />
      }
    >
      {isLoading ? (
        <div
          data-testid="profile-loading-skeleton"
          role="status"
          aria-busy="true"
          aria-label="Carregando perfil..."
          className="space-y-6"
        >
          <Skeleton height={24} width={220} ariaLabel="Carregando título..." />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Skeleton height={46} rounded="xs" ariaLabel="Carregando campo..." />
            <Skeleton height={46} rounded="xs" ariaLabel="Carregando campo..." />
            <Skeleton height={46} rounded="xs" ariaLabel="Carregando campo..." />
            <Skeleton height={46} rounded="xs" ariaLabel="Carregando campo..." />
          </div>
        </div>
      ) : isError ? (
        <div
          data-testid="profile-error-state"
          role="alert"
          className="p-6 rounded-md border border-coral/40 bg-surface-card text-center space-y-4"
        >
          <p className="text-coral text-base font-bold">
            Não foi possível carregar os dados do perfil.
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            className="h-10 px-6 rounded-xs bg-primary text-ink font-bold hover:bg-primary-hover transition-colors cursor-pointer"
          >
            Tentar novamente
          </button>
        </div>
      ) : (
        <ProfilePageContent
          initialValues={initialFormData}
          avatarUrl={profile?.avatarUrl ?? null}
          onSubmitProfile={handleSubmitProfile}
          onSubmitPassword={handleSubmitPassword}
          onUploadAvatar={handleUploadAvatar}
          onRemoveAvatar={handleRemoveAvatar}
          isSavingProfile={updateProfileMutation.isPending}
          isSavingPassword={changePasswordMutation.isPending}
          fieldErrors={fieldErrors}
          passwordFieldErrors={passwordFieldErrors}
          successMessage={successMessage}
          passwordSuccessMessage={passwordSuccessMessage}
        />
      )}
    </AccountLayout>
  );
}
