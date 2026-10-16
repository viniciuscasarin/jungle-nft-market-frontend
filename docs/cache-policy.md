# Política de Cache e Gestão de Estado (TanStack Query)

Este documento especifica formalmente as diretrizes de cache, retenção de dados, isolamento de usuários e reconciliação de estado com TanStack Query (v5) no **Jungle NFT Marketplace**.

---

## 1. Configuração Global do QueryClient

O `QueryClient` é instanciado como singleton exclusivo no host (`apps/shell`) e distribuído aos remotes através de `ShellProvider` via `useShell()`. É estritamente proibido criar instâncias secundárias de `QueryClient`.

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60, // 1 minuto padrão para dados públicos
      gcTime: 1000 * 60 * 10, // 10 minutos de retenção em memória
      retry: (failureCount, error) => {
        // Retry automático apenas para falhas transitórias e de rede (GET retryable)
        if (error instanceof ApiError && error.retryable) {
          return failureCount < 3;
        }
        return false;
      },
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: false, // NUNCA realizar retry automático em mutations
    },
  },
});
```

---

## 2. Estrutura e Fábrica de Query Keys

Todas as query keys são geradas exclusivamente por factories tipadas em `@nft/shared-query` ou nos respectivos módulos `data-access`. Nunca utilize strings soltas como chaves de cache.

### Hierarquia de Chaves

```typescript
export const queryKeys = {
  auth: {
    session: () => ['auth', 'session'] as const,
  },
  catalog: {
    all: () => ['catalog'] as const,
    list: (params: CatalogSearchParams) => ['catalog', 'list', params] as const,
    detail: (id: string) => ['catalog', 'detail', id] as const,
    reviews: (nftId: string) => ['catalog', 'reviews', nftId] as const,
  },
  cart: {
    current: (userId?: string) => ['cart', userId ?? 'anonymous'] as const,
    quote: (cartId?: string) => ['cart', 'quote', cartId] as const,
  },
  favorites: {
    all: (userId: string) => ['favorites', userId] as const,
  },
  profile: {
    current: (userId: string) => ['profile', userId] as const,
  },
  wallets: {
    current: (userId: string) => ['wallets', userId] as const,
  },
  orders: {
    list: (userId: string) => ['orders', 'list', userId] as const,
    detail: (userId: string, orderId: string) => ['orders', 'detail', userId, orderId] as const,
  },
};
```

---

## 3. Isolamento Estrito por Usuário (`userId`)

Para impedir vazamento de dados entre diferentes colecionadores no mesmo navegador:
1. **Chaves Privadas Parametrizadas**: Toda consulta privada (`favorites`, `profile`, `wallets`, `orders`, `cart` autenticado) exige obrigatoriamente o `userId` em sua query key.
2. **Limpeza Atômica no Logout (`clearPrivateCache`)**:
   - Ao executar logout ou alternar de usuário (A -> B), o `SessionController`:
     - Cancela todas as queries e mutations ativas (`queryClient.cancelQueries()`).
     - Remove todas as entradas de cache com chaves privadas (`queryClient.removeQueries({ predicate: ... })`).
     - Desconecta o cliente Socket.IO e limpa ouvintes de eventos.
     - Reseta o `tokenStore` (removendo `nft_auth_token`).

---

## 4. Tabela de Políticas e Tempos de Retenção (`staleTime`)

| Domínio / Recurso | Tipo | `staleTime` | `gcTime` | Política de Revalidação / Invalidação |
|---|---|---|---|---|
| **Sessão (`auth.session`)** | Privado | `0` (instantâneo) | 5 min | Validado no boot; invalidado no login/logout/expiração. |
| **Catálogo (`catalog.list`)** | Público | 60 seg | 10 min | Invalidação seletiva por eventos `nft.updated`. |
| **Detalhe de NFT (`catalog.detail`)** | Público | 30 seg | 10 min | Atualizado por `nft.updated` ou refetch manual. |
| **Avaliações (`catalog.reviews`)** | Público | 5 min | 15 min | Read-only. |
| **Carrinho (`cart.current`)** | Misto | `0` (instantâneo) | 5 min | Invalidado após mutações de itens e login (merge anônimo). |
| **Cotação (`cart.quote`)** | Misto | `0` (instantâneo) | 2 min | Revalidado antes da submissão do pedido; invalidado por alteração de itens ou evento de preço. |
| **Favoritos (`favorites.all`)** | Privado | 2 min | 10 min | Mutação com atualização otimista e rollback em falha. |
| **Perfil (`profile.current`)** | Privado | 5 min | 15 min | Invalidado imediatamente após `updateProfile`. |
| **Carteiras (`wallets.current`)** | Privado | 5 min | 15 min | Invalidado imediatamente após vincular/desvincular carteira. |
| **Pedidos (`orders.detail`)** | Privado | Infinito (estados terminais) | 30 min | Pedidos `confirmed` e `rejected` são imutáveis e não refazem polling. |

---

## 5. Atualização Otimista com Rollback

Ações de alta frequência como favoritar/desfavoritar utilizam atualizações otimistas no cache do TanStack Query:
1. `onMutate`: Cancela queries ativas para a chave, obtém snapshot do cache anterior, e atualiza o cache localmente de forma síncrona.
2. `onError`: Restaura integralmente o snapshot prévio e emite anúncio acessível para leitores de tela (`aria-live="polite"`).
3. `onSettled`: Invalida a query key para sincronização final com a resposta autoritativa da API.

---

## 6. Reconciliação com Eventos em Tempo Real (Socket.IO)

Eventos recebidos via Socket.IO atualizam o cache do TanStack Query seguindo regras estritas:
- **Deduplicação**: Eventos repetidos com o mesmo `event.id` são descartados.
- **Monotonicidade de Versão**: Eventos com `version <= lastAppliedVersion` são ignorados, impedindo regressão de estado.
- **Filtro de Sessão**: Eventos com `userId` diferente do usuário atualmente autenticado são descartados.
- **Invalidação Direcionada**:
  - `nft.updated`: Invalida `catalog.detail(id)` e `cart.quote()`.
  - `order.updated`: Atualiza o registro em `orders.detail` e invalida o carrinho se o status for `confirmed`.
