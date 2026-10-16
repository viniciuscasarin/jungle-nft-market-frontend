import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import * as React from 'react';
import { PdpGallery } from './pdp-gallery';
import { PdpPurchaseSection } from './pdp-purchase-section';
import { PdpTabs } from './pdp-tabs';
import { PdpRelatedCarousel } from './pdp-related-carousel';
import { PdpPageContent } from './pdp-page-content';


describe('PdpGallery', () => {
  it('renders a gallery with 2 columns: 4 thumbnails in first col and main image in second col', () => {
    render(<PdpGallery />);

    // Galeria possui largura de 573px no desktop e gap de 28px entre colunas
    const gallery = screen.getByTestId('pdp-gallery');
    expect(gallery.className).toContain('lg:w-[573px]');
    expect(gallery.className).toContain('gap-[28px]');

    // Coluna de miniaturas possui gap de 16px, miniaturas de 100px x 100px e é oculta no mobile (hidden lg:flex)
    const thumbnailsCol = screen.getByTestId('pdp-gallery-thumbnails-col');
    expect(thumbnailsCol.className).toContain('gap-[16px]');
    expect(thumbnailsCol.className).toContain('md:w-[100px]');
    expect(thumbnailsCol.className).toContain('hidden');
    expect(thumbnailsCol.className).toContain('lg:flex');

    const thumb0 = screen.getByTestId('pdp-thumbnail-0');
    expect(thumb0.className).toContain('w-[100px]');
    expect(thumb0.className).toContain('h-[100px]');
    expect(thumb0.className).toContain('border');
    expect(thumb0.className).toContain('border-primary');

    const thumb1 = screen.getByTestId('pdp-thumbnail-1');
    expect(thumb1.className).toContain('w-[100px]');
    expect(thumb1.className).toContain('h-[100px]');
    expect(thumb1.className).toContain('border');

    // Imagem principal dentro de wrapper com bg-surface-card e padding de 20px
    const mainWrapper = screen.getByTestId('pdp-main-image-wrapper');
    expect(mainWrapper.className).toContain('bg-surface-card');
    expect(mainWrapper.className).toContain('p-[20px]');

    // Indicador de zoom: div redonda 30x30px a 12px de top e right, com bg-surface-raised, visível apenas no desktop
    const zoomIndicator = screen.getByTestId('pdp-zoom-indicator');
    expect(zoomIndicator.className).toContain('w-[30px]');
    expect(zoomIndicator.className).toContain('h-[30px]');
    expect(zoomIndicator.className).toContain('rounded-full');
    expect(zoomIndicator.className).toContain('top-[12px]');
    expect(zoomIndicator.className).toContain('right-[12px]');
    expect(zoomIndicator.className).toContain('bg-surface-raised');
    expect(zoomIndicator.className).toContain('border-border-default');
    expect(zoomIndicator.className).toContain('hidden');
    expect(zoomIndicator.className).toContain('lg:flex');

    // Imagem principal
    const mainImgContainer = screen.getByTestId('pdp-main-image-container');
    expect(mainImgContainer.className).toContain('cursor-crosshair');

    const mainImg = screen.getByTestId('pdp-main-image') as HTMLImageElement;
    expect(mainImg).toBeDefined();
    expect(mainImg.src).toContain('/assets/images/nft-03-emerald-ape.png');
  });

  it('changes active image when clicking a thumbnail', () => {
    const handleSelect = vi.fn();
    render(<PdpGallery onSelectImage={handleSelect} />);

    const thumb1 = screen.getByTestId('pdp-thumbnail-1');
    fireEvent.click(thumb1);

    expect(handleSelect).toHaveBeenCalledWith(1);
    expect(thumb1.getAttribute('aria-selected')).toBe('true');

    const mainImg = screen.getByTestId('pdp-main-image') as HTMLImageElement;
    expect(mainImg.src).toContain('/assets/images/nft-03-emerald-ape.png');
  });

  it('handles mouse enter, move and leave for interactive zoom on desktop (>=1024px)', () => {
    // Garante viewport desktop
    window.innerWidth = 1200;
    render(<PdpGallery />);

    const mainImgContainer = screen.getByTestId('pdp-main-image-container');
    const mainImg = screen.getByTestId('pdp-main-image');

    // Inicialmente sem zoom
    expect(mainImg.style.transform).toBe('scale(1)');

    // Mock do getBoundingClientRect
    vi.spyOn(mainImgContainer, 'getBoundingClientRect').mockReturnValue({
      left: 100,
      top: 100,
      width: 400,
      height: 400,
      right: 500,
      bottom: 500,
      x: 100,
      y: 100,
      toJSON: () => {},
    });

    // Ao passar o mouse (hover e movimento)
    fireEvent.mouseEnter(mainImgContainer);
    fireEvent.mouseMove(mainImgContainer, { clientX: 200, clientY: 200 });

    expect(mainImg.style.transform).toBe('scale(1.9)');
    expect(mainImg.style.transformOrigin).toBe('25% 25%');

    // Ao retirar o mouse
    fireEvent.mouseLeave(mainImgContainer);
    expect(mainImg.style.transform).toBe('scale(1)');
    expect(mainImg.style.transformOrigin).toBe('50% 50%');
  });

  it('disables interactive hover zoom on mobile (<1024px)', () => {
    // Simula viewport mobile (ex: 414px)
    const originalWidth = window.innerWidth;
    window.innerWidth = 414;

    render(<PdpGallery />);

    const mainImgContainer = screen.getByTestId('pdp-main-image-container');
    const mainImg = screen.getByTestId('pdp-main-image');

    // Ao tentar hover no mobile, o zoom deve permanecer desativado
    fireEvent.mouseEnter(mainImgContainer);
    fireEvent.mouseMove(mainImgContainer, { clientX: 200, clientY: 200 });

    expect(mainImg.style.transform).toBe('scale(1)');

    // Restaura largura
    window.innerWidth = originalWidth;
  });
});

