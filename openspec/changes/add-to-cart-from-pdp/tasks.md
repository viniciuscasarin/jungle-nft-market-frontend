# Tasks: Add to Cart from PDP

## Status: Proposed

## Reconciliação com complete-purchase-happy-path (2026-10-16)

Mapa de arquivos, dependências e lacunas em [reuse-audit.md](../complete-purchase-happy-path/reuse-audit.md). Domain, handlers, query keys e componentes visuais locais serão reaproveitados. A UI ainda contém fixtures, cálculo monetário nativo e chrome próprio; não está pronta para integração. Data-access, feature, PDP, contador e continuidade guest/login permanecem pendentes.

A integração é coordenada pela change `complete-purchase-happy-path`. Atualização otimista/rollback (4.3.4, partes de 4.3.6, 6.2.2, 9.1.3) fica adiada com checkboxes abertos. A conexão da task 7.1 será feita na feature, preservando UI apresentacional; a rota canônica é `/carrinho`, respeitando os limites do standalone. Checkboxes anteriores de execução/cobertura não constituem evidência de checks atuais.

---

## Phase 1: Preparação e Cherry-pick de Componentes UI

### Task 1.1: Cherry-pick dos componentes da branch feat/layouts
- [x] 1.1.1 Listar arquivos específicos necessários de `feat/layouts:libs/cart/ui/src/`
- [x] 1.1.2 Usar `git show origin/feat/layouts:<path>` para extrair cada arquivo:
  - `cart-page-content.tsx`
  - `cart-item-row.tsx`
  - `cart-item-card.tsx`
  - `cart-quantity-stepper.tsx`
  - `order-summary-card.tsx`
  - `cart-recommended-carousel.tsx`
  - `cart-mobile-header.tsx`
  - `types.ts`
- [x] 1.1.3 Copiar cada arquivo para `libs/cart/ui/src/` na branch atual
- [x] 1.1.4 **NÃO fazer `git merge`** — apenas copiar arquivos individuais
- [x] 1.1.5 Verificar se há stories (`.stories.tsx`) úteis e copiá-las se necessário
- [x] 1.1.6 Executar `pnpm typecheck` e corrigir erros
- [x] 1.1.7 Executar `pnpm lint` e corrigir erros

**Acceptance Criteria**:
- Apenas arquivos específicos de `libs/cart/ui` foram copiados (não merge completo)
- Componentes funcionais e sem dependências quebradas
- `typecheck` e `lint` passam sem erros
- Nenhum import de terceiros direto (exceto React)

**Estimated Time**: 1-1.5 horas

---

### Task 1.2: Ajustar tipos dos componentes UI
- [x] 1.2.1 Revisar `libs/cart/ui/src/types.ts`
- [x] 1.2.2 Alinhar tipos locais com `@nft/shared-contracts` (`CartItem`, `Cart`)
- [ ] 1.2.3 Remover duplicação de tipos se houver
- [x] 1.2.4 Atualizar imports nos componentes para usar contratos compartilhados
- [x] 1.2.5 Executar `pnpm typecheck` e corrigir erros

**Acceptance Criteria**:
- Componentes usam `CartItem` de `@nft/shared-contracts`
- Não há duplicação de tipos
- `typecheck` passa sem erros

**Estimated Time**: 30 minutos

---

### Task 1.3: Atualizar exports de libs/cart/ui
- [x] 1.3.1 Revisar `libs/cart/ui/src/index.ts`
- [x] 1.3.2 Garantir que todos os componentes estão exportados
- [x] 1.3.3 Exportar tipos auxiliares se necessário
- [x] 1.3.4 Adicionar comentário de documentação ao módulo
- [x] 1.3.5 Verificar que não há circular dependencies

**Acceptance Criteria**:
- Todos os componentes públicos estão exportados em `index.ts`
- Nenhuma circular dependency detectada pelo lint
- `CART_UI_MODULE` constante está definida

**Estimated Time**: 15 minutos

---

## Phase 2: Implementação da Camada Domain

### Task 2.1: Criar funções puras de manipulação de carrinho
- [x] 2.1.1 Criar `libs/cart/domain/src/cart-calculations.ts`
- [x] 2.1.2 Implementar `calculateCartItemTotal(unitPrice: string, quantity: number): string`
  - Usar `multiply()` de `@nft/shared-money`
  - Retornar string decimal
