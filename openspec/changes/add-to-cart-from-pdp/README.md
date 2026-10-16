# Add to Cart from PDP

## Overview

Esta change implementa a funcionalidade completa de **adicionar items ao carrinho** a partir da página de detalhes do produto (PDP), transformando o botão "Adicionar ao carrinho" (atualmente apenas uma notificação de indisponibilidade) em uma ação funcional que:

1. Executa requisição `POST /api/cart/items` ao backend simulado MSW
2. Valida disponibilidade de estoque
3. Faz merge de items duplicados
4. Atualiza o cache do TanStack Query de forma otimista
5. Fornece feedback visual e acessível
6. Atualiza o badge de contador no header
7. Conecta a página de carrinho aos dados reais

## Context

### Current State

- ✅ Componentes visuais do carrinho já existem na branch `feat/layouts` (podem ser reutilizados)
- ✅ Schemas de contrato (`AddToCartInputSchema`, `CartSchema`) já definidos
- ✅ Estado de carrinho no banco de dados mock já implementado
- ✅ Merge de carrinho guest em login já implementado
- ❌ Handlers MSW de carrinho são minimalistas (apenas GET retornando vazio)
- ❌ Botão "Adicionar ao carrinho" apenas exibe notificação de indisponível
- ❌ Libs `cart/*` (domain, data-access, feature) estão vazias
- ❌ Nenhuma mutation de carrinho implementada

### Desired State

- ✅ Componentes visuais necessários copiados de `feat/layouts` (cherry-pick seletivo)
- ✅ Handlers MSW completos para todas as operações de carrinho
- ✅ Camadas domain e data-access implementadas
- ✅ Botão "Adicionar ao carrinho" funcional com feedback visual
- ✅ Badge de contador no header atualizado automaticamente
- ✅ Página `/cart` conectada aos dados reais
- ✅ Isolamento de cache por usuário
- ✅ Atualização otimista com rollback em erro
- ✅ Acessibilidade completa (live regions, navegação por teclado)

## Architecture

### Layers

```
┌─────────────────────────────────────────────────────┐
│                   apps/shell                        │
│  Header com badge de contador (cartItemCountQuery) │
└─────────────────────────────────────────────────────┘
           │                               │
           ▼                               ▼
┌──────────────────────┐      ┌──────────────────────┐
│  apps/storefront     │      │   apps/checkout      │
│  PdpFeaturePage      │      │   CartPage           │
│  useAddToCart()      │      │   CartPageContent    │
└──────────────────────┘      └──────────────────────┘
           │                               │
           ▼                               ▼
┌─────────────────────────────────────────────────────┐
│              libs/cart/data-access                  │
│  - cartQueryOptions, cartItemCountQueryOptions      │
│  - useAddToCart, useUpdateCartItem, etc.            │
└─────────────────────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────────────────┐
│              libs/cart/domain                       │
│  - calculateCartItemTotal, mergeCartItems, etc.     │
└─────────────────────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────────────────┐
│              libs/cart/ui                           │
│  - CartPageContent, CartItemRow, etc.               │
└─────────────────────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────────────────┐
│              libs/mocks/handlers                    │
│  - POST/GET/PUT/DELETE /api/cart/*                  │
└─────────────────────────────────────────────────────┘
```

### Data Flow

```
User clicks "Adicionar ao carrinho"
  └─> handleAddToCart() em PdpFeaturePage
      └─> useAddToCart().mutate({ nftId, editionId, quantity })
          ├─> onMutate: Atualização otimista do cache
          └─> POST /api/cart/items
              └─> MSW Handler
                  ├─> Valida disponibilidade
                  ├─> Merge ou adiciona item
                  └─> Retorna carrinho atualizado
                      └─> onSuccess
                          ├─> Invalida cartQueryOptions
                          ├─> Exibe toast de sucesso
                          └─> Live region anuncia ação
```

## Key Features

### 1. Optimistic Updates
- Item aparece imediatamente no badge do carrinho
- Cache atualizado antes da resposta do servidor
- Rollback automático em caso de erro
- UX extremamente responsiva

### 2. User Isolation
- Query keys incluem `userId` para usuários autenticados
- Query keys usam `'guest'` para usuários anônimos
- Cache limpo automaticamente em logout
- Merge automático de carrinho guest em login

### 3. Stock Validation
- Validação de `availableSupply` no backend
- Merge de quantidades respeitando limite máximo
- Feedback claro quando estoque é insuficiente
- Cenários de erro determinísticos para testes

### 4. Accessibility
- Live regions para anúncios de ações
- Navegação por teclado completa
- Labels e aria-labels descritivos
- Feedback visual e sonoro (screen reader)
- Conformidade com WCAG 2.1 AA

### 5. Monetary Precision
- Valores ETH sempre como string decimal
- Cálculos via `@nft/shared-money` (Decimal.js)
- Nenhuma aritmética nativa em valores monetários
- Formatação consistente em toda a aplicação

## API Endpoints

### POST /api/cart/items
Adiciona item ao carrinho (ou faz merge se já existir).

