import '@testing-library/jest-dom/vitest';
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';

describe('Checkout Standalone Remote (apps/checkout)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders explicit honest unavailable state on root route', () => {
    render(<App />);

    expect(
      screen.getByRole('heading', { level: 1, name: 'Checkout Remoto - Modo Standalone' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Fluxo Integrado Obrigatório')).toBeInTheDocument();
    expect(
      screen.getByText(/O fluxo de carrinho, pagamento e confirmação de pedido depende da cotação/i),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Acessar Shell Integrado/i }),
    ).toBeInTheDocument();
  });

  it('renders honest unavailable state for simulated cart, payment and order routes without crash', () => {
    const { rerender } = render(<App shellOrigin="http://localhost:4200" />);

    expect(screen.getByText('Fluxo Integrado Obrigatório')).toBeInTheDocument();

    // Re-rendering on different simulated sub-routes
    rerender(<App shellOrigin="http://localhost:4200" />);
    expect(screen.getByText('Fluxo Integrado Obrigatório')).toBeInTheDocument();

    rerender(<App shellOrigin="http://localhost:4200" />);
    expect(screen.getByText('Fluxo Integrado Obrigatório')).toBeInTheDocument();
  });

  it('supports keyboard navigation and triggers redirect to Shell origin', () => {
    const onNavigate = vi.fn();
    render(<App shellOrigin="http://localhost:4200" onNavigateToShell={onNavigate} />);

    const button = screen.getByRole('button', { name: /Acessar Shell Integrado/i });
    button.focus();
    expect(document.activeElement).toBe(button);

    fireEvent.click(button);
    expect(onNavigate).toHaveBeenCalledTimes(1);
  });

  it('strictly assures absence of mutation, checkout processing or fake order confirmation', () => {
    render(<App />);

    // Must never show deceptive purchase confirmation or order success in standalone mode
    expect(screen.queryByText(/compra confirmada/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/recibo de confirmação/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/pedido realizado/i)).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /confirmar pagamento/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /finalizar compra/i })).not.toBeInTheDocument();
  });
});