- [x] 2.1.3 Implementar `mergeCartItems(existingItem: CartItem, newQuantity: number, maxAvailable: number): CartItem`
  - Somar quantidades
  - Respeitar `maxAvailable`
  - Retornar item atualizado
- [x] 2.1.4 Implementar `validateCartItemQuantity(quantity: number, maxAvailable: number): boolean`
- [x] 2.1.5 Implementar `isCartEmpty(cart: Cart): boolean`

**Acceptance Criteria**:
- Todas as funções são puras (sem side effects)
- Nenhuma dependência de React ou I/O
- Apenas `@nft/shared-contracts` e `@nft/shared-money` como dependências
- TypeScript strict mode passa

**Estimated Time**: 1 hora

---

### Task 2.2: Criar testes unitários de domain
- [x] 2.2.1 Criar `libs/cart/domain/src/cart-calculations.spec.ts`
- [x] 2.2.2 Testar `calculateCartItemTotal` com diversos valores:
  - Quantidade 1
  - Quantidade múltipla
  - Preço com muitas casas decimais
- [x] 2.2.3 Testar `mergeCartItems`:
  - Merge sem exceder limite
  - Merge excedendo limite (deve respeitar `maxAvailable`)
- [x] 2.2.4 Testar `validateCartItemQuantity`:
  - Quantidade válida
  - Quantidade excedendo limite
  - Quantidade zero ou negativa
- [x] 2.2.5 Testar `isCartEmpty`:
  - Carrinho vazio
  - Carrinho com items
- [x] 2.2.6 Executar `pnpm test` e garantir 100% de cobertura

**Acceptance Criteria**:
- Todos os testes passam
- Cobertura de código ≥ 95%
- Casos de borda testados

**Estimated Time**: 1 hora

---

### Task 2.3: Atualizar exports de libs/cart/domain
- [x] 2.3.1 Exportar todas as funções públicas em `libs/cart/domain/src/index.ts`
- [x] 2.3.2 Adicionar documentação JSDoc às funções
- [x] 2.3.3 Verificar que não há circular dependencies

**Acceptance Criteria**:
- Todas as funções públicas estão exportadas
- JSDoc presente em todas as funções
- Lint passa sem erros

**Estimated Time**: 15 minutos

---

## Phase 3: Implementação dos Handlers MSW

### Task 3.1: Implementar POST /api/cart/items
- [x] 3.1.1 Criar `libs/mocks/handlers/src/cart.ts`
- [x] 3.1.2 Implementar handler `http.post('/api/cart/items')`
- [x] 3.1.3 Extrair `userId` do header `Authorization` (JWT)
- [x] 3.1.4 Extrair `sessionId` do header `x-session-id`
- [x] 3.1.5 Validar payload com `AddToCartInputSchema`
- [x] 3.1.6 Buscar NFT e edição na base de dados mock
- [x] 3.1.7 Validar disponibilidade (`edition.availableSupply >= quantity`)
- [x] 3.1.8 Buscar ou criar carrinho do usuário/guest
- [x] 3.1.9 Verificar se item já existe (merge ou add)
- [x] 3.1.10 Atualizar carrinho e retornar resposta
- [x] 3.1.11 Implementar cenários de erro:
  - `401 Unauthorized` se sem `userId` e sem `sessionId`
  - `404 Not Found` se NFT ou edição não existir
  - `409 Conflict` se estoque insuficiente
  - `400 Bad Request` se validação falhar

**Acceptance Criteria**:
- Handler implementado e funcional
- Todos os cenários de erro cobertos
- Merge de items duplicados funcional
- Resposta retorna carrinho completo atualizado

**Estimated Time**: 2 horas

---

### Task 3.2: Atualizar GET /api/cart
- [x] 3.2.1 Substituir handler minimalista em `libs/mocks/handlers/src/index.ts`
- [x] 3.2.2 Implementar handler completo `http.get('/api/cart')`
- [x] 3.2.3 Extrair `userId` ou `sessionId`
- [x] 3.2.4 Buscar carrinho do usuário/guest na base de dados
- [x] 3.2.5 Retornar carrinho vazio se não existir
- [x] 3.2.6 Retornar carrinho completo se existir

**Acceptance Criteria**:
- Handler retorna carrinho do usuário correto
- Handler retorna carrinho vazio para usuário sem carrinho
- Isolamento por usuário funcional

**Estimated Time**: 30 minutos

---

