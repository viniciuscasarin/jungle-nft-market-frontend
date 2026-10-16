import { render, screen, waitFor } from '@nft/shared-testing';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import * as React from 'react';
import { LoginForm } from './login-form';
import { AuthTabs } from './auth-tabs';

describe('AuthTabs', () => {
  it('renders login and register tabs with correct aria-current attribute', () => {
    const { rerender } = render(<AuthTabs activeTab="login" />);

    const loginTab = screen.getByRole('link', { name: /entrar/i });
    const registerTab = screen.getByRole('link', { name: /criar conta/i });

    expect(loginTab).toHaveAttribute('aria-current', 'page');
    expect(registerTab).not.toHaveAttribute('aria-current');
    expect(loginTab).toHaveAttribute('href', '/login');
    expect(registerTab).toHaveAttribute('href', '/cadastro');

    rerender(<AuthTabs activeTab="register" />);
    expect(loginTab).not.toHaveAttribute('aria-current');
    expect(registerTab).toHaveAttribute('aria-current', 'page');
  });

  it('preserves encoded redirect parameter in tab links', () => {
    render(<AuthTabs activeTab="login" redirect="/checkout?step=review" />);

    const loginTab = screen.getByRole('link', { name: /entrar/i });
    const registerTab = screen.getByRole('link', { name: /criar conta/i });

    expect(loginTab).toHaveAttribute('href', '/login?redirect=%2Fcheckout%3Fstep%3Dreview');
    expect(registerTab).toHaveAttribute('href', '/cadastro?redirect=%2Fcheckout%3Fstep%3Dreview');
  });
});

describe('LoginForm', () => {
  it('renders form fields, labels, tabs, and action buttons', () => {
    render(<LoginForm onSubmit={vi.fn()} />);

    expect(screen.getByRole('link', { name: /entrar/i })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: /criar conta/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/email ou username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/senha/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^entrar$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /esqueceu a senha\?/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /continuar com google/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /continuar com apple/i })).toBeInTheDocument();
  });

  it('validates empty inputs on submit and displays accessible error messages', async () => {
    const handleSubmit = vi.fn();
    const user = userEvent.setup();

    render(<LoginForm onSubmit={handleSubmit} />);

    const submitButton = screen.getByRole('button', { name: /^entrar$/i });
    await user.click(submitButton);

    expect(await screen.findByText('Informe seu email ou username')).toBeInTheDocument();
    expect(await screen.findByText('Informe sua senha')).toBeInTheDocument();
    expect(handleSubmit).not.toHaveBeenCalled();

    const identifierInput = screen.getByLabelText(/email ou username/i);
    const passwordInput = screen.getByLabelText(/senha/i);

    expect(identifierInput).toHaveAttribute('aria-invalid', 'true');
    expect(identifierInput).toHaveAttribute('aria-describedby');
    expect(passwordInput).toHaveAttribute('aria-invalid', 'true');
    expect(passwordInput).toHaveAttribute('aria-describedby');
  });

  it('submits valid credentials successfully', async () => {
    const handleSubmit = vi.fn();
    const user = userEvent.setup();

    render(<LoginForm onSubmit={handleSubmit} />);

    const identifierInput = screen.getByLabelText(/email ou username/i);
    const passwordInput = screen.getByLabelText(/senha/i);

    await user.type(identifierInput, 'alice@example.com');
    await user.type(passwordInput, 'Secret123!');

    const submitButton = screen.getByRole('button', { name: /^entrar$/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(handleSubmit).toHaveBeenCalledWith({
        identifier: 'alice@example.com',
        password: 'Secret123!',
      });
    });
  });

  it('handles loading state with aria-busy and disabled controls', () => {
    render(<LoginForm onSubmit={vi.fn()} isLoading={true} />);

    const submitButton = screen.getByRole('button', { name: /entrando\.\.\./i });
    expect(submitButton).toBeDisabled();
    expect(submitButton).toHaveAttribute('aria-busy', 'true');

    const identifierInput = screen.getByLabelText(/email ou username/i);
    const passwordInput = screen.getByLabelText(/senha/i);
    expect(identifierInput).toBeDisabled();
    expect(passwordInput).toBeDisabled();
  });

  it('renders global error with role="alert", clears password and focuses it', async () => {
    const { rerender } = render(<LoginForm onSubmit={vi.fn()} />);

    const passwordInput = screen.getByLabelText(/senha/i);
    const user = userEvent.setup();
    await user.type(passwordInput, 'WrongPassword');
    expect(passwordInput).toHaveValue('WrongPassword');

    rerender(
      <LoginForm
        onSubmit={vi.fn()}
        errorMessage="Credenciais inválidas. Verifique seu identificador e senha."
      />
    );

    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent(/credenciais inválidas/i);
    expect(passwordInput).toHaveValue('');
    expect(passwordInput).toHaveFocus();
  });

  it('announces notice when clicking "Esqueceu a senha?"', async () => {
    const handleNotice = vi.fn();
    const user = userEvent.setup();

    render(<LoginForm onSubmit={vi.fn()} onNotice={handleNotice} />);

    const forgotBtn = screen.getByRole('button', { name: /esqueceu a senha\?/i });
    await user.click(forgotBtn);

    const noticeEl = screen.getByRole('status');
    expect(noticeEl).toHaveTextContent('Recuperação de senha indisponível nesta demonstração.');
    expect(handleNotice).toHaveBeenCalledWith('Recuperação de senha indisponível nesta demonstração.');
  });

  it('announces notice when clicking social login buttons', async () => {
    const handleNotice = vi.fn();
    const user = userEvent.setup();

    render(<LoginForm onSubmit={vi.fn()} onNotice={handleNotice} />);

    const googleBtn = screen.getByRole('button', { name: /continuar com google/i });
    await user.click(googleBtn);

    expect(handleNotice).toHaveBeenCalledWith('Autenticação social indisponível nesta demonstração.');
  });
});
