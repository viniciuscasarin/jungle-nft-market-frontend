# Proposal

## Why

O remote `apps/storefront` atualmente renderiza apenas um placeholder estático na rota inicial (`/`) e o endpoint `GET /api/nfts` retorna todos os itens sem filtragem, ordenação, paginação real ou integração com o pipeline de cenários do MSW. Precisamos entregar a jornada de descoberta e catálogo da Home de ponta a ponta (desktop e mobile), reaproveitando o layout estático já construído na branch `feat/layouts` e conectando-o aos contratos tipados, regras de domínio, URL search params, TanStack Query e backend simulado MSW — com foco cirúrgico no caminho feliz (P0) e registro explícito de simplificações como débito técnico (P1) devido ao prazo crítico.

## What Changes

- **Reaproveitamento e adaptação arquitetural do layout (`feat/layouts` -> `libs/catalog/ui`)**:
  - Migração dos componentes visuais da Home (`HomeHeroBanner`, `CatalogFilterSidebar`, `HomePromoSection`, `HomeBlogSection`, `HomePageContent`) e dos assets self-hosted (`apps/shell/public/assets/images/*`) da branch `feat/layouts`.
  - Remoção de dados fictícios e estados locais hardcoded (`DEFAULT_CATALOG_NFTS`, `MobileTabBar` duplicada e toast local) de `libs/catalog/ui`, mantendo os componentes puramente apresentacionais e controlados por props.
  - Adequação do filtro de faixa de preço para operar exclusivamente com strings decimais ETH (`EthAmount`) validadas e formatadas via `@nft/shared-money`, sem uso de `number` ou `parseFloat` em valores monetários.
- **Contratos e Search Params (`libs/shared/contracts` e `libs/shared/query`)**:
  - Extensão de `CatalogSearchParamsSchema` e `NftListQuerySchema` para suportar busca textual (`q`), coleções selecionadas (`collections`), redes (`networks`: `ethereum`, `polygon`, `solana`), faixa de preço em ETH (`minPrice`, `maxPrice`), aba ativa (`tab`: `'all' | 'new' | 'trending'`), ordenação (`sort`) e paginação (`page`, `pageSize`).
  - Extensão de `NftItemSchema` com campos opcionais visuais (`rarity`, `previousPriceEth`, `network`, `collectionName`) e de `NftListResponseSchema` com `facets` (contagens por coleção e por rede).
  - Adição da factory `queryKeys.catalog.list(params)` em `@nft/shared-query`.
- **Handlers MSW e Fixtures (`libs/mocks/handlers` e `libs/mocks/fixtures`)**:
  - Atualização das fixtures de catálogo em `libs/mocks/fixtures` para referenciar assets locais self-hosted (`/assets/images/nft-*.png`) e metadados de coleção/rede/raridade compatíveis com o Figma.
  - Implementação do handler `GET /api/nfts` via `defineHandler` integrado ao banco em memória (`getMockDatabase().nfts`), aplicando busca textual, filtros combináveis (coleções, redes, aba, faixa de preço comparada via `@nft/shared-money`), ordenação, paginação (`paginate`) e respeitando todos os cenários de rede do MSW (`default`, `empty`, `slow-network`, `out-of-order`, `http-5xx`, `recovering-5xx`, `connection-down`).
- **Domínio, Data-Access e Feature (`libs/catalog/{domain,data-access,feature}` e `apps/storefront`)**:
  - `libs/catalog/domain`: funções puras de normalização de query/filtros, validação de faixa de preço em ETH via `@nft/shared-money` e transição de estado que reinicia `page = 1` sempre que qualquer filtro, busca, aba ou ordenação é alterado.
  - `libs/catalog/data-access`: `fetchCatalogNfts` e `catalogListQueryOptions` integrados ao `HttpClient` do Shell e repassando `AbortSignal` do TanStack Query para cancelamento e descarte de respostas obsoletas/fora de ordem.
  - `libs/catalog/feature` e `apps/storefront`: página conectada `CatalogHomePage` sincronizada com os search params da URL (`useSearch`, `useNavigate`), integrada ao chrome mobile via `usePageChrome({ onOpenFilters })`, navegando para `/nft/$nftId` ao clicar em cards/Hero/Featured NFT e acionando `useUnavailable()` para ações fora de escopo (Promo cards, Blog cards, botão de favorito antes da Etapa 11).

## Estratégia de Prazo Crítico: P0 (Caminho Feliz) vs P1 (Débito Técnico)

- **P0 (Obrigatório nesta entrega — Caminho Feliz e Invariantes)**:
  - Reaproveitamento direto dos componentes de `feat/layouts` respeitando `@nx/enforce-module-boundaries` e removendo mocks/estados locais da UI.
  - `GET /api/nfts` funcional no MSW filtrando por `q`, `collections`, `minPrice`/`maxPrice` (via `@nft/shared-money`), `networks`, `tab`, `sort` e `page`, sincronizado com a URL e reiniciando `page = 1` ao filtrar.
  - Estados assíncronos completos (`Skeleton` com `aria-busy="true"`, `EmptyState` com limpeza de filtros e `ErrorState` com retry), navegação para `/nft/$nftId` e feedback acessível `"indisponível nesta demonstração"` para elementos fora de escopo.
  - Testes enxutos de alto valor: testes unitários em `catalog/domain` e `mocks/handlers` + 1 teste E2E enxuto do Fluxo 1 em `apps/web-e2e`.