describe('PdpPurchaseSection', () => {
  it('renders strictly in the required sequential row order', () => {
    render(
      <PdpPurchaseSection
        title="Cyber Panther #8812"
        priceEth="2.50"
        priceUsd="R$ 38.000,00"
        rating={4.8}
        reviewCount={25}
        description="Arte com detalhes cibernéticos e acabamento holográfico."
        tokenId="#8812"
        collectionName="Panthers Genesis"
      />
    );

    // Linha 1: Nome do produto
    const title = screen.getByTestId('pdp-product-title');
    expect(title.textContent).toBe('Cyber Panther #8812');

    // Linha 2: Preço em ETH e estrelinhas
    const priceEth = screen.getByTestId('pdp-price-eth');
    expect(priceEth.textContent).toContain('2.50 ETH');
    expect(screen.getByTestId('pdp-rating-container')).toBeDefined();

    // Linha 3: Label "Sobre este NFT:" e descrição
    const aboutLabel = screen.getByTestId('pdp-about-label');
    expect(aboutLabel.textContent).toBe('Sobre este NFT:');
    const description = screen.getByTestId('pdp-product-description');
    expect(description.textContent).toBe('Arte com detalhes cibernéticos e acabamento holográfico.');

    // Linha 4: Options sobre qual versão do produto deseja comprar
    const versionsRow = screen.getByTestId('pdp-row-4-versions');
    expect(versionsRow).toBeDefined();
    expect(screen.getByTestId('pdp-version-option-v-1')).toBeDefined();

    // Linha 5: Seletor de quantidade seguido dos botões de comprar e favoritar
    expect(screen.getByTestId('pdp-quantity-stepper-container')).toBeDefined();
    expect(screen.getByTestId('pdp-buy-now-button')).toBeDefined();
    expect(screen.getByTestId('pdp-favorite-button')).toBeDefined();

    // Próximas linhas consecutivamente:
    // 1. ID do Token
    const tokenIdVal = screen.getByTestId('pdp-token-id-value');
    expect(tokenIdVal.textContent).toBe('#8812');

    // 2. Coleção
    const collectionVal = screen.getByTestId('pdp-collection-name');
    expect(collectionVal.textContent).toBe('Panthers Genesis');

    // 3. Atributos
    expect(screen.getByTestId('pdp-attributes-grid')).toBeDefined();
  });

  it('allows version selection in row 4', () => {
    const handleSelectVersion = vi.fn();
    render(<PdpPurchaseSection onSelectVersion={handleSelectVersion} />);

    const opt2 = screen.getByTestId('pdp-version-option-v-2');
    fireEvent.click(opt2);

    expect(handleSelectVersion).toHaveBeenCalledWith('v-2');
    expect(opt2.getAttribute('aria-checked')).toBe('true');
  });

  it('handles quantity change in row 5', () => {
    const handleQtyChange = vi.fn();
    render(<PdpPurchaseSection quantity={2} onQuantityChange={handleQtyChange} />);

    const plusButton = screen.getByRole('button', { name: /aumentar quantidade/i });
    fireEvent.click(plusButton);

    expect(handleQtyChange).toHaveBeenCalledWith(3);
  });

  it('handles favorite toggle in row 5', () => {
    const handleFavorite = vi.fn();
    render(<PdpPurchaseSection onFavoriteToggle={handleFavorite} />);

    const favButton = screen.getByTestId('pdp-favorite-button');
    expect(favButton.getAttribute('aria-pressed')).toBe('false');

    fireEvent.click(favButton);
    expect(handleFavorite).toHaveBeenCalledTimes(1);
    expect(favButton.getAttribute('aria-pressed')).toBe('true');
  });

  it('handles buy now action in row 5', () => {
    const handleBuy = vi.fn();
    render(<PdpPurchaseSection onBuyNow={handleBuy} />);

    const buyButton = screen.getByTestId('pdp-buy-now-button');
    fireEvent.click(buyButton);

    expect(handleBuy).toHaveBeenCalledTimes(1);
  });
});