### Task 3.3: Implementar PUT /api/cart/items/:itemId
- [x] 3.3.1 Implementar handler `http.put('/api/cart/items/:itemId')`
- [x] 3.3.2 Extrair `itemId` dos params
- [x] 3.3.3 Validar payload com `UpdateCartItemInputSchema`
- [x] 3.3.4 Buscar carrinho do usuário/guest
- [x] 3.3.5 Buscar item no carrinho pelo `itemId`
- [x] 3.3.6 Validar nova quantidade vs `maxAvailable`
- [x] 3.3.7 Atualizar quantidade do item
- [x] 3.3.8 Retornar carrinho atualizado
- [x] 3.3.9 Implementar cenários de erro:
  - `404` se carrinho ou item não existir
  - `409` se quantidade exceder estoque

**Acceptance Criteria**:
- Handler atualiza quantidade corretamente
- Validação de `maxAvailable` funcional
- Cenários de erro cobertos

**Estimated Time**: 1 hora

---

### Task 3.4: Implementar DELETE /api/cart/items/:itemId
- [x] 3.4.1 Implementar handler `http.delete('/api/cart/items/:itemId')`
- [x] 3.4.2 Extrair `itemId` dos params
- [x] 3.4.3 Buscar carrinho do usuário/guest
- [x] 3.4.4 Buscar item no carrinho pelo `itemId`
- [x] 3.4.5 Remover item do array `cart.items`
- [x] 3.4.6 Atualizar `cart.updatedAt`
- [x] 3.4.7 Retornar carrinho atualizado
- [x] 3.4.8 Implementar cenário de erro `404` se item não existir

**Acceptance Criteria**:
- Handler remove item corretamente
- Carrinho atualizado retornado
- Erro 404 se item não existir

**Estimated Time**: 30 minutos

---

### Task 3.5: Implementar DELETE /api/cart
- [x] 3.5.1 Implementar handler `http.delete('/api/cart')`
- [x] 3.5.2 Buscar carrinho do usuário/guest
- [x] 3.5.3 Limpar array `cart.items`
- [x] 3.5.4 Atualizar `cart.updatedAt`
- [x] 3.5.5 Retornar resposta de sucesso

**Acceptance Criteria**:
- Handler limpa carrinho corretamente
- Carrinho vazio mantém estrutura válida

**Estimated Time**: 15 minutos

---

### Task 3.6: Atualizar exports de mocks/handlers
- [x] 3.6.1 Exportar `cartHandlers` de `libs/mocks/handlers/src/cart.ts`
- [x] 3.6.2 Importar e incluir `cartHandlers` no array `handlers` em `libs/mocks/handlers/src/index.ts`
- [x] 3.6.3 Verificar que handlers são registrados no MSW worker

**Acceptance Criteria**:
- Todos os handlers de carrinho estão registrados
- MSW intercepta requisições de carrinho corretamente

**Estimated Time**: 15 minutos

---

### Task 3.7: Criar cenários de teste determinísticos
- [x] 3.7.1 Criar cenário "Carrinho com múltiplos items" em `libs/mocks/fixtures/src/carts.ts`
- [ ] 3.7.2 Criar cenário "Carrinho com item esgotado" (edição com `availableSupply = 0`)
- [ ] 3.7.3 Criar cenário "Carrinho guest para merge" em `libs/mocks/core/src/scenarios.ts`
- [ ] 3.7.4 Documentar cenários no `README.md` de mocks

**Acceptance Criteria**:
- Cenários determinísticos e reproduzíveis
- Documentação atualizada

**Estimated Time**: 30 minutos

---

## Phase 4: Implementação da Camada Data Access

### Task 4.1: Criar query key factories
- [x] 4.1.1 Adicionar factories de query keys em `libs/shared/query/src/query-keys.ts`:
  - `queryKeys.cart.all`
  - `queryKeys.cart.lists()`
  - `queryKeys.cart.list(userId)`
  - `queryKeys.cart.counts()`
  - `queryKeys.cart.count(userId)`
- [x] 4.1.2 Exportar factories em `libs/shared/query/src/index.ts`

**Acceptance Criteria**:
- Query keys seguem padrão hierárquico
- Keys incluem `userId` para isolamento

**Estimated Time**: 20 minutos

---

