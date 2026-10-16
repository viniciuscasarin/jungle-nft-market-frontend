import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import * as React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './tabs';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from './dialog';
import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from './drawer';
import { ToastProvider, useToast } from './toast';
import { Tooltip } from './tooltip';
import { Pagination } from './pagination';
import { Avatar } from './avatar';
import { Skeleton } from './skeleton';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from './dropdown-menu';

describe('Layout & Overlays Primitives', () => {
  describe('Card', () => {
    it('renders card with header, title, description and content', () => {
      render(
        <Card variant="interactive">
          <CardHeader>
            <CardTitle>Coleção Primária</CardTitle>
            <CardDescription>Coleção exclusiva de 500 itens</CardDescription>
          </CardHeader>
          <CardContent>Conteúdo do Card</CardContent>
        </Card>
      );

      expect(screen.getByText('Coleção Primária')).toBeInTheDocument();
      expect(screen.getByText(/coleção exclusiva/i)).toBeInTheDocument();
      expect(screen.getByText('Conteúdo do Card')).toBeInTheDocument();
    });
  });

  describe('Tabs', () => {
    it('switches tabs on click and navigates with arrow keys', () => {
      render(
        <Tabs defaultValue="details">
          <TabsList>
            <TabsTrigger value="details">Detalhes</TabsTrigger>
            <TabsTrigger value="bids">Lances</TabsTrigger>
            <TabsTrigger value="history">Histórico</TabsTrigger>
          </TabsList>
          <TabsContent value="details">Conteúdo Detalhes</TabsContent>
          <TabsContent value="bids">Conteúdo Lances</TabsContent>
          <TabsContent value="history">Conteúdo Histórico</TabsContent>
        </Tabs>
      );

      const detailsTab = screen.getByRole('tab', { name: 'Detalhes' });
      const bidsTab = screen.getByRole('tab', { name: 'Lances' });

      expect(detailsTab).toHaveAttribute('aria-selected', 'true');
      expect(screen.getByText('Conteúdo Detalhes')).toBeInTheDocument();
      expect(screen.queryByText('Conteúdo Lances')).not.toBeInTheDocument();

      fireEvent.click(bidsTab);
      expect(bidsTab).toHaveAttribute('aria-selected', 'true');
      expect(screen.getByText('Conteúdo Lances')).toBeInTheDocument();
      expect(screen.queryByText('Conteúdo Detalhes')).not.toBeInTheDocument();

      // Arrow navigation
      bidsTab.focus();
      fireEvent.keyDown(bidsTab.parentElement!, { key: 'ArrowRight' });
      const historyTab = screen.getByRole('tab', { name: 'Histórico' });
      expect(historyTab).toHaveAttribute('aria-selected', 'true');
    });
  });

  describe('Dialog', () => {
    it('opens dialog on trigger click and closes on close button', () => {
      render(
        <Dialog>
          <DialogTrigger asChild>
            <button>Abrir Modal</button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Título do Modal</DialogTitle>
              <DialogDescription>Descrição do modal de confirmação</DialogDescription>
            </DialogHeader>
            <div>Corpo do modal</div>
          </DialogContent>
        </Dialog>
      );

      expect(screen.queryByText('Título do Modal')).not.toBeInTheDocument();

      const openButton = screen.getByText('Abrir Modal');
      fireEvent.click(openButton);

      expect(screen.getByText('Título do Modal')).toBeInTheDocument();
      expect(screen.getByText('Descrição do modal de confirmação')).toBeInTheDocument();

      const closeButton = screen.getByRole('button', { name: 'Fechar diálogo' });
      fireEvent.click(closeButton);

      expect(screen.queryByText('Título do Modal')).not.toBeInTheDocument();
    });
  });

  describe('Drawer', () => {
    it('opens side drawer and renders content', () => {
      render(
        <Drawer>
          <DrawerTrigger asChild>
            <button>Abrir Filtros</button>
          </DrawerTrigger>
          <DrawerContent side="right">
            <DrawerHeader>
              <DrawerTitle>Filtros do Catálogo</DrawerTitle>
            </DrawerHeader>
            <div>Conteúdo dos filtros</div>
          </DrawerContent>
        </Drawer>
      );

      expect(screen.queryByText('Filtros do Catálogo')).not.toBeInTheDocument();

      fireEvent.click(screen.getByText('Abrir Filtros'));
      expect(screen.getByText('Filtros do Catálogo')).toBeInTheDocument();
      expect(screen.getByText('Conteúdo dos filtros')).toBeInTheDocument();
    });
  });

  describe('Toast', () => {
    it('adds and displays toast inside polite live region', () => {
      const TestComponent = () => {
        const { addToast } = useToast();
        return (
          <button
            onClick={() =>
              addToast({
                title: 'Item adicionado',
                description: 'NFT inserido no carrinho',
                variant: 'success',
              })
            }
          >
            Adicionar
          </button>
        );
      };

      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      );

      fireEvent.click(screen.getByText('Adicionar'));

      expect(screen.getByText('Item adicionado')).toBeInTheDocument();
      expect(screen.getByText('NFT inserido no carrinho')).toBeInTheDocument();

      const closeBtn = screen.getByRole('button', { name: 'Fechar notificação' });
      fireEvent.click(closeBtn);
      expect(screen.queryByText('Item adicionado')).not.toBeInTheDocument();
    });
  });

  describe('Tooltip', () => {
    it('shows tooltip content on mouse enter and hides on mouse leave', () => {
      render(
        <Tooltip content="Copiar endereço da carteira">
          <button>0x123...456</button>
        </Tooltip>
      );

      const trigger = screen.getByText('0x123...456');
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();

      fireEvent.mouseEnter(trigger.parentElement!);
      expect(screen.getByRole('tooltip')).toBeInTheDocument();
      expect(screen.getByText('Copiar endereço da carteira')).toBeInTheDocument();

      fireEvent.mouseLeave(trigger.parentElement!);
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    });
  });

  describe('Pagination', () => {
    it('renders pages and triggers onPageChange on button clicks', () => {
      const handlePageChange = vi.fn();
      render(
        <Pagination
          currentPage={2}
          totalPages={5}
          onPageChange={handlePageChange}
        />
      );

      expect(screen.getByRole('navigation', { name: 'Paginação' })).toBeInTheDocument();
      const current = screen.getByRole('button', { name: 'Página 2' });
      expect(current).toHaveAttribute('aria-current', 'page');

      const nextBtn = screen.getByRole('button', { name: 'Próxima página' });
      fireEvent.click(nextBtn);
      expect(handlePageChange).toHaveBeenCalledWith(3);

      const prevBtn = screen.getByRole('button', { name: 'Página anterior' });
      fireEvent.click(prevBtn);
      expect(handlePageChange).toHaveBeenCalledWith(1);
    });
  });

  describe('Avatar', () => {
    it('renders fallback when src is not provided or fails to load', () => {
      render(<Avatar fallback="VC" size="lg" />);
      expect(screen.getByText('VC')).toBeInTheDocument();
    });
  });

  describe('Skeleton', () => {
    it('preserves dimensions, sets aria-busy and applies reduced motion class', () => {
      render(<Skeleton width={200} height={280} ariaLabel="Carregando NFT..." />);

      const skeleton = screen.getByRole('status');
      expect(skeleton).toHaveAttribute('aria-busy', 'true');
      expect(skeleton.style.width).toBe('200px');
      expect(skeleton.style.height).toBe('280px');
      expect(skeleton.className).toContain('motion-reduce:animate-none');
      expect(screen.getByText('Carregando NFT...')).toBeInTheDocument();
    });
  });

  describe('DropdownMenu', () => {
    it('opens dropdown menu on trigger click and allows keyboard navigation and item selection', () => {
      const handleSelect = vi.fn();
      render(
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button type="button">Abrir Menu</button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>Ações</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={handleSelect}>Perfil</DropdownMenuItem>
            <DropdownMenuItem>Sair</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );

      const trigger = screen.getByRole('button', { name: 'Abrir Menu' });
      fireEvent.keyDown(trigger, { key: 'ArrowDown' });

      expect(screen.getByText('Ações')).toBeInTheDocument();
      const perfilItem = screen.getByRole('menuitem', { name: 'Perfil' });
      expect(perfilItem).toBeInTheDocument();

      fireEvent.click(perfilItem);
      expect(handleSelect).toHaveBeenCalledTimes(1);
    });
  });
});
