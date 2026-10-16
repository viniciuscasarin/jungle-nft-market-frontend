# Proposal: Add to Cart from PDP

## Why

Atualmente, ao clicar nos botões "Comprar agora" ou "Adicionar ao carrinho" na página de detalhes do produto (PDP), o usuário vê apenas uma notificação de indisponibilidade (`notifyUnavailable`). Não há implementação funcional que:
1. Execute a requisição `POST /api/cart/items` ao backend simulado MSW
2. Adicione o NFT selecionado ao carrinho do usuário (autenticado ou guest)
3. Atualize o badge do carrinho no header
4. Forneça feedback visual e acessível da ação

Além disso, a branch `feat/layouts` já contém os **componentes visuais completos do carrinho** (`CartPageContent`, `CartItemRow`, `OrderSummaryCard`, etc.) que podem ser reutilizados, e as camadas `libs/cart/*` (domain, data-access, feature) estão vazias.

Esta change faz **cherry-pick seletivo** dos componentes visuais necessários de `feat/layouts` para `libs/cart/ui`, implementa toda a infraestrutura backend MSW para operações de carrinho, cria a camada de domain e data-access do carrinho, e integra o botão "Adicionar ao carrinho" do PDP com a mutation do TanStack Query, incluindo:
- Atualização otimista do cache
- Feedback visual (loading, sucesso, erro)
- Live regions para acessibilidade
- Merge automático de carrinhos guest em login
- Isolamento por usuário (`userId` em query keys)

## What Changes

### 1. Cherry-pick dos componentes visuais do carrinho (`feat/layouts` → `libs/cart/ui`)
- **Cherry-pick apenas dos arquivos necessários** de `origin/feat/layouts:libs/cart/ui/src/`:
  - `cart-page-content.tsx`: layout completo da página de carrinho
  - `cart-item-row.tsx` / `cart-item-card.tsx`: representação de items do carrinho (desktop/mobile)
  - `cart-quantity-stepper.tsx`: controle acessível de quantidade
  - `order-summary-card.tsx`: resumo do pedido (subtotal, desconto, taxas, total)
  - `cart-recommended-carousel.tsx`: carrossel de recomendações
  - `cart-mobile-header.tsx`: header mobile específico do carrinho
  - `types.ts`: tipos auxiliares de UI
- **NÃO fazer merge completo da branch** `feat/layouts` — apenas copiar os arquivos específicos listados acima
- Ajuste dos tipos para usar os contratos de `@nft/shared-contracts` em vez de tipos locais
- Exportação em `libs/cart/ui/src/index.ts`
- Testes dos componentes (`cart-components.spec.tsx`)
- Stories do Storybook (`.stories.tsx`) para cada componente (se houver na branch)

### 2. Implementação dos handlers MSW de carrinho (`libs/mocks/handlers`)
- **`POST /api/cart/items`**: adicionar item ao carrinho
  - Input: `{ nftId, editionId, quantity }` (`AddToCartInputSchema`)
  - Validação de disponibilidade no estoque (`edition.availableSupply`)
  - Merge de items duplicados (mesmo NFT + edição): soma de quantidades respeitando `maxAvailable`
  - Suporte a usuário autenticado (`userId` do header `Authorization`) e guest (`x-session-id`)
  - Criação automática do carrinho se não existir
  - Retorno do carrinho completo atualizado (`Cart`)
  - Cenários de erro:
    - `404` NFT ou edição não encontrada
    - `409` Estoque insuficiente
    - `400` Validação de entrada
    - `401` Não autenticado e sem session-id
    - `500` Erro simulado de latência/timeout
- **`GET /api/cart`**: obter carrinho atual (substituir handler minimalista)
  - Retorna carrinho do usuário logado ou guest
  - Retorna carrinho vazio se não existir
- **`PUT /api/cart/items/:itemId`**: atualizar quantidade de item
  - Input: `{ quantity }` (`UpdateCartItemInputSchema`)
  - Validação de `maxAvailable`
  - Cenários de erro: item não encontrado, estoque insuficiente
