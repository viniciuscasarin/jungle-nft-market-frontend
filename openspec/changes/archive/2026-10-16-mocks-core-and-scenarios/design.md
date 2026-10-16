# Design: Mock Infrastructure and Scenarios

## Context
O projeto possui bibliotecas scaffolded para mocks (`libs/mocks/core`, `libs/mocks/fixtures`, `libs/mocks/handlers`, `libs/mocks/socket`), mas seu estado atual é composto apenas por stubs primitivos. A aplicação host (`apps/shell`) e os remotes em modo standalone necessitam de uma camada de simulação MSW unificada e idempotente. Todas as regras de negócio, contratos Zod de `@nft/shared-contracts` e restrições de isolamento por usuário exigem um repositório determinístico em memória com controle de transações, suporte a avanço temporal e injeção de condições extremas de rede.

## Goals / Non-Goals

**Goals:**
- Prover um banco em memória relacional/documental com coleções estritamente tipadas e transações atômicas `transaction(fn)`.
- Garantir determinismo absoluto através de PRNG (Mulberry32) com semente fixa e relógio injetável `Clock`.
- Permitir simulação de condições de rede complexas (`latency`, `outOfOrder`, `timeout`, falhas transitórias com recuperação e interceptação pós-processamento `phase: 'after'`).
- Suportar persistência local em `localStorage` para navegação e refresh, com degradação graciosa para memória e reset integral que restaura o snapshot inicial.
- Excluir o código de mocks e o `msw` do bundle de produção quando `VITE_ENABLE_MOCKS=false`.
- Ajustar as fronteiras de módulo do ESLint para que `@nft/shared-testing` possa utilizar `mocks/*` e `msw` em testes, proibindo código de produção de importar essas libs.

**Non-Goals:**
- Implementar handlers REST específicos de regras de domínio (auth, catálogo, checkout, pedidos etc.) — estes serão implementados nas changes de seus respectivos domínios.
- Emissão de eventos reais via Socket.IO (esta change entrega a abstração `MockEventBus` com implementação no-op; a simulação WebSocket Socket.IO pertence à etapa de tempo real).
- Interfaces visuais adicionais além do modal acessível `MocksDevPanel`.

## Decisions

### 1. Modelo de Banco em Memória com Transações Atômicas e Versionamento
- **Decisão**: Modelar o estado interno como um registro de coleções indexadas em memória (`users`, `sessions`, `nfts`, `reviews`, `favorites`, `carts`, `coupons`, `orders`, `profiles`, `wallets`). A mutação de dados é encapsulada na função `transaction(fn)`: um clone profundo (deep copy) do estado é criado antes da execução de `fn`; se `fn` concluir sem exceções, o novo estado é comitado e persistido; se `fn` lançar erro, as modificações são descartadas. Toda entidade alterada tem seu campo monotônico `version` incrementado via `bumpVersion()`.
- **Alternativas consideradas**:
  - *Proxy/Immer*: adiciona dependência e overhead; deep clone em memória nativo com JSON/structuredClone é determinístico e suficiente para o volume das fixtures.
  - *Mutações diretas sem transação*: impediria rollback limpo em caso de falha de validação ou erro interno durante fluxos complexos de escrita (como `mergeGuestCart`).

### 2. PRNG Mulberry32 e Relógio Injetável
- **Decisão**: Utilizar o algoritmo Mulberry32 com semente fixa de 32 bits (padrão `0x6D2B79F5`) para gerar números pseudo-aleatórios, UUIDs v4 determinísticos, tokens de sessão e hashes simulados. O `Clock` possui duas implementações: `system` (baseado em `Date.now()`) e `controlled` (com ponto de partida fixado e controle manual via `advanceClock(ms)` e `set(date)`). Fixtures de data utilizam offsets relativos (ex.: `expiresInDays: 30`) calculados no boot em relação ao tempo inicial do cenário.
- **Alternativas consideradas**:
  - *Math.random() e Date.now() nativos*: Rejeitado categoricamente pelas regras do projeto (inviabiliza testes determinísticos e baselines visuais estáveis).
  - *Bibliotecas externas de mock de data (Sinon/FakeTimers)*: Incompatível com o escopo no navegador do MSW worker, que roda em thread de Service Worker separada.

