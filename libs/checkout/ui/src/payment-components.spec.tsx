import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import * as React from 'react';
import {
  CollectorProfileForm,
  CheckoutNftsSummary,
  WalletAndNetworkSelector,
  ConnectedWalletsSection,
  PaymentPageContent,
  OrderConfirmationModal,
} from './index';

describe('Payment & Checkout UI Components', () => {
  describe('CollectorProfileForm', () => {
    it('renders all form fields with labels and required markers', () => {
      const onChange = vi.fn();
      render(<CollectorProfileForm onChange={onChange} />);

      expect(screen.getByText('Perfil do colecionador')).toBeInTheDocument();
      expect(screen.getByLabelText(/Nome de exibição/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Nome de usuário/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Rede/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Endereço da carteira/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Tipo de carteira/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Nome ENS/)).toBeInTheDocument();

      const input = screen.getByLabelText(/Nome de exibição/);
      fireEvent.change(input, { target: { value: 'Vinicius Casarin' } });
      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({ displayName: 'Vinicius Casarin' })
      );

      const anotherWalletBtn = screen.getByRole('checkbox', { name: 'Usar outra carteira?' });
      fireEvent.click(anotherWalletBtn);
      expect(anotherWalletBtn).toHaveAttribute('aria-checked', 'true');
    });
  });

  describe('CheckoutNftsSummary', () => {
    it('renders acquired NFTs, subtotal, discount, fee, and total', () => {
      render(<CheckoutNftsSummary />);

      expect(screen.getByText('Seus NFTs')).toBeInTheDocument();
      expect(screen.getByText(/Emerald Ape #042/)).toBeInTheDocument();
      expect(screen.getByText('(x 2)')).toBeInTheDocument();
      expect(screen.getByText('2.38 ETH')).toBeInTheDocument();
      expect(screen.getByText('26.83 ETH')).toBeInTheDocument();
      expect(screen.getByText('0.016 ETH')).toBeInTheDocument();
      expect(screen.getByText('26.846 ETH')).toBeInTheDocument();

      // Toggle do cupom promocional
      const couponBtn = screen.getByText('Tem um código promocional? Aplique aqui');
      fireEvent.click(couponBtn);
      expect(screen.getByPlaceholderText('Digite o cupom...')).toBeInTheDocument();
    });
  });

  describe('WalletAndNetworkSelector', () => {
    it('allows selecting wallet option in desktop mode', () => {
      const onSelect = vi.fn();
      render(<WalletAndNetworkSelector onSelect={onSelect} />);

      expect(screen.getByText('Carteira e rede')).toBeInTheDocument();
      const metamaskBtn = screen.getByRole('radio', { name: 'MetaMask' });
      fireEvent.click(metamaskBtn);
      expect(onSelect).toHaveBeenCalledWith('metamask');
    });

    it('allows selecting wallet option in mobile mode', () => {
      const onSelect = vi.fn();
      render(<WalletAndNetworkSelector isMobile onSelect={onSelect} />);

      const walletConnectBtn = screen.getByRole('radio', { name: /WalletConnect/ });
      fireEvent.click(walletConnectBtn);
      expect(onSelect).toHaveBeenCalledWith('walletconnect');
    });
  });

  describe('ConnectedWalletsSection (Mobile)', () => {
    it('renders connected wallets and allows switching active wallet', () => {
      const onSelect = vi.fn();
      const onSwitch = vi.fn();

      render(<ConnectedWalletsSection onSelectWallet={onSelect} onSwitchWallet={onSwitch} />);

      expect(screen.getByText('Carteira conectada')).toBeInTheDocument();
      expect(screen.getByText('Reserva')).toBeInTheDocument();
      expect(screen.getByText('nova.kurio.eth')).toBeInTheDocument();

      const principalWallet = screen.getByTestId('connected-wallet-wallet-principal');
      fireEvent.click(principalWallet);
      expect(onSelect).toHaveBeenCalledWith('wallet-principal');

      const switchBtn = screen.getByText('Trocar carteira');
      fireEvent.click(switchBtn);
      expect(onSwitch).toHaveBeenCalled();
    });
  });

  describe('PaymentPageContent Orchestrator', () => {
    it('renders complete payment page and handles purchase confirmation', () => {
      const onConfirm = vi.fn();
      render(<PaymentPageContent onConfirmPurchase={onConfirm} />);

      expect(screen.getAllByText('Perfil do colecionador')[0]).toBeInTheDocument();
      expect(screen.getByText('Seus NFTs')).toBeInTheDocument();

      const confirmBtns = screen.getAllByRole('button', { name: 'Confirmar compra' });
      fireEvent.click(confirmBtns[0]!);
      expect(onConfirm).toHaveBeenCalled();
    });

    it('renders mobile fixed bottom bar and opens drawer with wallet summary', () => {
      render(<PaymentPageContent />);

      const bottomBar = screen.getByTestId('payment-mobile-fixed-bottom-bar');
      expect(bottomBar).toBeInTheDocument();

      const drawerTrigger = screen.getByRole('button', { name: 'Abrir resumo da carteira' });
      expect(drawerTrigger).toBeInTheDocument();

      fireEvent.click(drawerTrigger);

      const dialog = screen.getByRole('dialog');
      expect(dialog).toBeInTheDocument();
    });

    it('opens OrderConfirmationModal when purchase is confirmed', () => {
      render(<PaymentPageContent />);

      const confirmBtns = screen.getAllByRole('button', { name: 'Confirmar compra' });
      fireEvent.click(confirmBtns[0]!);

      expect(screen.getByTestId('order-confirmation-modal')).toBeInTheDocument();
      expect(screen.getByText('Seus NFTs agora estão na sua carteira')).toBeInTheDocument();
    });
  });

  describe('OrderConfirmationModal (#11:4385)', () => {
    it('renders transaction details, NFTs, network fee and Etherscan link', () => {
      render(<OrderConfirmationModal isInline />);

      expect(screen.getByText('Seus NFTs agora estão na sua carteira')).toBeInTheDocument();
      expect(screen.getByText('0xA91F…E82C')).toBeInTheDocument();
      expect(screen.getByText('29 Jul, 2026')).toBeInTheDocument();
      expect(screen.getAllByText('26.846 ETH')[0]).toBeInTheDocument();
      expect(screen.getByText('MetaMask')).toBeInTheDocument();

      // Detalhes da transação
      expect(screen.getByText('Detalhes da transação')).toBeInTheDocument();
      expect(screen.getByText('Emerald Ape #042')).toBeInTheDocument();
      expect(screen.getByText('(x 2)')).toBeInTheDocument();
      expect(screen.getByText('2.38 ETH')).toBeInTheDocument();
      expect(screen.getByText('Violet Nomad #314')).toBeInTheDocument();
      expect(screen.getByText('(x 6)')).toBeInTheDocument();
      expect(screen.getByText('8.34 ETH')).toBeInTheDocument();
      expect(screen.getByText('Ivory Baron #088')).toBeInTheDocument();
      expect(screen.getByText('(x 9)')).toBeInTheDocument();
      expect(screen.getByText('16.11 ETH')).toBeInTheDocument();

      // Taxas e botão
      expect(screen.getByText('0.016 ETH')).toBeInTheDocument();
      expect(screen.getByText('Ver no Etherscan')).toBeInTheDocument();
    });

    it('triggers onClose when close button is clicked', () => {
      const onClose = vi.fn();
      render(<OrderConfirmationModal isOpen onClose={onClose} />);

      const closeBtn = screen.getByRole('button', { name: 'Fechar modal de confirmação' });
      fireEvent.click(closeBtn);
      expect(onClose).toHaveBeenCalled();
    });

    it('triggers onClose when Escape key is pressed', () => {
      const onClose = vi.fn();
      render(<OrderConfirmationModal isOpen onClose={onClose} />);

      fireEvent.keyDown(window, { key: 'Escape' });
      expect(onClose).toHaveBeenCalled();
    });
  });
});