- **`DELETE /api/cart/items/:itemId`**: remover item do carrinho
- **`DELETE /api/cart`**: limpar carrinho completo
- Atualização de `libs/mocks/handlers/src/index.ts` para exportar `cartHandlers` completos
- Cenários determinísticos adicionais em `libs/mocks/core`:
  - Carrinho com múltiplos items
  - Carrinho com item esgotado (estoque zerado)
  - Carrinho guest com merge em login

### 3. Implementação da camada de domain (`libs/cart/domain`)
- Funções puras para manipulação de carrinho:
  - `calculateCartItemTotal(unitPrice: string, quantity: number): string` — cálculo de subtotal de item usando `@nft/shared-money`
  - `mergeCartItems(existingItem: CartItem, newQuantity: number, maxAvailable: number): CartItem` — merge de quantidades respeitando limite
  - `validateCartItemQuantity(quantity: number, maxAvailable: number): boolean` — validação de quantidade
  - `isCartEmpty(cart: Cart): boolean` — verifica se carrinho está vazio
- Testes unitários com Vitest (100% de cobertura das funções puras)
- Exportação em `libs/cart/domain/src/index.ts`

### 4. Implementação da camada de data-access (`libs/cart/data-access`)
- **Query options**:
  - `cartQueryOptions(userId?: string, sessionId?: string)` — obter carrinho atual
    - Query key: `['cart', userId ?? sessionId ?? 'guest']` (isolamento por usuário)
    - Stale time: 30 segundos
    - Retry: 1 tentativa apenas em erros `retryable`
  - `cartItemCountQueryOptions(userId?: string, sessionId?: string)` — contador de items para badge
    - Derivado do carrinho principal via `select`
- **Mutations**:
  - `useAddToCart()` — adicionar item ao carrinho
    - Atualização otimista: adiciona item imediatamente no cache
    - Em sucesso: invalida `cartQueryOptions` e atualiza badge
    - Em erro: rollback do cache otimista + toast de erro
    - Live region anuncia: "Item adicionado ao carrinho"
  - `useUpdateCartItem()` — atualizar quantidade de item
  - `useRemoveCartItem()` — remover item do carrinho
  - `useClearCart()` — limpar carrinho completo
- Query key factories em `@nft/shared-query`:
  - `queryKeys.cart.list(userId)` — carrinho completo
  - `queryKeys.cart.count(userId)` — contador de items
- Exportação em `libs/cart/data-access/src/index.ts`

### 5. Integração no PDP (`libs/catalog/feature`)
- Atualização de `pdp-feature-page.tsx`:
  - Substituir `onAddToCart={() => notifyUnavailable('Adicionar ao carrinho')}` por `handleAddToCart`
  - Implementar `handleAddToCart` usando `useAddToCart()`:
    ```typescript
    const addToCart = useAddToCart();
    
    const handleAddToCart = () => {
      if (!activeEdition) return;
      
      addToCart.mutate({
        nftId: nft.id,
        editionId: activeEdition.id,
        quantity: safeQuantity,
      });
    };
    ```
  - Feedback visual no botão:
    - Loading state: `isLoading={addToCart.isPending}`
    - Disabled durante mutation
  - Toast de sucesso/erro já gerenciado pela mutation
  - Live region para anúncio acessível
- Atualização de `pdp-purchase-section.tsx`:
  - Adicionar prop `isAddingToCart?: boolean` para loading state
  - Passar loading state para o botão "Adicionar ao carrinho"

### 6. Badge do carrinho no header (`apps/shell`)
- Adicionar badge de contador no ícone do carrinho do header
- Usar `useQuery(cartItemCountQueryOptions)` para obter contagem
- Atualização automática via invalidação do cache
- Badge visível apenas se contador > 0
- Badge acessível com `aria-label="X items no carrinho"`

### 7. Integração da página de carrinho (`apps/checkout`)
- Atualização de `apps/checkout/src/CartPage.tsx`:
  - Conectar `CartPageContent` aos dados reais via `useQuery(cartQueryOptions)`
  - Estados assíncronos: loading (skeleton), vazio (EmptyState com link para catálogo), erro (ErrorState com retry)
  - Passar callbacks para mutations (`useUpdateCartItem`, `useRemoveCartItem`)
