import { render, screen, waitFor } from '@nft/shared-testing';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as React from 'react';
import { ApiError } from '@nft/shared-contracts';
import { resumeStore } from '@nft/auth-data-access';
import { AuthModalLayout } from './auth-modal-layout';
import { LoginPage } from './login-page';
import { SignUpPage } from './sign-up-page';
import { SessionController } from './session-controller';

// Mock shared-router hooks when outside RouterProvider in unit tests
vi.mock('@nft/shared-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@nft/shared-router')>();
  return {
    ...actual,
    useRouter: () => null,
    useSearch: () => ({}),
    useNavigate: () => vi.fn(),
  };
});

// Helper component to provide a mock AuthContext
const MockAuthProvider: React.FC<{
  loginMock?: ReturnType<typeof vi.fn>;
  registerMock?: ReturnType<typeof vi.fn>;
  children: React.ReactNode;
}> = ({ loginMock = vi.fn(), registerMock = vi.fn(), children }) => {
  const mockController = new SessionController({
    queryClient: { cancelQueries: vi.fn(), removeQueries: vi.fn() } as never,
    realtimeClient: { disconnect: vi.fn(), connect: vi.fn() } as never,
    tokenStore: { getToken: () => null, setToken: vi.fn(), removeToken: vi.fn() },
  });

  // Override auth context actions for test control
  const value = {
    session: null,
    user: null,
    status: 'anonymous' as const,
    controller: mockController,
    login: loginMock,
    register: registerMock,
    logout: vi.fn(),
  };

  return (
    <CustomMockContext.Provider value={value}>
      {children}
    </CustomMockContext.Provider>
  );
};

// Create a typed mock context that useAuth can read in tests
const CustomMockContext = React.createContext<{
  session: null;
  user: null;
  status: 'anonymous';
  controller: SessionController;
  login: ReturnType<typeof vi.fn>;
  register: ReturnType<typeof vi.fn>;
  logout: ReturnType<typeof vi.fn>;
} | null>(null);

// Mock useAuth from ./session-provider
vi.mock('./session-provider', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./session-provider')>();
  return {
    ...actual,
    useAuth: () => {
      const ctx = React.useContext(CustomMockContext);
      if (ctx) return ctx;
      return actual.useAuth();
    },
    useOptionalAuth: () => {
      const ctx = React.useContext(CustomMockContext);
      if (ctx) return ctx;
      return actual.useOptionalAuth();
    },
  };
});

