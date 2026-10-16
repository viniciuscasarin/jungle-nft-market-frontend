import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { OrderStatusNotice } from './order-status-notice';

describe('OrderStatusNotice', () => {
  it('announces the supplied order state without deriving success', () => {
    render(<OrderStatusNotice label="Pagamento recusado" description="Revise sua carteira simulada." tone="danger" />);
    expect(screen.getByRole('status')).toHaveTextContent('Pagamento recusado');
    expect(screen.getByRole('status')).toHaveTextContent('Revise sua carteira simulada.');
    expect(screen.queryByText(/confirmado/i)).not.toBeInTheDocument();
  });
});
