import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import * as React from 'react';
import { Button } from './button';
import { Spinner } from './spinner';
import { Badge } from './badge';
import { Alert } from './alert';
import { EmptyState } from './empty-state';
import { ErrorState } from './error-state';

describe('Action & Feedback Primitives', () => {
  describe('Button', () => {
    it('renders with children and responds to click events', () => {
      const handleClick = vi.fn();
      render(<Button onClick={handleClick}>Comprar NFT</Button>);

      const button = screen.getByRole('button', { name: /comprar nft/i });
      expect(button).toBeInTheDocument();
      fireEvent.click(button);
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('renders different variants with appropriate design system token classes', () => {
      const { rerender } = render(<Button variant="primary">Primary</Button>);
      let button = screen.getByRole('button', { name: /primary/i });
      expect(button.className).toContain('bg-primary');
      expect(button.className).toContain('focus-visible:ring-primary');

      rerender(<Button variant="secondary">Secondary</Button>);
      button = screen.getByRole('button', { name: /secondary/i });
      expect(button.className).toContain('bg-surface-raised');

      rerender(<Button variant="destructive">Destructive</Button>);
      button = screen.getByRole('button', { name: /destructive/i });
      expect(button.className).toContain('bg-feedback-error');
    });

    it('prevents interaction and shows accessible loading state when loading', () => {
      const handleClick = vi.fn();
      render(
        <Button loading loadingLabel="Processando..." onClick={handleClick}>
          Confirmar
        </Button>
      );

      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      expect(button).toHaveAttribute('aria-busy', 'true');
      expect(screen.getByText('Processando...')).toBeInTheDocument();

      fireEvent.click(button);
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('renders left and right icons properly', () => {
      render(
        <Button
          leftIcon={<span data-testid="left-icon">←</span>}
          rightIcon={<span data-testid="right-icon">→</span>}
        >
          Próximo
        </Button>
      );

      expect(screen.getByTestId('left-icon')).toBeInTheDocument();
      expect(screen.getByTestId('right-icon')).toBeInTheDocument();
      expect(screen.getByText('Próximo')).toBeInTheDocument();
    });

    it('supports polymorphic rendering via asChild', () => {
      render(
        <Button asChild>
          <a href="/marketplace">Ir ao Marketplace</a>
        </Button>
      );

      const link = screen.getByRole('link', { name: /ir ao marketplace/i });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', '/marketplace');
      expect(link.className).toContain('bg-primary');
    });
  });

  describe('Spinner', () => {
    it('renders accessible status role and screen reader text', () => {
      render(<Spinner ariaLabel="Carregando dados..." />);

      const status = screen.getByRole('status');
      expect(status).toBeInTheDocument();
      expect(screen.getByText('Carregando dados...')).toBeInTheDocument();
    });

    it('applies motion-reduce class to respect reduced motion preference', () => {
      const { container } = render(<Spinner size="lg" />);
      const svg = container.querySelector('svg');
      expect(svg).toHaveClass('motion-reduce:animate-none');
      expect(svg).toHaveClass('h-8 w-8');
    });
  });

  describe('Badge', () => {
    it('renders with variants for status, edition and rarity', () => {
      const { rerender } = render(<Badge variant="rarity">Legendary</Badge>);
      expect(screen.getByText('Legendary')).toBeInTheDocument();
      expect(screen.getByText('Legendary').className).toContain('text-accent');

      rerender(<Badge variant="edition">#042/100</Badge>);
      expect(screen.getByText('#042/100').className).toContain('text-text-accent');

      rerender(<Badge variant="success">Disponível</Badge>);
      expect(screen.getByText('Disponível').className).toContain('text-feedback-success');
    });
  });

  describe('Alert', () => {
    it('renders role="alert" for error/warning and role="status" for info/success', () => {
      const { rerender } = render(
        <Alert variant="error" title="Erro no pagamento" description="Saldo insuficiente" />
      );
      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText('Erro no pagamento')).toBeInTheDocument();
      expect(screen.getByText('Saldo insuficiente')).toBeInTheDocument();

      rerender(
        <Alert variant="success" title="Transação concluída" description="NFT enviado para sua carteira" />
      );
      expect(screen.getByRole('status')).toBeInTheDocument();
      expect(screen.getByText('Transação concluída')).toBeInTheDocument();
    });

    it('triggers onClose when close button is clicked', () => {
      const handleClose = vi.fn();
      render(
        <Alert
          variant="info"
          title="Novidade"
          description="Novo drop disponível"
          onClose={handleClose}
          closeLabel="Fechar aviso"
        />
      );

      const closeButton = screen.getByRole('button', { name: 'Fechar aviso' });
      fireEvent.click(closeButton);
      expect(handleClose).toHaveBeenCalledTimes(1);
    });

    it('renders custom action when provided', () => {
      render(
        <Alert
          variant="warning"
          title="Atenção"
          action={<Button size="sm">Recarregar</Button>}
        />
      );
      expect(screen.getByRole('button', { name: 'Recarregar' })).toBeInTheDocument();
    });
  });

  describe('EmptyState', () => {
    it('renders accessible region with title, description and CTA button', () => {
      const handleAction = vi.fn();
      render(
        <EmptyState
          title="Nenhum NFT encontrado"
          description="Tente ajustar seus filtros para encontrar itens disponíveis."
          action={<Button onClick={handleAction}>Limpar filtros</Button>}
        />
      );

      expect(screen.getByRole('region', { name: 'Nenhum NFT encontrado' })).toBeInTheDocument();
      expect(screen.getByText('Nenhum NFT encontrado')).toBeInTheDocument();
      expect(screen.getByText(/ajustar seus filtros/i)).toBeInTheDocument();

      const button = screen.getByRole('button', { name: 'Limpar filtros' });
      fireEvent.click(button);
      expect(handleAction).toHaveBeenCalledTimes(1);
    });
  });

  describe('ErrorState', () => {
    it('renders alert role and executes onRetry callback on button click', () => {
      const handleRetry = vi.fn();
      render(
        <ErrorState
          title="Falha ao carregar catálogo"
          message="Não foi possível obter os dados da API simulada."
          onRetry={handleRetry}
          retryLabel="Tentar novamente"
        />
      );

      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText('Falha ao carregar catálogo')).toBeInTheDocument();
      expect(screen.getByText(/não foi possível obter/i)).toBeInTheDocument();

      const retryButton = screen.getByRole('button', { name: 'Tentar novamente' });
      fireEvent.click(retryButton);
      expect(handleRetry).toHaveBeenCalledTimes(1);
    });

    it('shows loading state on retry button when isRetrying is true', () => {
      render(
        <ErrorState
          title="Erro"
          message="Conexão perdida"
          onRetry={vi.fn()}
          isRetrying={true}
        />
      );

      const retryButton = screen.getByRole('button');
      expect(retryButton).toBeDisabled();
      expect(retryButton).toHaveAttribute('aria-busy', 'true');
    });
  });
});
