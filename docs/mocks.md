# Documentação da Infraestrutura de Mocks e Cenários

Esta documentação detalha a arquitetura, o ciclo de vida, os utilitários de desenvolvimento e o mapeamento dos cenários de teste da infraestrutura de backend simulado do Jungle NFT Marketplace.

---

## 1. Arquitetura e Ciclo de Vida

O marketplace opera com backend 100% simulado baseado no **Mock Service Worker (MSW)**. A arquitetura obedece às regras invioláveis do repositório:
- **Isolamento na camada de rede**: Componentes React, hooks, módulos `data-access` e o cliente Axios nunca contêm dados fictícios, flags de mock ou desvios de regra de negócio. Todo dado falso vive em `libs/mocks/*`.
- **Exclusão de produção**: Quando `VITE_ENABLE_MOCKS=false`, o MSW é removido do bundle de produção do shell via dynamic import condicional, resultando em 0 bytes de código de mocks ou de worker enviados aos usuários finais.
- **Transparência de protocolos**: As chamadas REST e endpoints são interceptados nos Service Workers do navegador ou via `setupServer` do Node no Vitest.

```
┌────────────────────────────────────────────────────────┐
│                        Aplicação                       │
│  (React UI / TanStack Query / Axios HttpClient)        │
└───────────────────────────┬────────────────────────────┘
                            │ Requisições HTTP (/api/*)
                            ▼
┌────────────────────────────────────────────────────────┐
│                 MSW Service Worker                     │
│  ┌──────────────────────────────────────────────────┐  │
│  │           Universal Network Pipeline             │  │
│  │  - Phase 'before': Injeção de latência / falhas  │  │
│  │  - Domain Handlers: parseBody, requireSession    │  │
│  │  - Phase 'after': Timeout pós-mutação            │  │
│  └──────────────────────────┬───────────────────────┘  │
└─────────────────────────────┼──────────────────────────┘
                              │
                              ▼
┌────────────────────────────────────────────────────────┐
│                 In-Memory Mock Database                │
│  - Coleções tipadas (@nft/shared-contracts)            │
│  - Transações atômicas com rollback em exceção         │
│  - Versionamento monotônico incremental                │
│  - Persistência com StorageAdapter (Local / Memory)    │
│  - Determinismo estrito via Mulberry32 PRNG e Clock    │
└────────────────────────────────────────────────────────┘
```

---

## 2. In-Memory Database, Transações e Persistência

### 2.1 Banco em Memória Reativo
O estado central reside em `@nft/mocks-core` e contém coleções estritamente tipadas pelos contratos Zod de `@nft/shared-contracts`:
- `users`: Usuários registrados com senhas armazenadas exclusivamente na forma de `passwordHash` e `passwordSalt` gerados via PBKDF2/SHA-256.
- `sessions`: Sessões ativas indexadas por token com data de expiração ISO.
- `nfts`: Catálogo de NFTs contendo edições, preço decimal ETH, criador e estatísticas de avaliação.
- `reviews`: Avaliações públicas de colecionadores com ratings inteiros de 1 a 5.
- `favorites`: Lista de favoritos por usuário.
- `carts`: Carrinhos de compras com suporte a itens por edição e código de cupom.
- `coupons`: Cupons de desconto (percentuais, fixos em ETH, expirados e inativos).
- `orders`: Pedidos de compra com chave de idempotência e status (`pending`, `confirmed`, `rejected`).
- `wallets`: Carteiras primárias e secundárias por usuário.

### 2.2 Transações Atômicas
Toda escrita de múltiplos passos ou sensível a falhas é executada através de `transaction(fn)`:
- Antes da execução de `fn`, um clone estruturado (`structuredClone`) do estado é capturado como snapshot.
- Se `fn` concluir com sucesso, as alterações são comitadas, a versão do banco é incrementada e o estado é persistido.
- Se `fn` lançar erro ou exceção, todas as alterações são imediatamente revertidas e o estado anterior é restaurado.

### 2.3 Resiliência e Degradação Graciosa
A persistência entre navegação e refresh utiliza `StorageAdapter` com chave namespace `nft-mocks:v1:state`:
- **Navegador**: Grava no `localStorage`. Em caso de estouro de quota (`QuotaExceededError`) ou restrições de storage, o sistema degrada automaticamente para memória pura (`MemoryStorageAdapter`), sinalizando `persistenceDegraded: true` sem interromper o usuário.
- **Node/Vitest**: Utiliza `MemoryStorageAdapter` isolado por teste.
- **Reset Integral**: Executa `resetMockDatabase()`, limpando o storage local e restabelecendo o snapshot estritamente idêntico ao estado inicial pristine do cenário ativo.

