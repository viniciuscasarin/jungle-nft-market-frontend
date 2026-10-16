# Design

## Context

A arquitetura de tempo real conecta duas pontas dentro do navegador (e em testes Node/Playwright):
1. **Servidor Simulado (`@nft/mocks-core` + `@nft/mocks-socket`)**: O estado do marketplace vive em `MockDatabaseState` (`libs/mocks/core/src/database.ts`), com versionamento monotônico (`bumpVersion`) e um barramento interno (`MockEventBus`). O pacote `@mswjs/socket.io-binding` (`v0.2.0`) converte conexões interceptadas pelo `ws.link(...)` do MSW em instâncias `toSocketIo(connection)` compatíveis com o protocolo Engine.IO v4 / Socket.IO v4 sobre WebSocket.
2. **Cliente (`@nft/shared-realtime` + `@nft/shell-kit` + `apps/shell`)**: O singleton `realtimeClient` encapsula `socket.io-client` (`v4.8.1`). O host Shell possui instâncias únicas de `QueryClient` (`@nft/shared-query`) e `feedback` (`GlobalLiveRegions` + `ShellToastProvider`).

Consulte `proposal.md` para a motivação e a estratégia de prazo crítico (P0 vs P1).

## Goals / Non-Goals

**Goals:**
- Garantir que 100% dos eventos `nft.updated` e `order.updated` trafeguem de ponta a ponta pelo `socket.io-client` + `@mswjs/socket.io-binding`.
- Assegurar consistência estrita entre REST e WebSocket: toda mutação em `mocks/core` incrementa `version` na entidade e no banco antes de emitir o evento no socket.
- Aplicar no cliente deduplicação por `id`, descarte monotônico por `version <= lastAppliedVersion` por recurso (`nft:<id>`, `order:<id>`) e isolamento estrito por `userId`.
- Reconciliar o cache do TanStack Query de forma rápida, segura e sem regressão usando `queryClient.invalidateQueries` nas chaves afetadas e no `onReconnect`.
- Expor gatilhos determinísticos em `window.__mocks` para testes E2E e validação manual.

**Non-Goals:**
- Patch cirúrgico manual (`queryClient.setQueryData`) em múltiplas páginas cacheadas do catálogo (registrado como Débito Técnico P1 em `ARCHITECTURE.md` §17).
- Construção das páginas de Carrinho, Pagamento e Confirmação (escopo das próximas changes).
- Suporte a HTTP long-polling no Socket.IO (o `@mswjs/socket.io-binding` opera exclusivamente sobre WebSocket).

## Decisions

### 1. Interceptor WebSocket Universal (`ws.link(/\/socket\.io\//)`) e Transporte `['websocket']`
- **Decisão**: Em `libs/mocks/socket`, usar `ws.link(/\/socket\.io\//)` em vez de `ws.link('wss://*')`, e em `libs/shared/realtime`, configurar `transports: ['websocket']`.
- **Motivo**: Em ambiente local (`http://localhost:4200`), preview e Playwright, o navegador abre `ws://localhost:4200/socket.io/?EIO=4&transport=websocket` (sem TLS). Um filtro `wss://*` ignora conexões `ws://`. Além disso, `@mswjs/socket.io-binding` intercepta apenas frames WebSocket e não requisições HTTP de long-polling.
- **Alternativas consideradas**: Configurar certificado HTTPS local em todos os 4 apps Vite (descartado por complexidade desnecessária no CI e E2E).

### 2. Conexão Sob Demanda Independente de Autenticação para Eventos Públicos
- **Decisão**: Permitir que `realtimeClient.subscribe(...)` conecte o socket sempre que `subscriptionCount > 0`, mesmo quando `currentToken` for `null` (visitante), mantendo o filtro de `userId` na camada de recepção do evento.
- **Motivo**: `nft.updated` é um evento público que afeta visitantes navegando no Catálogo, na PDP ou no Carrinho anônimo. Já eventos privados (`order.updated` ou qualquer envelope com `userId`) exigem que haja um `userId` autenticado idêntico ao `event.userId`. Quando o token de autenticação muda (`setAuthToken`), o cliente atualiza `socket.auth` e limpa o estado privado se o usuário mudou ou deslogou.

