import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import * as React from 'react';
import { AccountLayout } from './account-layout';
import { AccountNavigation } from './account-navigation';
import { AccountMobileHeader } from './account-mobile-header';

describe('AccountLayout & AccountNavigation', () => {
  it('renders fixed 310px sidebar container (hidden on mobile), remaining content column and 28px gap classes', () => {
    render(
      <AccountLayout
        sidebar={<div data-testid="test-sidebar">Sidebar</div>}
        mobileHeader={<div data-testid="test-mobile-header">Mobile Header</div>}
      >
        <div data-testid="test-content">Conteúdo da Página</div>
      </AccountLayout>
    );

    const grid = screen.getByTestId('account-grid-layout');
    expect(grid.className).toContain('md:grid-cols-[310px_1fr]');
    expect(grid.className).toContain('gap-[28px]');

    const sidebarCol = screen.getByTestId('account-sidebar-column');
    expect(sidebarCol.className).toContain('hidden');
    expect(sidebarCol.className).toContain('md:block');
    expect(sidebarCol.className).toContain('md:w-[310px]');
    expect(sidebarCol.className).toContain('md:min-w-[310px]');

    const contentCol = screen.getByTestId('account-content-column');
    expect(contentCol.className).toContain('flex-1');
    expect(screen.getByTestId('test-mobile-header')).toBeDefined();
  });

  it('renders all required menus in navigation', () => {
    const handleSelect = vi.fn();
    render(<AccountNavigation activeMenu="profile" onSelectMenu={handleSelect} />);

    expect(screen.getByRole('heading', { level: 2, name: 'Meu perfil' })).toBeDefined();

    const requiredLabels = [
      'Dados do perfil',
      'Carteiras',
      'Atividade',
      'Lista de interesse',
      'Ofertas',
      'Arquivos baixados',
      'Suporte',
      'Sair',
    ];

    for (const label of requiredLabels) {
      expect(screen.getByRole('button', { name: new RegExp(label, 'i') })).toBeDefined();
    }
  });

  it('handles menu selection click callbacks', () => {
    const handleSelect = vi.fn();
    render(<AccountNavigation activeMenu="profile" onSelectMenu={handleSelect} />);

    const walletsButton = screen.getByRole('button', { name: /carteiras/i });
    fireEvent.click(walletsButton);

    expect(handleSelect).toHaveBeenCalledWith('wallets');
  });

  it('marks active menu with aria-current="page"', () => {
    render(<AccountNavigation activeMenu="wallets" />);

    const walletsButton = screen.getByRole('button', { name: /carteiras/i });
    expect(walletsButton.getAttribute('aria-current')).toBe('page');

    const profileButton = screen.getByRole('button', { name: /dados do perfil/i });
    expect(profileButton.getAttribute('aria-current')).toBeNull();
  });
});

describe('AccountMobileHeader', () => {
  it('renders 3 columns: 35x35 back circle, responsive title container, and 35x35 menu circle', () => {
    const handleBack = vi.fn();
    const handleSelect = vi.fn();

    render(
      <AccountMobileHeader
        title="Dados do perfil"
        activeMenu="profile"
        onSelectMenu={handleSelect}
        onBackClick={handleBack}
      />
    );

    const backButton = screen.getByTestId('account-mobile-back-button');
    expect(backButton.className).toContain('w-[35px]');
    expect(backButton.className).toContain('h-[35px]');
    expect(backButton.className).toContain('rounded-full');

    fireEvent.click(backButton);
    expect(handleBack).toHaveBeenCalledTimes(1);

    const titleContainer = screen.getByTestId('account-mobile-title-container');
    expect(titleContainer.className).toContain('flex-1');
    expect(screen.getByRole('heading', { level: 1, name: 'Dados do perfil' })).toBeDefined();

    const menuButton = screen.getByTestId('account-mobile-menu-button');
    expect(menuButton.className).toContain('w-[35px]');
    expect(menuButton.className).toContain('h-[35px]');
    expect(menuButton.className).toContain('rounded-full');
  });

  it('opens dialog with account pages when clicking menu button and allows selection', () => {
    const handleSelect = vi.fn();

    render(
      <AccountMobileHeader
        title="Dados do perfil"
        activeMenu="profile"
        onSelectMenu={handleSelect}
      />
    );

    // Antes de clicar, o dialog não está presente
    expect(screen.queryByTestId('account-mobile-menu-dialog')).toBeNull();

    // Clica na 3ª coluna (bolinha com ícone de menu)
    const menuButton = screen.getByTestId('account-mobile-menu-button');
    fireEvent.click(menuButton);

    // Modal aberto com os menus
    expect(screen.getByTestId('account-mobile-menu-dialog')).toBeDefined();
    expect(screen.getByRole('heading', { level: 2, name: 'Navegação da conta' })).toBeDefined();

    // Clica em Carteiras dentro do menu
    const walletsOption = screen.getAllByRole('button', { name: /carteiras/i })[0];
    if (walletsOption) {
      fireEvent.click(walletsOption);
      expect(handleSelect).toHaveBeenCalledWith('wallets');
    }

    // Modal é fechado após seleção
    expect(screen.queryByTestId('account-mobile-menu-dialog')).toBeNull();
  });
});
