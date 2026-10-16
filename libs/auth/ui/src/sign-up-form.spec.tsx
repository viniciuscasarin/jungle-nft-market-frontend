import { render, screen, waitFor } from '@nft/shared-testing';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import * as React from 'react';
import { SignUpForm } from './sign-up-form';

describe('SignUpForm', () => {
  it('renders all form fields, labels, tabs, and action buttons', () => {
    render(<SignUpForm onSubmit={vi.fn()} />);

    expect(screen.getByRole('link', { name: /entrar/i })).not.toHaveAttribute('aria-current');
    expect(screen.getByRole('link', { name: /criar conta/i })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByLabelText(/nome de exibição/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/senha/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^criar conta$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /continuar com google/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /continuar com apple/i })).toBeInTheDocument();
  });

  it('validates empty inputs on submit and displays accessible error messages', async () => {
    const handleSubmit = vi.fn();
    const user = userEvent.setup();

    render(<SignUpForm onSubmit={handleSubmit} />);

    const submitButton = screen.getByRole('button', { name: /^criar conta$/i });
    await user.click(submitButton);

    expect(await screen.findByText('Nome de exibição é obrigatório')).toBeInTheDocument();
    expect(await screen.findByText('Username deve ter pelo menos 3 caracteres')).toBeInTheDocument();
    expect(await screen.findByText('Email inválido')).toBeInTheDocument();
    expect(await screen.findByText('Senha deve ter no mínimo 8 caracteres')).toBeInTheDocument();
    expect(handleSubmit).not.toHaveBeenCalled();

    const nameInput = screen.getByLabelText(/nome de exibição/i);
    expect(nameInput).toHaveAttribute('aria-invalid', 'true');
    expect(nameInput).toHaveAttribute('aria-describedby');
  });

  it('enforces password rules (at least 8 chars, 1 letter, 1 number)', async () => {
    const handleSubmit = vi.fn();
    const user = userEvent.setup();

    render(<SignUpForm onSubmit={handleSubmit} />);

    const passwordInput = screen.getByLabelText(/senha/i);
    const submitButton = screen.getByRole('button', { name: /^criar conta$/i });

    // Less than 8 characters
    await user.type(passwordInput, 'Abc1');
    await user.click(submitButton);
    expect(await screen.findByText('Senha deve ter no mínimo 8 caracteres')).toBeInTheDocument();

    // No letters (only numbers)
    await user.clear(passwordInput);
    await user.type(passwordInput, '12345678');
    await user.click(submitButton);
    expect(await screen.findByText('Senha deve conter pelo menos uma letra')).toBeInTheDocument();

    // No numbers (only letters)
    await user.clear(passwordInput);
    await user.type(passwordInput, 'Abcdefgh');
    await user.click(submitButton);
    expect(await screen.findByText('Senha deve conter pelo menos um número')).toBeInTheDocument();

    expect(handleSubmit).not.toHaveBeenCalled();
  });

  it('submits valid registration details successfully', async () => {
    const handleSubmit = vi.fn();
    const user = userEvent.setup();

    render(<SignUpForm onSubmit={handleSubmit} />);

    await user.type(screen.getByLabelText(/nome de exibição/i), 'Alice Wonder');
    await user.type(screen.getByLabelText(/username/i), 'alice_123');
    await user.type(screen.getByLabelText(/email/i), 'alice@example.com');
    await user.type(screen.getByLabelText(/senha/i), 'Password123');

    await user.click(screen.getByRole('button', { name: /^criar conta$/i }));

    await waitFor(() => {
      expect(handleSubmit).toHaveBeenCalledWith({
        displayName: 'Alice Wonder',
        username: 'alice_123',
        email: 'alice@example.com',
        password: 'Password123',
      });
    });
  });

  it('maps 409 CONFLICT field errors from the API and focuses the first invalid field', async () => {
    const { rerender } = render(<SignUpForm onSubmit={vi.fn()} />);

    rerender(
      <SignUpForm
        onSubmit={vi.fn()}
        fieldErrors={{
          username: 'Username já está em uso.',
          email: 'Este email já está cadastrado.',
        }}
      />
    );

    expect(await screen.findByText('Username já está em uso.')).toBeInTheDocument();
    expect(await screen.findByText('Este email já está cadastrado.')).toBeInTheDocument();

    const usernameInput = screen.getByLabelText(/username/i);
    const emailInput = screen.getByLabelText(/email/i);

    expect(usernameInput).toHaveAttribute('aria-invalid', 'true');
    expect(emailInput).toHaveAttribute('aria-invalid', 'true');
    // First invalid field should have received focus
    expect(usernameInput).toHaveFocus();
  });

  it('handles loading state with aria-busy and disabled inputs', () => {
    render(<SignUpForm onSubmit={vi.fn()} isLoading={true} />);

    const submitBtn = screen.getByRole('button', { name: /criando conta\.\.\./i });
    expect(submitBtn).toBeDisabled();
    expect(submitBtn).toHaveAttribute('aria-busy', 'true');

    expect(screen.getByLabelText(/nome de exibição/i)).toBeDisabled();
    expect(screen.getByLabelText(/username/i)).toBeDisabled();
    expect(screen.getByLabelText(/email/i)).toBeDisabled();
    expect(screen.getByLabelText(/senha/i)).toBeDisabled();
  });

  it('renders global error with role="alert"', () => {
    render(
      <SignUpForm
        onSubmit={vi.fn()}
        errorMessage="Ocorreu um erro no servidor. Tente novamente."
      />
    );

    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent(/ocorreu um erro no servidor/i);
  });
});