describe('PdpTabs', () => {
  it('renders tabs with solid primary line header, 28px buttons with font-size 17, and tab content with font-size 14 line-height 24 text-secondary and padding-top 12px', () => {
    render(<PdpTabs />);

    // Cabeçalho das tabs tem linha sólida color primary e alinhamento estável (sem overflow-x-auto)
    const header = screen.getByTestId('pdp-tabs-header');
    expect(header.className).toContain('border-b');
    expect(header.className).toContain('border-solid');
    expect(header.className).toContain('border-primary');
    expect(header.className).not.toContain('overflow-x-auto');

    // Botões das tabs:
    // Tab 1: "Detalhes do NFT"
    const detailsTab = screen.getByTestId('pdp-tab-details-btn');
    expect(detailsTab.textContent).toBe('Detalhes do NFT');
    expect(detailsTab.className).toContain('h-[28px]');
    expect(detailsTab.className).toContain('text-[17px]');
    expect(detailsTab.className).toContain('-mb-[1px]');
    // Selecionado por padrão: color accent, bold, borda sólida de 2px da mesma cor do texto
    expect(detailsTab.getAttribute('aria-selected')).toBe('true');
    expect(detailsTab.className).toContain('text-accent');
    expect(detailsTab.className).toContain('font-bold');
    expect(detailsTab.className).toContain('border-b-2');
    expect(detailsTab.className).toContain('border-accent');

    // Tab 2: "Avaliacao de colecionadores (0)" (sempre 0 por padrão)
    const reviewsTab = screen.getByTestId('pdp-tab-reviews-btn');
    expect(reviewsTab.textContent).toBe('Avaliacao de colecionadores (0)');
    expect(reviewsTab.className).toContain('h-[28px]');
    expect(reviewsTab.className).toContain('text-[17px]');
    expect(reviewsTab.className).toContain('-mb-[1px]');
    // Não selecionado (normal): color foreground (text-text-primary)
    expect(reviewsTab.getAttribute('aria-selected')).toBe('false');
    expect(reviewsTab.className).toContain('text-text-primary');
    expect(reviewsTab.className).toContain('border-transparent');

    // Conteúdo da tab Detalhes: font size 14, line height 24, color text secondary, padding top 12px
    const content = screen.getByTestId('pdp-tabpanel-details');
    expect(content.className).toContain('text-[14px]');
    expect(content.className).toContain('leading-[24px]');
    expect(content.className).toContain('text-text-secondary');
    expect(content.className).toContain('pt-[12px]');

    // Descrição textual presente e card de especificações de contrato removido
    expect(screen.getByTestId('pdp-details-description-text')).toBeDefined();
    expect(screen.queryByTestId('pdp-details-specs-card')).toBeNull();
  });

  it('switches to reviews tab and shows message that there are no reviews yet', () => {
    const handleTabChange = vi.fn();
    render(<PdpTabs onTabChange={handleTabChange} />);

    const detailsTab = screen.getByTestId('pdp-tab-details-btn');
    const reviewsTab = screen.getByTestId('pdp-tab-reviews-btn');

    // Clica na tab de avaliações
    fireEvent.click(reviewsTab);

    expect(handleTabChange).toHaveBeenCalledWith('reviews');
    expect(reviewsTab.getAttribute('aria-selected')).toBe('true');
    expect(reviewsTab.className).toContain('text-accent');
    expect(reviewsTab.className).toContain('font-bold');
    expect(reviewsTab.className).toContain('border-accent');

    // A tab de detalhes agora está no estado normal
    expect(detailsTab.getAttribute('aria-selected')).toBe('false');
    expect(detailsTab.className).toContain('text-text-primary');

    // O painel ativo passa a ser o de avaliações exibindo a mensagem de que não há avaliações
    const reviewsPanel = screen.getByTestId('pdp-tabpanel-reviews');
    expect(reviewsPanel).toBeDefined();
    expect(reviewsPanel.className).toContain('text-[14px]');
    expect(reviewsPanel.className).toContain('leading-[24px]');
    expect(reviewsPanel.className).toContain('text-text-secondary');
    expect(reviewsPanel.className).toContain('pt-[12px]');

    const emptyMessage = screen.getByTestId('pdp-no-reviews-message');
    expect(emptyMessage.textContent).toContain('Ainda não há avaliações neste produto');
  });

  it('supports keyboard navigation with ArrowRight and ArrowLeft', () => {
    render(<PdpTabs />);

    const header = screen.getByTestId('pdp-tabs-header');
    const detailsTab = screen.getByTestId('pdp-tab-details-btn');
    const reviewsTab = screen.getByTestId('pdp-tab-reviews-btn');

    expect(detailsTab.getAttribute('aria-selected')).toBe('true');

    // Pressiona seta para a direita
    fireEvent.keyDown(header, { key: 'ArrowRight' });
    expect(reviewsTab.getAttribute('aria-selected')).toBe('true');

    // Pressiona seta para a esquerda
    fireEvent.keyDown(header, { key: 'ArrowLeft' });
    expect(detailsTab.getAttribute('aria-selected')).toBe('true');
  });
});

