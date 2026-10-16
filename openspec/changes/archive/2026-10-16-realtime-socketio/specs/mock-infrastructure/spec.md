# Spec Delta

## ADDED Requirements

### Requirement: Simulated Socket.IO Server Binding and Deterministic Event Triggers
O módulo `@nft/mocks-socket` e o núcleo `@nft/mocks-core` SHALL integrar `@mswjs/socket.io-binding` ao ciclo de vida do MSW (`startMocks` no navegador e `createMockServer` em Node/Vitest) e expor gatilhos determinísticos em `window.__mocks` para mutar recursos no banco em memória (incrementando `version` monotonicamente) e emitir eventos pelo canal Socket.IO (`nft.updated`, `order.updated`, evento duplicado, evento com versão obsoleta e desconexão/reconexão simulada).

#### Scenario: Mutação no banco em memória reflete no REST e emite evento no Socket.IO
- **WHEN** um gatilho do mock ou handler altera o preço/disponibilidade de um NFT ou o status de um pedido no `@nft/mocks-core`
- **THEN** o banco em memória persiste a mutação com `version` incrementada (visível imediatamente nos handlers REST) e o `@nft/mocks-socket` emite o envelope correspondente (`nft.updated` ou `order.updated`) para os clientes `socket.io-client` conectados.

#### Scenario: Disparo determinístico de duplicata, versão antiga e reconexão para E2E
- **WHEN** um teste aciona os helpers de controle do mock (`window.__mocks`) para reenviar o mesmo `event.id`, enviar um `version` inferior ao atual ou simular reconexão do socket
- **THEN** o servidor Socket.IO simulado transmite os pacotes correspondentes pelo WebSocket interceptado pelo MSW de forma determinística e reproduzível.
