import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';

describe('Account Remote Layout', () => {
  it('renders Kurio header, account layout, navigation and initial profile page content', () => {
    render(<App />);

    // Verifica elementos do Header e remote dev banner
    expect(screen.getByText(/Account Remote • Worktree de Layouts/i)).toBeDefined();
    expect(screen.getByText(/Porta 4203/i)).toBeDefined();

    // Verifica barra lateral de 310px com os menus solicitados
    expect(screen.getByRole('heading', { level: 2, name: 'Meu perfil' })).toBeDefined();
    expect(screen.getByRole('button', { name: /dados do perfil/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /carteiras/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /atividade/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /lista de interesse/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /ofertas/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /arquivos baixados/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /suporte/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /sair/i })).toBeDefined();

    // Verifica conteúdo inicial (Dados do perfil)
    expect(screen.getByRole('heading', { level: 1, name: 'Perfil do colecionador' })).toBeDefined();
  });

  it('switches between menu sections when clicking sidebar items', () => {
    render(<App />);

    // Clica em Carteiras
    const walletsButton = screen.getByRole('button', { name: /carteiras/i });
    fireEvent.click(walletsButton);

    // Deve renderizar a página de Carteiras
    expect(screen.getByRole('heading', { level: 1, name: 'Carteira principal' })).toBeDefined();
    expect(screen.getByText(/Estas carteiras ficam disponíveis no pagamento/i)).toBeDefined();

    // Clica em Atividade
    const activityButton = screen.getByRole('button', { name: /atividade/i });
    fireEvent.click(activityButton);

    expect(screen.getAllByRole('heading', { level: 1, name: 'Atividade' }).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/Histórico de transações, compras, vendas e lances/i)).toBeDefined();
  });
});