describe('PdpRelatedCarousel', () => {
  it('renders carousel header with "Mais dessa colecao", height 28px, font size 17 bold, text accent, border solid bottom 1px color primary', () => {
    render(<PdpRelatedCarousel />);

    const carousel = screen.getByTestId('pdp-related-carousel');
    expect(carousel).toBeDefined();

    // Cabeçalho com linha sólida color primary
    const header = screen.getByTestId('pdp-related-carousel-header');
    expect(header).toBeDefined();
    expect(header.className).toContain('border-b');
    expect(header.className).toContain('border-solid');
    expect(header.className).toContain('border-primary');

    // Título do cabeçalho
    const title = screen.getByTestId('pdp-related-carousel-title');
    expect(title.textContent).toBe('Mais dessa colecao');
    expect(title.className).toContain('h-[28px]');
    expect(title.className).toContain('text-[17px]');
    expect(title.className).toContain('font-bold');
    expect(title.className).toContain('text-accent');
  });

  it('renders carousel with 5 visible items, gap 26px, image 212x212 with 13px border inside surface card container py 20px px 4px, name foreground 15px with mt 12px, price accent 16px bold', () => {
    const handleSelect = vi.fn();
    render(<PdpRelatedCarousel onSelectItem={handleSelect} />);

    // Trilha com gap de 26px
    const track = screen.getByTestId('pdp-related-carousel-track');
    expect(track.className).toContain('gap-[26px]');

    // Exatamente 5 itens
    const items = ['related-1', 'related-2', 'related-3', 'related-4', 'related-5'];
    items.forEach((id) => {
      const itemElement = screen.getByTestId(`pdp-related-item-${id}`);
      expect(itemElement).toBeDefined();
      expect(itemElement.className).toContain('w-[220px]');

      // Container da cor surface card com py 20px e px 4px
      const container = screen.getByTestId(`pdp-related-image-container-${id}`);
      expect(container.className).toContain('bg-surface-card');
      expect(container.className).toContain('py-[20px]');
      expect(container.className).toContain('px-[4px]');

      // Imagem 212x212 com bordas 13px
      const img = screen.getByTestId(`pdp-related-image-${id}`);
      expect(img.className).toContain('w-[212px]');
      expect(img.className).toContain('h-[212px]');
      expect(img.className).toContain('rounded-[13px]');

      // Nome do item com mt 12px, color foreground (text-text-primary) e font size 15
      const name = screen.getByTestId(`pdp-related-name-${id}`);
      expect(name.className).toContain('mt-[12px]');
      expect(name.className).toContain('text-[15px]');
      expect(name.className).toContain('text-text-primary');

      // Preço com cor text accent, font size 16px e bold
      const price = screen.getByTestId(`pdp-related-price-${id}`);
      expect(price.className).toContain('text-[16px]');
      expect(price.className).toContain('font-bold');
      expect(price.className).toContain('text-accent');
    });

    // Teste de clique
    const firstItem = screen.getByTestId('pdp-related-item-related-1');
    fireEvent.click(firstItem);
    expect(handleSelect).toHaveBeenCalledTimes(1);
    expect(handleSelect).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'related-1',
        name: 'Cosmic Bloom #118',
        price: '1.29 ETH',
      })
    );

    // Paginação com 3 dots
    expect(screen.getByTestId('pdp-related-carousel-dots')).toBeDefined();
    expect(screen.getByTestId('pdp-related-dot-0')).toBeDefined();
    expect(screen.getByTestId('pdp-related-dot-1')).toBeDefined();
    expect(screen.getByTestId('pdp-related-dot-2')).toBeDefined();
  });

  it('supports mouse drag-to-scroll across items', () => {
    render(<PdpRelatedCarousel />);
    const track = screen.getByTestId('pdp-related-carousel-track');

    expect(track.className).toContain('cursor-grab');

    // Inicia drag com mouse down
    fireEvent.mouseDown(track, { pageX: 500 });
    expect(track.className).toContain('cursor-grabbing');

    // Movimenta cursor para arrastar
    fireEvent.mouseMove(track, { pageX: 300 });

    // Finaliza drag com mouse up
    fireEvent.mouseUp(track);
    expect(track.className).toContain('cursor-grab');
  });
});

