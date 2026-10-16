import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import * as React from 'react';
import { HomeHeroBanner } from './home-hero-banner';
import { CatalogFilterSidebar } from './catalog-filter-sidebar';
import { HomePromoSection } from './home-promo-section';
import { HomeBlogSection } from './home-blog-section';
import { HomePageContent } from './home-page-content';

describe('Home Components', () => {
  describe('HomeHeroBanner', () => {
    it('renders hero title, subtitle, CTA button, dots and artworks for desktop and mobile', () => {
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
      const dots = screen.getByTestId('hero-dots-desktop');
      expect(dots).toBeDefined();
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
          selectedCollections={['arte-digital']}
          onToggleCollection={handleToggleCol}
          selectedNetworks={['ethereum']}
          onToggleNetwork={handleToggleNet}
          onApplyPriceRange={handleApplyPrice}
        />
      );

      // Coleções
      expect(screen.getByText('Coleções')).toBeDefined();
      expect(screen.getByText('Arte digital')).toBeDefined();
      expect(screen.getByText('(33)')).toBeDefined();

      const colBtn = screen.getByRole('button', { name: /Arte digital/i });
      fireEvent.click(colBtn);
      expect(handleToggleCol).toHaveBeenCalledWith('arte-digital');

      // Faixa de Preço
      expect(screen.getByRole('heading', { name: 'Faixa de preço' })).toBeDefined();
      const applyBtn = screen.getByTestId('apply-price-button');
      fireEvent.click(applyBtn);
      expect(handleApplyPrice).toHaveBeenCalledTimes(1);

      // Rede
      expect(screen.getByText('Rede')).toBeDefined();
      expect(screen.getByText('Ethereum')).toBeDefined();
      expect(screen.getByText('(119)')).toBeDefined();

      const netBtn = screen.getByRole('button', { name: /Ethereum/i });
      fireEvent.click(netBtn);
      expect(handleToggleNet).toHaveBeenCalledWith('ethereum');

      // NFT em Destaque
      expect(screen.getByText('NFT EM DESTAQUE')).toBeDefined();
      expect(screen.getByText('OFERTA LIMITADA')).toBeDefined();
    });
  });

  describe('HomePromoSection', () => {
    it('renders both promotional cards with titles, descriptions and CTAs', () => {
      render(<HomePromoSection />);

      expect(screen.getByTestId('home-promo-section')).toBeDefined();
      expect(screen.getByText(/Lançamentos gênesis/i)).toBeDefined();
      expect(screen.getByText(/Arte digital selecionada/i)).toBeDefined();
      expect(screen.getAllByRole('button', { name: /Explorar/i }).length).toBe(2);
    });
  });

  describe('HomeBlogSection', () => {
    it('renders Diário da Cunhagem section with 4 blog cards and read more buttons', () => {
      render(<HomeBlogSection />);

      expect(screen.getByText('Diário da Cunhagem')).toBeDefined();
      expect(screen.getByText(/Histórias, guias e insights/i)).toBeDefined();

      expect(screen.getByText('Como funciona a propriedade de NFTs')).toBeDefined();
      expect(screen.getByText('10 artistas digitais para acompanhar')).toBeDefined();
      expect(screen.getByText('Raridade, atributos e procedência')).toBeDefined();
      expect(screen.getByText('Como proteger sua carteira')).toBeDefined();

      expect(screen.getAllByRole('button', { name: /Ler mais/i }).length).toBe(4);
    });
  });

  describe('HomePageContent', () => {
    it('renders the complete Home layout including hero, catalog, promos and blog', () => {
      const handleSelectNft = vi.fn();
      const handleAddToCart = vi.fn();

      render(
        <HomePageContent
          onSelectNft={handleSelectNft}
          onAddToCart={handleAddToCart}
        />
      );

      // Hero
      expect(screen.getByTestId('home-hero-banner')).toBeDefined();

      // Abas de categoria
      const tabAll = screen.getByRole('tab', { name: 'Todos os NFTs' });
      const tabNew = screen.getByRole('tab', { name: 'Novos lançamentos' });
      const tabTrending = screen.getByRole('tab', { name: 'Em alta' });

      expect(tabAll.getAttribute('aria-selected')).toBe('true');
      expect(tabNew.getAttribute('aria-selected')).toBe('false');

      fireEvent.click(tabNew);
      expect(tabNew.getAttribute('aria-selected')).toBe('true');

      fireEvent.click(tabTrending);
      expect(tabTrending.getAttribute('aria-selected')).toBe('true');

      // Grid de NFTs - 9 cards renderizados
      const nftGrid = screen.getByTestId('catalog-nft-grid');
      expect(nftGrid).toBeDefined();

      expect(screen.getByText('Emerald Ape #042')).toBeDefined();
      expect(screen.getByText('Sage Nomad #009')).toBeDefined();
      expect(screen.getByText('Neon Vessel #552')).toBeDefined();
      expect(screen.getByText('Cosmic Bloom #118')).toBeDefined();
      expect(screen.getByText('Violet Nomad #314')).toBeDefined();
      expect(screen.getByText('Ivory Baron #088')).toBeDefined();
      expect(screen.getByText('Golden Beat #207')).toBeDefined();
      expect(screen.getByText('Apex Ape #104')).toBeDefined();
      expect(screen.getByText('Golden Signal #160')).toBeDefined();

      // Card com preço promocional / riscado
      expect(screen.getByText('1.99 ETH')).toBeDefined();
      expect(screen.getByText('2.29 ETH')).toBeDefined();

      // Paginação
      const pagination = screen.getByTestId('catalog-pagination');
      expect(pagination).toBeDefined();
      expect(screen.getByRole('button', { name: 'Página 1' })).toBeDefined();
      expect(screen.getByRole('button', { name: 'Página 2' })).toBeDefined();

      // Alternar página
      fireEvent.click(screen.getByRole('button', { name: 'Página 2' }));
      expect(screen.getByRole('button', { name: 'Página 2' }).getAttribute('aria-current')).toBe('page');

      // Promoções e Blog
      expect(screen.getByTestId('home-promo-section')).toBeDefined();
      expect(screen.getByTestId('home-blog-section')).toBeDefined();

      // Recursos Mobile (Fiel ao frame 14:5226 do Figma)
      expect(screen.getByRole('button', { name: /Explorar coleções/i })).toBeDefined();
      expect(screen.getByRole('button', { name: 'Abrir painel de filtros' })).toBeDefined();
      expect(screen.getByText('RARO')).toBeDefined();
      expect(screen.getByRole('button', { name: 'Favoritar Emerald Ape #042' })).toBeDefined();
      expect(screen.getByRole('navigation', { name: 'Navegação móvel' })).toBeDefined();
    });
  });
});
