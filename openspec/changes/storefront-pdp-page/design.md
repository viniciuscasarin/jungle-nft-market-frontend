# Design: Storefront PDP Page

## Context

A arquitetura do projeto segue o padrão Clean Architecture por camadas (`domain`, `data-access`, `feature`, `ui`) com boundaries estritos do Nx e Module Federation.
Na branch `feat/layouts`, os componentes visuais da PDP (`pdp-gallery.tsx`, `pdp-purchase-section.tsx`, `pdp-tabs.tsx`, `pdp-related-carousel.tsx`, `pdp-page-content.tsx`) já foram estruturados e validados com base nos frames Figma `#10:244` (desktop 1440px) e `#15:5536` (mobile 414px).
Na branch `main`, a camada de dados em `libs/catalog/data-access` já possui `fetchNftDetail` e `catalogDetailQueryOptions(httpClient, nftId)`, e o MSW já implementa `GET /api/nfts/:id`.

## Goals / Non-Goals

**Goals:**
- Portar e refinar os componentes visuais da PDP para `libs/catalog/ui` sem acoplamento com rede ou chamadas de fetch.
- Implementar `PdpFeaturePage` em `libs/catalog/feature`, conectando a UI ao `catalogDetailQueryOptions` e tratando estados de loading, 404 e erro com retry.
- Calcular preço total para múltiplas edições estritamente com `@nft/shared-money` (`multiply`), garantindo precisão decimal e quantidades inteiras.
- Integrar com `usePageChrome` do `libs/shell-kit` para atualizar o título da PDP no breadcrumb do host Shell.
- Exibir a seção "Colecionáveis Relacionados" consumindo outros itens do catálogo via `catalogListQueryOptions`.
- Expor `PdpPage` no remote `apps/storefront` consumindo a feature conectada.

**Non-Goals:**
- Não implementar neste momento o fluxo de checkout e pagamento (já pertencem a `checkout-payment-and-orders`).
- Não persistir favoritos reais em banco remoto se não houver mutation definida (usar feedback ou fallback via `useUnavailable` se fora de escopo).

## Decisions

1. **Separação UI (`libs/catalog/ui`) vs Feature (`libs/catalog/feature`)**:
   - *Decisão*: Todos os componentes da PDP (`PdpGallery`, `PdpPurchaseSection`, `PdpTabs`, `PdpRelatedCarousel`, `PdpPageContent`) permanecem em `libs/catalog/ui` como componentes puramente apresentacionais recebendo dados e callbacks via props.
   - *Alternativa considerada*: Colocar fetch diretamente no `PdpPageContent`. *Rejeitada* pois viola as fronteiras de arquitetura (regras de boundaries do ESLint: `libs/catalog/ui` só pode depender de `shared/ui` e `domain`).

2. **Cálculo Monetário via `@nft/shared-money`**:
   - *Decisão*: Ao selecionar quantidade $N$, o preço total é computado por `multiply(nft.priceEth, quantity)`.
   - *Alternativa considerada*: Usar `parseFloat(price) * quantity`. *Rejeitada* pois viola o invariante 3 das regras invioláveis ("ETH é string decimal. Nunca number ou parseFloat").

3. **Carrossel de Colecionáveis Relacionados**:
   - *Decisão*: A `PdpFeaturePage` realiza uma busca de catálogo usando `useCatalogListQuery` com `pageSize: 6`, filtrando o item atual para exibir NFTs alternativos no carrossel inferior.
   - *Alternativa considerada*: Fixar NFTs estáticos no código. *Rejeitada* pois viola o invariante 1 de evitar dados fictícios em componentes/features.

4. **Sincronização do Breadcrumb com o Shell Host**:
   - *Decisão*: Utilizar `usePageChrome({ breadcrumbLabel: nft.title })` no unmount/mount para atualizar dinamicamente o título no cabeçalho do Shell.

## Risks / Trade-offs

- **[Risk] ID inexistente ou formato inválido na URL**:
  - *Mitigação*: Se `GET /api/nfts/:id` retornar 404 (`ApiError` com `code: 'NOT_FOUND'`), a feature renderiza o `EmptyState` com título "Colecionável não encontrado" e botão de retorno ao catálogo (`/`).
- **[Risk] Parâmetros de rota no modo standalone de desenvolvimento do remote**:
  - *Mitigação*: No `apps/storefront` standalone, ler `useParams` com fallback seguro para `nft-01` quando nenhum ID estiver presente na URL, permitindo visualização imediata em modo isolado.
