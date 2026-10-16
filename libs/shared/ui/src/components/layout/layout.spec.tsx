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

      render(
        <Header
          cartCount={3}
          activePath="/"
          onLoginClick={handleLogin}
          onCartClick={handleCart}
        />
      );

      expect(screen.getByRole('link', { name: /kurio nft marketplace - início/i })).toBeInTheDocument();

      const exploreLink = screen.getByRole('link', { name: 'Explorar' });
      expect(exploreLink).toHaveAttribute('aria-current', 'page');
      expect(exploreLink.className).toContain('text-primary');

      const cartBtn = screen.getByRole('button', { name: 'Carrinho com 3 itens' });
      expect(cartBtn).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();

      fireEvent.click(cartBtn);
      expect(handleCart).toHaveBeenCalledTimes(1);

      const loginBtn = screen.getByRole('button', { name: 'Entrar' });
      fireEvent.click(loginBtn);
      expect(handleLogin).toHaveBeenCalledTimes(1);
    });

    it('renders user session with name and avatar when user is provided', () => {
      render(
        <Header
          user={{
            name: 'Alice Cooper',
            avatarUrl: 'https://example.com/avatar.png',
            walletAddress: '0x1234...5678',
          }}
          onLogoutClick={vi.fn()}
        />
      );

      expect(screen.getByText('Alice Cooper')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Sair' })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Entrar' })).not.toBeInTheDocument();
    });
  });

  describe('Footer', () => {
    it('renders navigation links and displays friendly out-of-scope notice on newsletter submit and social click', () => {
      render(<Footer />);

      expect(screen.getByText('Todas as Coleções')).toBeInTheDocument();
      expect(screen.getByText('Minha Conta')).toBeInTheDocument();

      // Social button click
      const discordBtn = screen.getByRole('button', { name: 'Seguir no Discord' });
      fireEvent.click(discordBtn);

      expect(
        screen.getByText('Acesso ao Discord indisponível nesta demonstração.')
      ).toBeInTheDocument();

      // Newsletter form submit
      const emailInput = screen.getByLabelText('E-mail para newsletter');
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

      const submitBtn = screen.getByRole('button', { name: 'Inscrever-se' });
      fireEvent.click(submitBtn);

      expect(
        screen.getByText('Funcionalidade indisponível nesta demonstração.')
      ).toBeInTheDocument();
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
      render(<MobileTabBar activeId="cart" cartCount={2} onTabSelect={handleSelect} />);

      expect(screen.getByRole('navigation', { name: 'Navegação móvel' })).toBeInTheDocument();
      const cartLink = screen.getByRole('link', { name: /carrinho/i });
      expect(cartLink).toHaveAttribute('aria-current', 'page');
      expect(screen.getByText('2')).toBeInTheDocument();
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
