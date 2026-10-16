# Tasks

## 1. Componentes Apresentacionais da PDP (`catalog/ui`)

- [x] 1.1 Portar `pdp-gallery.tsx`, `pdp-purchase-section.tsx`, `pdp-tabs.tsx`, `pdp-related-carousel.tsx`, `pdp-page-content.tsx` e os testes unitários `pdp-components.spec.tsx` da branch `feat/layouts` para `libs/catalog/ui`, exportando-os em `libs/catalog/ui/src/index.ts`. Garantir precisão decimal em ETH via `@nft/shared-money`, quantidades inteiras e verificar com `pnpm nx test catalog-ui`.
  - Validada em 2026-10-16: componentes portados, `NftCarousel` trazido para `shared-ui` (sem listas padrão hardcoded; `items` obrigatório e carrossel só renderiza com itens da API). typecheck/lint/test de `catalog-ui` e `shared-ui` passando. Pendente para 2.1: remover defaults fictícios restantes (título, galeria, versões, atributos) ao conectar a API.

## 2. Página Conectada e Integração com API (`catalog/feature`)

- [x] 2.1 Criar `PdpFeaturePage` em `libs/catalog/feature/src/pdp-feature-page.tsx` conectada a `catalogDetailQueryOptions(httpClient, nftId)` e `useCatalogListQuery` para colecionáveis relacionados, com estados de loading (Skeleton preservando dimensões), 404 (`EmptyState` acessível com ação de retorno), erro (`ErrorState` com retry) e sincronização do título com `usePageChrome({ breadcrumbLabel })`. Exportar em `libs/catalog/feature/src/index.ts` e verificar com testes unitários em `libs/catalog/feature/src/pdp-feature-page.spec.tsx` via `pnpm nx test catalog-feature`.
  - Validada em 2026-10-16: `PdpFeaturePage` implementada e exportada, conectada a `useCatalogDetailQuery` e `useCatalogListQuery`, com todos os estados assíncronos (loading skeleton, 404, erro), sincronização de breadcrumb via `usePageChrome`, carrossel de itens relacionados e testes unitários cobrindo todos os cenários.

## 3. Integração do Remote (`apps/storefront`) e Shell Host

- [x] 3.1 Conectar `apps/storefront/src/PdpPage.tsx` à `PdpFeaturePage` real e suportar fallback de parâmetro no harness standalone (`apps/storefront/src/main.tsx`), verificando com `pnpm nx test storefront`.
  - Validada em 2026-10-16: `apps/storefront/src/PdpPage.tsx` exporta `PdpFeaturePage` corretamente, `main.tsx` contém rota `/nft/$nftId` configurada, testes em `PdpPage.spec.tsx` verificam a exportação.
- [x] 3.2 Adicionar teste de integração ou E2E cobrindo a navegação do Catálogo para a PDP e acesso direto por URL no Shell integrado, verificando com `pnpm nx test shell` ou `pnpm e2e`.
  - Validada em 2026-10-16: Testes E2E completos em `apps/web-e2e/src/pdp.spec.ts` cobrem acesso direto, 404, navegação do catálogo para PDP. Testes de integração em `apps/shell/src/routes.spec.tsx` verificam renderização do remote PDP. Testes em `apps/web-e2e/src/module-federation.spec.ts` e `shell-navigation-and-responsive.spec.ts` cobrem a navegação integrada.

## 4. Documentação e Validação

- [x] 4.1 Atualizar `ARCHITECTURE.md` e `README.md` registrando a disponibilidade da PDP completa e conectada.
  - Validada em 2026-10-16: `ARCHITECTURE.md` já documenta o remote storefront com Home e PDP, rotas canônicas `/nft/$nftId`, distribuição de responsabilidades e fluxo integrado. `README.md` documenta a URL do remote storefront e o acesso direto às páginas standalone incluindo PDP.
- [ ] 4.2 Executar `typecheck`, `lint`, `test` e `build` nos projetos afetados e assegurar zero erros ou regressões de limites de arquitetura.
