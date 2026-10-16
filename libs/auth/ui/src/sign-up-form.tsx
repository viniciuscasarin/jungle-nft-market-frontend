import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { SignUpInputSchema, type SignUpInput } from '@nft/shared-contracts';
import {
  FormField,
  Input,
  Button,
  Alert,
  SocialButton,
  cn,
} from '@nft/shared-ui';
import { AuthTabs } from './auth-tabs';

export interface SignUpFormProps {
  /**
   * Callback fired when valid form data is submitted.
   */
  onSubmit: (values: SignUpInput) => void | Promise<void>;
  /**
   * Global error message (e.g. from API or network failure).
   * Rendered in a banner with role="alert".
   */
  errorMessage?: string | null | undefined;
  /**
   * Field-level errors from the API (e.g. 409 CONFLICT on email or username).
   * Automatically mapped to fields with focus set to the first error.
   */
  fieldErrors?: Record<string, string> | null | undefined;
  /**
   * Whether the sign-up operation is actively in flight.
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
   * Optional initial field values.
   */
  defaultValues?: Partial<SignUpInput> | undefined;
  /**
   * Optional callback for unsupported demonstration notices.
   */
  onNotice?: ((message: string) => void) | undefined;
  /**
   * Optional custom CSS class name for the form wrapper.
   */
  className?: string | undefined;
}

export const SignUpForm: React.FC<SignUpFormProps> = ({
  onSubmit,
  errorMessage,
  fieldErrors,
  isLoading = false,
  redirect,
  renderLink,
  defaultValues,
  onNotice,
  className,
}) => {
  const [notice, setNotice] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    setFocus,
    formState: { errors },
  } = useForm<SignUpInput>({
    resolver: zodResolver(SignUpInputSchema),
    defaultValues: {
      displayName: defaultValues?.displayName ?? '',
      username: defaultValues?.username ?? '',
      email: defaultValues?.email ?? '',
      password: defaultValues?.password ?? '',
    },
  });

  // Map API field errors (such as HTTP 409 Conflict) and focus the first invalid field
  React.useEffect(() => {
    if (fieldErrors && Object.keys(fieldErrors).length > 0) {
      const validFields: Array<keyof SignUpInput> = ['displayName', 'username', 'email', 'password'];
      let firstInvalid: keyof SignUpInput | null = null;

      for (const field of validFields) {
        const errorMsg = fieldErrors[field];
        if (errorMsg) {
          setError(field, { type: 'server', message: errorMsg });
          if (!firstInvalid) {
            firstInvalid = field;
          }
        }
      }

      if (firstInvalid) {
        setFocus(firstInvalid);
      }
    }
  }, [fieldErrors, setError, setFocus]);

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
      <AuthTabs activeTab="register" redirect={redirect} renderLink={renderLink} />

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
          id="signup-display-name"
          label="Nome de exibição"
          required
          error={errors.displayName?.message}
        >
          <Input
            type="text"
            placeholder="ex: Alice Colecionadora"
            autoComplete="name"
            disabled={isLoading}
            {...register('displayName')}
          />
        </FormField>

        <FormField
          id="signup-username"
          label="Username"
          required
          error={errors.username?.message}
        >
          <Input
            type="text"
            placeholder="alice_nft"
            autoComplete="username"
            disabled={isLoading}
            {...register('username')}
          />
        </FormField>

        <FormField
          id="signup-email"
          label="Email"
          required
          error={errors.email?.message}
        >
          <Input
            type="email"
            placeholder="seu@email.com"
            autoComplete="email"
            disabled={isLoading}
            {...register('email')}
          />
        </FormField>

        <FormField
          id="signup-password"
          label="Senha"
          required
          description="Mínimo 8 caracteres, contendo ao menos uma letra e um número"
          error={errors.password?.message}
        >
          <Input
            type="password"
            placeholder="••••••••"
            autoComplete="new-password"
            disabled={isLoading}
            {...register('password')}
          />
        </FormField>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          loading={isLoading}
          loadingLabel="Criando conta..."
          className="w-full mt-2"
        >
          Criar conta
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

SignUpForm.displayName = 'SignUpForm';
