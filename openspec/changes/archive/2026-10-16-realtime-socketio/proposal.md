# Proposal

## Why

O marketplace exige comunicação em tempo real real e determinística ponta a ponta para propagar alterações de preço e disponibilidade de edições (`nft.updated`) e mudanças de status de pedidos (`order.updated`), sendo critério eliminatório trafegar eventos reais pelo `socket.io-client` interceptado pelo `@mswjs/socket.io-binding` (nunca chamando setters, callbacks locais ou `queryClient.setQueryData` diretamente a partir de controles de UI). Como estamos próximos do prazo crítico, esta change prioriza fazer o caminho feliz e todos os requisitos eliminatórios funcionarem de imediato (P0) usando invalidação direcionada no TanStack Query (`invalidateQueries`) combinada ao filtro de deduplicação (`id`), versão monotônica (`version`) e isolamento por `userId`, documentando sofisticações secundárias como Débito Técnico (P1) em `ARCHITECTURE.md` §13 e §17.

## What Changes

- **P0 — Servidor Socket.IO Simulado (`@nft/mocks-socket` e `@nft/mocks-core`)**:
  - Atualiza `socketInterceptor` em `libs/mocks/socket` para interceptar conexões WebSocket (`ws://` e `wss://`) no endpoint `/socket.io/` usando `@mswjs/socket.io-binding` (`toSocketIo`), conectando os clientes ativos ao `MockEventBus` de `@nft/mocks-core`.
  - Registra o handler WebSocket no bootstrap do MSW no navegador (`startMocks` em `libs/shell-kit`) e no servidor de testes Node (`createMockServer` em `libs/mocks/core`).
  - Adiciona helpers determinísticos em `@nft/mocks-core` e `window.__mocks` para mutar NFTs (preço/estoque) e pedidos (`pending` -> `confirmed` | `rejected`) em transação atômica (`bumpVersion`), persistindo no banco em memória (para que o REST reflita exatamente o mesmo estado) e emitindo `nft.updated` e `order.updated` pelo socket no envelope padronizado.
  - Exponibiliza gatilhos determinísticos em `window.__mocks` para E2E: alteração de preço/estoque (`nft.updated`), atualização de pedido (`order.updated`), reenvio de evento duplicado (mesmo `id`), envio de evento obsoleto (`version` menor ou igual à atual) e simulação de queda/reconexão do socket.
- **P0 — Cliente Socket.IO, Deduplicação, Versionamento, Isolamento e Reconexão (`@nft/shared-realtime`)**:
  - Configura `createRealtimeClient` com transporte WebSocket compatível com `@mswjs/socket.io-binding` (`transports: ['websocket']`), mantendo estados explícitos de conexão (`connecting`, `connected`, `reconnecting`, `disconnected`) e suporte a recepção de eventos públicos (`nft.updated`) mesmo para visitantes não autenticados quando houver subscription ativa.
  - Implementa pipeline de filtragem e recepção de envelopes (`RealtimeEnvelopeSchema`) em `@nft/shared-realtime`:
    1. Deduplicação por `event.id` (`isDuplicate`), descartando eventos já processados.
    2. Controle de versão monotônica por recurso (`nft:<id>`, `order:<id>`) via `isStale(incomingVersion, currentVersion)`, impedindo regressão de estado e reaplicação de efeitos colaterais (avisos duplicados).
    3. Isolamento por `userId`: eventos privados (`order.updated` ou qualquer envelope com `userId`) são descartados se não houver sessão ativa ou se `event.userId !== activeUserId`.
    4. Reconexão (`onReconnect`) e limpeza completa de listeners/estado privado no `disconnect()` e no logout.
- **P0 — Integração com TanStack Query e Feedback Acessível (`@nft/shell-kit` e `apps/shell`)**:
  - Registra sincronizador global de eventos em tempo real no Shell (`RealtimeSync` / `useRealtimeSync`) que escuta `nft.updated` e `order.updated` via `realtimeClient`:
    - `nft.updated`: invalida queries afetadas de catálogo, detalhe de NFT, carrinho e cotação (`queryClient.invalidateQueries`) e emite aviso acessível (`feedback.notify` com Toast e anúncio em live region `polite`).
    - `order.updated`: invalida queries do pedido do `userId` autenticado (e carrinho quando `confirmed`) e emite aviso acessível.
    - `onReconnect`: invalida as queries ativas no `QueryClient` para reconciliar imediatamente catálogo, detalhe, carrinho, cotação e pedidos pendentes com a fonte da verdade REST.