**Request**:
```json
{
  "nftId": "nft-01",
  "editionId": "ed-01",
  "quantity": 2
}
```

**Response** (200):
```json
{
  "id": "cart_user_alice",
  "userId": "user_alice",
  "items": [
    {
      "id": "item_1",
      "nftId": "nft-01",
      "editionId": "ed-01",
      "title": "Emerald Ape",
      "unitPrice": "0.025",
      "quantity": 2,
      "maxAvailable": 10,
      "imageUrl": "/assets/images/nft-01.png"
    }
  ],
  "updatedAt": "2026-10-16T12:00:00Z"
}
```

**Errors**:
- `401 Unauthorized` — sem autenticação nem session-id
- `404 Not Found` — NFT ou edição não encontrada
- `409 Conflict` — estoque insuficiente
- `400 Bad Request` — validação de entrada falhou

### GET /api/cart
Obtém carrinho atual do usuário ou guest.

**Response** (200):
```json
{
  "id": "cart_user_alice",
  "userId": "user_alice",
  "items": [...],
  "couponCode": null,
  "updatedAt": "2026-10-16T12:00:00Z"
}
```

### PUT /api/cart/items/:itemId
Atualiza quantidade de um item.

**Request**:
```json
{
  "quantity": 5
}
```

### DELETE /api/cart/items/:itemId
Remove item do carrinho.

### DELETE /api/cart
Limpa carrinho completamente.

## Testing Strategy

### Unit Tests
- Funções puras de `libs/cart/domain`
- Componentes isolados de `libs/cart/ui`

### Integration Tests
- Mutations com MSW handlers
- Atualização otimista e rollback
- Invalidação de cache

### E2E Tests
- Fluxo completo de adicionar ao carrinho
- Atualização e remoção de items
- Cenários de erro (estoque, sessão expirada)
- Merge de carrinho guest em login

## Dependencies

- `@nft/shared-contracts` — schemas e tipos
- `@nft/shared-money` — cálculos monetários
- `@nft/shared-query` — query key factories
- `@nft/shared-http` — cliente Axios
- `@nft/shared-ui` — componentes base
- `@nft/shell-kit` — hooks do shell
- `@tanstack/react-query` — gerenciamento de estado
- `msw` — simulação de backend
- `zod` — validação de schemas

## Files Changed

### New Files
- `openspec/changes/add-to-cart-from-pdp/`
- `libs/cart/domain/src/cart-calculations.ts`
- `libs/cart/domain/src/cart-calculations.spec.ts`
- `libs/cart/data-access/src/cart-queries.ts`
- `libs/cart/data-access/src/use-add-to-cart.ts`
- `libs/cart/data-access/src/use-update-cart-item.ts`
- `libs/cart/data-access/src/use-remove-cart-item.ts`
- `libs/cart/data-access/src/use-clear-cart.ts`
- `libs/cart/ui/src/cart-skeleton.tsx`
- `libs/mocks/handlers/src/cart.ts`
- `apps/web-e2e/src/cart-add-to-cart.spec.ts`

### Modified Files
- `libs/cart/ui/src/*` (merge from `feat/layouts`)
- `libs/catalog/feature/src/pdp-feature-page.tsx`
- `libs/catalog/ui/src/pdp-purchase-section.tsx`
- `libs/cart/ui/src/cart-page-content.tsx`
- `libs/shared/query/src/query-keys.ts`
- `libs/mocks/handlers/src/index.ts`
- `libs/auth/data-access/src/use-logout.ts`
- `libs/auth/data-access/src/use-login.ts`
- `apps/shell/src/components/Header.tsx`
- `apps/checkout/src/CartPage.tsx`
- `ARCHITECTURE.md`
- `README.md`
- `docs/contracts.md`

## Timeline

**Estimated Total Time**: 24-30 horas

**Breakdown**:
- Preparação e Cherry-pick Seletivo: ~1.5 horas (ajustado)
- Domain Layer: ~2.5 horas
- MSW Handlers: ~5 horas
- Data Access Layer: ~5 horas
- PDP Integration: ~1.5 horas
- Header Badge: ~1.5 horas
- Cart Page: ~2.5 horas
- Cache Isolation: ~1 hora
- Testing: ~6 horas
- Documentation: ~2 horas

## Success Criteria

- [ ] Botão "Adicionar ao carrinho" funcional
- [ ] Badge de contador atualizado automaticamente
- [ ] Página `/cart` exibe items corretamente
- [ ] Atualização otimista com rollback funcional
- [ ] Live regions anunciam ações
- [ ] Merge de carrinho guest em login funcional
- [ ] Isolamento de cache por usuário
- [ ] Todos os testes passando
- [ ] `typecheck`, `lint`, `test`, `build` passando
- [ ] Documentação atualizada

## Related Documents

- [Proposal](./proposal.md)
- [Design](./design.md)
- [Spec: Cart Add to Cart](./specs/cart-add-to-cart/spec.md)
- [Tasks](./tasks.md)
- [ARCHITECTURE.md](../../../ARCHITECTURE.md)
- [openspec/project.md](../../project.md)

## Questions?

Consulte os documentos acima ou abra uma discussão no repositório.
