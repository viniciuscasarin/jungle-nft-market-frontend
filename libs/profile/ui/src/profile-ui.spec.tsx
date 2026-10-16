import '@testing-library/jest-dom/vitest';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import {
  AccountLayout,
  AccountNavigation,
  AccountMobileHeader,
  ProfilePageContent,
} from './index';


describe('Profile UI Components (@nft/profile-ui)', () => {
  describe('AccountLayout', () => {
    it('renders sidebar, mobileHeader, and main content', () => {
      render(
        <AccountLayout
          sidebar={<div data-testid="sidebar">Sidebar Content</div>}
          mobileHeader={<div data-testid="mobile-header">Mobile Header</div>}
        >
          <div data-testid="main-content">Main Page Content</div>
        </AccountLayout>
      );

      expect(screen.getByTestId('sidebar')).toBeInTheDocument();
      expect(screen.getByTestId('mobile-header')).toBeInTheDocument();
      expect(screen.getByTestId('main-content')).toBeInTheDocument();
      expect(screen.getByTestId('account-grid-layout')).toBeInTheDocument();
    });
  });

  describe('AccountNavigation', () => {
    it('renders all menu items and calls onSelectMenu on click', () => {
      const onSelect = vi.fn();
      render(<AccountNavigation activeMenu="profile" onSelectMenu={onSelect} />);

      const profileBtn = screen.getByRole('button', { name: /dados do perfil/i });
      expect(profileBtn).toHaveAttribute('aria-current', 'page');

      const walletsBtn = screen.getByRole('button', { name: /carteiras/i });
      fireEvent.click(walletsBtn);
      expect(onSelect).toHaveBeenCalledWith('wallets');

      const logoutBtn = screen.getByRole('button', { name: /sair/i });
      fireEvent.click(logoutBtn);
      expect(onSelect).toHaveBeenCalledWith('logout');
    });
  });

  describe('AccountMobileHeader', () => {
    it('opens mobile dialog menu on trigger and calls onSelectMenu', () => {
      const onSelect = vi.fn();
      render(
        <AccountMobileHeader
          title="Dados do perfil"
          activeMenu="profile"
          onSelectMenu={onSelect}
        />
      );

      const menuBtn = screen.getByTestId('account-mobile-menu-button');
      fireEvent.click(menuBtn);

      const dialog = screen.getByTestId('account-mobile-menu-dialog');
      expect(dialog).toBeInTheDocument();

      const walletsItem = screen.getAllByRole('button', { name: /carteiras/i })[0]!;
      fireEvent.click(walletsItem);
      expect(onSelect).toHaveBeenCalledWith('wallets');
    });
  });

  describe('ProfilePageContent', () => {
    it('renders all Figma visible labels and inputs with initial values', () => {
      render(
        <ProfilePageContent
          initialValues={{
            displayName: 'Alice Silva',
            username: 'alice',
            email: 'alice@example.com',
            ensName: 'alice',
            walletNickname: 'Carteira Principal',
          }}
        />
      );

      expect(screen.getByLabelText(/nome de exibição/i)).toHaveValue('Alice Silva');
      expect(screen.getByLabelText(/nome de usuário/i)).toHaveValue('alice');
      expect(screen.getByLabelText(/e-mail/i)).toHaveValue('alice@example.com');
      expect(screen.getByLabelText(/nome ens/i)).toHaveValue('alice');
      expect(screen.getByLabelText(/apelido da carteira/i)).toHaveValue('Carteira Principal');
    });

    it('displays validation errors with aria-invalid and aria-describedby', () => {
      render(
        <ProfilePageContent
          fieldErrors={{
            email: 'Este e-mail já está em uso por outro usuário.',
          }}
          passwordFieldErrors={{
            currentPassword: 'A senha atual informada está incorreta.',
          }}
        />
      );

      const emailInput = screen.getByLabelText(/e-mail/i);
      expect(emailInput).toHaveAttribute('aria-invalid', 'true');
      expect(emailInput).toHaveAttribute('aria-describedby', 'email-error');
      expect(screen.getByText('Este e-mail já está em uso por outro usuário.')).toBeInTheDocument();

      const currentPasswordInput = screen.getByLabelText('Senha atual', { selector: 'input' });
      expect(currentPasswordInput).toHaveAttribute('aria-invalid', 'true');
      expect(currentPasswordInput).toHaveAttribute('aria-describedby', 'currentPassword-error');
      expect(screen.getByText('A senha atual informada está incorreta.')).toBeInTheDocument();

    });

    it('submits profile data on form submission', () => {
      const onSubmitProfile = vi.fn();
      render(
        <ProfilePageContent
          initialValues={{
            displayName: 'Bob Santos',
            username: 'bob',
            email: 'bob@example.com',
            ensName: 'bob',
            walletNickname: 'Bob Wallet',
          }}
          onSubmitProfile={onSubmitProfile}
        />
      );

      const saveBtn = screen.getByRole('button', { name: /^salvar$/i });
      fireEvent.click(saveBtn);

      expect(onSubmitProfile).toHaveBeenCalledWith(
        expect.objectContaining({
          displayName: 'Bob Santos',
          username: 'bob',
          email: 'bob@example.com',
          ensName: 'bob',
          walletNickname: 'Bob Wallet',
        })
      );
    });
  });
});