### Task 4.2: Criar query options de carrinho
- [x] 4.2.1 Criar `libs/cart/data-access/src/cart-queries.ts`
- [x] 4.2.2 Implementar `cartQueryOptions(client, userId?, sessionId?)`
  - Query key com `userId` ou `'guest'`
  - Query function `GET /api/cart`
  - Stale time: 30 segundos
  - Retry: 1 vez apenas em erros `retryable`
- [x] 4.2.3 Implementar `cartItemCountQueryOptions(client, userId?, sessionId?)`
  - Derivado de `cartQueryOptions` via `select`
  - Calcula soma de `cart.items.map(i => i.quantity)`

**Acceptance Criteria**:
- Query options configurados corretamente
- Isolamento por usuário funcional
- Contador derivado do carrinho principal

**Estimated Time**: 45 minutos

---

### Task 4.3: Criar mutation useAddToCart com dependências injetadas
- [x] 4.3.1 Criar `libs/cart/data-access/src/use-add-to-cart.ts`
- [x] 4.3.2 Implementar hook `useAddToCart(dependencies)` com cliente, identidade e callbacks injetados
- [x] 4.3.3 Implementar `mutationFn`: `POST /api/cart/items`
- [x] 4.3.4 Implementar `onMutate` (atualização otimista):
  - Cancelar queries em andamento
  - Fazer snapshot do carrinho atual
  - Atualizar cache otimisticamente (merge ou add item)
  - Retornar context com snapshot
- [x] 4.3.5 Implementar `onSuccess`:
  - Invalidar `cartQueryOptions`
  - Invalidar `cartItemCountQueryOptions`
  - Exibir toast de sucesso
  - Anunciar para screen reader
- [x] 4.3.6 Implementar `onError`:
  - Restaurar snapshot (rollback)
  - Exibir toast de erro com mensagem específica
  - Anunciar erro para screen reader

**Acceptance Criteria**:
- Mutation funcional
- Atualização otimista implementada
- Rollback em erro funcional
- Feedback visual e acessível

**Estimated Time**: 2 horas

---

### Task 4.4: Criar mutations de atualização e remoção
- [x] 4.4.1 Criar `libs/cart/data-access/src/use-update-cart-item.ts`
- [x] 4.4.2 Implementar `useUpdateCartItem()`
  - Mutation function: `PUT /api/cart/items/:itemId`
  - Atualização otimista opcional
  - Invalidação de cache em sucesso
- [x] 4.4.3 Criar `libs/cart/data-access/src/use-remove-cart-item.ts`
- [x] 4.4.4 Implementar `useRemoveCartItem()`
  - Mutation function: `DELETE /api/cart/items/:itemId`
  - Atualização otimista opcional
  - Invalidação de cache em sucesso
- [x] 4.4.5 Criar `libs/cart/data-access/src/use-clear-cart.ts`
- [x] 4.4.6 Implementar `useClearCart()`
  - Mutation function: `DELETE /api/cart`
  - Invalidação de cache em sucesso

**Acceptance Criteria**:
- Todas as mutations funcionais
- Invalidação de cache correta
- Feedback de erro apropriado

**Estimated Time**: 1.5 horas

---

### Task 4.5: Atualizar exports de cart/data-access
- [x] 4.5.1 Exportar query options em `libs/cart/data-access/src/index.ts`
- [x] 4.5.2 Exportar mutations em `libs/cart/data-access/src/index.ts`
- [x] 4.5.3 Adicionar documentação JSDoc

**Acceptance Criteria**:
- Todas as funções públicas exportadas
- Documentação presente

**Estimated Time**: 10 minutos

---

## Phase 5: Integração no PDP

### Task 5.1: Integrar useAddToCart no PDP
- [ ] 5.1.1 Abrir `libs/catalog/feature/src/pdp-feature-page.tsx`
- [ ] 5.1.2 Importar `useAddToCart` de `@nft/cart-data-access`
- [ ] 5.1.3 Substituir `onAddToCart={() => notifyUnavailable('Adicionar ao carrinho')}` por `handleAddToCart`
- [ ] 5.1.4 Implementar `handleAddToCart`:
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
- [ ] 5.1.5 Passar `isAddingToCart={addToCart.isPending}` para `PdpPageContent`

**Acceptance Criteria**:
- Botão "Adicionar ao carrinho" funcional
- Loading state visível durante mutation
- Toast de sucesso/erro exibido

**Estimated Time**: 30 minutos

---

