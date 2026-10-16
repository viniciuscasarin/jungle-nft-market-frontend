import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within, fn } from '@storybook/test';
import { HomePageContent } from './home-page-content';

const mockNfts = [
  {
    id: 'nft-01',
    title: 'Cyber Ape #3421',
    collectionName: 'Jungle Genesis',
    priceEth: '1.25',
    imageUrl: '/assets/images/nft-03.png',
    rarity: 'Lendário',
  },
  {
    id: 'nft-02',
    title: 'Pixel Dragon #891',
    collectionName: 'Art Gallery',
    priceEth: '0.85',
    previousPriceEth: '1.50',
    imageUrl: '/assets/images/nft-04.png',
    rarity: 'Raro',
  },
  {
    id: 'nft-03',
    title: 'Abstract Mind #4567',
    collectionName: 'Digital Horizons',
    priceEth: '2.10',
    imageUrl: '/assets/images/nft-05.png',
  },
  {
    id: 'nft-04',
    title: 'Neon City #1234',
    collectionName: 'Metaverse Realms',
    priceEth: '0.75',
    imageUrl: '/assets/images/nft-06.png',
    rarity: 'Comum',
  },
  {
    id: 'nft-05',
    title: 'Cosmic Explorer #7890',
    collectionName: 'Space Odyssey',
    priceEth: '3.50',
    previousPriceEth: '4.00',
    imageUrl: '/assets/images/nft-07.png',
    rarity: 'Épico',
  },
  {
    id: 'nft-06',
    title: 'Digital Flora #5678',
    collectionName: 'Nature Collection',
    priceEth: '1.00',
    imageUrl: '/assets/images/nft-08.png',
  },
];

const mockFacets = {
  collections: [
    { id: 'jungle-genesis', label: 'Jungle Genesis', count: 42 },
    { id: 'art-gallery', label: 'Art Gallery', count: 28 },
    { id: 'digital-horizons', label: 'Digital Horizons', count: 15 },
    { id: 'metaverse-realms', label: 'Metaverse Realms', count: 33 },
  ],
  networks: [
    { id: 'ethereum' as const, label: 'Ethereum', count: 58 },
    { id: 'polygon' as const, label: 'Polygon', count: 34 },
    { id: 'solana' as const, label: 'Solana', count: 26 },
  ],
};

const meta: Meta<typeof HomePageContent> = {
  title: 'Catalog/HomePageContent',
  component: HomePageContent,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/dKMJKBVdX6q0Ym4OX5vd3V',
    },
  },
  args: {
    items: mockNfts,
    facets: mockFacets,
    activeTab: 'all',
    sortBy: 'popular-desc',
    selectedCollections: [],
    selectedNetworks: [],
    currentPage: 1,
    totalPages: 3,
    onTabChange: fn(),
    onSortChange: fn(),
    onToggleCollection: fn(),
    onToggleNetwork: fn(),
    onPriceRangeChange: fn(),
    onApplyPriceRange: fn(),
    onClearFilters: fn(),
    onPageChange: fn(),
    onSelectNft: fn(),
    onFavoriteToggle: fn(),
    onUnavailable: fn(),
    onOpenFilterDrawerChange: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof HomePageContent>;

/**
 * Composição completa da Home: Hero Banner + Catálogo com filtros (desktop sidebar, mobile drawer)
 * + Paginação + Seções Promo e Blog. Demonstra o caminho feliz com todos os elementos interativos.
 */
export const Default: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    // Valida Hero Banner
    await expect(canvas.getByTestId('home-hero-banner')).toBeInTheDocument();

    // Valida Catálogo e cards de NFT
    const catalogSection = canvas.getByTestId('home-catalog-section');
    await expect(catalogSection).toBeInTheDocument();

    const catalogGrid = canvas.getByTestId('catalog-grid');
    await expect(catalogGrid).toBeInTheDocument();

    const firstCard = canvas.getByTestId('catalog-item-nft-01');
    await expect(firstCard).toBeInTheDocument();

    // Clica em um card de NFT
    await userEvent.click(firstCard);
    await expect(args.onSelectNft).toHaveBeenCalledWith('nft-01');

    // Alterna aba para "new"
    const newTab = canvas.getByTestId('catalog-tab-new');
    await userEvent.click(newTab);
    await expect(args.onTabChange).toHaveBeenCalledWith('new');

    // Altera ordenação
    const sortSelect = canvas.getByTestId('catalog-sort-select');
    await userEvent.selectOptions(sortSelect, 'price-asc');
    await expect(args.onSortChange).toHaveBeenCalledWith('price-asc');

    // Navega para página 2
    const page2Button = canvas.getByTestId('pagination-page-2');
    await userEvent.click(page2Button);
    await expect(args.onPageChange).toHaveBeenCalledWith(2);
  },
};

