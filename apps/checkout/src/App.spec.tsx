import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';

describe('Checkout Remote', () => {
  it('renders accessible header and placeholder content', () => {
    render(<App />);

    expect(screen.getByRole('heading', { level: 1, name: 'Checkout Remote' })).toBeDefined();
    expect(screen.getByRole('region', { name: 'Fluxo de Checkout' })).toBeDefined();
    expect(screen.getByText(/Porta 4202/i)).toBeDefined();
  });
});