### Task 5.2: Adicionar live region ao PDP
- [ ] 5.2.1 Criar state `announceMessage` para anúncios
- [ ] 5.2.2 Adicionar elemento live region:
  ```tsx
  <div aria-live="polite" aria-atomic="true" className="sr-only">
    {announceMessage}
  </div>
  ```
- [ ] 5.2.3 Atualizar `announceMessage` em `onSuccess` e `onError`
- [ ] 5.2.4 Limpar mensagem após 3 segundos

**Acceptance Criteria**:
- Live region anuncia ações corretamente
- Mensagem é limpa automaticamente
- Apenas leitores de tela "veem" o anúncio

**Estimated Time**: 20 minutos

---

### Task 5.3: Atualizar PdpPurchaseSection com loading state
- [ ] 5.3.1 Abrir `libs/catalog/ui/src/pdp-purchase-section.tsx`
- [ ] 5.3.2 Adicionar prop `isAddingToCart?: boolean`
- [ ] 5.3.3 Passar `isLoading={isAddingToCart}` para botão "Adicionar ao carrinho"
- [ ] 5.3.4 Desabilitar botão durante `isAddingToCart`

**Acceptance Criteria**:
- Botão exibe spinner durante loading
- Botão desabilitado durante mutation
- UX clara e responsiva

**Estimated Time**: 15 minutos

---

## Phase 6: Badge de Contador no Header

### Task 6.1: Adicionar badge ao header do shell
- [ ] 6.1.1 Abrir `apps/shell/src/components/Header.tsx` (ou componente equivalente)
- [ ] 6.1.2 Importar `useQuery` e `cartItemCountQueryOptions`
- [ ] 6.1.3 Obter contagem de items:
  ```typescript
  const session = useSession();
  const cartCountQuery = useQuery(cartItemCountQueryOptions(session?.userId, session?.sessionId));
  const itemCount = cartCountQuery.data ?? 0;
  ```
- [ ] 6.1.4 Renderizar badge condicionalmente (`{itemCount > 0 && ...}`)
- [ ] 6.1.5 Adicionar `aria-label={`${itemCount} items no carrinho`}`
- [ ] 6.1.6 Estilizar badge (pequeno círculo vermelho com número branco)

**Acceptance Criteria**:
- Badge visível apenas se `itemCount > 0`
- Contador atualizado automaticamente
- Badge acessível (aria-label descritivo)

**Estimated Time**: 45 minutos

---

### Task 6.2: Testar atualização automática do badge
- [ ] 6.2.1 Adicionar item ao carrinho no PDP
- [ ] 6.2.2 Verificar que badge é atualizado imediatamente (otimista)
- [ ] 6.2.3 Verificar que badge é atualizado após resposta do servidor
- [ ] 6.2.4 Verificar que badge é atualizado após remover item
- [ ] 6.2.5 Verificar que badge desaparece quando carrinho fica vazio

**Acceptance Criteria**:
- Badge atualiza em todas as operações de carrinho
- Sem delays perceptíveis (otimista)

**Estimated Time**: 20 minutos

---

## Phase 7: Página de Carrinho

### Task 7.1: Conectar CartPageContent aos dados reais
- [ ] 7.1.1 Criar conexão em `libs/cart/feature/src/cart-feature-page.tsx` e revisar `libs/cart/ui/src/cart-page-content.tsx` apresentacional
- [ ] 7.1.2 Importar `useQuery`, `cartQueryOptions`, mutations somente na feature; UI recebe dados/callbacks por props
- [ ] 7.1.3 Obter dados do carrinho:
  ```typescript
  const session = useSession();
  const cartQuery = useQuery(cartQueryOptions(session?.userId, session?.sessionId));
  const updateCartItem = useUpdateCartItem();
  const removeCartItem = useRemoveCartItem();
  ```
- [ ] 7.1.4 Implementar estados assíncronos:
  - Loading: `<CartSkeleton />`
  - Error: `<ErrorState onRetry={cartQuery.refetch} />`
  - Empty: `<EmptyState ... />`
  - Success: renderizar items e summary
- [ ] 7.1.5 Passar callbacks para componentes filhos:
  ```tsx
  <CartItemRow
    onUpdateQuantity={(qty) => updateCartItem.mutate({ itemId, quantity: qty })}
    onRemove={() => removeCartItem.mutate({ itemId })}
  />
  ```

**Acceptance Criteria**:
- Página exibe carrinho do usuário
- Estados assíncronos implementados
- Mutations conectadas aos controles

**Estimated Time**: 1.5 horas

