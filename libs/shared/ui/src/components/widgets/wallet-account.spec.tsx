import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import * as React from 'react';
import { WalletOption } from './wallet-option';
import { WalletCard } from './wallet-card';
import { SocialButton } from './social-button';
import { AccountSidebar } from './account-sidebar';
import { ModalLayout } from './modal-layout';
import { IconMetamask } from '../../icons/IconMetamask';

describe('Wallet, Account & Modal Widgets', () => {
  describe('WalletOption', () => {
    it('renders radio card with wallet icon, title and description', () => {
      const handleChange = vi.fn();
      render(
        <WalletOption
          id="opt-metamask"
          name="wallet"
          value="metamask"
          title="MetaMask"
          description="Conecte-se usando a extensão do navegador"
          icon={<IconMetamask className="h-6 w-6" />}
          badge="Popular"
          onChange={handleChange}
        />
      );

      const radio = screen.getByRole('radio');
      expect(radio).not.toBeChecked();
      expect(screen.getByText('MetaMask')).toBeInTheDocument();
      expect(screen.getByText(/extensão do navegador/i)).toBeInTheDocument();
      expect(screen.getByText('Popular')).toBeInTheDocument();

      fireEvent.click(radio);
      expect(handleChange).toHaveBeenCalled();
    });
  });

  describe('WalletCard', () => {
    it('renders wallet details, ETH balance and handles copy address', () => {
      const handleCopy = vi.fn();
      const handleSetDefault = vi.fn();
      const handleDisconnect = vi.fn();

      render(
        <WalletCard
          address="0x71C...4982"
          fullAddress="0x71C0000000000000000000000000000000004982"
          walletName="MetaMask Principal"
          balanceEth="3.8421"
          isDefault={false}
          onCopyAddress={handleCopy}
          onSetDefault={handleSetDefault}
          onDisconnect={handleDisconnect}
        />
      );

      expect(screen.getByText('MetaMask Principal')).toBeInTheDocument();
      expect(screen.getByText('0x71C...4982')).toBeInTheDocument();
      expect(screen.getByText('3.8421 ETH')).toBeInTheDocument();

      const copyBtn = screen.getByRole('button', { name: 'Copiar endereço da carteira' });
      fireEvent.click(copyBtn);
      expect(handleCopy).toHaveBeenCalledWith('0x71C0000000000000000000000000000000004982');

      const setDefaultBtn = screen.getByRole('button', { name: 'Definir Principal' });
      fireEvent.click(setDefaultBtn);
      expect(handleSetDefault).toHaveBeenCalledWith('0x71C...4982');

      const disconnectBtn = screen.getByRole('button', { name: 'Desconectar' });
      fireEvent.click(disconnectBtn);
      expect(handleDisconnect).toHaveBeenCalledWith('0x71C...4982');
    });

    it('displays Principal badge when isDefault is true', () => {
      render(
        <WalletCard
          address="0x123...456"
          walletName="Coinbase"
          isDefault={true}
        />
      );

      expect(screen.getByText('Principal')).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Definir Principal' })).not.toBeInTheDocument();
    });
  });

  describe('SocialButton', () => {
    it('renders provider button and triggers onUnavailable on click without local live region', () => {
      const handleUnavailable = vi.fn();
      const handleNotice = vi.fn();
      render(
        <SocialButton
          provider="google"
          noticeText="Login com Google indisponível nesta demonstração."
          onUnavailable={handleUnavailable}
          onNotice={handleNotice}
        />
      );

      const btn = screen.getByRole('button', { name: 'Continuar com Google' });
      expect(btn).toBeInTheDocument();

      fireEvent.click(btn);
      expect(handleUnavailable).toHaveBeenCalledWith('Continuar com Google');
      expect(handleNotice).toHaveBeenCalledWith('Login com Google indisponível nesta demonstração.');
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });
  });

  describe('AccountSidebar', () => {
    it('renders user info, active nav item and handles logout', () => {
      const handleNavigate = vi.fn();
      const handleLogout = vi.fn();

      render(
        <AccountSidebar
          user={{
            name: 'Bob Ross',
            email: 'bob@example.com',
          }}
          activePath="/carteiras"
          onNavigate={handleNavigate}
          onLogout={handleLogout}
        />
      );

      expect(screen.getByText('Bob Ross')).toBeInTheDocument();
      expect(screen.getByText('bob@example.com')).toBeInTheDocument();

      const walletsLink = screen.getByRole('link', { name: /minhas carteiras/i });
      expect(walletsLink).toHaveAttribute('aria-current', 'page');
      expect(walletsLink.className).toContain('text-primary');

      const profileLink = screen.getByRole('link', { name: /meu perfil/i });
      fireEvent.click(profileLink);
      expect(handleNavigate).toHaveBeenCalledWith('/perfil');

      const logoutBtn = screen.getByRole('button', { name: /encerrar sessão/i });
      fireEvent.click(logoutBtn);
      expect(handleLogout).toHaveBeenCalledTimes(1);
    });
  });

  describe('ModalLayout', () => {
    it('renders dialog container with title, subtitle and close action', () => {
      const handleClose = vi.fn();
      render(
        <ModalLayout
          title="Conectar Carteira"
          subtitle="Escolha sua carteira favorita para continuar"
          onClose={handleClose}
          footer={<span>Precisa de ajuda? Acesse o guia</span>}
        >
          <div>Opções de carteira aqui</div>
        </ModalLayout>
      );

      expect(screen.getByRole('dialog', { name: 'Conectar Carteira' })).toBeInTheDocument();
      expect(screen.getByText('Conectar Carteira')).toBeInTheDocument();
      expect(screen.getByText('Escolha sua carteira favorita para continuar')).toBeInTheDocument();
      expect(screen.getByText('Opções de carteira aqui')).toBeInTheDocument();
      expect(screen.getByText('Precisa de ajuda? Acesse o guia')).toBeInTheDocument();

      const closeBtn = screen.getByRole('button', { name: 'Fechar janela' });
      fireEvent.click(closeBtn);
      expect(handleClose).toHaveBeenCalledTimes(1);
    });
  });
});