- Atualização de `apps/checkout/src/main.tsx`:
  - Garantir rota `/cart` no harness standalone

### 8. Limpeza de cache em logout e troca de usuário
- Atualização de `libs/auth/data-access`:
  - `useLogout()`: limpar cache de carrinho privado ao deslogar
  - Cancelar queries e subscriptions relacionadas ao carrinho
- Merge de carrinho guest em login:
  - Já implementado em `libs/mocks/core/src/database.ts` (`mergeGuestCart`)
  - Garantir que a UI invalide o cache após login bem-sucedido

### 9. Testes
- **Testes unitários**:
  - Funções puras de `libs/cart/domain`
  - Componentes de `libs/cart/ui`
- **Testes de integração**:
  - Mutations de `libs/cart/data-access` com MSW
  - Atualização otimista e rollback
- **Testes E2E** (`apps/web-e2e`):
  - Fluxo completo:
    1. Navegar para PDP
    2. Selecionar edição e quantidade
    3. Clicar em "Adicionar ao carrinho"
    4. Verificar toast de sucesso
    5. Verificar badge do carrinho atualizado
    6. Navegar para `/cart`
    7. Verificar item adicionado na lista
    8. Atualizar quantidade
    9. Remover item
  - Cenários de erro:
    - Item esgotado
    - Sessão expirada
    - Falha de rede

### 10. Documentação
- Atualizar `ARCHITECTURE.md`:
  - Seção sobre carrinho e isolamento por usuário
  - Decisões de atualização otimista
- Atualizar `README.md`:
  - Fluxo de adicionar ao carrinho
- Atualizar `docs/contracts.md`:
  - Endpoints de carrinho
  - Payloads e respostas

## Capabilities

### New Capabilities
- `cart-add-to-cart`: Define o comportamento de adicionar item ao carrinho a partir do PDP, cobrindo requisição `POST /api/cart/items`, validação de disponibilidade, merge de items duplicados, atualização otimista do cache, feedback visual e acessível, e suporte a usuários autenticados e guest.
- `cart-page-display`: Define a exibição da página de carrinho (`/cart`), cobrindo listagem de items, cálculo de totais via API, controles de quantidade, remoção de items, estados assíncronos (loading, vazio, erro) e integração com checkout.
- `cart-badge-counter`: Define o badge de contador de items no header, atualizado automaticamente via cache do TanStack Query.

### Modified Capabilities
- `catalog-pdp-detail`: Adiciona integração com carrinho (botão "Adicionar ao carrinho" funcional) e navegação para `/cart` após adicionar item.

## Impact

### Apps e Libs Afetados
- **`libs/cart/ui`** (`scope:cart`, `type:ui`, `flow:checkout`)
  - Port completo dos componentes visuais de `feat/layouts`
  - Ajuste de tipos para usar `@nft/shared-contracts`
- **`libs/cart/domain`** (`scope:cart`, `type:domain`)
  - Funções puras de manipulação de carrinho e cálculos monetários
- **`libs/cart/data-access`** (`scope:cart`, `type:data-access`)
  - Query options e mutations para operações de carrinho
- **`libs/cart/feature`** (`scope:cart`, `type:feature`, `flow:checkout`)
  - Componentes conectados (se necessário para lógica específica do carrinho)
- **`libs/catalog/feature`** (`scope:catalog`, `type:feature`, `flow:storefront`)
  - Integração do PDP com a mutation de adicionar ao carrinho
- **`libs/mocks/handlers`** (`scope:mocks`, `type:mocks`)
  - Handlers completos de carrinho (POST, GET, PUT, DELETE)
- **`libs/mocks/core`** (`scope:mocks`, `type:mocks`)
  - Cenários adicionais de carrinho
- **`libs/shared/query`** (`scope:shared`, `type:util`)
  - Query key factories para carrinho
- **`apps/shell`** (`scope:shell`, `type:app`, `flow:shell`)
  - Badge de contador no header
  - Limpeza de cache em logout
- **`apps/storefront`** (`scope:storefront`, `type:app`, `flow:storefront`)
  - PDP com botão funcional de adicionar ao carrinho