---

### Task 7.2: Criar componente CartSkeleton
- [ ] 7.2.1 Criar `libs/cart/ui/src/cart-skeleton.tsx`
- [ ] 7.2.2 Implementar skeleton com mesmas dimensões do layout real
- [ ] 7.2.3 Adicionar shimmer animation (respeitando `prefers-reduced-motion`)
- [ ] 7.2.4 Adicionar `aria-label="Carregando carrinho"`
- [ ] 7.2.5 Exportar em `libs/cart/ui/src/index.ts`

**Acceptance Criteria**:
- Skeleton preserva dimensões (sem layout shift)
- Shimmer desligado sob `prefers-reduced-motion`
- Região em carregamento usa `aria-busy`

**Estimated Time**: 30 minutos

---

### Task 7.3: Atualizar rota /cart no standalone de checkout
- [ ] 7.3.1 Abrir `apps/checkout/src/main.tsx`
- [ ] 7.3.2 Garantir que rota `/cart` está definida
- [ ] 7.3.3 Testar acesso à rota no harness standalone

**Acceptance Criteria**:
- Rota `/cart` funcional no standalone
- Página renderiza corretamente

**Estimated Time**: 10 minutos

---

## Phase 8: Limpeza de Cache e Isolamento

### Task 8.1: Limpar cache de carrinho em logout
- [ ] 8.1.1 Abrir `libs/auth/data-access/src/use-logout.ts` (ou equivalente)
- [ ] 8.1.2 Importar `queryKeys` de `@nft/shared-query`
- [ ] 8.1.3 Adicionar limpeza de cache em `onSuccess`:
  ```typescript
  const userId = session?.userId;
  queryClient.removeQueries({ queryKey: queryKeys.cart.list(userId) });
  queryClient.removeQueries({ queryKey: queryKeys.cart.count(userId) });
  ```
- [ ] 8.1.4 Cancelar queries em andamento

**Acceptance Criteria**:
- Cache de carrinho limpo em logout
- Nenhum vazamento de dados entre usuários

**Estimated Time**: 20 minutos

---

### Task 8.2: Invalidar cache após login (merge de carrinho guest)
- [ ] 8.2.1 Abrir `libs/auth/data-access/src/use-login.ts` (ou equivalente)
- [ ] 8.2.2 Após login bem-sucedido, invalidar cache de carrinho:
  ```typescript
  queryClient.invalidateQueries({ queryKey: queryKeys.cart.all });
  ```
- [ ] 8.2.3 Garantir que `mergeGuestCart` é chamado pelo handler de login (já implementado)

**Acceptance Criteria**:
- Carrinho guest é mesclado ao carrinho do usuário
- Cache invalidado após login
- Dados atualizados refletidos na UI

**Estimated Time**: 15 minutos

---

## Phase 9: Testes

### Task 9.1: Testes de integração das mutations
- [ ] 9.1.1 Criar `libs/mocks/handlers/src/cart-data-access.spec.ts` para testar a API pública de data-access sem violar fronteiras
- [ ] 9.1.2 Testar API pública/mutations com MSW em mocks/handlers (respeitando fronteiras):
  - Sucesso: item adicionado
  - Erro: estoque insuficiente
  - Erro: sessão expirada
- [ ] 9.1.3 Testar atualização otimista e rollback
- [ ] 9.1.4 Testar invalidação de cache
- [ ] 9.1.5 Criar testes similares para outras mutations

**Acceptance Criteria**:
- Todos os cenários de mutations testados
- Atualização otimista e rollback verificados
- Testes passam consistentemente

**Estimated Time**: 2 horas

---

### Task 9.2: Testes E2E do fluxo completo
- [ ] 9.2.1 Criar `apps/web-e2e/src/cart-add-to-cart.spec.ts`
- [ ] 9.2.2 Testar fluxo completo:
  1. Navegar para PDP
  2. Selecionar edição
  3. Definir quantidade
  4. Clicar em "Adicionar ao carrinho"
  5. Verificar toast de sucesso
  6. Verificar badge atualizado
  7. Navegar para `/cart`
  8. Verificar item na lista
- [ ] 9.2.3 Testar atualização de quantidade no carrinho
- [ ] 9.2.4 Testar remoção de item
- [ ] 9.2.5 Testar carrinho vazio
- [ ] 9.2.6 Testar cenários de erro:
  - Item esgotado
  - Sessão expirada