### 3. Invalidação Direcionada (`invalidateQueries`) vs Patch Manual In-Place (`setQueryData`) [P0 vs P1]
- **Decisão**: No P0, após o evento passar pelas guardas de schema, `isDuplicate(event.id)`, `isStale(event.version, currentVersion)` e `userId`, o sincronizador atualiza o mapa de `version` do recurso e executa `queryClient.invalidateQueries` nas famílias de chaves afetadas (`catalog`, `cart`, `quote`, `orders`). O patch cirúrgico in-place de listas paginadas fica registrado como Débito Técnico P1 em `ARCHITECTURE.md` §13 e §17.
- **Motivo**: Como o servidor simulado atualiza o banco em memória na mesma transação antes de emitir o evento, `invalidateQueries` dispara o refetch imediato das queries ativas e garante 100% de consistência com os filtros, ordenação e cotação calculada pela API, com zero risco de dessincronia ou cálculo financeiro no cliente.

### 4. Normalização Tolerante do Envelope com Fonte Única em `@nft/shared-contracts`
- **Decisão**: Manter `RealtimeEnvelopeSchema` (`{ id, type, resource: 'nft' | 'order', resourceId, version, timestamp, userId?, payload }`) como contrato canônico e incluir um pré-normalizador que também aceita `{ resource: { kind, id }, occurredAt }` convertendo para `{ resource: kind, resourceId: id, timestamp: occurredAt }`.
- **Motivo**: Preserva 100% de compatibilidade com os contratos já testados na Etapa 4 (`libs/shared/contracts/src/realtime.ts` e `docs/contracts.md`) e ao mesmo tempo aceita payloads no formato `{ resource: { kind, id }, occurredAt }` descrito no prompt da Etapa 12.

### 5. Sincronizador Centralizado no Host (`useRealtimeSync` / `RealtimeSync`)
- **Decisão**: Criar um componente/hook `RealtimeSync` em `@nft/shell-kit` montado uma única vez em `apps/shell`, consumindo `useShell()` (`realtimeClient`, `queryClient`, `feedback`, `session`).
- **Motivo**: Evita que múltiplos remotes registrem listeners duplicados para o mesmo evento global, garantindo que cada `nft.updated` ou `order.updated` válido dispare exatamente uma invalidação e um único anúncio acessível (`feedback.notify`).

## Risks / Trade-offs

- **[Risk] Pacotes de handshake do `@mswjs/socket.io-binding` em reconexões simuladas** -> **Mitigação**: Expor um método explícito de simulação de queda/reconexão no `mocks/socket` e no `realtimeClient` (`notifyReconnect` / fechamento e reabertura da conexão WebSocket simulada) que exercita os listeners de `connect` / `reconnect` do `socket.io-client` e aciona o callback `onReconnect`.
- **[Risk] Importação dinâmica de `@nft/mocks-socket` em `libs/shell-kit` bloqueada pelo ESLint** -> **Mitigação**: Adicionar `@nft/mocks-socket` em `checkDynamicDependenciesExceptions` no `eslint.config.js` (junto a `@nft/mocks-core` e `@nft/mocks-handlers`), mantendo tree-shaking total quando `VITE_ENABLE_MOCKS=false`.
- **[Trade-off P1] Refetch via `invalidateQueries` em vez de patch otimista de cache** -> **Mitigação**: No ambiente MSW local a resolução é imediata e garante que totais de cotação e facetas nunca sejam recalculados na UI (respeitando a regra inviolável #4). Documentado em `ARCHITECTURE.md` §13 e §17.
