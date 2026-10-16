import * as React from 'react';
import { useNavigate, useRouter, useSearch, Link } from '@nft/shared-router';
import { ApiError } from '@nft/shared-contracts';
import { sanitizeRedirect } from '@nft/auth-domain';
import { resumeStore } from '@nft/auth-data-access';
import { LoginForm } from '@nft/auth-ui';
import { useOptionalAuth } from './session-provider';
import { AuthModalLayout } from './auth-modal-layout';

export interface LoginPageProps {
  /**
   * Safe redirect target path. If not provided, read from search params.
   */
  redirect?: string | null | undefined;
  /**
   * Reason for showing login page (e.g. 'expired'). If not provided, read from search params.
   */
  reason?: string | null | undefined;
  /**
   * Callback fired on successful login. If omitted, uses router navigation.
   */
  onSuccess?: ((target: string) => void) | undefined;
  /**
   * Callback fired when modal is closed. If omitted, navigates to redirect target or root.
   */
  onClose?: (() => void) | undefined;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  redirect: propRedirect,
  reason: propReason,
  onSuccess,
  onClose,
}) => {
  const searchParams =
    (useSearch({ strict: false }) as { redirect?: string; reason?: string } | undefined) ?? {};
  const navigate = useNavigate();
  const router = useRouter();

  const effectiveRedirect = propRedirect !== undefined ? propRedirect : searchParams.redirect;
  const effectiveReason = propReason !== undefined ? propReason : searchParams.reason;

  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [announcement, setAnnouncement] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  const auth = useOptionalAuth();

  // If reason is expired, notify user with accessible message
  React.useEffect(() => {
    if (effectiveReason === 'expired') {
      setErrorMessage('Sua sessão expirou. Faça login novamente para continuar.');
    }
  }, [effectiveReason]);

  const handleClose = () => {
    if (onClose) {
      onClose();
      return;
    }

    const safeFallback = sanitizeRedirect(effectiveRedirect ?? '/');
    const path = safeFallback.split('?')[0] ?? '/';
    const searchStr = safeFallback.split('?')[1];
    const searchObj = searchStr
      ? Object.fromEntries(new URLSearchParams(searchStr).entries())
      : undefined;

    const isInsideRouter = Boolean(router && typeof router.buildLocation === 'function');
    if (isInsideRouter) {
      if (searchObj) {
        navigate({ to: path, search: searchObj as never });
      } else {
        navigate({ to: path as never });
      }
    } else if (typeof window !== 'undefined') {
      window.location.href = safeFallback;
    }
  };

  const handleLoginSubmit = async (credentials: { identifier: string; password: string }) => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      if (!auth) {
        throw new Error('Serviço de autenticação indisponível.');
      }
      const session = await auth.login(credentials);

      // Check for saved context in ResumeStore
      const restored = resumeStore.restoreForUser(session.user.id);
      const targetCandidate = restored
        ? `${restored.path}${restored.search || ''}`
        : effectiveRedirect ?? '/';

      const safeTarget = sanitizeRedirect(targetCandidate);
      setAnnouncement(`Login realizado com sucesso. Bem-vindo(a), ${session.user.displayName}!`);

      if (onSuccess) {
        onSuccess(safeTarget);
      } else {
        const path = safeTarget.split('?')[0] ?? '/';
        const searchStr = safeTarget.split('?')[1];
        const searchObj = searchStr
          ? Object.fromEntries(new URLSearchParams(searchStr).entries())
          : undefined;

        const isInsideRouter = Boolean(router && typeof router.buildLocation === 'function');
        if (isInsideRouter) {
          if (searchObj) {
            navigate({ to: path, search: searchObj as never });
          } else {
            navigate({ to: path as never });
          }
        } else if (typeof window !== 'undefined') {
          window.location.href = safeTarget;
        }
      }
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        if (err.code === 'UNAUTHENTICATED') {
          setErrorMessage('Credenciais inválidas. Verifique seu identificador e senha.');
        } else {
          setErrorMessage(err.message || 'Erro ao realizar login.');
        }
      } else if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('Erro ao realizar login. Tente novamente.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const isInsideRouter = Boolean(router && typeof router.buildLocation === 'function');

  const renderLink = isInsideRouter
    ? ({
        to,
        children,
        className,
        'aria-current': ariaCurrent,
      }: {
        to: string;
        active: boolean;
        children: React.ReactNode;
        className: string;
        'aria-current'?: 'page' | undefined;
      }) => {
        const path = to.split('?')[0] ?? '/';
        const searchStr = to.split('?')[1];
        const searchObj = searchStr
          ? Object.fromEntries(new URLSearchParams(searchStr).entries())
          : undefined;

        if (searchObj) {
          return (
            <Link
              to={path}
              search={searchObj}
              aria-current={ariaCurrent}
              className={className}
            >
              {children}
            </Link>
          );
        }

        return (
          <Link
            to={path}
            aria-current={ariaCurrent}
            className={className}
          >
            {children}
          </Link>
        );
      }
    : undefined;

  return (
    <AuthModalLayout
      title="Entrar na Conta"
      description="Informe suas credenciais para acessar sua conta no Jungle NFT Marketplace"
      onClose={handleClose}
    >
      {announcement && (
        <div
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className="sr-only"
        >
          {announcement}
        </div>
      )}

      <LoginForm
        onSubmit={handleLoginSubmit}
        errorMessage={errorMessage}
        isLoading={isLoading}
        redirect={effectiveRedirect}
        renderLink={renderLink}
      />
    </AuthModalLayout>
  );
};

LoginPage.displayName = 'LoginPage';
