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
  type AccountMenuId,
} from '@nft/profile-ui';
import { WalletsPageContent } from '@nft/wallets-ui';
import {
  type WalletFormData,
  formDataToCreateWalletInput,
} from '@nft/wallets-domain';
import {
  useWalletsQuery,
  useSaveWallet,
  useSaveSecondaryWallet,
} from '@nft/wallets-data-access';

export function WalletsFeaturePage() {
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
    data: userWallets,
    isLoading,
    isError,
    refetch,
  } = useWalletsQuery(httpClient, userId);

  const saveWalletMutation = useSaveWallet(httpClient, userId);
  const saveSecondaryWalletMutation = useSaveSecondaryWallet(httpClient, userId);

  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);

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

  const handleSavePrimaryWallet = async (formData: WalletFormData) => {
    setFieldErrors({});
    setSuccessMessage(null);
    try {
      const input = formDataToCreateWalletInput(formData, true);
      await saveWalletMutation.mutateAsync(input);
      setSuccessMessage('Carteira principal salva com sucesso!');
      feedback.announce('Carteira principal salva com sucesso!', 'polite');
    } catch (err: unknown) {
      if (err instanceof ApiError && err.fieldErrors) {
        setFieldErrors(err.fieldErrors);
      } else {
        feedback.announce('Erro ao salvar carteira principal.', 'assertive');
      }
    }
  };

  const handleSaveSecondaryWallet = async (formData: WalletFormData) => {
    setFieldErrors({});
    setSuccessMessage(null);
    try {
      const input = formDataToCreateWalletInput(formData, false);
      await saveSecondaryWalletMutation.mutateAsync(input);
      setSuccessMessage('Carteira secundária salva com sucesso!');
      feedback.announce('Carteira secundária salva com sucesso!', 'polite');
    } catch (err: unknown) {
      if (err instanceof ApiError && err.fieldErrors) {
        setFieldErrors(err.fieldErrors);
      } else {
        feedback.announce('Erro ao salvar carteira secundária.', 'assertive');
      }
    }
  };

  const handleSelectSecondarySameAsPrimary = async () => {
    if (!userWallets?.primary) return;
    try {
      await saveSecondaryWalletMutation.mutateAsync({
        address: userWallets.primary.address,
        network: userWallets.primary.network,
        walletType: userWallets.primary.walletType ?? 'metamask',
        ensName: userWallets.primary.ensName ?? null,
        label: 'Secundária (Igual à principal)',
        displayName: userWallets.primary.displayName ?? null,
        email: userWallets.primary.email ?? null,
        referralCode: null,
        notes: 'Clonada da carteira principal',
        isPrimary: false,
      });
      setSuccessMessage('Carteira secundária configurada igual à principal!');
      feedback.announce('Carteira secundária configurada igual à principal!', 'polite');
    } catch {
      feedback.announce('Erro ao configurar carteira secundária.', 'assertive');
    }
  };

  return (
    <AccountLayout
      sidebar={
        <AccountNavigation activeMenu="wallets" onSelectMenu={handleMenuSelect} />
      }
      mobileHeader={
        <AccountMobileHeader
          title="Carteiras"
          activeMenu="wallets"
          onSelectMenu={handleMenuSelect}
        />
      }
    >
      {isLoading ? (
        <div
          data-testid="wallets-loading-skeleton"
          role="status"
          aria-busy="true"
          aria-label="Carregando carteiras..."
          className="space-y-6"
        >
          <Skeleton height={24} width={200} ariaLabel="Carregando título..." />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Skeleton height={46} rounded="xs" ariaLabel="Carregando campo..." />
            <Skeleton height={46} rounded="xs" ariaLabel="Carregando campo..." />
            <Skeleton height={46} rounded="xs" ariaLabel="Carregando campo..." />
            <Skeleton height={46} rounded="xs" ariaLabel="Carregando campo..." />
          </div>
        </div>
      ) : isError ? (
        <div
          data-testid="wallets-error-state"
          role="alert"
          className="p-6 rounded-md border border-coral/40 bg-surface-card text-center space-y-4"
        >
          <p className="text-coral text-base font-bold">
            Não foi possível carregar as carteiras conectadas.
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
        <WalletsPageContent
          primaryWallet={userWallets?.primary ?? null}
          secondaryWallet={userWallets?.secondary ?? null}
          onSubmitPrimaryWallet={handleSavePrimaryWallet}
          onSubmitSecondaryWallet={handleSaveSecondaryWallet}
          onSelectSecondarySameAsPrimary={handleSelectSecondarySameAsPrimary}
          isSaving={saveWalletMutation.isPending || saveSecondaryWalletMutation.isPending}
          fieldErrors={fieldErrors}
          successMessage={successMessage}
        />
      )}
    </AccountLayout>
  );
}
