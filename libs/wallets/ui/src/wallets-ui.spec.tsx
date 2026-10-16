import '@testing-library/jest-dom/vitest';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { WalletsPageContent } from './index';


describe('Wallets UI Components (@nft/wallets-ui)', () => {
  it('renders all Figma visible labels and fields with primary wallet values', () => {
    render(
      <WalletsPageContent
        primaryWallet={{
          id: 'wal-1',
          address: '0x1111111111111111111111111111111111111111',
          network: 'ethereum-mainnet',
          walletType: 'metamask',
          ensName: 'alice',
          label: 'Primary Vault',
          displayName: 'Minha MetaMask',
          isPrimary: true,
        }}
      />
    );

    expect(screen.getByLabelText(/nome de exibição/i)).toHaveValue('Minha MetaMask');
    expect(screen.getByLabelText(/apelido da carteira/i)).toHaveValue('Primary Vault');
    expect(screen.getByLabelText(/rede/i)).toHaveValue('ethereum-mainnet');
    expect(screen.getByLabelText(/endereço da carteira/i)).toHaveValue(
      '0x1111111111111111111111111111111111111111'
    );
    expect(screen.getByLabelText(/tipo de carteira/i)).toHaveValue('metamask');
    expect(screen.getByLabelText(/nome ens/i)).toHaveValue('alice');
  });

  it('renders empty secondary wallet text when secondary wallet is null', () => {
    render(<WalletsPageContent primaryWallet={null} secondaryWallet={null} />);

    expect(
      screen.getByText('Você ainda não adicionou uma carteira secundária.')
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/igual à carteira principal/i)).toBeInTheDocument();
  });

  it('associates validation errors using aria-invalid and aria-describedby', () => {
    render(
      <WalletsPageContent
        fieldErrors={{
          address: 'Endereço hexadecimal inválido',
          label: 'Apelido da carteira é obrigatório',
        }}
      />
    );

    const addressInput = screen.getByLabelText(/endereço da carteira/i);
    expect(addressInput).toHaveAttribute('aria-invalid', 'true');
    expect(addressInput).toHaveAttribute('aria-describedby', 'walletAddress-error');
    expect(screen.getByText('Endereço hexadecimal inválido')).toBeInTheDocument();

    const labelInput = screen.getByLabelText(/apelido da carteira/i);
    expect(labelInput).toHaveAttribute('aria-invalid', 'true');
    expect(labelInput).toHaveAttribute('aria-describedby', 'walletAlias-error');
    expect(screen.getByText('Apelido da carteira é obrigatório')).toBeInTheDocument();
  });

  it('submits primary wallet on clicking salvar carteira', () => {
    const onSubmitPrimary = vi.fn();
    render(
      <WalletsPageContent
        primaryWallet={{
          id: 'wal-1',
          address: '0x1111111111111111111111111111111111111111',
          network: 'ethereum-mainnet',
          walletType: 'metamask',
          label: 'My Vault',
          displayName: 'MetaMask 1',
          isPrimary: true,
        }}
        onSubmitPrimaryWallet={onSubmitPrimary}
      />
    );

    const submitBtn = screen.getByRole('button', { name: /salvar carteira/i });
    fireEvent.click(submitBtn);

    expect(onSubmitPrimary).toHaveBeenCalledWith(
      expect.objectContaining({
        address: '0x1111111111111111111111111111111111111111',
        label: 'My Vault',
        isPrimary: true,
      })
    );
  });
});
