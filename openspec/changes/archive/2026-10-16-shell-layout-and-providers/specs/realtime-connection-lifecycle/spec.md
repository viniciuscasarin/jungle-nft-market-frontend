# Spec Delta

## Purpose

Define o ciclo de vida inteligente da conexão Socket.IO gerenciado por contagem de inscrições ativas e sincronizado com a autenticação do usuário.

## ADDED Requirements

### Requirement: Subscription Reference Counting Realtime Client
O cliente `RealtimeClient` encapsulado em `@nft/shared-realtime` SHALL gerenciar internamente o ciclo de vida da conexão do socket com base na contagem de subscriptions ativas e na presença de sessão autenticada. Sem subscriptions ativas, a conexão de socket SHALL permanecer fechada (`disconnected`), prevenindo conexões desnecessárias e erros de console.

#### Scenario: Aplicação inicia sem subscriptions ativas
- **WHEN** o host shell e os remotes inicializam sem nenhuma chamada a `subscribe()`
- **THEN** nenhuma conexão Socket.IO é aberta contra o servidor e nenhum log de erro de rede é emitido no console.

#### Scenario: Primeira subscription ativa a conexão
- **WHEN** o primeiro componente consumidor invoca `subscribe(event, handler)` na presença de uma sessão autenticada
- **THEN** o `RealtimeClient` inicia a conexão do socket automaticamente e registra o handler.

#### Scenario: Desconexão automática ao zerar subscriptions
- **WHEN** todos os componentes consumidores cancelam suas assinaturas (cleanup no unmount) e a contagem de subscriptions ativas chega a zero
- **THEN** o `RealtimeClient` encerra a conexão de transporte do socket imediatamente.

#### Scenario: Desconexão imediata no logout
- **WHEN** o usuário realiza logout ou a sessão expira
- **THEN** o `SessionController` invoca `disconnect()` forçado no `RealtimeClient`, limpando listeners e cancelando tentativas de reconexão.