describe('PdpPageContent', () => {
  it('renders 3 rows: row 1 (gallery & purchase), row 2 (tabs), row 3 (carousel "Mais dessa colecao")', () => {
    render(<PdpPageContent />);

    // Primeira linha: Galeria e Seção de compra
    const firstRowGrid = screen.getByTestId('pdp-first-row-grid');
    expect(firstRowGrid).toBeDefined();

    const colGallery = screen.getByTestId('pdp-col-gallery');
    expect(colGallery).toBeDefined();

    const colPurchase = screen.getByTestId('pdp-col-purchase-info');
    expect(colPurchase).toBeDefined();

    expect(screen.getByTestId('pdp-gallery')).toBeDefined();
    expect(screen.getByTestId('pdp-purchase-section')).toBeDefined();

    // Segunda linha: Tabs "Detalhes do NFT" e "Avaliacao de colecionadores (0)"
    const secondRow = screen.getByTestId('pdp-second-row-tabs');
    expect(secondRow).toBeDefined();
    expect(screen.getByTestId('pdp-tabs-container')).toBeDefined();
    expect(screen.getByTestId('pdp-tab-details-btn')).toBeDefined();
    expect(screen.getByTestId('pdp-tab-reviews-btn').textContent).toBe('Avaliacao de colecionadores (0)');

    // Terceira linha: Carrossel "Mais dessa colecao"
    const thirdRow = screen.getByTestId('pdp-third-row-carousel');
    expect(thirdRow).toBeDefined();
    expect(screen.getByTestId('pdp-related-carousel')).toBeDefined();
    expect(screen.getByTestId('pdp-related-carousel-title').textContent).toBe('Mais dessa colecao');
  });

  it('renders mobile-specific elements: mobile top bar with back & favorite, rating pill badge, card overlap with 40px radius, and sticky buy bar', () => {
    const handleBack = vi.fn();
    const handleFavorite = vi.fn();
    const handleBuyNow = vi.fn();
    const handleAddToCart = vi.fn();
    const handleQtyChange = vi.fn();

    render(
      <PdpPageContent
        title="Emerald Ape #042"
        priceEth="1.19"
        rating={4.8}
        reviewCount={19}
        onBack={handleBack}
        onFavoriteToggle={handleFavorite}
        onBuyNow={handleBuyNow}
        onAddToCart={handleAddToCart}
        onQuantityChange={handleQtyChange}
      />
    );

    // Background degradê da seção superior no mobile (#241612 -> #2F1D15)
    const gradientBg = screen.getByTestId('pdp-mobile-top-gradient-bg');
    expect(gradientBg.className).toContain('lg:hidden');
    expect(gradientBg.className).toContain('from-[#241612]');
    expect(gradientBg.className).toContain('to-[#2F1D15]');

    // Barra superior mobile com botão voltar e botão favoritar
    const mobileTopBar = screen.getByTestId('pdp-mobile-top-bar');
    expect(mobileTopBar.className).toContain('lg:hidden');

    const backButton = screen.getByTestId('pdp-mobile-back-button');
    fireEvent.click(backButton);
    expect(handleBack).toHaveBeenCalledTimes(1);

    const favButton = screen.getByTestId('pdp-mobile-favorite-button');
    expect(favButton.getAttribute('aria-pressed')).toBe('false');
    fireEvent.click(favButton);
    expect(handleFavorite).toHaveBeenCalledTimes(1);

    // Badge de rating em pill no topo ao lado do título
    const ratingBadge = screen.getByTestId('pdp-mobile-rating-badge');
    expect(ratingBadge.className).toContain('lg:hidden');
    expect(ratingBadge.textContent).toContain('★');
    expect(ratingBadge.textContent).toContain('4.8');
    expect(ratingBadge.textContent).toContain('(19)');

    // Sobreposição do card de compra com raio 40px e colado nas laterais da tela no mobile (w-full sem margem lateral)
    const purchaseCol = screen.getByTestId('pdp-col-purchase-info');
    expect(purchaseCol.className).toContain('-mt-[36px]');
    expect(purchaseCol.className).toContain('rounded-t-[40px]');
    expect(purchaseCol.className).toContain('bg-surface-card');
    expect(purchaseCol.className).toContain('w-full');
    expect(purchaseCol.className).toContain('m-0');

    // Barra fixa de compra na base (Sticky Buy Bar) com shadow e borda arredondada 40px
    const stickyBuyBar = screen.getByTestId('pdp-mobile-sticky-buy-bar');
    expect(stickyBuyBar.className).toContain('fixed');
    expect(stickyBuyBar.className).toContain('bottom-0');
    expect(stickyBuyBar.className).toContain('lg:hidden');
    expect(stickyBuyBar.className).toContain('rounded-t-[40px]');
    expect(stickyBuyBar.style.borderRadius).toBe('40px 40px 0px 0px');
    expect(stickyBuyBar.style.boxShadow).toBe('0px 0px 20px rgba(10, 6, 4, 0.45)');

    // Preço em destaque na barra fixa
    const priceEth = screen.getByTestId('pdp-mobile-price-eth');
    expect(priceEth.textContent).toBe('1.19 ETH');

    // Stepper de quantidade na barra fixa
    const qtyValue = screen.getByTestId('pdp-mobile-quantity-value');
    expect(qtyValue.textContent).toBe('1');

    const incrementBtn = screen.getByTestId('pdp-mobile-qty-increment');
    fireEvent.click(incrementBtn);
    expect(handleQtyChange).toHaveBeenCalledWith(2);
    expect(qtyValue.textContent).toBe('2');

    const decrementBtn = screen.getByTestId('pdp-mobile-qty-decrement');
    fireEvent.click(decrementBtn);
    expect(handleQtyChange).toHaveBeenCalledWith(1);
    expect(qtyValue.textContent).toBe('1');

    // Botão Comprar NFT na barra fixa
    const buyButton = screen.getByTestId('pdp-mobile-buy-button');
    expect(buyButton.textContent).toBe('Comprar NFT');
    fireEvent.click(buyButton);
    expect(handleBuyNow).toHaveBeenCalledTimes(1);

    // Botão de Carrinho na barra fixa
    const cartButton = screen.getByTestId('pdp-mobile-cart-button');
    fireEvent.click(cartButton);
    expect(handleAddToCart).toHaveBeenCalledTimes(1);
  });
});


