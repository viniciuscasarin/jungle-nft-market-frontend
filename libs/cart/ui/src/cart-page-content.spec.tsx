import * as React from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CartPageContent } from './cart-page-content';
import { CartSkeleton } from './cart-skeleton';
import { toCartItemViewModel } from './types';

afterEach(cleanup);
const item = toCartItemViewModel({ id: 'item', nftId: 'nft', editionId: 'edition', title: 'Colecionável', imageUrl: '/assets/images/nft-03-emerald-ape.png', unitPrice: '0.123456789', quantity: 2, maxAvailable: 6 });
const summary = { subtotalEth: '9,0000 ETH', discountEth: '1,0000 ETH', networkFeeEth: '0,0050 ETH', totalEth: '8,0050 ETH' };

describe('controlled cart presentation', () => {
  it('displays the authoritative summary without calculating it from item prices', () => {
    render(<CartPageContent initialItems={[item]} summary={summary} />);
    expect(screen.getByTestId('cart-total').textContent).toBe('8,0050 ETH');
    expect(screen.getAllByAltText('Colecionável').length).toBe(2);
    expect(screen.queryByRole('main')).toBeNull();
    expect(screen.queryByRole('banner')).toBeNull();
    expect(screen.queryByRole('contentinfo')).toBeNull();
  });
  it('emits quantity/removal callbacks without changing persisted local state', () => {
    const quantity = vi.fn(); const remove = vi.fn();
    render(<CartPageContent initialItems={[item]} summary={summary} onQuantityChange={quantity} onRemove={remove} />);
    fireEvent.click(screen.getAllByRole('button', { name: 'Aumentar quantidade' })[0]!);
    expect(quantity).toHaveBeenCalledWith('item', 3);
    fireEvent.click(screen.getAllByRole('button', { name: 'Remover Colecionável do carrinho' })[0]!);
    expect(remove).toHaveBeenCalledWith('item');
    expect(screen.getByTestId('cart-item-row-item')).toBeDefined();
  });
  it('renders the empty state and blocks controls while a request is pending', () => {
    const { rerender } = render(<CartPageContent />);
    expect(screen.getByText('Seu carrinho está vazio')).toBeDefined();
    rerender(<CartPageContent initialItems={[item]} busy />);
    expect(screen.getByTestId('cart-page-content').getAttribute('aria-busy')).toBe('true');
    expect(screen.getByRole('group', { name: 'Itens do carrinho' }).getAttribute('disabled')).not.toBeNull();
  });
  it('exposes a named busy skeleton with reduced-motion support', () => {
    const { container } = render(<CartSkeleton />);
    expect(screen.getByTestId('cart-loading').getAttribute('aria-label')).toBe('Carregando carrinho');
    expect(container.querySelector('.motion-reduce\\:animate-none')).not.toBeNull();
  });
});
