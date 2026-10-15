import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { singletonProbe } from '@nft/shell-kit';
import App from './App';

describe('Storefront Remote', () => {
  beforeEach(() => {
    singletonProbe.reset();
  });

  it('renders accessible header and placeholder content', () => {
    render(<App />);

    expect(screen.getByRole('heading', { level: 1, name: 'Storefront Remote' })).toBeDefined();
    expect(screen.getByRole('region', { name: 'Catálogo Storefront' })).toBeDefined();
    expect(screen.getByText(/Porta 4201/i)).toBeDefined();
  });

  it('increments singletonProbe on mount', () => {
    render(<App />);

    expect(singletonProbe.getCount()).toBe(1);
    expect(screen.getByTestId('singleton-probe-count').textContent).toBe('1');
    expect(singletonProbe.getEvents()[0]?.caller).toBe('apps/storefront');
  });
});