---

## 3. Guia dos 16 Cenários Obrigatórios

O registry de cenários em `@nft/mocks-core` disponibiliza 16 cenários determinísticos:

| ID do Cenário | Nome | Comportamento Simulado |
|---|---|---|
| `default` | Padrão (Sucesso) | Catálogo com 48 NFTs, 2 usuários, cupons válidos, latência normal sem injeção de falhas. |
| `empty` | Catálogo Vazio | Zero NFTs, zero avaliações, zero pedidos e carrinhos limpos para validar estados vazios da UI. |
| `slow-network` | Rede Lenta | Latência fixa de 2000ms em todas as requisições para validar skeletons e shimmering. |
| `variable-latency` | Latência Variável | Latência pseudo-aleatória entre 300ms e 1500ms usando PRNG com semente determinística. |
| `out-of-order` | Respostas Fora de Ordem | Inversão deliberada da ordem de resposta de requisições consecutivas para validar concorrência. |
| `connection-down` | Queda de Conexão | Todas as requisições sofrem erro de rede imediato (`HttpResponse.error()`). |
| `http-4xx` | Erros de Cliente 4xx | Requisições retornam HTTP 400 com payload padronizado `ApiError`. |
| `http-5xx` | Erros de Servidor 5xx | Requisições retornam HTTP 500 com payload padronizado `ApiError` e `retryable: true`. |
| `recovering-5xx` | Recuperação Transitória | Falha as 2 primeiras tentativas com HTTP 503 e recupera com sucesso na 3ª tentativa. |
| `session-expired` | Sessão Expirada | Tokens de sessão vencidos; endpoints autenticados retornam HTTP 401 `SESSION_EXPIRED`. |
| `forbidden-access` | Acesso Proibido | Endpoints protegidos retornam HTTP 403 `FORBIDDEN`. |
| `price-changed-at-checkout` | Preço Alterado | Retorna HTTP 409 `PRICE_CHANGED` na finalização da compra alertando alteração de cotação. |
| `sold-out-at-checkout` | Edição Esgotada | Retorna HTTP 409 `AVAILABILITY_CONFLICT` sinalizando que o estoque esgotou no momento do checkout. |
| `order-timeout-after-create` | Timeout Pós-Gravação | Executa a gravação do pedido no banco de dados com sucesso na fase `before`, mas sofre timeout na fase `after`. Permite comprovar recuperação idempotente. |
| `payment-confirmed` | Pagamento Confirmado | Pedidos criados resultam deterministicamente em confirmação (`status: confirmed`). |
| `payment-rejected` | Pagamento Recusado | Pedidos criados resultam deterministicamente em recusa (`status: rejected`). |

---

## 4. Como Acionar e Controlar os Cenários

### 4.1 Via Parâmetro de URL
Navegue adicionando `?scenario=<id>` ou solicite reset via `?reset=1`:
```
http://localhost:3000/?scenario=slow-network
http://localhost:3000/?scenario=recovering-5xx&reset=1
```
> **Nota de Higiene de URL**: Os parâmetros `?scenario` e `?reset` são consumidos no boot e removidos limpa e imediatamente da barra de endereços via `history.replaceState`, sem causar reloads adicionais ou poluir a navegação do TanStack Router.

### 4.2 Via Mocks Dev Panel
Pressione o atalho acessível:
- **Windows / Linux**: `Ctrl + Alt + M`
- **Mac**: `Cmd + Alt + M`
- **Ou via URL**: Acesse `/?mocks-panel=1`

O painel abre um modal acessível sobreposto (`Dialog`), permitindo trocar de cenário em tempo real, efetuar reset integral, avançar o relógio em 1 hora ou forçar a expiração da sessão, sem incluir botões flutuantes intrusivos na página.

### 4.3 Via Console e Automação Playwright (`window.__mocks`)
Em testes automatizados com Playwright ou no console DevTools:
```js
// Obter estado atual
window.__mocks.getState();

// Trocar cenário
window.__mocks.setScenario('sold-out-at-checkout');

// Resetar para o estado inicial pristino
window.__mocks.reset();

// Expirar a sessão do usuário ativo
window.__mocks.expireSession();

// Avançar o relógio determinístico em 30 minutos
window.__mocks.advanceClock(1800000);
```

---

## 5. Mapeamento de Conformidade com o §6 do challenge.md

A tabela a seguir comprova o atendimento integral a todos os requisitos do Desafio:

