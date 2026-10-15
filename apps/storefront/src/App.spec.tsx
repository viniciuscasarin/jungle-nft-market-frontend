import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';

describe('Storefront Remote', () => {
  it('renders accessible header and placeholder content', () => {
    render(<App />);

    expect(screen.getByRole('heading', { level: 1, name: 'Storefront Remote' })).toBeDefined();
    expect(screen.getByRole('region', { name: 'Catálogo Storefront' })).toBeDefined();
    expect(screen.getByText(/Porta 4201/i)).toBeDefined();
  });
});
