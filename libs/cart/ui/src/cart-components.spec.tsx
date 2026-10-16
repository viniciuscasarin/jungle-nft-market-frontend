import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import * as React from 'react';
import {
  CartQuantityStepper,
  CartItemRow,
  CartItemCard,
  OrderSummaryCard,
  CartRecommendedCarousel,
  CartMobileHeader,
  CartPageContent,
  CartItem,
  CartOrderSummary,
} from './index';

describe('Cart UI Components', () => {
  describe('CartQuantityStepper', () => {
    it('renders current value and respects min/max boundaries', () => {
      const onChange = vi.fn();
      render(<CartQuantityStepper value={2} min={1} max={5} onChange={onChange} />);

      const spin = screen.getByRole('spinbutton');
      expect(spin).toHaveTextContent('2');

      const decBtn = screen.getByRole('button', { name: 'Diminuir quantidade' });
      const incBtn = screen.getByRole('button', { name: 'Aumentar quantidade' });

      fireEvent.click(incBtn);
      expect(onChange).toHaveBeenCalledWith(3);

      fireEvent.click(decBtn);
      expect(onChange).toHaveBeenCalledWith(1);
    });

    it('disables decrement button when at minimum', () => {
      const onChange = vi.fn();
      render(<CartQuantityStepper value={1} min={1} max={5} onChange={onChange} />);

      const decBtn = screen.getByRole('button', { name: 'Diminuir quantidade' });
      expect(decBtn).toBeDisabled();

      fireEvent.click(decBtn);
      expect(onChange).not.toHaveBeenCalled();
    });

    it('disables increment button when at maximum', () => {
      const onChange = vi.fn();
      render(<CartQuantityStepper value={5} min={1} max={5} onChange={onChange} />);

      const incBtn = screen.getByRole('button', { name: 'Aumentar quantidade' });
      expect(incBtn).toBeDisabled();

      fireEvent.click(incBtn);
      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe('CartItemRow (Desktop)', () => {
    const item: CartItem = {
      id: 'ape-042',
      name: 'Emerald Ape #042',
      tokenId: '#0042',
      imageUrl: '/assets/images/nft-03-emerald-ape.png',
      priceEth: '1.19 ETH',
      quantity: 2,
      maxQuantity: 50,
      edition: '1/50',
    };

    it('renders NFT metadata, unit price and computed row total', () => {
      const onQuantityChange = vi.fn();
      const onRemove = vi.fn();

      render(
        <table>
          <tbody>
            <CartItemRow
              item={item}
              onQuantityChange={onQuantityChange}
              onRemove={onRemove}
            />
          </tbody>
        </table>
      );

      expect(screen.getByText('Emerald Ape #042')).toBeInTheDocument();
      expect(screen.getByText('ID do token: #0042')).toBeInTheDocument();
      expect(screen.getByText('1.19 ETH')).toBeInTheDocument();
      expect(screen.getByText('2.38 ETH')).toBeInTheDocument();

      const removeBtn = screen.getByRole('button', { name: 'Remover Emerald Ape #042 do carrinho' });
      fireEvent.click(removeBtn);
      expect(onRemove).toHaveBeenCalledWith('ape-042');
    });
  });

  describe('CartItemCard (Mobile)', () => {
    const item: CartItem = {
      id: 'violet-314',
      name: 'Violet Nomad #314',
      tokenId: '#0009',
      imageUrl: '/assets/images/nft-07-violet-nomad.png',
      priceEth: '1.39 ETH',
      quantity: 1,
      maxQuantity: 10,
      edition: '1/1',
    };

    it('renders mobile card with edition and price', () => {
      const onQuantityChange = vi.fn();
      const onRemove = vi.fn();

      render(
        <CartItemCard
          item={item}
          onQuantityChange={onQuantityChange}
          onRemove={onRemove}
        />
      );

      expect(screen.getByText('Violet Nomad #314')).toBeInTheDocument();
      expect(screen.getByText('Edição: 1/1')).toBeInTheDocument();
      expect(screen.getByText('1.39 ETH')).toBeInTheDocument();

      const removeBtn = screen.getByRole('button', { name: 'Remover Violet Nomad #314 do carrinho' });
      fireEvent.click(removeBtn);
      expect(onRemove).toHaveBeenCalledWith('violet-314');
    });
  });

  describe('OrderSummaryCard', () => {
    const summary: CartOrderSummary = {
      subtotalEth: '26.83 ETH',
      discountEth: '00.00',
      networkFeeEth: '0.016 ETH',
      totalEth: '26.846 ETH',
      appliedCoupon: null,
    };

    it('renders subtotal, network fee and total with promo code application', () => {
      const onApplyCoupon = vi.fn();
      const onCheckout = vi.fn();

      render(
        <OrderSummaryCard
          summary={summary}
          onApplyCoupon={onApplyCoupon}
          onCheckout={onCheckout}
        />
      );

      expect(screen.getByText('Resumo da carteira')).toBeInTheDocument();
      expect(screen.getByText('26.83 ETH')).toBeInTheDocument();
      expect(screen.getByText('0.016 ETH')).toBeInTheDocument();
      expect(screen.getByText('Taxa estimada')).toBeInTheDocument();
      expect(screen.getByText('26.846 ETH')).toBeInTheDocument();

      const input = screen.getByPlaceholderText('Digite o código promocional...');
      const applyBtn = screen.getByRole('button', { name: 'Aplicar' });

      fireEvent.change(input, { target: { value: 'DESCONTO10' } });
      fireEvent.click(applyBtn);

      expect(onApplyCoupon).toHaveBeenCalledWith('DESCONTO10');

      const checkoutBtn = screen.getByRole('button', { name: 'Conectar e finalizar' });
      fireEvent.click(checkoutBtn);
      expect(onCheckout).toHaveBeenCalled();
    });

    it('displays active coupon badge and allows removal', () => {
      const onRemoveCoupon = vi.fn();
      render(
        <OrderSummaryCard
          summary={{
            ...summary,
            appliedCoupon: 'PROMO10',
            discountEth: '2.68 ETH',
          }}
          onRemoveCoupon={onRemoveCoupon}
        />
      );

      expect(screen.getByText(/PROMO10/)).toBeInTheDocument();
      const removeBtn = screen.getByRole('button', { name: 'Remover' });
      fireEvent.click(removeBtn);
      expect(onRemoveCoupon).toHaveBeenCalled();
    });
  });

  describe('CartRecommendedCarousel', () => {
    it('renders recommended items with name and price', () => {
      const onSelectItem = vi.fn();
      render(<CartRecommendedCarousel onSelectItem={onSelectItem} />);

      expect(screen.getByText('Colecionadores também viram')).toBeInTheDocument();
      expect(screen.getByText('Cosmic Bloom #118')).toBeInTheDocument();

      const itemBtn = screen.getByRole('button', { name: /Cosmic Bloom #118/ });
      fireEvent.click(itemBtn);
      expect(onSelectItem).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Cosmic Bloom #118' })
      );
    });
  });

  describe('CartMobileHeader', () => {
    it('renders title and triggers onBack callback', () => {
      const onBack = vi.fn();
      render(<CartMobileHeader title="Carrinho de NFTs" onBack={onBack} />);

      expect(screen.getByText('Carrinho de NFTs')).toBeInTheDocument();
      const backBtn = screen.getByRole('button', { name: 'Voltar para a página anterior' });
      fireEvent.click(backBtn);
      expect(onBack).toHaveBeenCalled();
    });
  });

  describe('CartPageContent Orchestrator', () => {
    it('renders default items and allows quantity update and removal', () => {
      render(<CartPageContent />);

      // Verifica itens padrão do Figma
      expect(screen.getAllByText('Emerald Ape #042')[0]).toBeInTheDocument();
      expect(screen.getAllByText('Violet Nomad #314')[0]).toBeInTheDocument();
      expect(screen.getAllByText('Ivory Baron #088')[0]).toBeInTheDocument();

      // Botão de remoção
      const removeBtns = screen.getAllByRole('button', { name: /Remover Emerald Ape #042/ });
      fireEvent.click(removeBtns[0]!);

      // Deve ter removido o primeiro item
      expect(screen.queryByText('ID do token: #0042')).not.toBeInTheDocument();
    });

    it('renders empty cart state when no items exist', () => {
      render(<CartPageContent initialItems={[]} />);

      expect(screen.getByText('Seu carrinho está vazio')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Explorar mercado' })).toBeInTheDocument();
    });

    it('renders mobile fixed bottom bar and opens drawer with order summary', () => {
      const onCheckout = vi.fn();
      render(<CartPageContent onCheckout={onCheckout} />);

      const bottomBar = screen.getByTestId('cart-mobile-fixed-bottom-bar');
      expect(bottomBar).toBeInTheDocument();

      const drawerTrigger = screen.getByRole('button', { name: 'Abrir resumo da carteira' });
      expect(drawerTrigger).toBeInTheDocument();

      fireEvent.click(drawerTrigger);

      // O Drawer deve estar aberto e exibir o diálogo acessível
      const dialog = screen.getByRole('dialog');
      expect(dialog).toBeInTheDocument();
    });
  });
});
