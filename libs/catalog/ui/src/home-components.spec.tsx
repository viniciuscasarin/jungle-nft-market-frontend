import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import * as React from 'react';
import { HomeHeroBanner } from './home-hero-banner';
import { CatalogFilterSidebar } from './catalog-filter-sidebar';
import { HomePromoSection } from './home-promo-section';
import { HomeBlogSection } from './home-blog-section';
import { HomePageContent } from './home-page-content';

describe('Home Components (@nft/catalog-ui)', () => {
  describe('HomeHeroBanner', () => {
    it('renders hero title, CTA button, dots and artworks for desktop and mobile', () => {
      const handleCta = vi.fn();
      const handleDot = vi.fn();

      render(
        <HomeHeroBanner
          onCtaClick={handleCta}
          onDotClick={handleDot}
        />
      );

      // Desktop
      const titleDesktop = screen.getByTestId('hero-title-desktop');
      expect(titleDesktop).toBeDefined();
      expect(titleDesktop.textContent).toContain('SEJA DONO DO FUTURO');

      const ctaDesktop = screen.getByTestId('hero-cta-desktop');
      expect(ctaDesktop).toBeDefined();
      fireEvent.click(ctaDesktop);
      expect(handleCta).toHaveBeenCalledTimes(1);

      // Dots
      const dotButtons = screen.getAllByRole('tab', { name: /Ir para slide/i });
      expect(dotButtons.length).toBe(3);
      fireEvent.click(dotButtons[1]!);
      expect(handleDot).toHaveBeenCalledWith(1);

      // Mobile
      const titleMobile = screen.getByTestId('hero-title-mobile');
      expect(titleMobile).toBeDefined();
      expect(titleMobile.textContent).toContain('SEJA DONO DA');
    });
  });

  describe('CatalogFilterSidebar', () => {
    it('renders collections, price range, networks, and featured NFT banner', () => {
      const handleToggleCol = vi.fn();
      const handleToggleNet = vi.fn();
      const handleApplyPrice = vi.fn();

      render(
        <CatalogFilterSidebar
          selectedCollections={['col_cyber_jungle']}
          onToggleCollection={handleToggleCol}
          selectedNetworks={['ethereum']}
          onToggleNetwork={handleToggleNet}
          onApplyPriceRange={handleApplyPrice}
        />
      );

      // Coleções
      expect(screen.getByText('Coleções')).toBeDefined();
      expect(screen.getByText('Cyber Jungle')).toBeDefined();

      const colBtn = screen.getByRole('button', { name: /Cyber Jungle/i });
      fireEvent.click(colBtn);
      expect(handleToggleCol).toHaveBeenCalledWith('col_cyber_jungle');

      // Faixa de Preço
      expect(screen.getByRole('heading', { name: 'Faixa de preço' })).toBeDefined();
      const applyBtn = screen.getByTestId('apply-price-button');
      fireEvent.click(applyBtn);
      expect(handleApplyPrice).toHaveBeenCalledTimes(1);

      // Rede
      expect(screen.getByText('Rede')).toBeDefined();
      expect(screen.getByText('Ethereum')).toBeDefined();

      const netBtn = screen.getByRole('button', { name: /Ethereum/i });
      fireEvent.click(netBtn);
      expect(handleToggleNet).toHaveBeenCalledWith('ethereum');

      // NFT em Destaque
      expect(screen.getByText('NFT EM DESTAQUE')).toBeDefined();
      expect(screen.getByText('OFERTA LIMITADA')).toBeDefined();
    });
  });

  describe('HomePromoSection', () => {
    it('renders promotional cards and triggers onUnavailable when clicked', () => {
      const handleUnavailable = vi.fn();
      render(<HomePromoSection onUnavailable={handleUnavailable} />);

      expect(screen.getByTestId('home-promo-section')).toBeDefined();
      expect(screen.getByText(/Lançamentos gênesis/i)).toBeDefined();
      expect(screen.getByText(/Arte digital selecionada/i)).toBeDefined();

      const buttons = screen.getAllByRole('button', { name: /Explorar/i });
      expect(buttons.length).toBe(2);
      fireEvent.click(buttons[0]!);
      expect(handleUnavailable).toHaveBeenCalledWith('Lançamentos promocionais');
    });
  });

  describe('HomeBlogSection', () => {
    it('renders Diário da Cunhagem section with 4 cards and triggers onUnavailable on click', () => {
      const handleUnavailable = vi.fn();
      render(<HomeBlogSection onUnavailable={handleUnavailable} />);

      expect(screen.getByText('Diário da Cunhagem')).toBeDefined();
      expect(screen.getByText(/Histórias, guias e insights/i)).toBeDefined();

      const readMoreButtons = screen.getAllByRole('button', { name: /Ler mais/i });
      expect(readMoreButtons.length).toBe(4);
      fireEvent.click(readMoreButtons[0]!);
      expect(handleUnavailable).toHaveBeenCalledWith('Diário da Cunhagem');
    });
  });

  describe('HomePageContent', () => {
    const sampleItems = [
      {
        id: 'nft-01',
        title: 'Alpha Primate #01',
        collectionName: 'Cyber Jungle',
        priceEth: '1.25',
        previousPriceEth: '1.80',
        rarity: 'RARO',
        imageUrl: '/assets/images/nft-03-emerald-ape.png',
      },
      {
        id: 'nft-02',
        title: 'Neon Viper #02',
        collectionName: 'Neon Predators',
        priceEth: '0.85',
        imageUrl: '/assets/images/nft-04-sage-nomad.png',
      },
    ];

    it('renders loading skeleton with aria-busy="true" during data fetching', () => {
      render(<HomePageContent isLoading={true} items={[]} />);

      const loadingContainer = screen.getByTestId('catalog-loading-grid');
      expect(loadingContainer.getAttribute('aria-busy')).toBe('true');
      const skeletons = screen.getAllByTestId('catalog-card-skeleton');
      expect(skeletons.length).toBe(9);
    });

    it('renders ErrorState with retry button on query failure', () => {
      const handleRetry = vi.fn();
      render(
        <HomePageContent
          isError={true}
          error={new Error('Falha de conexão com a API')}
          onRetry={handleRetry}
        />
      );

      expect(screen.getByTestId('catalog-error-state')).toBeDefined();
      expect(screen.getByText(/Falha de conexão com a API/i)).toBeDefined();

      const retryBtn = screen.getByRole('button', { name: /Tentar novamente/i });
      fireEvent.click(retryBtn);
      expect(handleRetry).toHaveBeenCalledTimes(1);
    });

    it('renders EmptyState with clear filters action when no items match filters', () => {
      const handleClear = vi.fn();
      render(
        <HomePageContent
          items={[]}
          isLoading={false}
          isError={false}
          onClearFilters={handleClear}
        />
      );

      expect(screen.getByTestId('catalog-empty-state')).toBeDefined();
      expect(screen.getByText('Nenhum NFT encontrado')).toBeDefined();

      const clearBtn = screen.getByTestId('clear-filters-button');
      fireEvent.click(clearBtn);
      expect(handleClear).toHaveBeenCalledTimes(1);
    });

    it('renders success catalog grid with formatted prices, badges, and handlers', () => {
      const handleSelectNft = vi.fn();
      const handleTabChange = vi.fn();
      const handleSortChange = vi.fn();

      render(
        <HomePageContent
          items={sampleItems}
          activeTab="all"
          onTabChange={handleTabChange}
          sortBy="popular-desc"
          onSortChange={handleSortChange}
          onSelectNft={handleSelectNft}
          currentPage={1}
          totalPages={3}
        />
      );

      // Grid
      expect(screen.getByTestId('catalog-grid')).toBeDefined();
      expect(screen.getByText('Alpha Primate #01')).toBeDefined();
      expect(screen.getByText('1,25 ETH')).toBeDefined();
      expect(screen.getByText('1,80 ETH')).toBeDefined();
      expect(screen.getByText('RARO')).toBeDefined();

      // Click card
      const card = screen.getByTestId('catalog-item-nft-01');
      fireEvent.click(card);
      expect(handleSelectNft).toHaveBeenCalledWith('nft-01');

      // Abas
      const tabNew = screen.getByTestId('catalog-tab-new');
      fireEvent.click(tabNew);
      expect(handleTabChange).toHaveBeenCalledWith('new');

      // Ordenação
      const sortSelect = screen.getByTestId('catalog-sort-select');
      fireEvent.change(sortSelect, { target: { value: 'price-asc' } });
      expect(handleSortChange).toHaveBeenCalledWith('price-asc');

      // Paginação
      expect(screen.getByTestId('catalog-pagination')).toBeDefined();
      expect(screen.getByTestId('pagination-page-1')).toBeDefined();
      expect(screen.getByTestId('pagination-page-2')).toBeDefined();
      expect(screen.getByTestId('pagination-page-3')).toBeDefined();
    });
  });
});
