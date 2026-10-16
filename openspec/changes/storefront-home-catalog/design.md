# Design

## Context

A rota inicial (`/`) do host `apps/shell` carrega via Module Federation o módulo `storefront/HomePage` dentro do `AppLayout` (`_app`). Na branch `feat/layouts`, os componentes visuais da Home (`HomeHeroBanner`, `CatalogFilterSidebar`, `HomePromoSection`, `HomeBlogSection`, `HomePageContent`) e os assets (`apps/shell/public/assets/images/*`) já foram implementados com alta fidelidade ao Figma (frames `2:2` desktop e `14:5226` mobile), mas operam com dados estáticos hardcoded (`DEFAULT_CATALOG_NFTS`), estado local em React e `priceRange` numérico (`[number, number]`).

Ver `proposal.md` para a motivação e a estratégia de priorização P0 (Caminho Feliz) vs P1 (Débito Técnico).

## Goals / Non-Goals

**Goals:**
- Reaproveitar integralmente a estrutura visual de `feat/layouts` em `libs/catalog/ui`, adequando-a às fronteiras Nx (`type:ui` sem fetch, sem mocks e sem estado de rota) e à regra inviolável de precisão monetária (`@nft/shared-money`).
- Conectar `GET /api/nfts` no MSW (`libs/mocks/handlers`) ao banco em memória (`getMockDatabase().nfts`) e ao pipeline de rede (`defineHandler`).
- Sincronizar todos os parâmetros de busca, filtros, abas, ordenação e paginação na URL (`CatalogSearchParamsSchema`), com reset automático para `page = 1` em qualquer mudança de filtro.
- Integrar o `Drawer` de filtros mobile ao gatilho do `SearchBar` do `AppLayout` via `usePageChrome({ onOpenFilters })` sem duplicar `MobileTabBar` ou toasts locais.

**Non-Goals:**
- Implementar a PDP (`/nft/$nftId`) ou a funcionalidade real de favoritar (ambas pertencem à Etapa 11).
- Implementar eventos Socket.IO (`nft.updated`) no catálogo (Etapa 12).
- Recalcular facetas cruzadas dinâmicas N×M ou criar dezenas de variantes de stories CSF3 (registrados como Débito Técnico P1 em `ARCHITECTURE.md` §17).

## Decisions

### 1. Separação entre `libs/catalog/ui` (Apresentacional) e `libs/catalog/feature` (Conectado)
- **Decisão**: Manter `HomeHeroBanner`, `CatalogFilterSidebar`, `HomePromoSection`, `HomeBlogSection` e `HomePageContent` em `@nft/catalog-ui` como componentes controlados por props (recebendo `items`, `facets`, `filters`, `pagination`, `isLoading`, `error`, `onRetry`, `onFilterChange`, `onClearFilters`, `onSelectNft`, `onUnavailable`). Criar `CatalogHomePage` em `@nft/catalog-feature` que consome `useSearch`, `useNavigate`, `useShell`, `usePageChrome`, `useUnavailable` e `useQuery(catalogListQueryOptions(...))`, e expor `HomePage` em `apps/storefront/src/HomePage.tsx` apontado no `vite.config.ts` do remote.
- **Racional**: Respeita estritamente `@nx/enforce-module-boundaries` (`type:ui` só importa `shared/ui`, `domain`, `contracts`, `money`; `type:feature` conecta `data-access`, `router` e `shell-kit`) e evita qualquer refatoração visual desnecessária nos componentes vindos de `feat/layouts`.
- **Alternativas consideradas**: Mover `HomePageContent` inteiro para `catalog/feature`. Rejeitado porque `apps/storybook` (`flow:tooling`) só pode importar bibliotecas `type:ui` e `flow:shared`.