describe('AuthModalLayout', () => {
  it('renders decorative background with aria-hidden="true" and modal content', () => {
    const handleClose = vi.fn();
    render(
      <AuthModalLayout
        title="Modal Teste"
        description="Descrição acessível do modal"
        onClose={handleClose}
      >
        <p>Conteúdo interno</p>
      </AuthModalLayout>
    );

    const bg = screen.getByTestId('auth-decorative-bg');
    expect(bg).toHaveAttribute('aria-hidden', 'true');

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Conteúdo interno')).toBeInTheDocument();
  });

  it('triggers onClose when close button is clicked', async () => {
    const handleClose = vi.fn();
    const user = userEvent.setup();

    render(
      <AuthModalLayout
        title="Modal Teste"
        description="Descrição"
        onClose={handleClose}
      >
        <p>Conteúdo</p>
      </AuthModalLayout>
    );

    const closeBtn = screen.getByRole('button', { name: /fechar modal de autenticação/i });
    await user.click(closeBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});

describe('LoginPage', () => {
  beforeEach(() => {
    resumeStore.clearContext();
    vi.clearAllMocks();
  });

  it('renders login form inside modal and shows notice when session is expired', () => {
    render(
      <MockAuthProvider>
        <LoginPage reason="expired" />
      </MockAuthProvider>
    );

    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent(/sua sessão expirou/i);
    expect(screen.getByLabelText(/email ou username/i)).toBeInTheDocument();
  });

  it('submits credentials, restores context from ResumeStore, announces success and calls onSuccess', async () => {
    const loginMock = vi.fn().mockResolvedValue({
      token: 'jwt-alice',
      user: {
        id: 'user-alice-1',
        displayName: 'Alice Colecionadora',
        username: 'alice',
        email: 'alice@example.com',
        avatarUrl: null,
        bio: null,
        createdAt: '2026-01-01T00:00:00.000Z',
      },
      expiresAt: '2026-01-01T01:00:00.000Z',
    });

    resumeStore.saveContext({
      userId: 'user-alice-1',
      path: '/checkout',
      search: '?step=review',
      drafts: { coupon: 'JUNGLE10' },
      savedAt: new Date().toISOString(),
    });

    const handleSuccess = vi.fn();
    const user = userEvent.setup();

    render(
      <MockAuthProvider loginMock={loginMock}>
        <LoginPage onSuccess={handleSuccess} />
      </MockAuthProvider>
    );

    await user.type(screen.getByLabelText(/email ou username/i), 'alice@example.com');
    await user.type(screen.getByLabelText(/senha/i), 'Password123');
    await user.click(screen.getByRole('button', { name: /^entrar$/i }));

    await waitFor(() => {
      expect(loginMock).toHaveBeenCalledWith({
        identifier: 'alice@example.com',
        password: 'Password123',
      });
      expect(handleSuccess).toHaveBeenCalledWith('/checkout?step=review');
    });

    const liveRegion = screen.getByRole('status');
    expect(liveRegion).toHaveTextContent('Login realizado com sucesso. Bem-vindo(a), Alice Colecionadora!');
  });

  it('displays generic error on UNAUTHENTICATED (401) error', async () => {
    const loginMock = vi.fn().mockRejectedValue(
      new ApiError({
        code: 'UNAUTHENTICATED',
        message: 'Invalid credentials',
        statusCode: 401,
      })
    );

    const user = userEvent.setup();

    render(
      <MockAuthProvider loginMock={loginMock}>
        <LoginPage />
      </MockAuthProvider>
    );

    await user.type(screen.getByLabelText(/email ou username/i), 'wrong@user.com');
    await user.type(screen.getByLabelText(/senha/i), 'wrongpass');
    await user.click(screen.getByRole('button', { name: /^entrar$/i }));

    await waitFor(() => {
      const alert = screen.getByRole('alert');
      expect(alert).toHaveTextContent('Credenciais inválidas. Verifique seu identificador e senha.');
    });
  });
});

describe('SignUpPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('submits valid registration, announces success and navigates to sanitized redirect', async () => {
    const registerMock = vi.fn().mockResolvedValue({
      token: 'jwt-bob',
      user: {
        id: 'user-bob-1',
        displayName: 'Bob Maker',
        username: 'bob_maker',
        email: 'bob@example.com',
        avatarUrl: null,
        bio: null,
        createdAt: '2026-01-01T00:00:00.000Z',
      },
      expiresAt: '2026-01-01T01:00:00.000Z',
    });

    const handleSuccess = vi.fn();
    const user = userEvent.setup();

    render(
      <MockAuthProvider registerMock={registerMock}>
        <SignUpPage redirect="/catalogo" onSuccess={handleSuccess} />
      </MockAuthProvider>
    );

    await user.type(screen.getByLabelText(/nome de exibição/i), 'Bob Maker');
    await user.type(screen.getByLabelText(/username/i), 'bob_maker');
    await user.type(screen.getByLabelText(/email/i), 'bob@example.com');
    await user.type(screen.getByLabelText(/senha/i), 'SecurePass1');
    await user.click(screen.getByRole('button', { name: /^criar conta$/i }));

    await waitFor(() => {
      expect(registerMock).toHaveBeenCalledWith({
        displayName: 'Bob Maker',
        username: 'bob_maker',
        email: 'bob@example.com',
        password: 'SecurePass1',
      });
      expect(handleSuccess).toHaveBeenCalledWith('/catalogo');
    });

    const liveRegion = screen.getByRole('status');
    expect(liveRegion).toHaveTextContent('Conta criada com sucesso! Bem-vindo(a) ao Jungle NFT, Bob Maker!');
  });

  it('maps 409 CONFLICT errors to form inputs', async () => {
    const registerMock = vi.fn().mockRejectedValue(
      new ApiError({
        code: 'CONFLICT',
        message: 'Conflito de cadastro',
        statusCode: 409,
        fieldErrors: {
          email: 'Este email já está registrado.',
        },
      })
    );

    const user = userEvent.setup();

    render(
      <MockAuthProvider registerMock={registerMock}>
        <SignUpPage />
      </MockAuthProvider>
    );

    await user.type(screen.getByLabelText(/nome de exibição/i), 'Bob Maker');
    await user.type(screen.getByLabelText(/username/i), 'bob_maker');
    await user.type(screen.getByLabelText(/email/i), 'bob@example.com');
    await user.type(screen.getByLabelText(/senha/i), 'SecurePass1');
    await user.click(screen.getByRole('button', { name: /^criar conta$/i }));

    expect(await screen.findByText('Este email já está registrado.')).toBeInTheDocument();
  });
});
