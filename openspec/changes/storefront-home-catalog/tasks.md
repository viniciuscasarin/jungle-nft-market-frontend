# Tasks

## 1. [P0 — Caminho Feliz] Contratos, Query Keys e Regras Puras de Domínio

- [x] 1.1 Estender `NftItemSchema`, `NftListQuerySchema`, `NftListResponseSchema` e `CatalogSearchParamsSchema` em `libs/shared/contracts` (suportando `q`, `collections`, `networks`, `minPrice`, `maxPrice`, `tab`, `sort`, `page`, `pageSize: 9`, metadados visuais e `facets`), adicionar `queryKeys.catalog` em `libs/shared/query` e atualizar `docs/contracts.md`, verificando com `pnpm nx test shared-contracts` e `pnpm nx test shared-query`
- [x] 1.2 Implementar funções puras de domínio em `libs/catalog/domain` (`normalizeCatalogSearchParams`, `applyCatalogFilterChange` que reinicia `page = 1` ao alterar busca/filtro/aba/ordenação, e `validatePriceRangeEth` usando exclusivamente `@nft/shared-money`) com testes unitários em `libs/catalog/domain/src/index.spec.ts`, verificando com `pnpm nx test catalog-domain`

## 2. [P0 — Caminho Feliz] Assets Self-Hosted, Fixtures e Handler MSW (`GET /api/nfts`)

- [x] 2.1 Importar os assets estáticos da Home da branch `feat/layouts` (`apps/shell/public/assets/images/{hero-nft,featured-nft,nft-03..11,promo-*,blog-*}.png`) e atualizar `libs/mocks/fixtures/src/nfts.ts` para usar imagens locais self-hosted e metadados de coleção/rede/raridade/desconto, verificando com `pnpm nx test mocks-fixtures`
- [x] 2.2 Implementar o handler `GET /api/nfts` em `libs/mocks/handlers` usando `defineHandler` e `getMockDatabase().nfts` (filtragem combinável por `q`, `collections`, `networks`, `minPrice`/`maxPrice` via `@nft/shared-money` e `tab`, ordenação `sort`, paginação `paginate` e retorno de `facets` fixos da base do cenário) e cobrir cenários de sucesso, vazio e erro com testes em `libs/mocks/handlers`, verificando com `pnpm nx test mocks-handlers`

## 3. [P0 — Caminho Feliz] Camada Data-Access e Componentes Apresentacionais (`catalog/ui`)

- [x] 3.1 Implementar `fetchCatalogNfts` e `catalogListQueryOptions` em `libs/catalog/data-access` (repassando `AbortSignal` do TanStack Query, `staleTime: 60_000` e usando `queryKeys.catalog.list`) com teste unitário em `libs/catalog/data-access`, verificando com `pnpm nx test catalog-data-access`
- [x] 3.2 Migrar e adaptar os componentes apresentacionais da Home da branch `feat/layouts` para `libs/catalog/ui` (`HomeHeroBanner`, `CatalogFilterSidebar`, `HomePromoSection`, `HomeBlogSection`, `HomePageContent`), removendo dados/estados locais hardcoded (`DEFAULT_CATALOG_NFTS`, `MobileTabBar` e toast duplicados), convertendo faixa de preço para strings decimais ETH (`@nft/shared-money`) e adicionando estados de loading (`Skeleton` com `aria-busy="true"`), `EmptyState` (limpar filtros) e `ErrorState` (retry), verificando com `pnpm nx test catalog-ui`

## 4. [P0 — Caminho Feliz] Página Conectada (`catalog/feature`), Remote (`apps/storefront`) e E2E

- [x] 4.1 Implementar `CatalogHomePage` em `libs/catalog/feature` e expô-la em `apps/storefront/src/HomePage.tsx` (atualizando `apps/storefront/vite.config.ts`), sincronizando filtros/busca/abas/ordenação/página com a URL (`useSearch`/`useNavigate`), registrando o Drawer de filtros mobile em `usePageChrome({ onOpenFilters })`, navegando para `/nft/$nftId` e acionando `useUnavailable()` nos elementos fora de escopo, verificando com `pnpm nx test catalog-feature` e `pnpm nx test storefront`
- [x] 4.2 Adicionar teste E2E enxuto do caminho feliz e estados de falha em `apps/web-e2e/src/catalog-home.spec.ts` (busca + filtros + reset para página 1 + refresh restaurando URL + `EmptyState` + `ErrorState` com retry + aviso `"indisponível nesta demonstração"` em Promo/Blog cards), verificando com `pnpm e2e apps/web-e2e/src/catalog-home.spec.ts`

## 5. [P1 — Débito Técnico & Fechamento] Stories Mínimos, Documentação de Débito Técnico e Validação Final

- [x] 5.1 Manter story CSF3 principal em `libs/catalog/ui/src/home-page-content.stories.tsx` e registrar em `ARCHITECTURE.md` (§17 Limitações conhecidas / Débitos Técnicos) e `README.md` as simplificações P1 adotadas para o prazo (cobertura mínima de stories CSF3 por subcomponente da Home, contagens de facetas fixas por cenário no `GET /api/nfts` e Hero/Featured apontando para NFTs determinísticos da fixture)
- [ ] 5.2 Executar `typecheck`, `lint`, `test` e `build` nos projetos afetados (`pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm build`) e garantir zero erros
