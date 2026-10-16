# Proposal: Storefront PDP Page

## Why

Atualmente, ao acessar a rota `/nft/:nftId` (como `/nft/nft-01`), o usuário visualiza apenas um componente placeholder/stub básico de Module Federation (`apps/storefront/src/PdpPage.tsx`), sem a interface gráfica rica desenhada no Figma e sem conexão com o backend simulado (`GET /api/nfts/:id`).

Os layouts visuais da PDP (galeria com zoom, seção de compra com cálculo de quantidade e preço em ETH, abas de detalhes e avaliações, e carrossel de itens relacionados) já foram criados na branch `feat/layouts` (commit `ef9e5ca`), mas nunca foram integrados à branch `main` nem conectados à API real via TanStack Query e handlers do MSW.

Esta change traz os componentes visuais de `feat/layouts` para `libs/catalog/ui`, implementa a página conectada `PdpFeaturePage` em `libs/catalog/feature`, integra a chamada `fetchNftDetail` (`catalogDetailQueryOptions`) com suporte a loading (Skeleton), erro (ErrorState com retry) e 404 (NFT inexistente), e expõe a página final no remote `apps/storefront`, sincronizando o título do breadcrumb no Shell via `usePageChrome`.

## What Changes

- **Port dos componentes visuais da PDP (`feat/layouts` -> `libs/catalog/ui`)**:
  - `pdp-gallery.tsx`: galeria com imagem principal e miniaturas selecionáveis.
  - `pdp-purchase-section.tsx`: exibição de autor/coleção, título, preço em ETH decimal (`@nft/shared-money`), seletor de quantidade inteira, botões de ação ("Comprar agora" e "Adicionar ao carrinho"), e badges de edição/disponibilidade.
  - `pdp-tabs.tsx`: abas acessíveis de Detalhes da obra e Avaliações de colecionadores com navegação por teclado (`role="tablist"`).
  - `pdp-related-carousel.tsx`: carrossel de outros colecionáveis recomendados.
  - `pdp-page-content.tsx`: composição estrutural responsiva (desktop 1440px e mobile 390px/414px conforme Figma `#10:244` e `#15:5536`).
  - Exportação desses componentes em `libs/catalog/ui/src/index.ts`.
- **Implementação da página conectada em `libs/catalog/feature`**:
  - `pdp-feature-page.tsx`: componente conectado que obtém `nftId` da rota ou fallback, executa `useQuery(catalogDetailQueryOptions)`, trata estados assíncronos (`isLoading` com skeleton com dimensões preservadas, `isError` com `ErrorState` e retry, `notFound` com `EmptyState` e link para voltar ao catálogo).
  - Consulta paralela ou reutilização de catálogo para alimentar o carrossel de itens relacionados.
  - Notificação do título do item para o shell através de `usePageChrome({ breadcrumbLabel })`.
  - Tratamento de ações fora de escopo ou ações com fluxo subsequente (ex: aviso explícito via `useUnavailable()` ou navegação para `/carrinho`).
  - Exportação em `libs/catalog/feature/src/index.ts`.
- **Atualização do remote `apps/storefront`**:
  - `apps/storefront/src/PdpPage.tsx`: substituição do placeholder pela página conectada `PdpFeaturePage`.
  - `apps/storefront/src/main.tsx`: suporte a rota `/nft/:nftId` no harness standalone.
- **Testes e documentação**:
  - Testes unitários/integração em `libs/catalog/ui` e `libs/catalog/feature`.
  - Teste E2E ou atualização de testes de rotas do Shell para PDP real.
  - Atualização de `ARCHITECTURE.md` e `README.md`.

## Capabilities

### New Capabilities
- `catalog-pdp-detail`: Define o comportamento da página de detalhes do NFT (PDP em `/nft/:nftId`), cobrindo busca de detalhes por ID via MSW (`GET /api/nfts/:id`), precisão monetária em ETH com quantidades inteiras, estados assíncronos (loading skeleton, 404/não encontrado e erro com retry), navegação por teclado nas abas/galeria, atualização do breadcrumb no Shell host e carrossel de itens relacionados.

### Modified Capabilities
<!-- Nenhuma capability existente tem requisitos modificados -->

## Impact

- **Apps e Libs afetados**:
  - `libs/catalog/ui` (`scope:catalog`, `type:ui`, `flow:storefront`)
  - `libs/catalog/feature` (`scope:catalog`, `type:feature`, `flow:storefront`)
  - `apps/storefront` (`scope:storefront`, `type:app`, `flow:storefront`)
  - `apps/shell` (`scope:shell`, `type:app`, `flow:shell`) - integração de navegação e breadcrumb dinâmico
- **Dependências**:
  - `@nft/catalog-data-access` (já implementa `catalogDetailQueryOptions`)
  - `@nft/shared-contracts` (já define `NftItemSchema`)
  - `@nft/shared-money` (cálculo e formatação de valores ETH)
  - `@nft/shared-ui` (botões, badges, skeleton, error-state, empty-state)
  - `@nft/shell-kit` (`useShell`, `useSession`, `usePageChrome`, `useUnavailable`)
