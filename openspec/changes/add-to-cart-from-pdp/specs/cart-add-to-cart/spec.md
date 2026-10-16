# Spec: Cart Add to Cart

## Capability ID
`cart-add-to-cart`

## Overview
Define o comportamento de adicionar items ao carrinho de compras a partir da página de detalhes do produto (PDP), incluindo validação de disponibilidade, merge de items duplicados, atualização otimista do cache, feedback visual e acessível, e suporte a usuários autenticados e guest.

## Scope
- Botão "Adicionar ao carrinho" no PDP funcional
- Requisição `POST /api/cart/items` ao backend simulado
- Validação de estoque e limites de quantidade
- Merge de items duplicados no carrinho
- Atualização otimista do cache com rollback em erro
- Feedback visual (loading, toast de sucesso/erro)
- Live region para anúncios acessíveis
- Badge de contador no header atualizado automaticamente
- Suporte a usuários autenticados (userId) e guest (sessionId)

## Out of Scope
- Aplicação de cupom de desconto
- Tempo real para atualização de estoque (Socket.IO)
- Carrinho compartilhado entre dispositivos
- Salvamento de carrinho para "comprar depois"
- Navegação automática para `/cart` após adicionar item

---

## Requirements

### REQ-001: Botão "Adicionar ao Carrinho" no PDP
**Priority**: MUST  
**Type**: Functional

O botão "Adicionar ao carrinho" na página de detalhes do produto (PDP) SHALL executar a mutation `useAddToCart()` ao ser clicado.

**Acceptance Criteria**:
- O botão SHALL estar visível e habilitado quando uma edição válida estiver selecionada
- O botão SHALL estar desabilitado durante a execução da mutation (`isPending === true`)
- O botão SHALL exibir estado de loading visual durante a mutation
- O botão SHALL ter `data-testid="pdp-add-to-cart-button"` para testes

**WHEN** o usuário clica no botão "Adicionar ao carrinho" no PDP  
**THEN** a mutation `useAddToCart()` é executada com `{ nftId, editionId, quantity }`

---

### REQ-002: Requisição POST /api/cart/items
**Priority**: MUST  
**Type**: Functional

A mutation `useAddToCart()` SHALL executar uma requisição `POST /api/cart/items` com o payload `{ nftId, editionId, quantity }` validado pelo schema `AddToCartInputSchema`.

**Acceptance Criteria**:
- O payload SHALL ser validado com `AddToCartInputSchema` antes de enviar
- A requisição SHALL incluir header `Authorization` se usuário estiver autenticado
- A requisição SHALL incluir header `x-session-id` se usuário for guest
- A requisição SHALL ter timeout de 10 segundos
- Não SHALL haver retry automático (mutation não idempotente para usuário)

**WHEN** a mutation é executada com `{ nftId: "nft-01", editionId: "ed-01", quantity: 2 }`  
**THEN** uma requisição `POST /api/cart/items` é enviada com o payload validado

---

### REQ-003: Validação de Disponibilidade no Backend
**Priority**: MUST  
**Type**: Functional

O handler MSW `POST /api/cart/items` SHALL validar se a edição solicitada tem estoque disponível (`edition.availableSupply >= quantity`).

**Acceptance Criteria**:
- O handler SHALL buscar o NFT pelo `nftId` na base de dados mock
- O handler SHALL buscar a edição pelo `editionId` no array `nft.editions`
- O handler SHALL retornar `404` se NFT ou edição não existir
- O handler SHALL retornar `409` com código `insufficient_stock` se estoque for insuficiente
- O handler SHALL atualizar o carrinho apenas se validação passar

**WHEN** usuário tenta adicionar 5 unidades de uma edição com `availableSupply = 3`  
**THEN** o handler retorna `409 Conflict` com `{ code: "insufficient_stock" }`

**WHEN** usuário tenta adicionar 2 unidades de uma edição com `availableSupply = 5`  
**THEN** o handler adiciona o item ao carrinho com sucesso

---

### REQ-004: Merge de Items Duplicados
**Priority**: MUST  
**Type**: Functional

O handler MSW SHALL fazer merge de quantidades se o item (mesmo `nftId` + `editionId`) já existir no carrinho.

**Acceptance Criteria**:
- O handler SHALL verificar se existe item com mesmo `nftId` e `editionId` no carrinho
- Se existir, SHALL somar a quantidade solicitada à quantidade existente
- A quantidade final SHALL respeitar o limite `maxAvailable` (= `edition.availableSupply`)
- Se não existir, SHALL adicionar novo item ao array `cart.items`
- O campo `updatedAt` do carrinho SHALL ser atualizado

**WHEN** carrinho já tem 2 unidades de "nft-01/ed-01" e usuário adiciona 3 unidades  
**AND** `availableSupply = 10`  
**THEN** a quantidade final é 5 unidades

**WHEN** carrinho já tem 3 unidades de "nft-01/ed-01" e usuário adiciona 5 unidades  
**AND** `availableSupply = 6`  
**THEN** a quantidade final é 6 unidades (limitada ao máximo disponível)