- **P1 (Simplificações convertidas em Débito Técnico documentado em `ARCHITECTURE.md` §17)**:
  - **Stories CSF3**: manter apenas 1 story principal (`home-page-content.stories.tsx`) cobrindo a composição da Home, registrando a expansão de stories individuais por subcomponente/pseudo-estado como débito técnico.
  - **Contagens de facetas (`facets`)**: retornar no `GET /api/nfts` as contagens de itens por coleção e por rede calculadas sobre o conjunto base do cenário ativo no MSW, registrando o recálculo cruzado dinâmico facetado (N×M por combinação de filtros ativos) como débito técnico.
  - **Hero e Featured NFT determinísticos**: manter o Hero e o banner lateral `NFT EM DESTAQUE` apontando para NFTs determinísticos da fixture (`nft-01` e `nft-02`) e os dots do Hero alternando slides visuais fixos.

## Capabilities

### New Capabilities
- `catalog-discovery`: Descoberta e listagem de NFTs na Home (`apps/storefront` e `libs/catalog/*`), incluindo sincronização bidirecional de busca, filtros combináveis, abas, ordenação e paginação com a URL, reset automático para página 1 ao filtrar, estados assíncronos acessíveis (loading skeleton, vazio, erro com retry), Drawer de filtros mobile integrado ao `AppLayout` e tratamento de ações fora de escopo.

### Modified Capabilities
- `domain-contracts`: Extensão de `CatalogSearchParamsSchema`, `NftListQuerySchema`, `NftItemSchema` e `NftListResponseSchema` para contemplar filtros de coleções, redes, aba ativa, facetas de contagem e metadados visuais de card (`rarity`, `previousPriceEth`, `network`, `collectionName`).
- `mock-infrastructure`: Implementação do handler `GET /api/nfts` em `@nft/mocks-handlers` sobre o banco em memória e pipeline `defineHandler` de `@nft/mocks-core`, suportando filtragem combinável, comparação de preço via `@nft/shared-money`, ordenação, paginação e facetas, além de fixtures com imagens locais self-hosted.

## Impact

### Projetos Nx Afetados e Tags
- `libs/shared/contracts` (`scope:contracts`, `type:util`, `flow:shared`)
- `libs/shared/query` (`scope:shared`, `type:util`, `flow:shared`)
- `libs/mocks/fixtures` (`scope:mocks`, `type:util`, `flow:shared`)
- `libs/mocks/handlers` (`scope:mocks`, `type:util`, `flow:shared`)
- `libs/catalog/domain` (`scope:catalog`, `type:domain`, `flow:storefront`)
- `libs/catalog/data-access` (`scope:catalog`, `type:data-access`, `flow:storefront`)
- `libs/catalog/ui` (`scope:catalog`, `type:ui`, `flow:storefront`)
- `libs/catalog/feature` (`scope:catalog`, `type:feature`, `flow:storefront`)
- `apps/storefront` (`scope:storefront`, `type:app`, `flow:storefront`)
- `apps/shell` (`scope:shell`, `type:app`, `flow:shell`) — assets estáticos em `public/assets/images/*`
- `apps/web-e2e` (`scope:e2e`, `type:e2e`)

### Fora de Escopo
- Página de detalhes do NFT (PDP), seleção de edições e listagem de avaliações (Etapa 11).
- Favoritos e atualização otimista de favoritos (Etapa 11 — cliques no ícone de coração na Home acionam aviso `"indisponível nesta demonstração"` nesta etapa ou callback preparatório).
- Eventos Socket.IO em tempo real (`nft.updated`) no catálogo (Etapa 12).
- Páginas editoriais de blog, promoções, suporte e criadores (acionam aviso `"indisponível nesta demonstração"` via `useUnavailable`).

### Premissas (registradas também em `ARCHITECTURE.md`)
- O tamanho padrão da página da Home (`pageSize`) é `9` itens (grade de 3 colunas × 3 linhas no desktop e 2 colunas no mobile, fiel ao Figma), aceitando override via search param validado.
- As abas do catálogo filtram subconjuntos determinísticos da base: `all` (todos os itens), `new` (itens ordenados/filtrados pelos lançamentos mais recentes) e `trending` (itens em destaque ou com maior popularidade/avaliações).
- A faixa de preço opera com strings decimais ETH de ponta a ponta; o controle visual `PriceRangeSlider` converte eventos de input DOM imediatamente para strings decimais formatadas com 2 casas (`0.00`) antes de repassar às camadas de catálogo e URL.
