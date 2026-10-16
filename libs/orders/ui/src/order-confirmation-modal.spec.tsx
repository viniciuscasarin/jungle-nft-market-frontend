import '@testing-library/jest-dom/vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { OrderConfirmationModal } from './order-confirmation-modal';
import type { OrderConfirmationData } from './types';

const mockModalData: OrderConfirmationData = {
  transactionId: '0x1234abcd5678ef90',
  date: '10 Fev, 2026',
  totalEth: '3.1550 ETH',
  walletName: 'MetaMask (0x1111...1111)',
  networkFeeEth: '0.0050 ETH',
  items: [
    {
      id: 'item-1',
      name: 'Cyber Ape #01',
      tokenId: '#0001',
      imageUrl: 'https://example.com/nft.png',
      quantity: 2,
      subtotalEth: '3.1500 ETH',
    },
  ],
};

describe('OrderConfirmationModal', () => {
  it('renders with accessibility attributes role="dialog" and aria-modal="true"', () => {
    render(<OrderConfirmationModal isOpen data={mockModalData} />);

    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAttribute('aria-labelledby', 'order-confirmation-title');
    expect(screen.getByText('Seus NFTs agora estão na sua carteira')).toBeInTheDocument();
  });

  it('renders order summary details, transaction items and fees', () => {
    render(<OrderConfirmationModal isOpen data={mockModalData} />);

    expect(screen.getByText('0x1234abcd5678ef90')).toBeInTheDocument();
    expect(screen.getByText('10 Fev, 2026')).toBeInTheDocument();
    expect(screen.getAllByText('3.1550 ETH').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('MetaMask (0x1111...1111)')).toBeInTheDocument();

    expect(screen.getByText('Cyber Ape #01')).toBeInTheDocument();
    expect(screen.getByText('ID do token: #0001')).toBeInTheDocument();
    expect(screen.getByText('(x 2)')).toBeInTheDocument();
    expect(screen.getByText('3.1500 ETH')).toBeInTheDocument();
    expect(screen.getByText('0.0050 ETH')).toBeInTheDocument();
  });

  it('calls onClose when close button (X) is clicked', () => {
    const handleClose = vi.fn();
    render(<OrderConfirmationModal isOpen data={mockModalData} onClose={handleClose} />);

    const closeBtn = screen.getByLabelText('Fechar modal de confirmação');
    fireEvent.click(closeBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when Escape key is pressed', () => {
    const handleClose = vi.fn();
    render(<OrderConfirmationModal isOpen data={mockModalData} onClose={handleClose} />);

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('calls onEtherscanClick when "Ver no Etherscan" button is clicked', () => {
    const handleEtherscan = vi.fn();
    render(<OrderConfirmationModal isOpen data={mockModalData} onEtherscanClick={handleEtherscan} />);

    const etherscanBtn = screen.getByRole('button', { name: /ver no etherscan/i });
    fireEvent.click(etherscanBtn);
    expect(handleEtherscan).toHaveBeenCalledTimes(1);
  });

  it('does not render anything when isOpen is false and isInline is false', () => {
    render(<OrderConfirmationModal isOpen={false} data={mockModalData} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