**Acceptance Criteria**:
- Todos os cenários E2E passam
- Fluxo completo verificado
- Cenários de erro cobertos

**Estimated Time**: 3 horas

---

### Task 9.3: Testes de acessibilidade
- [ ] 9.3.1 Verificar navegação por teclado:
  - Tab através dos controles
  - Enter para ativar botões
  - Esc para fechar modals/toasts
- [ ] 9.3.2 Verificar live regions anunciando ações
- [ ] 9.3.3 Verificar labels e aria-labels descritivos
- [ ] 9.3.4 Verificar contraste de cores (AA)
- [ ] 9.3.5 Verificar focus visível em todos os elementos interativos

**Acceptance Criteria**:
- Navegação por teclado funcional
- Anúncios de screen reader corretos
- Conformidade com WCAG 2.1 AA

**Estimated Time**: 1 hora

---

## Phase 10: Documentação e Finalização

### Task 10.1: Atualizar ARCHITECTURE.md
- [ ] 10.1.1 Adicionar seção sobre carrinho e isolamento por usuário
- [ ] 10.1.2 Documentar estratégia de atualização otimista
- [ ] 10.1.3 Documentar decisões de cache (stale time, invalidação)
- [ ] 10.1.4 Adicionar diagrama de fluxo de dados de carrinho

**Acceptance Criteria**:
- Decisões de arquitetura documentadas
- Diagramas claros e precisos

**Estimated Time**: 30 minutos

---

### Task 10.2: Atualizar README.md
- [ ] 10.2.1 Adicionar seção sobre funcionalidade de carrinho
- [ ] 10.2.2 Documentar fluxo de adicionar ao carrinho
- [ ] 10.2.3 Adicionar screenshots (se aplicável)

**Acceptance Criteria**:
- README atualizado e claro
- Funcionalidade de carrinho documentada

**Estimated Time**: 20 minutos

---

### Task 10.3: Atualizar docs/contracts.md
- [ ] 10.3.1 Documentar endpoints de carrinho:
  - `POST /api/cart/items`
  - `GET /api/cart`
  - `PUT /api/cart/items/:itemId`
  - `DELETE /api/cart/items/:itemId`
  - `DELETE /api/cart`
- [ ] 10.3.2 Documentar payloads de requisição e resposta
- [ ] 10.3.3 Documentar códigos de erro

**Acceptance Criteria**:
- Todos os endpoints documentados
- Exemplos de payloads presentes
- Cenários de erro documentados

**Estimated Time**: 30 minutos

---

### Task 10.4: Validação final
- [ ] 10.4.1 Executar `pnpm typecheck` — deve passar sem erros
- [ ] 10.4.2 Executar `pnpm lint` — deve passar sem erros
- [ ] 10.4.3 Executar `pnpm test` — deve passar sem erros
- [ ] 10.4.4 Executar `pnpm build` — deve passar sem erros
- [ ] 10.4.5 Executar `pnpm e2e` — deve passar sem erros
- [ ] 10.4.6 Testar manualmente fluxo completo em `dev:mocks`
- [ ] 10.4.7 Verificar responsividade (390px, 768px, 1440px)
- [ ] 10.4.8 Verificar acessibilidade com leitor de tela

**Acceptance Criteria**:
- Todos os comandos passam sem erros
- Fluxo manual funcional
- Responsividade e acessibilidade verificadas

**Estimated Time**: 1 hora

---

## Summary

**Total Tasks**: 59 subtasks  
**Estimated Total Time**: 23-28 horas (ajustado para cherry-pick seletivo)

**Phases**:
1. Preparação e Cherry-pick de Componentes UI: ~1.5 horas (ajustado)
2. Implementação da Camada Domain: ~2.5 horas
3. Implementação dos Handlers MSW: ~5 horas
4. Implementação da Camada Data Access: ~5 horas
5. Integração no PDP: ~1.5 horas
6. Badge de Contador no Header: ~1.5 horas
7. Página de Carrinho: ~2.5 horas
8. Limpeza de Cache e Isolamento: ~1 hora
9. Testes: ~6 horas
10. Documentação e Finalização: ~2 horas

---

## Notes

- Algumas tasks podem ser executadas em paralelo (ex: domain e handlers MSW)
- Testes devem ser executados incrementalmente durante a implementação
- Validação final é crítica antes de considerar a change concluída
- Documentação deve ser atualizada conforme a implementação avança
