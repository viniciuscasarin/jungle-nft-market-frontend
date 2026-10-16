import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { SignInInputSchema, type SignInInput } from '@nft/shared-contracts';
import {
  FormField,
  Input,
  Button,
  Alert,
  SocialButton,
  cn,
} from '@nft/shared-ui';
import { AuthTabs } from './auth-tabs';

export interface LoginFormProps {
  /**
   * Callback fired when valid form data is submitted.
   */
  onSubmit: (values: SignInInput) => void | Promise<void>;
  /**
   * Global error message (e.g. from API 401 UNAUTHENTICATED or network failure).
   * Rendered in a banner with role="alert".
   */
  errorMessage?: string | null | undefined;
  /**
   * Whether the login operation is actively in flight.
   */
  isLoading?: boolean | undefined;
  /**
   * Redirect URL to preserve across tabs and return paths.
   */
  redirect?: string | null | undefined;
  /**
   * Optional custom link renderer for the auth tabs.
   */
  renderLink?: ((props: {
    to: string;
    active: boolean;
    children: React.ReactNode;
    className: string;
    'aria-current'?: 'page' | undefined;
  }) => React.ReactNode) | undefined;
  /**
   * Optional pre-filled identifier (email or username).
   */
  defaultIdentifier?: string | undefined;
  /**
   * Optional callback for unsupported demonstration notices.
   */
  onNotice?: ((message: string) => void) | undefined;
  /**
   * Optional custom CSS class name for the form wrapper.
   */
  className?: string | undefined;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  onSubmit,
  errorMessage,
  isLoading = false,
  redirect,
  renderLink,
  defaultIdentifier = '',
  onNotice,
  className,
}) => {
  const [notice, setNotice] = React.useState<string | null>(null);
  const passwordInputRef = React.useRef<HTMLInputElement | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<SignInInput>({
    resolver: zodResolver(SignInInputSchema),
    defaultValues: {
      identifier: defaultIdentifier,
      password: '',
    },
  });

  const { ref: passwordFormRef, ...passwordRest } = register('password');

  // When an authentication error occurs (401), clear password and refocus it
  React.useEffect(() => {
    if (errorMessage) {
      setValue('password', '');
      passwordInputRef.current?.focus();
    }
  }, [errorMessage, setValue]);

  const handleForgotPassword = (e: React.MouseEvent) => {
    e.preventDefault();
    const msg = 'Recuperação de senha indisponível nesta demonstração.';
    setNotice(msg);
    onNotice?.(msg);
  };

  const handleSocialNotice = (msg: string) => {
    setNotice(msg);
    onNotice?.(msg);
  };

  const onFormSubmit = handleSubmit((data) => {
    setNotice(null);
    return onSubmit(data);
  });

  return (
    <div className={cn('flex flex-col w-full max-w-md mx-auto font-mono', className)}>
      <AuthTabs activeTab="login" redirect={redirect} renderLink={renderLink} />

      {errorMessage && (
        <Alert
          variant="error"
          description={errorMessage}
          className="mb-4"
        />
      )}

      {notice && (
        <p
          role="status"
          aria-live="polite"
          className="text-tiny-10 text-accent bg-surface-raised p-2.5 rounded-sm border border-accent/30 text-center mb-4"
        >
          {notice}
        </p>
      )}

      <form onSubmit={onFormSubmit} noValidate className="flex flex-col gap-4">
        <FormField
          id="login-identifier"
          label="Email ou username"
          required
          error={errors.identifier?.message}
        >
          <Input
            type="text"
            placeholder="seu@email.com ou username"
            autoComplete="username"
            disabled={isLoading}
            {...register('identifier')}
          />
        </FormField>

        <FormField
          id="login-password"
          label="Senha"
          required
          error={errors.password?.message}
        >
          <Input
            ref={(node) => {
              passwordFormRef(node);
              passwordInputRef.current = node;
            }}
            type="password"
            placeholder="••••••••"
            autoComplete="current-password"
            disabled={isLoading}
            {...passwordRest}
          />
        </FormField>

        <div className="flex justify-end -mt-1">
          <button
            type="button"
            onClick={handleForgotPassword}
            className="text-caption-12 text-primary hover:text-primary-hover underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-xs cursor-pointer"
          >
            Esqueceu a senha?
          </button>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          loading={isLoading}
          loadingLabel="Entrando..."
          className="w-full mt-2"
        >
          Entrar
        </Button>
      </form>

      <div className="relative my-6 flex items-center justify-center">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border-default" />
        </div>
        <span className="relative bg-surface-card px-3 text-caption-12 text-text-muted">
          ou continue com
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <SocialButton provider="google" onNotice={handleSocialNotice} />
        <SocialButton provider="apple" onNotice={handleSocialNotice} />
      </div>
    </div>
  );
};

LoginForm.displayName = 'LoginForm';
