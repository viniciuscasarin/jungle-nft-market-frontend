# Spec Delta

## Purpose

Define o canal de comunicação em tempo real via `socket.io-client` (`@nft/shared-realtime`) conectado ao servidor simulado `@mswjs/socket.io-binding`, incluindo deduplicação por `id`, descarte de eventos antigos por `version` monotônica, isolamento estrito por `userId`, reconciliação do cache TanStack Query na recepção de `nft.updated` / `order.updated` e na reconexão (`onReconnect`), e anúncios acessíveis em live region e toast.

## ADDED Requirements

### Requirement: End-to-End Socket.IO Transport Over MSW Binding
O módulo `@nft/shared-realtime` SHALL conectar instâncias reais do `socket.io-client` ao interceptor WebSocket `@mswjs/socket.io-binding` em `@nft/mocks-socket` utilizando transporte WebSocket (`transports: ['websocket']`), mantendo estados observáveis de conexão (`connecting`, `connected`, `reconnecting`, `disconnected`) e proibindo qualquer atualização artificial de estado por setters locais ou `queryClient.setQueryData` direto sem passagem pelo WebSocket.

#### Scenario: Conexão WebSocket e recepção real pelo socket.io-client
- **WHEN** um consumidor registra uma subscription para `nft.updated` ou `order.updated` via `realtimeClient.subscribe` (com ou sem sessão autenticada) e o servidor simulado emite um evento
- **THEN** o evento trafega pelo WebSocket interceptado pelo `@mswjs/socket.io-binding`, o estado do cliente permanece `'connected'` e o callback do `socket.io-client` recebe o envelope validado.

#### Scenario: Limpeza de listeners no unmount e no logout
- **WHEN** o componente consumidor é desmontado ou o usuário realiza logout (`realtimeClient.disconnect()`)
- **THEN** os listeners registrados são removidos do socket e a conexão é encerrada quando não restam subscriptions ativas.

---

### Requirement: Deduplication, Monotonic Versioning, and User Isolation
O processador de eventos em `@nft/shared-realtime` SHALL validar todo evento recebido contra o contrato de envelope de tempo real (suportando normalização de `{ resource: { kind, id }, occurredAt }` para `{ resource, resourceId, timestamp }`), deduplicar por `event.id` (`isDuplicate`), descartar eventos com `version` menor ou igual à última versão aplicada para o mesmo recurso (`isStale`) e ignorar eventos privados cujo `userId` divirja do usuário autenticado na sessão ativa.

#### Scenario: Descarte de evento duplicado ou com versão antiga
- **WHEN** o mesmo evento (mesmo `id`) chega duas vezes ou chega um evento atrasado com `version` menor ou igual à última aplicada para o mesmo `{ resource, resourceId }`
- **THEN** o cliente descarta o evento silenciosamente, sem invalidar o cache novamente, sem regredir o estado e sem duplicar avisos na live region ou toast.

#### Scenario: Isolamento de eventos privados por userId
- **WHEN** um evento privado (`order.updated` ou envelope contendo `userId`) chega com `userId` diferente do usuário autenticado (ou enquanto o cliente está como visitante não autenticado)
- **THEN** o cliente ignora o evento sem atualizar o cache e sem exibir notificações para o usuário atual.

---

### Requirement: Domain Cache Reconciliation and Accessible Feedback for Realtime Events
O sincronizador de tempo real do Shell SHALL escutar `nft.updated` e `order.updated` através do `realtimeClient`, invalidar as queries afetadas no `QueryClient` (`catalog`, `detail`, `cart`, `quote`, `orders`) e emitir anúncio acessível via `feedback.notify` (Toast visual e live region `polite`).

#### Scenario: Atualização de preço ou disponibilidade via nft.updated
- **WHEN** o servidor simulado emite `nft.updated` alterando o preço ou a disponibilidade de uma edição de NFT (com `version` superior à atual)
- **THEN** o `socket.io-client` recebe o evento, invalida as queries de catálogo, detalhe do NFT, carrinho e cotação no TanStack Query e anuncia a mudança de preço ou disponibilidade na live region `polite` e em toast.

#### Scenario: Atualização de status de pedido via order.updated
- **WHEN** o servidor simulado emite `order.updated` para o `userId` autenticado alterando o pedido de `pending` para `confirmed` ou `rejected`
- **THEN** o `socket.io-client` recebe o evento, invalida a query do pedido (e do carrinho caso `confirmed`) e anuncia a mudança de estado em live region e toast.

---

### Requirement: Active Resource Reconciliation on Socket Reconnect
O `RealtimeClient` e o sincronizador do Shell SHALL detectar a reconexão do socket (`onReconnect`) após uma queda de conexão e invalidar as queries ativas no `QueryClient` para reconciliar o estado exibido com a API REST.

#### Scenario: Reconciliação com REST após queda e reconexão do socket
- **WHEN** a conexão do socket cai e reconecta posteriormente (`onReconnect`)
- **THEN** o sincronizador invalida as queries ativas (catálogo, detalhe, carrinho, cotação e pedidos), reconciliando os recursos visíveis com os dados mais recentes da API REST e atualizando a tabela de versões conhecidas.