- **`apps/checkout`** (`scope:checkout`, `type:app`, `flow:checkout`)
  - Página de carrinho conectada aos dados reais
- **`apps/web-e2e`** (`scope:web-e2e`, `type:test`)
  - Testes E2E do fluxo completo de adicionar ao carrinho

### Dependências
- `@nft/shared-contracts` — schemas `AddToCartInputSchema`, `CartSchema`, `CartItemSchema`
- `@nft/shared-money` — cálculos monetários em ETH (string decimal)
- `@nft/shared-query` — query key factories
- `@nft/shared-http` — cliente Axios
- `@nft/shared-ui` — componentes base (Button, Toast, Badge, Skeleton, ErrorState, EmptyState)
- `@nft/shell-kit` — `useShell`, `useSession`, `useToast`
- `@tanstack/react-query` — queries e mutations
- `msw` — handlers de backend simulado

### Pré-requisitos
1. Merge da branch `feat/layouts` para trazer os componentes visuais do carrinho
2. Change `storefront-pdp-page` já implementada (PDP funcional)
3. Handlers MSW de autenticação e sessão já implementados

## Out of Scope

- Aplicação de cupom de desconto (será implementado em change futura)
- Tempo real para atualização de estoque (eventos Socket.IO para carrinho)
- Carrinho compartilhado entre dispositivos (sincronização cross-device)
- Salvamento de carrinho para "comprar depois" (wishlist persistente)
- Recomendações personalizadas no carrossel do carrinho

## Risks and Mitigations

| Risco | Impacto | Mitigação |
|-------|---------|-----------|
| Componentes de `feat/layouts` podem ter dependências não disponíveis na `main` | Alto | Cherry-pick seletivo e teste incremental de cada componente copiado |
| Atualização otimista falhando rollback | Médio | Testes de integração com cenários de erro, verificar estado do cache |
| Race condition entre add-to-cart e login | Médio | Garantir que `mergeGuestCart` seja chamado antes de invalidar cache |
| Badge do carrinho não atualizando | Baixo | Query key correta com `userId`, invalidação explícita após mutations |
| Performance com carrinho grande (>50 items) | Baixo | Paginação ou virtualização em change futura se necessário |

## Success Criteria

- [ ] Todos os componentes visuais de `feat/layouts` portados e funcionais
- [ ] Handlers MSW de carrinho implementados e testados
- [ ] Botão "Adicionar ao carrinho" no PDP funcional
- [ ] Badge do carrinho no header atualizado automaticamente
- [ ] Página `/cart` exibe items corretamente
- [ ] Atualização otimista com rollback funcional
- [ ] Live regions anunciam ações de forma acessível
- [ ] Merge de carrinho guest em login funcional
- [ ] Isolamento por usuário (`userId` em query keys)
- [ ] Todos os testes (unitários, integração, E2E) passando
- [ ] `typecheck`, `lint`, `test` e `build` passando sem erros
- [ ] Documentação atualizada (`ARCHITECTURE.md`, `README.md`, `docs/contracts.md`)

## Timeline Estimate

- **Port de componentes visuais**: 2-3 horas
- **Handlers MSW**: 2-3 horas
- **Domain e data-access**: 2-3 horas
- **Integração PDP**: 1-2 horas
- **Badge do header**: 1 hora
- **Página de carrinho**: 2-3 horas
- **Testes**: 3-4 horas
- **Documentação**: 1 hora

**Total estimado**: 14-19 horas (ajustado para cherry-pick ao invés de merge completo)

## Open Questions

1. Devemos navegar automaticamente para `/cart` após adicionar item, ou apenas exibir toast?
   - **Proposta**: Apenas toast + badge atualizado. Navegação automática pode ser intrusiva.
2. Limite máximo de items no carrinho?
   - **Proposta**: Sem limite arbitrário. Validar apenas `maxAvailable` por item.
3. Expiração de carrinho guest?
   - **Proposta**: Sem expiração automática nesta change. Limpeza em sessão expirada.
4. Comportamento do botão "Comprar agora"?
   - **Proposta**: Adicionar ao carrinho + navegar para `/checkout/payment` (ou continuar com notificação de indisponível se fluxo de pagamento não estiver pronto).