| Item do §6 do Challenge | Implementação no Projeto | Arquivo / Teste de Cobertura |
|---|---|---|
| Mocks na camada de rede sem dados fictícios em componentes | MSW no Service Worker e Node; restrição estrita via ESLint boundaries | `libs/shared/testing/src/boundaries.spec.ts` |
| Estado consistente entre catálogo, favoritos, carrinho, perfil, carteiras e pedidos | In-Memory Database reativo com coleções unificadas | `libs/mocks/core/src/database.ts`, `database.spec.ts` |
| Suporte a persistência local pós-refresh | `StorageAdapter` com `LocalStorageAdapter` (`nft-mocks:v1:state`) | `libs/mocks/core/src/storage.ts`, `database.spec.ts` |
| Reset integral restaurando cenário conhecido | `resetMockDatabase()` com snapshot profundo | `libs/mocks/core/src/database.spec.ts` |
| Simulação de latência fixa e variável | `LatencyBehavior` (fixa ou intervalo PRNG Mulberry32) | `libs/mocks/core/src/network-pipeline.spec.ts` |
| Simulação de respostas fora de ordem | `outOfOrder` behavior determinístico | `libs/mocks/core/src/network-profile.ts` |
| Falhas de conexão e erros HTTP 4xx/5xx | `connectionError` e `httpError` com `ApiError` normalizado | `libs/mocks/core/src/network-pipeline.spec.ts` |
| Sessão expirada e acesso não autorizado | `session-expired` e `requireSession()` retornando 401 | `libs/mocks/core/src/network-pipeline.spec.ts` |
| Conflito de validação de formulário | `parseBody()` retornando 422 com `fieldErrors` | `libs/mocks/core/src/network-pipeline.spec.ts` |
| Cupom inválido ou expirado | Fixtures `JUNGLE10`, `SAVE50`, `EXPIRED20`, `INACTIVE` | `libs/mocks/fixtures/src/index.spec.ts` |
| Preço alterado ou edição esgotada no checkout | Cenários `price-changed-at-checkout` e `sold-out-at-checkout` | `libs/mocks/core/src/scenarios.ts` |
| Timeout pós-gravação de pedido | Pipeline em duas fases com `phase: 'after'` e `timeout` | `libs/mocks/core/src/network-pipeline.spec.ts` |
| Pagamento confirmado e recusado | Cenários `payment-confirmed` e `payment-rejected` | `libs/mocks/core/src/scenarios.ts` |
| Credenciais fictícias sem senha em texto claro | Alice e Bob com `passwordHash` e `passwordSalt` PBKDF2/SHA-256 | `libs/mocks/core/src/auth-crypto.spec.ts`, `tools/mocks-hash.ts` |
| Ativação condicional por flag de ambiente | Boot com `import.meta.env.VITE_ENABLE_MOCKS === 'true'` | `apps/shell/src/main.tsx` |

---

## 6. Tempo Real (Socket.IO MSW) e Gatilhos Determinísticos

A comunicação em tempo real ponta a ponta conecta o cliente real `socket.io-client` ao interceptor WebSocket do MSW via `@mswjs/socket.io-binding`:

- **Endpoint interceptado**: `ws.link(/\/socket\.io\//)` operando sobre o transporte `['websocket']`.
- **Gatilhos determinísticos em `window.__mocks` e `window.__NFT_MOCK_CONTROL__`**:
  ```js
  // Emitir atualização de preço ou estoque de NFT (mutando o banco e emitindo nft.updated)
  window.__mocks.emitNftUpdated({ nftId: 'nft-01', price: '4.50', availableSupply: 2 });

  // Emitir confirmação ou rejeição de pedido (mutando o banco e emitindo order.updated)
  window.__mocks.emitOrderUpdated({ orderId: 'ord_123', userId: 'usr_collector_01', status: 'confirmed' });

  // Reenviar o último evento mantendo o mesmo id e version para testar deduplicação
  window.__mocks.emitDuplicateEvent();

  // Enviar versão antiga (version <= atual) para testar descarte monotônico
  window.__mocks.emitStaleEvent({ nftId: 'nft-01', price: '0.01' });

  // Simular queda de conexão e reconexão do socket
  window.__mocks.simulateSocketDisconnect();
  window.__mocks.simulateSocketReconnect();
  ```
- **Ações Rápidas no `MocksDevPanel` (`Ctrl+Alt+M`)**: O painel de desenvolvimento contém botões dedicados de um clique para disparar `nft.updated`, `order.updated` e reconexão imediata.
- **Débito Técnico P1 Assumido**: A sincronização com o TanStack Query utiliza invalidação direcionada (`invalidateQueries`), mantendo o estado 100% fiel às respostas do servidor REST sem a complexidade de patches manuais in-place em múltiplas páginas de catálogo.