### 3. Pipeline de Condições de Rede em Duas Fases (`phase: 'before' | 'after'`)
- **Decisão**: Todos os handlers são registrados através de uma função de alta ordem `defineHandler(method, path, handlerFn)`. Antes de chamar `handlerFn`, o pipeline verifica regras do `NetworkProfile` ativo com `phase: 'before'`. Se nenhuma regra abortar a requisição, `handlerFn` executa. Em seguida, o pipeline avalia regras com `phase: 'after'`. Isto viabiliza simular cenários críticos como timeout após a gravação do pedido (o pedido é persistido no banco em memória, mas o cliente recebe timeout de rede).
- **Alternativas consideradas**:
  - *Configurar falha apenas no handler individual*: Polui a lógica dos handlers com flags de mock, violando a regra arquitetural de separação estrita de infraestrutura.
  - *Interceptador Axios no cliente*: Proibido pela regra de isolamento de rede (mocks residem exclusivamente na camada MSW).

### 4. Resiliência de Persistência e Reset Integral
- **Decisão**: Implementar `StorageAdapter` com implementações `LocalStorageAdapter` e `MemoryStorageAdapter`. A chave no `localStorage` utiliza namespace versionado `nft-mocks:v1:state`. Falhas de `QuotaExceededError` ou parsing corrompido são capturadas, fazendo o mock degradar automaticamente para memória pura e sinalizar `persistenceDegraded: true` em `getState()`. A função `reset()` limpa o storage e reaplica o snapshot do cenário ativo gerado no momento do boot.
- **Alternativas consideradas**:
  - *IndexedDB*: Overhead assíncrono excessivo para inicialização síncrona do Service Worker e testes no Vitest.

### 5. Carregamento Condicional do MSW e Tree-shaking no Shell
- **Decisão**: No arquivo `apps/shell/src/main.tsx`, a inicialização do MSW é encapsulada em uma função assíncrona com `import('@nft/shell-kit')` dinâmico ativada somente quando `import.meta.env.VITE_ENABLE_MOCKS === 'true'`. O worker `mockServiceWorker.js` é versionado em `apps/shell/public/`. Para os remotes rodando em modo isolado, o script de dev gera o worker em suas respectivas pastas `public/` sem versioná-lo no Git e sem incluí-lo no build integrado (`dist/integrated/`).
- **Alternativas consideradas**:
  - *Import estático de MSW no Shell*: Resultaria no vazamento de código de mocks e bibliotecas de teste para o bundle de produção quando as flags estiverem desativadas.

### 6. Governança de Fronteiras no ESLint para Testes
- **Decisão**: Ajustar as regras `@nx/enforce-module-boundaries` e `no-restricted-imports` no `eslint.config.js`:
  - Permitir que `@nft/shared-testing` importe `@nft/mocks-*` e `msw`.
  - Definir que `@nft/shared-testing` só pode ser importada em arquivos que casem com `**/*.{spec,test}.{ts,tsx}` ou `.storybook/**/*.{ts,tsx}`.
  - Manter a proibição absoluta para que `feature`, `ui` e `data-access` importem mocks.

## Risks / Trade-offs

- **[Multi-tab Storage Out-of-Sync]** → O `localStorage` persiste o estado no navegador, mas abas abertas simultaneamente não compartilham eventos de mutação em memória em tempo real.
  - *Mitigação*: Documentar expressamente em `docs/mocks.md` e `ARCHITECTURE.md` (§17) como limitação conhecida da simulação em memória.
- **[Tamanho do bundle das Fixtures]** → 48+ NFTs com múltiplos metadados e edições podem inflar os testes se carregados desnecessariamente.
  - *Mitigação*: Fixtures são puramente JSON/TypeScript estático e carregadas sob demanda apenas pelo módulo `@nft/mocks-core`.
- **[Service Worker Scope em Subcaminhos]** → Remotes servidos em `/remotes/<remoteName>/` não podem registrar service workers próprios para não colidir com o escopo do host.
  - *Mitigação*: O service worker é registrado com scope `/` exclusivamente pelo shell ou em modo standalone na porta de dev do remote.