/**
 * Estado de carregamento: exibe skeleton cards preservando dimensões da grade
 * e respeitando aria-busy para leitores de tela.
 */
export const Loading: Story = {
  args: {
    isLoading: true,
    items: [],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const loadingGrid = canvas.getByTestId('catalog-loading-grid');
    await expect(loadingGrid).toBeInTheDocument();
    await expect(loadingGrid).toHaveAttribute('aria-busy', 'true');

    const skeletons = canvas.getAllByTestId('catalog-card-skeleton');
    await expect(skeletons).toHaveLength(9);
  },
};

/**
 * Estado vazio: nenhum NFT corresponde aos filtros ativos.
 * Exibe EmptyState com botão de limpar filtros.
 */
export const Empty: Story = {
  args: {
    items: [],
    isLoading: false,
    isError: false,
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const emptyState = canvas.getByTestId('catalog-empty-state');
    await expect(emptyState).toBeInTheDocument();

    await expect(canvas.getByText(/nenhum nft encontrado/i)).toBeInTheDocument();

    const clearButton = canvas.getByTestId('clear-filters-button');
    await userEvent.click(clearButton);
    await expect(args.onClearFilters).toHaveBeenCalled();
  },
};

/**
 * Estado de erro: falha ao carregar o catálogo.
 * Exibe ErrorState com botão de retry.
 */
export const ErrorState: Story = {
  args: {
    items: [],
    isLoading: false,
    isError: true,
    error: new globalThis.Error('Falha ao consultar os NFTs'),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const errorState = canvas.getByTestId('catalog-error-state');
    await expect(errorState).toBeInTheDocument();

    await expect(canvas.getByText(/não foi possível carregar o catálogo/i)).toBeInTheDocument();

    const retryButton = canvas.getByRole('button', { name: /tentar novamente/i });
    await userEvent.click(retryButton);
    await expect(args.onRetry).toHaveBeenCalled();
  },
};

/**
 * Filtros aplicados: coleções e redes selecionadas, exibindo facets ativos.
 */
export const WithFiltersApplied: Story = {
  args: {
    selectedCollections: ['jungle-genesis', 'art-gallery'],
    selectedNetworks: ['ethereum'],
    minPrice: '0.50',
    maxPrice: '2.00',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Valida que catálogo está visível com filtros ativos
    await expect(canvas.getByTestId('catalog-grid')).toBeInTheDocument();
  },
};

/**
 * Viewport Mobile (390px): valida abertura do Drawer de filtros
 * e interação com botão de filtro mobile.
 */
export const MobileViewport: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
  args: {
    isFilterDrawerOpen: false,
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    // Valida botão de filtro mobile
    const filterButton = canvas.getByTestId('mobile-filter-button');
    await expect(filterButton).toBeInTheDocument();

    // Clica para abrir Drawer
    await userEvent.click(filterButton);
    await expect(args.onOpenFilterDrawerChange).toHaveBeenCalledWith(true);
  },
};

/**
 * Interação com favorito: ao clicar no botão de coração,
 * aciona callback de favoritar se disponível, ou aviso de indisponível.
 */
export const FavoriteInteraction: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    const favoriteButton = canvas.getByTestId('favorite-button-nft-01');
    await expect(favoriteButton).toBeInTheDocument();

    await userEvent.click(favoriteButton);
    await expect(args.onFavoriteToggle).toHaveBeenCalledWith('nft-01');
  },
};
