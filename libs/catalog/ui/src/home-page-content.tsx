import * as React from 'react';
import {
  cn,
  IconSliders,
  IconSearch,
  IconHeart,
  MobileTabBar,
  Drawer,
  DrawerContent,
} from '@nft/shared-ui';
import { HomeHeroBanner } from './home-hero-banner';
import { CatalogFilterSidebar } from './catalog-filter-sidebar';
import { HomePromoSection } from './home-promo-section';
import { HomeBlogSection } from './home-blog-section';

export interface CatalogNftItem {
  id: string;
  title: string;
  collectionName?: string | undefined;
  priceEth: string;
  previousPriceEth?: string | undefined;
  rarity?: string | undefined;
  imageUrl: string;
  isFavorite?: boolean | undefined;
}

export interface HomePageContentProps {
  items?: CatalogNftItem[] | undefined;
  onSelectNft?: ((id: string) => void) | undefined;
  onAddToCart?: ((id: string) => void) | undefined;
  onFavoriteToggle?: ((id: string) => void) | undefined;
  className?: string | undefined;
}

export const DEFAULT_CATALOG_NFTS: CatalogNftItem[] = [
  {
    id: 'nft-042',
    title: 'Emerald Ape #042',
    collectionName: 'Ape Society',
    priceEth: '1.19',
    imageUrl: '/assets/images/nft-03-emerald-ape.png',
  },
  {
    id: 'nft-009',
    title: 'Sage Nomad #009',
    collectionName: 'Nomad Wanderers',
    priceEth: '1.69',
    imageUrl: '/assets/images/nft-04-sage-nomad.png',
  },
  {
    id: 'nft-552',
    title: 'Neon Vessel #552',
    collectionName: 'Cyber Nomads',
    priceEth: '1.99',
    previousPriceEth: '2.29',
    rarity: 'RARO',
    imageUrl: '/assets/images/nft-05-neon-vessel.png',
  },
  {
    id: 'nft-118',
    title: 'Cosmic Bloom #118',
    collectionName: 'Botanical Bots',
    priceEth: '1.29',
    imageUrl: '/assets/images/nft-06-cosmic-bloom.png',
  },
  {
    id: 'nft-314',
    title: 'Violet Nomad #314',
    collectionName: 'Nomad Wanderers',
    priceEth: '1.39',
    imageUrl: '/assets/images/nft-07-violet-nomad.png',
  },
  {
    id: 'nft-088',
    title: 'Ivory Baron #088',
    collectionName: 'Baron Club',
    priceEth: '1.79',
    imageUrl: '/assets/images/nft-08-ivory-baron.png',
  },
  {
    id: 'nft-207',
    title: 'Golden Beat #207',
    collectionName: 'Sonic Apes',
    priceEth: '0.99',
    imageUrl: '/assets/images/nft-09-golden-beat.png',
  },
  {
    id: 'nft-104',
    title: 'Apex Ape #104',
    collectionName: 'Apex Tribe',
    priceEth: '2.15',
    imageUrl: '/assets/images/nft-10-artwork.png',
  },
  {
    id: 'nft-160',
    title: 'Golden Signal #160',
    collectionName: 'Sonic Apes',
    priceEth: '0.39',
    imageUrl: '/assets/images/nft-11-golden-signal.png',
  },
];