- **P1 — Escopo Registrado como Débito Técnico (Documentado em `ARCHITECTURE.md` §13 e §17)**:
  - **Atualização cirúrgica de cache in-place (`setQueryData` em listas paginadas)**: em vez de aplicar patches manuais complexos em páginas cacheadas do catálogo e recalcular estados derivados no cliente, o P0 utiliza `queryClient.invalidateQueries` após validar `id` e `version`, garantindo 100% de consistência com o estado REST.
  - **Painel visual elaborado de construção de eventos Socket.IO**: em vez de criar uma UI dedicada de dev-tools para edição livre de JSON de eventos, o P0 expõe métodos diretos em `window.__mocks` e ações rápidas enxutas no `MocksDevPanel` existente (`Ctrl+Alt+M`).

## Capabilities

### New Capabilities
- `realtime-events`: Comunicação em tempo real ponta a ponta via `socket.io-client` e `@mswjs/socket.io-binding`, cobrindo recepção dos eventos `nft.updated` e `order.updated`, deduplicação por `id`, ordenação monotônica por `version`, isolamento estrito por `userId`, reconciliação do cache TanStack Query (no evento e na reconexão) e anúncios acessíveis em live region/toast.

### Modified Capabilities
- `mock-infrastructure`: Registro do interceptor WebSocket `@mswjs/socket.io-binding` no bootstrap do MSW e adição de gatilhos determinísticos em `@nft/mocks-core` (`window.__mocks`) para mutar recursos e emitir `nft.updated`, `order.updated`, eventos duplicados, eventos obsoletos e reconexão.

## Impact

- **Apps e Libs Nx afetados (e suas tags)**:
  - `libs/mocks/core` (`scope:mocks`, `type:mocks`, `flow:shared`): helpers de mutação + emissão no `MockEventBus` e gatilhos determinísticos em `MockControls` (`window.__mocks`).
  - `libs/mocks/socket` (`scope:mocks`, `type:mocks`, `flow:shared`): handler WebSocket MSW com `@mswjs/socket.io-binding` conectado ao `MockEventBus` e controle de desconexão/reconexão simulada.
  - `libs/shared/realtime` (`scope:shared`, `type:util`, `flow:shared`): cliente `socket.io-client` com estados de conexão, deduplicação por `id`, guarda de `version` monotônica por recurso, filtro de `userId` e callback de reconexão.
  - `libs/shared/query` (`scope:shared`, `type:util`, `flow:shared`): fábrica de query keys padronizadas (`catalog`, `cart`, `quote`, `orders`) e helpers de invalidação por recurso/reconexão.
  - `libs/shell-kit` (`scope:shell`, `type:util`, `flow:shared`): integração do handler de socket no `startMocks()` e hook/componente de sincronização `RealtimeSync` consumindo `useShell()`.
  - `apps/shell` (`scope:shell`, `type:app`, `flow:shell`): montagem do sincronizador de tempo real no host e botões rápidos opcionais no `MocksDevPanel`.
  - `apps/web-e2e` (`scope:e2e`, `type:e2e`, `flow:shared`): teste E2E enxuto validando `nft.updated`, `order.updated`, descarte de duplicata/versão antiga, isolamento de `userId` e reconciliação pós-reconexão via `socket.io-client`.
- **Fora de escopo**:
  - Construção das telas completas de Carrinho, Pagamento e Confirmação (Etapas posteriores) — a reconciliação de cache e os anúncios acessíveis já deixam as chaves de query e eventos prontos para essas telas.
  - Patch manual in-place (`setQueryData`) em listas paginadas e painel visual avançado de edição de eventos (registrados como Débito Técnico P1 em `ARCHITECTURE.md` §13 e §17).
- **Premissas (registradas também em `ARCHITECTURE.md`)**:
  - O envelope canônico de eventos segue `RealtimeEnvelopeSchema` de `@nft/shared-contracts`, aceitando normalização compatível caso um emissor de teste informe `resource: { kind, id }` ou `occurredAt`.
  - No ambiente simulado com `@mswjs/socket.io-binding`, o transporte ativo do `socket.io-client` é exclusivamente `'websocket'` (sem HTTP long-polling).
  - A conexão WebSocket abre sob demanda quando há ao menos uma subscription ativa (incluindo visitantes para receber `nft.updated`), enquanto eventos privados (`order.updated`) exigem `userId` idêntico ao usuário autenticado na sessão ativa.