---

### REQ-005: Suporte a Usuário Autenticado e Guest
**Priority**: MUST  
**Type**: Functional

O handler MSW SHALL suportar adicionar items ao carrinho tanto para usuários autenticados (identificados por `userId`) quanto para usuários guest (identificados por `sessionId`).

**Acceptance Criteria**:
- Se header `Authorization` estiver presente, SHALL extrair `userId` do token JWT
- Se `userId` existir, o carrinho SHALL ser associado ao `userId` (`cart.userId`)
- Se `userId` não existir mas `x-session-id` estiver presente, SHALL usar `sessionId` (`cart.sessionId`)
- Se nenhum identificador estiver presente, SHALL retornar `401 Unauthorized`
- Carrinho guest SHALL ser mesclado ao carrinho do usuário após login (implementado em `mergeGuestCart`)

**WHEN** usuário autenticado adiciona item  
**THEN** item é adicionado ao carrinho com `cart.userId = "user_alice"`

**WHEN** usuário guest adiciona item  
**THEN** item é adicionado ao carrinho com `cart.sessionId = "session_abc123"`

**WHEN** requisição não tem `Authorization` nem `x-session-id`  
**THEN** handler retorna `401 Unauthorized`

---

### REQ-006: Atualização Otimista do Cache
**Priority**: MUST  
**Type**: Functional

A mutation `useAddToCart()` SHALL aplicar atualização otimista no cache do TanStack Query antes da resposta do servidor.

**Acceptance Criteria**:
- O hook `onMutate` SHALL cancelar queries em andamento para evitar race conditions
- O hook `onMutate` SHALL fazer snapshot do estado atual do carrinho
- O hook `onMutate` SHALL atualizar o cache otimisticamente:
  - Se item já existe, SHALL incrementar a quantidade
  - Se item não existe, SHALL adicionar item temporário
- O hook `onError` SHALL restaurar o snapshot em caso de erro (rollback)
- O hook `onSuccess` SHALL invalidar queries de carrinho para buscar dados reais do servidor

**WHEN** usuário clica em "Adicionar ao carrinho"  
**THEN** o item aparece imediatamente no badge do carrinho (atualização otimista)

**WHEN** a requisição falha com erro de rede  
**THEN** o item é removido do badge (rollback) e toast de erro é exibido

---

### REQ-007: Feedback Visual e Toast
**Priority**: MUST  
**Type**: Functional

A mutation `useAddToCart()` SHALL exibir feedback visual claro para o usuário em todos os estados (loading, sucesso, erro).

**Acceptance Criteria**:
- Durante `isPending`, o botão SHALL exibir spinner ou texto "Adicionando..."
- Em `onSuccess`, SHALL exibir toast de sucesso com mensagem "Item adicionado ao carrinho"
- Em `onError`, SHALL exibir toast de erro com mensagem específica do erro (`ApiError.message`)
- Toasts SHALL ser acessíveis e anunciados para leitores de tela
- Toasts SHALL ser dismissíveis (botão de fechar)
- Toasts SHALL desaparecer automaticamente após 5 segundos

**WHEN** mutation é bem-sucedida  
**THEN** toast verde com mensagem "Item adicionado ao carrinho" é exibido

**WHEN** mutation falha com erro de estoque  
**THEN** toast vermelho com mensagem "Estoque insuficiente" é exibido

---

### REQ-008: Live Region para Acessibilidade
**Priority**: MUST  
**Type**: Accessibility

A mutation SHALL anunciar ações para leitores de tela através de live region (`aria-live="polite"`).

**Acceptance Criteria**:
- Um elemento com `aria-live="polite"` e `aria-atomic="true"` SHALL existir no componente
- O elemento SHALL ter classe `sr-only` (visível apenas para leitores de tela)
- Em `onSuccess`, SHALL anunciar "Item adicionado ao carrinho"
- Em `onError`, SHALL anunciar "Erro ao adicionar item ao carrinho"
- O anúncio SHALL ser limpo após 3 segundos para evitar poluição

**WHEN** item é adicionado com sucesso  
**THEN** leitor de tela anuncia "Item adicionado ao carrinho"

**WHEN** ocorre erro ao adicionar  
**THEN** leitor de tela anuncia "Erro ao adicionar item ao carrinho"

---

### REQ-009: Badge de Contador no Header
**Priority**: MUST  
**Type**: Functional

O header do shell SHALL exibir um badge de contador mostrando o número total de items no carrinho.

**Acceptance Criteria**:
- O badge SHALL usar `useQuery(cartItemCountQueryOptions)` para obter a contagem
- O contador SHALL ser calculado como soma de todas as quantidades (`sum(item.quantity)`)
- O badge SHALL ser visível apenas se contador > 0
- O badge SHALL ser atualizado automaticamente após invalidação do cache
- O badge SHALL ter `aria-label` descritivo (ex: "3 items no carrinho")
- O badge SHALL ser acessível via teclado se for clicável

**WHEN** carrinho está vazio  
**THEN** badge não é exibido

