# Tasks

## 1. [P0] Servidor Socket.IO Simulado e Gatilhos Determinísticos (`libs/mocks/core`, `libs/mocks/socket`, `libs/shell-kit`)

- [x] 1.1 Em `libs/mocks/core`, implementar helpers determinísticos de mutação e emissão (`emitNftUpdated`, `emitOrderUpdated`, `emitDuplicateEvent`, `emitStaleEvent`) que atualizam o `MockDatabaseState` via `transaction()` + `bumpVersion()`, publicam o envelope `RealtimeEnvelope` no `MockEventBus` e expõem esses gatilhos em `MockControls` (`window.__mocks` / `window.__NFT_MOCK_CONTROL__`), verificando com testes unitários em `libs/mocks/core` (`pnpm nx test mocks-core`)
- [x] 1.2 Em `libs/mocks/socket`, atualizar `socketInterceptor` (`ws.link(/\/socket\.io\//)`) com `@mswjs/socket.io-binding` (`toSocketIo`) para retransmitir eventos do `MockEventBus` aos clientes conectados e suportar simulação de desconexão/reconexão, verificando com testes em `libs/mocks/socket/src/index.spec.ts` (`pnpm nx test mocks-socket`)
- [x] 1.3 Integrar o handler WebSocket de `@nft/mocks-socket` no bootstrap `startMocks()` (`libs/shell-kit/src/mocks.ts`), em `createMockServer()` (`libs/mocks/core/src/server.ts`) e nas exceções de dynamic import de `eslint.config.js`, verificando com `pnpm nx test shell-kit` e `pnpm lint`

## 2. [P0] Cliente Socket.IO, Deduplicação, Versionamento, Isolamento e Reconexão (`libs/shared/realtime`)

- [x] 2.1 Atualizar `createRealtimeClient` em `libs/shared/realtime` com transporte `['websocket']`, máquina de estados de conexão (`connecting`, `connected`, `reconnecting`, `disconnected`), conexão sob demanda para subscriptions ativas (incluindo visitantes para `nft.updated`), normalização tolerante do envelope (`RealtimeEnvelopeSchema`), deduplicação por `event.id` (`isDuplicate`), descarte de versão antiga por recurso (`isStale`), isolamento por `userId`, callback `onReconnect` e limpeza no unmount/logout, verificando com suíte completa Vitest em `libs/shared/realtime/src/index.spec.ts` (`pnpm nx test shared-realtime`)

## 3. [P0] Sincronização com TanStack Query, Feedback Acessível e Documentação (`libs/shared/query`, `libs/shell-kit`, `apps/shell`)

- [x] 3.1 Expandir `queryKeys` em `libs/shared/query` (`catalog`, `cart`, `quote`, `orders`) e implementar o sincronizador global `RealtimeSync` / `useRealtimeSync` em `libs/shell-kit` montado em `apps/shell` para invalidar as queries afetadas em `nft.updated`, `order.updated` e `onReconnect` e anunciar mudanças de preço/disponibilidade/status via `feedback.notify` (Toast + Live Region `polite`), verificando com testes unitários em `libs/shell-kit` e `apps/shell` (`pnpm nx test shell-kit` e `pnpm nx test shell`)
- [ ] 3.2 Adicionar ações rápidas de disparo de `nft.updated`, `order.updated` e reconexão no `MocksDevPanel` (`apps/shell/src/components/mocks-dev-panel.tsx`) e documentar o transporte `@mswjs/socket.io-binding`, suas limitações e os Débitos Técnicos P1 assumidos em `ARCHITECTURE.md` (§11, §13 e §17), `docs/mocks.md` e `README.md`, verificando com `pnpm nx test shell`

## 4. [P0] Teste E2E de Tempo Real e Validação Final (`apps/web-e2e`)

- [ ] 4.1 Criar teste E2E enxuto em `apps/web-e2e/src/realtime-socketio.spec.ts` validando recepção real via `socket.io-client` de `nft.updated` (atualização de dados e anúncio em live region), descarte de evento duplicado (`id`) e de versão obsoleta (`version`), isolamento de `userId` diferente da sessão ativa e reconciliação via REST após reconexão (`pnpm nx e2e web-e2e --grep "realtime"`)
- [ ] 4.2 Executar `typecheck`, `lint`, `test` e `build` nos projetos afetados (`pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm build`)

## P1 — Débito Técnico Mapeado (Referência documentada em `ARCHITECTURE.md` §13 e §17)

- **Atualização cirúrgica de cache in-place (`queryClient.setQueryData` em listas paginadas)**: Substituída no P0 por `queryClient.invalidateQueries` direcionado após validação de `id` e `version` em `@nft/shared-realtime`, garantindo 100% de consistência com os cálculos e filtros do servidor REST sem lógica manual complexa de patch no cliente.
- **Painel visual avançado de construção de payloads de eventos**: Substituído no P0 pelos helpers programáticos determinísticos em `window.__mocks` (`window.__NFT_MOCK_CONTROL__`) e pelos botões de ação rápida no `MocksDevPanel` (`Ctrl+Alt+M`).
- **Broadcast de eventos WebSocket entre múltiplas abas e transporte HTTP long-polling**: Limitado ao processo do Service Worker / aba ativa e ao transporte `'websocket'` suportado pelo `@mswjs/socket.io-binding`.
