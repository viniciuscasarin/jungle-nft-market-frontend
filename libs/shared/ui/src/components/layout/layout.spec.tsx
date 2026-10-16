import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import * as React from 'react';
import { Header } from './header';
import { Footer } from './footer';
import { Breadcrumb } from './breadcrumb';
import { MobileTabBar } from './mobile-tab-bar';
import { SearchBar, MobileSearchBar } from './search-bar';

describe('Global Layout Components', () => {
  describe('Header', () => {
    it('renders logo, active nav route, cart count and unauthenticated login button', () => {
      const handleLogin = vi.fn();
      const handleCart = vi.fn();
      const handleSearch = vi.fn();

      const { container } = render(
        <Header
          cartCount={3}
          activePath="/"
          onLoginClick={handleLogin}
          onCartClick={handleCart}
          onSearchClick={handleSearch}
        />
      );

      const headerEl = container.querySelector('header');
      expect(headerEl?.className).toContain('hidden lg:block');

      expect(screen.getByRole('link', { name: /kurio nft marketplace - início/i })).toBeInTheDocument();
      expect(screen.getByText('KURIO')).toBeInTheDocument();

      const homeLink = screen.getByRole('link', { name: 'Início' });
      expect(homeLink).toHaveAttribute('aria-current', 'page');
      expect(homeLink.className).toContain('border-primary');

      expect(screen.getByRole('link', { name: 'Mercado' })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'Criadores' })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'Aprenda' })).toBeInTheDocument();

      const searchLink = screen.getByRole('link', { name: 'Ir para busca de NFTs' });
      expect(searchLink).toBeInTheDocument();
      expect(searchLink).toHaveAttribute('href', '/#busca');
      fireEvent.click(searchLink);
      expect(handleSearch).toHaveBeenCalledTimes(1);

      const cartLink = screen.getByRole('link', { name: 'Carrinho com 3 itens' });
      expect(cartLink).toBeInTheDocument();
      expect(cartLink).toHaveAttribute('href', '/carrinho');
      expect(screen.getByText('3')).toBeInTheDocument();

      fireEvent.click(cartLink);
      expect(handleCart).toHaveBeenCalledTimes(1);

      const loginBtn = screen.getByRole('button', { name: 'Entrar' });
      fireEvent.click(loginBtn);
      expect(handleLogin).toHaveBeenCalledTimes(1);
    });

    it('renders user session with DropdownMenu containing profile, wallets and logout', () => {
      const handleLogout = vi.fn();
      render(
        <Header
          user={{
            name: 'Alice Cooper',
            avatarUrl: 'https://example.com/avatar.png',
            walletAddress: '0x1234...5678',
          }}
          onLogoutClick={handleLogout}
        />
      );

      expect(screen.getByText('Alice Cooper')).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Entrar' })).not.toBeInTheDocument();

      const userMenuTrigger = screen.getByRole('button', { name: 'Menu de Alice Cooper' });
      expect(userMenuTrigger).toBeInTheDocument();

      fireEvent.keyDown(userMenuTrigger, { key: 'ArrowDown' });

      expect(screen.getByRole('menuitem', { name: 'Perfil' })).toBeInTheDocument();
      expect(screen.getByRole('menuitem', { name: 'Carteiras' })).toBeInTheDocument();

      const logoutItem = screen.getByRole('menuitem', { name: 'Sair' });
      expect(logoutItem).toBeInTheDocument();
      fireEvent.click(logoutItem);
      expect(handleLogout).toHaveBeenCalledTimes(1);
    });
  });

  describe('Footer', () => {
    it('renders the 4 Figma sections with benefits badges, contact bar, navigation columns and copyright', () => {
      render(<Footer />);

      // Seção 1: Benefícios e Newsletter
      expect(screen.getByText('Segurança da carteira')).toBeInTheDocument();
      expect(screen.getByText('Criadores em destaque')).toBeInTheDocument();
      expect(screen.getByText('Alertas de lançamentos')).toBeInTheDocument();
      expect(screen.getByText('W')).toBeInTheDocument();
      expect(screen.getByText('C')).toBeInTheDocument();
      expect(screen.getByText('D')).toBeInTheDocument();
      expect(screen.getByText('Antecipe-se ao próximo lançamento')).toBeInTheDocument();

      // Seção 2: Faixa de contato
      expect(screen.getByText('Feito para colecionadores, criadores e cultura')).toBeInTheDocument();
      expect(screen.getByText('contato@email.com')).toBeInTheDocument();
      expect(screen.getByText('+55 11 4002 8922')).toBeInTheDocument();

      // Seção 3: Navegação e Carteiras
      expect(screen.getByRole('heading', { name: 'Central de ajuda' })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'Coleções' })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'Carteiras compatíveis' })).toBeInTheDocument();
      expect(screen.getByText('METAMASK')).toBeInTheDocument();
      expect(screen.getByText('WALLETCONNECT')).toBeInTheDocument();
      expect(screen.getByText('COINBASE')).toBeInTheDocument();

      // Seção 4: Copyright
      expect(screen.getByText('© 2026 Kurio. Propriedade digital para todos.')).toBeInTheDocument();
    });

    it('triggers onUnavailable callback on social button click and newsletter submit without local live region', () => {
      const handleUnavailable = vi.fn();
      render(<Footer onUnavailable={handleUnavailable} />);

      // Social button click
      const fbBtn = screen.getByRole('button', { name: 'Seguir no Facebook' });
      fireEvent.click(fbBtn);

      expect(handleUnavailable).toHaveBeenCalledWith('Rede social (Facebook)');

      // Newsletter form submit
      const emailInput = screen.getByLabelText('E-mail para newsletter');
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

      const submitBtn = screen.getByRole('button', { name: 'Enviar' });
      fireEvent.click(submitBtn);

      expect(handleUnavailable).toHaveBeenCalledWith('Newsletter');

      // Verify no local status live region is rendered in the footer
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });

    it('triggers onNewsletterSubmit callback when provided', () => {
      const handleNewsletter = vi.fn();
      render(<Footer onNewsletterSubmit={handleNewsletter} />);

      const emailInput = screen.getByLabelText('E-mail para newsletter');
      fireEvent.change(emailInput, { target: { value: 'newsletter@kurio.art' } });

      const submitBtn = screen.getByRole('button', { name: 'Enviar' });
      fireEvent.click(submitBtn);

      expect(handleNewsletter).toHaveBeenCalledWith('newsletter@kurio.art');
    });
  });

  describe('Breadcrumb', () => {
    it('renders navigation trail with links and aria-current on the last page', () => {
      const items = [
        { label: 'Início', href: '/' },
        { label: 'Coleções', href: '/colecoes' },
        { label: 'Cyber Kongz #42' },
      ];

      render(<Breadcrumb items={items} />);

      expect(screen.getByRole('navigation', { name: 'Breadcrumb' })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'Início' })).toHaveAttribute('href', '/');
      expect(screen.getByRole('link', { name: 'Coleções' })).toHaveAttribute('href', '/colecoes');

      const activeItem = screen.getByText('Cyber Kongz #42');
      expect(activeItem).toHaveAttribute('aria-current', 'page');
    });
  });

  describe('MobileTabBar', () => {
    it('renders navigation items and cart count badge', () => {
      const handleSelect = vi.fn();
      const { container } = render(<MobileTabBar activeId="cart" cartCount={2} onTabSelect={handleSelect} />);

      const navEl = container.querySelector('nav');
      expect(navEl?.className).toContain('lg:hidden');

      expect(screen.getByRole('navigation', { name: 'Navegação móvel' })).toBeInTheDocument();
      const cartLink = screen.getByRole('link', { name: /carrinho/i });
      expect(cartLink).toHaveAttribute('aria-current', 'page');
      expect(screen.getByText('2')).toBeInTheDocument();
    });

    it('resolves active tab from activePath and hides badge when cartCount is zero', () => {
      render(<MobileTabBar activePath="/perfil" cartCount={0} />);

      const accountLink = screen.getByRole('link', { name: /conta/i });
      expect(accountLink).toHaveAttribute('aria-current', 'page');
      expect(screen.queryByLabelText(/0 itens/i)).not.toBeInTheDocument();
    });
  });

  describe('SearchBar', () => {
    it('renders search role, handles typing, clear and submit', () => {
      const handleSearch = vi.fn();
      const handleClear = vi.fn();

      render(<SearchBar onSubmit={handleSearch} onClear={handleClear} />);

      const searchInput = screen.getByRole('searchbox', { name: 'Buscar NFTs' });
      fireEvent.change(searchInput, { target: { value: 'Bored Ape' } });

      const clearBtn = screen.getByRole('button', { name: 'Limpar busca' });
      expect(clearBtn).toBeInTheDocument();

      fireEvent.submit(searchInput.closest('form')!);
      expect(handleSearch).toHaveBeenCalledWith('Bored Ape');

      fireEvent.click(clearBtn);
      expect(handleClear).toHaveBeenCalled();
      expect(searchInput).toHaveValue('');
    });

    it('renders MobileSearchBar', () => {
      render(<MobileSearchBar placeholder="Busca móvel..." />);
      expect(screen.getByPlaceholderText('Busca móvel...')).toBeInTheDocument();
    });
  });
});