### 2. Representação da Faixa de Preço em ETH (`minPrice` / `maxPrice`)
- **Decisão**: No contrato (`CatalogSearchParamsSchema`), no domínio (`@nft/catalog-domain`), no estado conectado (`@nft/catalog-feature`) e nas props de `CatalogFilterSidebar` / `HomePageContent`, os limites de preço trafegam exclusivamente como strings decimais (`EthAmount`, ex.: `'0.02'` e `'12.30'`). A validação, comparação (`min <= item.price <= max`) e formatação no domínio, UI e MSW utilizam apenas `parse`, `compare` e `format` de `@nft/shared-money`. O componente visual `PriceRangeSlider` converte imediatamente os valores do input range HTML para strings decimais formatadas na borda do evento DOM.
- **Racional**: Cumpre a Regra Inviolável #3 ("ETH é string decimal. Nunca `number`, `parseFloat` ou aritmética nativa em valores monetários").

### 3. Serialização de Filtros nos Search Params da URL
- **Decisão**: `CatalogSearchParamsSchema` aceita `q` (string opcional), `collections` (array de strings ou string separada por vírgulas normalizada para `string[]`), `networks` (array ou string separada por vírgulas de `'ethereum' | 'polygon' | 'solana'`), `minPrice` (`EthAmount` opcional), `maxPrice` (`EthAmount` opcional), `tab` (`'all' | 'new' | 'trending'`, default `'all'`), `sort` (`NftSortOptionSchema`, default `'popular-desc'`), `page` (inteiro positivo, default `1`) e `pageSize` (inteiro positivo, default `9`).
- **Racional**: Garante URLs limpas, compartilháveis e tolerantes a parâmetros malformados, restaurando exatamente o estado após refresh (`F5`) ou navegação pelo histórico (voltar/avançar).

### 4. Integração com o Chrome do Host (`AppLayout` + `usePageChrome` + `useUnavailable`)
- **Decisão**: Remover a `<MobileTabBar />` e o estado de toast local que existiam dentro de `HomePageContent` na branch `feat/layouts`, pois o `AppLayout` do host já renderiza a `MobileTabBar`, a `SearchBar` mobile e o `ToastProvider` global. Em `CatalogHomePage` (`@nft/catalog-feature`), registrar `usePageChrome({ onOpenFilters: () => setIsFilterDrawerOpen(true) })` para que tanto o botão de filtros do `SearchBar` do Shell quanto o gatilho local da Home abram o mesmo `Drawer` de filtros mobile.
- **Racional**: Elimina landmarks/barras duplicadas no DOM integrado e reutiliza a infraestrutura de acessibilidade e live regions globais do `shell-kit`.

### 5. Simplificações P1 Registradas como Débito Técnico (`ARCHITECTURE.md` §17)
- **Decisão**:
  1. Retornar contagens de facetas (`facets.collections` e `facets.networks`) calculadas sobre a coleção base do cenário ativo no MSW em vez de recalcular facetas cruzadas dinâmicas a cada filtro.
  2. Manter 1 story CSF3 principal em `libs/catalog/ui` (`home-page-content.stories.tsx`) em vez de stories exaustivos por subcomponente.
  3. Apontar o Hero e o banner `NFT EM DESTAQUE` para itens determinísticos da fixture (`nft-01` e `nft-02`).
- **Racional**: Maximiza a velocidade de entrega do caminho feliz (P0) sem comprometer nenhum critério eliminatório, fronteira de lint ou teste E2E.

## Risks / Trade-offs

- **[Risk] Divergência entre URLs de imagens Unsplash nas fixtures atuais e os assets locais de `feat/layouts`** → **Mitigation**: Atualizar `generateCatalogFixtures()` em `libs/mocks/fixtures/src/nfts.ts` para usar ciclicamente os assets locais self-hosted (`/assets/images/nft-03-emerald-ape.png` até `nft-11-golden-signal.png`), garantindo carregamento offline/determinístico e zero dependência externa no Playwright e Lighthouse.
- **[Risk] Respostas fora de ordem ao alternar filtros rapidamente no cenário `out-of-order`** → **Mitigation**: Incluir todos os parâmetros normalizados na query key (`queryKeys.catalog.list(params)`) e repassar o `signal` (`AbortSignal`) do `queryFn` do TanStack Query para a chamada `httpClient.get('/api/nfts', { params, signal })`.