**WHEN** carrinho tem 3 items (qty: 2, 1, 5)  
**THEN** badge exibe "8"

**WHEN** usuário adiciona item ao carrinho  
**THEN** badge é atualizado automaticamente (ex: de "8" para "9")

---

### REQ-010: Isolamento de Cache por Usuário
**Priority**: MUST  
**Type**: Functional

O cache do TanStack Query SHALL isolar dados de carrinho por usuário, usando `userId` como parte da query key.

**Acceptance Criteria**:
- Query key SHALL incluir `userId` para usuários autenticados: `['cart', 'list', userId]`
- Query key SHALL incluir `'guest'` para usuários guest: `['cart', 'list', 'guest']`
- Logout SHALL limpar cache de carrinho privado do usuário anterior
- Login SHALL invalidar cache de carrinho guest (após merge com carrinho do usuário)
- Troca de usuário SHALL limpar cache do usuário anterior

**WHEN** Alice está logada e Bob faz login no mesmo navegador  
**THEN** o cache de Alice é limpo e não vaza para Bob

**WHEN** usuário guest faz login  
**THEN** carrinho guest é mesclado ao carrinho do usuário e cache é invalidado

---

### REQ-011: Valores Monetários em String Decimal
**Priority**: MUST  
**Type**: Technical

Todos os valores monetários (preço unitário, subtotal) SHALL ser manipulados como strings decimais, nunca como `number`.

**Acceptance Criteria**:
- Campo `unitPrice` em `CartItem` SHALL ser string (ex: "0.025")
- Cálculo de subtotal (`unitPrice * quantity`) SHALL usar `@nft/shared-money`
- Nenhuma operação aritmética nativa (`*`, `+`, `-`) SHALL ser usada em valores ETH
- Formato de exibição SHALL usar `formatEth()` de `@nft/shared-money`

**WHEN** item tem `unitPrice = "0.025"` e `quantity = 3`  
**THEN** subtotal é calculado como `"0.075"` usando `multiply(unitPrice, quantity)`

---

### REQ-012: Cenários de Erro Determinísticos
**Priority**: MUST  
**Type**: Testing

Os handlers MSW SHALL suportar cenários de erro determinísticos e reproduzíveis para testes.

**Acceptance Criteria**:
- Cenário de estoque insuficiente com edição esgotada (`availableSupply = 0`)
- Cenário de NFT não encontrado (`nftId` inválido)
- Cenário de edição não encontrada (`editionId` inválido)
- Cenário de validação de entrada (quantidade negativa, campos faltando)
- Cenário de sessão expirada (`401 Unauthorized`)
- Cenário de timeout de rede (latência configurável)

**WHEN** teste configura `edition.availableSupply = 0`  
**THEN** adicionar item retorna `409 Conflict`

**WHEN** teste envia `quantity = -1`  
**THEN** handler retorna `400 Bad Request` com detalhes de validação

---

## Dependencies

### Internal Dependencies
- `@nft/shared-contracts` — schemas de validação (`AddToCartInputSchema`, `CartSchema`)
- `@nft/shared-money` — cálculos monetários em string decimal
- `@nft/shared-query` — query key factories
- `@nft/shared-http` — cliente Axios
- `@nft/shared-ui` — componentes base (Toast, Badge, Button)
- `@nft/shell-kit` — `useShell`, `useSession`, `useToast`
- `@nft/catalog-feature` — PDP onde o botão está localizado
- `@nft/mocks-core` — estado do banco de dados mock
- `@nft/mocks-handlers` — handlers MSW

### External Dependencies
- `@tanstack/react-query` — gerenciamento de cache e mutations
- `msw` — simulação de backend
- `zod` — validação de schemas
- `react-hook-form` — se houver formulário de quantidade

---

## Versioning and Compatibility

- **Version**: 1.0.0
- **Introduced In**: Change `add-to-cart-from-pdp`
- **Breaking Changes**: None (nova funcionalidade)

---

## Metrics and Monitoring

### Success Metrics
- Taxa de sucesso de adicionar ao carrinho: >99%
- Tempo de resposta médio de `POST /api/cart/items`: <200ms (MSW simulado)
- Taxa de erro de validação: <1% (indicando boa UX no PDP)

### Error Metrics
- Contagem de erros `409 insufficient_stock` (indica problemas de disponibilidade)
- Contagem de erros `401 unauthorized` (indica problemas de sessão)
- Contagem de rollbacks de atualização otimista (indica problemas de rede)

---

## References

- [RFC 2119: Key words for use in RFCs](https://www.ietf.org/rfc/rfc2119.txt)
- [TanStack Query: Optimistic Updates](https://tanstack.com/query/latest/docs/react/guides/optimistic-updates)
- [WCAG 2.1: Live Regions](https://www.w3.org/WAI/WCAG21/Understanding/status-messages.html)
- [`openspec/project.md`](../../../project.md) — Regras transversais do projeto
- [`ARCHITECTURE.md`](../../../../ARCHITECTURE.md) — Decisões de arquitetura