export const HomePageContent: React.FC<HomePageContentProps> = ({
  items = DEFAULT_CATALOG_NFTS,
  onSelectNft,
  onFavoriteToggle,
  className,
}) => {
  // Estado de abas
  const [activeTab, setActiveTab] = React.useState<'all' | 'new' | 'trending'>('all');

  // Estado de ordenação
  const [sortBy, setSortBy] = React.useState('recent');

  // Estado de filtros
  const [selectedCollections, setSelectedCollections] = React.useState<string[]>([]);
  const [selectedNetworks, setSelectedNetworks] = React.useState<string[]>([]);
  const [priceRange, setPriceRange] = React.useState<[number, number]>([0.02, 12.3]);

  // Drawer de filtros mobile
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = React.useState(false);

  // Paginação
  const [currentPage, setCurrentPage] = React.useState(1);

  // Mensagem temporária de notificação
  const [toastMessage, setToastMessage] = React.useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  const handleToggleCollection = (colId: string) => {
    setSelectedCollections((prev) =>
      prev.includes(colId) ? prev.filter((id) => id !== colId) : [...prev, colId]
    );
  };

  const handleToggleNetwork = (netId: string) => {
    setSelectedNetworks((prev) =>
      prev.includes(netId) ? prev.filter((id) => id !== netId) : [...prev, netId]
    );
  };

  const handleClearFilters = () => {
    setSelectedCollections([]);
    setSelectedNetworks([]);
    setPriceRange([0.02, 12.3]);
    showToast('Filtros redefinidos');
  };

  return (
    <div
      data-testid="home-page-content"
      className={cn(
        'w-full max-w-[1440px] mx-auto px-4 sm:px-6 md:px-10 lg:px-[120px] font-mono text-text-primary py-4 sm:py-6 pb-24 lg:pb-12',
        className
      )}
    >
      {/* Toast Notification Acessível */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-24 right-4 sm:bottom-6 sm:right-6 z-50 bg-surface-raised border border-primary text-text-primary text-caption-12 px-4 py-3 rounded-xl shadow-2xl animate-in fade-in slide-in-from-bottom-3 duration-200"
        >
          {toastMessage}
        </div>
      )}

      {/* BARRA DE PESQUISA & FILTRO MOBILE (Fiel ao frame 14:5226 do Figma) */}
      <div className="lg:hidden mb-5 flex items-center gap-3">
        <button
          type="button"
          onClick={() => setIsFilterDrawerOpen(true)}
          aria-label="Explorar coleções e abrir filtros"
          className="flex-1 relative flex items-center bg-surface-card border border-border-default/70 rounded-[14px] px-3.5 h-[48px] shadow-sm text-left cursor-pointer active:scale-[0.99] transition-transform"
        >
          <IconSearch className="w-5 h-5 text-text-secondary mr-2.5 shrink-0" aria-hidden="true" />
          <span className="text-caption-13 text-text-secondary font-mono">
            Explorar coleções
          </span>
        </button>

        <button
          type="button"
          onClick={() => setIsFilterDrawerOpen(true)}
          aria-label="Abrir painel de filtros"
          className="h-[48px] w-[48px] flex items-center justify-center rounded-[14px] bg-primary text-ink hover:bg-primary-hover active:scale-95 transition-all shadow-md shrink-0 cursor-pointer"
        >
          <IconSliders className="w-5 h-5" aria-hidden="true" />
        </button>
      </div>

      {/* 1. SEÇÃO HERO BANNER */}
      <HomeHeroBanner
        onCtaClick={() => {
          const el = document.getElementById('catalogo');
          el?.scrollIntoView?.({ behavior: 'smooth' });
        }}
      />

      {/* 2. SEÇÃO CATÁLOGO & DESCOBERTA */}
      <section
        id="catalogo"
        data-testid="home-catalog-section"
        className="mt-6 sm:mt-16 scroll-mt-6"
        aria-label="Catálogo de Colecionáveis"
      >
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">
          {/* COLUNA ESQUERDA: Sidebar de Filtros Desktop (310px) */}
          <div className="hidden lg:block w-[310px] shrink-0 sticky top-6">
            <CatalogFilterSidebar
              selectedCollections={selectedCollections}
              onToggleCollection={handleToggleCollection}
              priceRange={priceRange}
              onPriceRangeChange={setPriceRange}
              onApplyPriceRange={() => showToast('Faixa de preço aplicada ao catálogo')}
              selectedNetworks={selectedNetworks}
              onToggleNetwork={handleToggleNetwork}
              onClearFilters={handleClearFilters}
              featuredNft={{
                title: 'NFT EM DESTAQUE',
                subtitle: 'OFERTA LIMITADA',
                imageUrl: '/assets/images/featured-nft.png',
                onClick: () => {
                  onSelectNft?.('nft-009');
                  showToast('Navegando para o NFT em Destaque...');
                },
              }}
            />
          </div>

          {/* COLUNA DIREITA: Área do Catálogo */}
          <div className="flex-1 min-w-0 w-full">
            {/* Barra Superior do Catálogo: Abas e Ordenação */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border-default/60">
              {/* Abas */}
              <div
                role="tablist"
                aria-label="Categorias de exibição de NFTs"
                className="w-full sm:w-auto flex items-center gap-6 overflow-x-auto sm:overflow-visible scrollbar-none [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden border-b border-border-default/60 sm:border-b-0 select-none"
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeTab === 'all'}
                  onClick={() => setActiveTab('all')}
                  className={cn(
                    'text-caption-13 font-bold transition-colors pb-3 -mb-[1px] whitespace-nowrap cursor-pointer border-b-2 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary',
                    activeTab === 'all'
                      ? 'text-text-accent border-primary'
                      : 'text-text-secondary hover:text-text-primary border-transparent'
                  )}
                >
                  Todos os NFTs
                </button>

                <button
                  type="button"
                  role="tab"
                  aria-selected={activeTab === 'new'}
                  onClick={() => setActiveTab('new')}
                  className={cn(
                    'text-caption-13 font-bold transition-colors pb-3 -mb-[1px] whitespace-nowrap cursor-pointer border-b-2 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary',
                    activeTab === 'new'
                      ? 'text-text-accent border-primary'
                      : 'text-text-secondary hover:text-text-primary border-transparent'
                  )}
                >
                  Novos lançamentos
                </button>

                <button
                  type="button"
                  role="tab"
                  aria-selected={activeTab === 'trending'}
                  onClick={() => setActiveTab('trending')}
                  className={cn(
                    'text-caption-13 font-bold transition-colors pb-3 -mb-[1px] whitespace-nowrap cursor-pointer border-b-2 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary',
                    activeTab === 'trending'
                      ? 'text-text-accent border-primary'
                      : 'text-text-secondary hover:text-text-primary border-transparent'
                  )}
                >
                  Em alta
                </button>
              </div>

              {/* Controles da Direita: Ordenação (Apenas Desktop lg+) */}
              <div className="hidden lg:flex items-center justify-end gap-3 pb-2.5">
                <div className="flex items-center gap-2 text-caption-12 text-text-secondary">
                  <label htmlFor="catalog-sort-select">
                    Ordenar por:
                  </label>
                  <select
                    id="catalog-sort-select"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    aria-label="Opções de ordenação"
                    className="bg-surface-card border border-border-default text-text-primary text-caption-12 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-primary cursor-pointer font-mono"
                  >
                    <option value="recent">Listados recentemente</option>
                    <option value="price-asc">Menor preço</option>
                    <option value="price-desc">Maior preço</option>
                    <option value="popular">Mais populares</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Grid de NFTs (3 Colunas no Desktop, 2 Colunas no Mobile - Fiel ao Figma frame 14:5226) */}
            <div
              data-testid="catalog-nft-grid"
              className="grid grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-6 mt-6"
            >
              {items.map((item, index) => {
                const formattedPrice = item.priceEth.includes('ETH') ? item.priceEth : `${item.priceEth} ETH`;
                const formattedPreviousPrice = item.previousPriceEth
                  ? item.previousPriceEth.includes('ETH')
                    ? item.previousPriceEth
                    : `${item.previousPriceEth} ETH`
                  : undefined;

                return (
                  <button
                    key={item.id}
                    type="button"
                    data-testid={`catalog-item-${item.id}`}
                    data-item-index={index}
                    aria-label={`${item.title}, preço ${formattedPrice}`}
                    onClick={() => onSelectNft?.(item.id)}
                    className="w-full flex flex-col group cursor-pointer text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface-default rounded-[16px] transition-transform duration-150 hover:-translate-y-1 border-none bg-transparent p-0"
                  >
                    {/* Container da cor surface card com badges e imagem */}
                    <div
                      data-testid={`catalog-image-container-${item.id}`}
                      className="w-full bg-surface-card py-3 sm:py-[20px] px-2 sm:px-[4px] flex items-center justify-center rounded-[16px] sm:rounded-[20px] border border-border-default/40 group-hover:border-border-accessible/60 transition-colors relative overflow-hidden"
                    >
                      {/* Badge RARO sobreposto (Fiel ao Figma frame 14:5226) */}
                      {item.rarity === 'RARO' && (
                        <span className="absolute top-2 left-2 sm:top-2.5 sm:left-2.5 bg-primary text-ink text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider shadow-sm z-10 select-none">
                          RARO
                        </span>
                      )}

                      {/* Botão de Favorito no topo direito (Fiel ao Figma) */}
                      <button
                        type="button"
                        aria-label={`Favoritar ${item.title}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onFavoriteToggle?.(item.id);
                          showToast(`Favorito alternado: ${item.title}`);
                        }}
                        className="absolute top-2 right-2 sm:top-2.5 sm:right-2.5 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#140d0a]/70 hover:bg-[#140d0a] backdrop-blur-sm flex items-center justify-center text-text-secondary hover:text-text-coral active:scale-90 transition-all cursor-pointer z-10"
                      >
                        <IconHeart className="w-3.5 h-3.5 sm:w-4 sm:h-4" aria-hidden="true" />
                      </button>

                      {/* Imagem responsiva com bordas arredondadas */}
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        data-testid={`catalog-image-${item.id}`}
                        className="w-full max-w-[212px] aspect-square rounded-[12px] sm:rounded-[14px] object-cover shrink-0 select-none pointer-events-none"
                        loading="lazy"
                        draggable={false}
                      />
                    </div>

                    {/* Nome do item */}
                    <span
                      data-testid={`catalog-name-${item.id}`}
                      className="mt-2.5 text-[14px] sm:text-[15px] text-text-primary truncate block font-medium group-hover:text-accent transition-colors"
                      title={item.title}
                    >
                      {item.title}
                    </span>

                    {/* Preço do item */}
                    <span
                      data-testid={`catalog-price-${item.id}`}
                      className="mt-0.5 text-[14px] sm:text-[16px] font-bold text-accent block"
                    >
                      {formattedPrice}
                      {formattedPreviousPrice && (
                        <span className="text-[13px] sm:text-[14px] line-through text-text-muted ml-2 font-normal">
                          {formattedPreviousPrice}
                        </span>
                      )}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Paginação do Catálogo: [ 1 ] [ 2 ] [ 3 ] [ 4 ] [ > ] */}
            <div
              data-testid="catalog-pagination"
              className="flex items-center justify-end gap-2 mt-12"
              role="navigation"
              aria-label="Paginação do catálogo"
            >
              {[1, 2, 3, 4].map((page) => {
                const isActive = page === currentPage;
                return (
                  <button
                    key={page}
                    type="button"
                    onClick={() => {
                      setCurrentPage(page);
                      showToast(`Página ${page} carregada`);
                      const el = document.getElementById('catalogo');
                      el?.scrollIntoView?.({ behavior: 'smooth' });
                    }}
                    aria-current={isActive ? 'page' : undefined}
                    aria-label={`Página ${page}`}
                    className={cn(
                      'w-9 h-9 flex items-center justify-center rounded-sm text-caption-12 font-bold transition-all cursor-pointer',
                      isActive
                        ? 'bg-primary text-ink shadow-sm'
                        : 'border border-border-default text-text-foreground hover:border-primary hover:text-text-primary bg-transparent'
                    )}
                  >
                    {page}
                  </button>
                );
              })}

              {/* Botão Próxima Página */}
              <button
                type="button"
                onClick={() => {
                  const nextPage = Math.min(4, currentPage + 1);
                  setCurrentPage(nextPage);
                  showToast(`Página ${nextPage} carregada`);
                }}
                disabled={currentPage === 4}
                aria-label="Próxima página"
                className="w-9 h-9 flex items-center justify-center rounded-sm text-caption-12 font-bold border border-border-default text-text-foreground hover:border-primary hover:text-text-primary bg-transparent disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
              >
                &gt;
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 3. SEÇÃO PROMOÇÕES (Lançamentos Gênesis & Arte Selecionada) */}
      <HomePromoSection />

      {/* 4. SEÇÃO BLOG ("Diário da Cunhagem") */}
      <HomeBlogSection />

      {/* BARRA DE NAVEGAÇÃO INFERIOR FIXA (Visível exclusivamente no mobile < md) */}
      <MobileTabBar activeId="home" cartCount={2} />

      {/* DRAWER LATERAL DE FILTROS PARA MOBILE / TABLET */}
      <Drawer open={isFilterDrawerOpen} onOpenChange={setIsFilterDrawerOpen}>
        <DrawerContent side="left" className="w-[320px] max-w-[85vw] p-6 bg-surface-card">
          <div className="flex items-center justify-between pb-4 border-b border-border-default mb-6">
            <h3 className="text-title-20 font-bold text-text-primary">Filtros</h3>
          </div>
          <div className="overflow-y-auto max-h-[calc(100vh-140px)] pr-2">
            <CatalogFilterSidebar
              selectedCollections={selectedCollections}
              onToggleCollection={handleToggleCollection}
              priceRange={priceRange}
              onPriceRangeChange={setPriceRange}
              selectedNetworks={selectedNetworks}
              onToggleNetwork={handleToggleNetwork}
              onClearFilters={handleClearFilters}
              onApplyPriceRange={() => {
                setIsFilterDrawerOpen(false);
                showToast('Filtros aplicados!');
              }}
            />
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
};
