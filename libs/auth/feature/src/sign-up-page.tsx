import * as React from 'react';
import { useNavigate, useRouter, useSearch, Link } from '@nft/shared-router';
import { ApiError, type SignUpInput } from '@nft/shared-contracts';
import { sanitizeRedirect } from '@nft/auth-domain';
import { SignUpForm } from '@nft/auth-ui';
import { useOptionalAuth } from './session-provider';
import { AuthModalLayout } from './auth-modal-layout';

export interface SignUpPageProps {
  /**
   * Safe redirect target path. If not provided, read from search params.
   */
  redirect?: string | null | undefined;
  /**
   * Callback fired on successful registration. If omitted, uses router navigation.
   */
  onSuccess?: ((target: string) => void) | undefined;
  /**
   * Callback fired when modal is closed. If omitted, navigates to redirect target or root.
   */
  onClose?: (() => void) | undefined;
}

export const SignUpPage: React.FC<SignUpPageProps> = ({
  redirect: propRedirect,
  onSuccess,
  onClose,
}) => {
  const searchParams =
    (useSearch({ strict: false }) as { redirect?: string } | undefined) ?? {};
  const navigate = useNavigate();
  const router = useRouter();

  const effectiveRedirect = propRedirect !== undefined ? propRedirect : searchParams.redirect;

  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string> | null>(null);
  const [announcement, setAnnouncement] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  const auth = useOptionalAuth();

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

  const handleRegisterSubmit = async (values: SignUpInput) => {
    setIsLoading(true);
    setErrorMessage(null);
    setFieldErrors(null);

    try {
      if (!auth) {
        throw new Error('Serviço de autenticação indisponível.');
      }
      const session = await auth.register(values);

      const safeTarget = sanitizeRedirect(effectiveRedirect ?? '/');
      setAnnouncement(`Conta criada com sucesso! Bem-vindo(a) ao Jungle NFT, ${session.user.displayName}!`);

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
        if (err.fieldErrors && Object.keys(err.fieldErrors).length > 0) {
          setFieldErrors(err.fieldErrors);
        } else {
          setErrorMessage(err.message || 'Erro ao realizar cadastro.');
        }
      } else if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('Erro ao realizar cadastro. Tente novamente.');
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
      title="Criar Conta"
      description="Crie sua conta para colecionar e negociar NFTs no Jungle NFT Marketplace"
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

      <SignUpForm
        onSubmit={handleRegisterSubmit}
        errorMessage={errorMessage}
        fieldErrors={fieldErrors}
        isLoading={isLoading}
        redirect={effectiveRedirect}
        renderLink={renderLink}
      />
    </AuthModalLayout>
  );
};

SignUpPage.displayName = 'SignUpPage';
