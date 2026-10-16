import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import * as AllIcons from './index';
import { IconCart } from './IconCart';
import { IconEthereum } from './IconEthereum';
import { IconMetamask } from './IconMetamask';

describe('Vector Icons in @nft/shared-ui', () => {
  it('should export at least 35 named icon components', () => {
    const iconNames = Object.keys(AllIcons).filter((key) => key.startsWith('Icon'));
    expect(iconNames.length).toBeGreaterThanOrEqual(35);
  });

  it('should render icon with default intrinsic dimensions and aria-hidden="true"', () => {
    const { container } = render(<IconCart data-testid="cart-icon" />);
    const svg = container.querySelector('svg');

    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute('aria-hidden', 'true');
    expect(svg).not.toHaveAttribute('role');
    expect(svg?.querySelector('title')).toBeNull();
    expect(svg).toHaveAttribute('width', '25');
    expect(svg).toHaveAttribute('height', '24');
  });

  it('should support accessible title for screen readers (removes aria-hidden, sets role="img")', () => {
    const { container } = render(<IconCart title="Meu Carrinho" data-testid="cart-icon" />);
    const svg = container.querySelector('svg');

    expect(svg).toBeInTheDocument();
    expect(svg).not.toHaveAttribute('aria-hidden');
    expect(svg).toHaveAttribute('role', 'img');

    const titleEl = svg?.querySelector('title');
    expect(titleEl).toBeInTheDocument();
    expect(titleEl?.textContent).toBe('Meu Carrinho');
  });

  it('should accept custom size and className', () => {
    const { container } = render(
      <IconEthereum size={48} className="text-accent" data-testid="eth-icon" />
    );
    const svg = container.querySelector('svg');

    expect(svg).toHaveAttribute('width', '48');
    expect(svg).toHaveAttribute('height', '48');
    expect(svg).toHaveClass('text-accent');
  });

  it('should support tree-shaking with individual named component exports', () => {
    expect(typeof IconCart).toBe('function');
    expect(typeof IconEthereum).toBe('function');
    expect(typeof IconMetamask).toBe('function');
  });
});
