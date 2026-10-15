import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';

describe('Account Remote', () => {
  it('renders accessible header and placeholder content', () => {
    render(<App />);

    expect(screen.getByRole('heading', { level: 1, name: 'Account Remote' })).toBeDefined();
    expect(screen.getByRole('region', { name: 'Painel de Conta e Carteiras' })).toBeDefined();
    expect(screen.getByText(/Porta 4203/i)).toBeDefined();
  });
});
