# Proposal: Mocks Core and Scenarios

## Why

O Jungle NFT Marketplace opera com um backend 100% simulado via MSW, sem dependência de blockchain real ou gateways externos. Para que os remotes e as features de domínio (auth, catálogo, carrinho, checkout, conta) possam ser desenvolvidos e testados de forma reproduzível e isolada, é indispensável estabelecer uma **infraestrutura determinística de mocks**. Esta infraestrutura deve suportar persistência local com restauração após refresh, reset integral, controle temporal e gerador pseudo-aleatório (PRNG) com semente estável, injeção de falhas e latências de rede (incluindo timeouts pós-processamento e inversão de ordem de resposta), além de fixtures ricas e compatíveis com os contratos do domínio.

## What Changes

- **Modelo de Cenário e Registry Tipado (`@nft/mocks-core`)**: Criação da abstração `Scenario` composta por dataset inicial, perfil de rede, flags de comportamento e modo de relógio, com união fechada `ScenarioId`.
- **Banco de Dados em Memória Reativo com Transações (`@nft/mocks-core`)**: Repositório em memória tipado pelos schemas de `@nft/shared-contracts` (`users`, `sessions`, `nfts`, `reviews`, `favorites`, `carts`, `coupons`, `orders`, `profiles`, `wallets`), com suporte a `transaction(fn)` atômica (rollback em exceção), versionamento monotônico incremental por recurso (`bumpVersion`) e helpers de domínio compartilhados (ex.: `mergeGuestCart`).
- **Relógio e PRNG Determinísticos Injetáveis (`@nft/mocks-core`)**: Implementação de `Clock` (`system` e `controlled`) e PRNG baseado em mulberry32 com semente fixa (`next`, `int`, `pick`, `uuid`, geradores de hashes e ids), eliminando chamadas descontroladas a `Math.random` ou `Date.now`.
- **Persistência Local e Resiliência (`@nft/mocks-core`)**: `StorageAdapter` com implementações `localStorage` (navegador) e `MemoryStorageAdapter` (Vitest/Node). Chave versionada `nft-mocks:v1:state`. Degradação graciosa para memória em caso de quota cheia ou erro de I/O, e função `reset()` que restaura integralmente o snapshot inicial idêntico do cenário ativo.
- **Pipeline de Rede Configurável (`NetworkProfile`)**: Interceptador universal com suporte a latência fixa/aleatória, `outOfOrder` determinístico, `timeout`, `connectionError`, `httpError` normalizado com `ApiError`, `failTimes(n)` e sequenciamento, suportando execução pós-handler (`phase: 'after'`).
- **Helpers de Handlers MSW (`@nft/mocks-core`)**: Utilitários universais `defineHandler`, `apiPath`, `apiError` com mapeamento explícito de status HTTP (`VALIDATION_ERROR` 422, `UNAUTHENTICATED`/`SESSION_EXPIRED` 401, `FORBIDDEN` 403, `NOT_FOUND` 404, `CONFLICT`/`AVAILABILITY_CONFLICT`/`PRICE_CHANGED`/`IDEMPOTENCY_CONFLICT` 409, `TRANSIENT` 503), `parseBody`, `requireSession`, leitura de `guestId`, `paginate` e endpoint diagnóstico `GET /api/__mocks/ping`.
- **Seleção de Cenário e Dev Panel Acessível**: Precedência de seleção (`?scenario=<id>` > storage > `VITE_DEFAULT_SCENARIO` > `default`), consumo e limpeza limpa de URL via `history.replaceState`. Painel `MocksDevPanel` em `apps/shell` carregado sob demanda (`lazy`), acionado estritamente via atalho `Ctrl+Alt+M` ou `?mocks-panel=1` sem interferência visual na página ou no Lighthouse.
- **Controles Globais Tipados (`window.__mocks`)**: Exposição de `MockControls` para automação com Playwright (`getState`, `setScenario`, `reset`, `setNetworkProfile`, `expireSession`, `advanceClock`, `setFlag`, `events`).
- **Fixtures Determinísticas Ricas (`@nft/mocks-fixtures`)**: 48+ NFTs (4 páginas de 12, 5+ coleções, 3 chains), avaliações paginadas e vazias, 2 usuários com credenciais de demonstração e senhas hasheadas (`passwordHash` e `passwordSalt`), cupons válidos, expirados e inválidos, carteiras e dados de suporte.
- **Script de Hash de Senhas (`tools/mocks-hash.ts`)**: Script CLI `pnpm mocks:hash <senha>` para gerar pares determinísticos `passwordHash` e `passwordSalt` usando PBKDF2/SHA-256.
- **Integração MSW no Host e Standalone (`@nft/shell-kit`)**: Inicialização idempotente via `startMocks()`, exclusão completa de `msw` do bundle quando `VITE_ENABLE_MOCKS=false`, worker `mockServiceWorker.js` versionado em `apps/shell/public/` e script de dev para remotes.
- **Ajuste de Fronteiras de Módulo para Testes**: Atualização de `eslint.config.js`, `AGENTS.md`, `ARCHITECTURE.md` e `openspec/project.md` para autorizar `@nft/shared-testing` a importar `mocks/*` e `msw`, garantindo que `@nft/shared-testing` só possa ser importado por arquivos `*.spec.*`, `*.test.*` e stories.

## Capabilities

### New Capabilities
- `mock-infrastructure`: Provê o mecanismo de simulação de backend do marketplace, incluindo banco em memória atômico, relógio e gerador pseudo-aleatório determinísticos, persistência resiliente, interceptação de rede configurável, seleção de cenários, fixtures estáticas e integração do MSW no navegador e no Vitest.

### Modified Capabilities
<!-- Nenhuma especificação existente teve seus requisitos de comportamento alterados; os contratos de domínio permanecem os mesmos. -->

## Impact

- **Projetos Nx e Tags Afetados**:
  - `libs/mocks/core`: `scope:mocks`, `type:util`, `flow:shared`
  - `libs/mocks/fixtures`: `scope:mocks`, `type:util`, `flow:shared`
  - `libs/shell-kit`: `scope:shell`, `type:util`, `flow:shared`
  - `libs/shared/testing`: `scope:shared`, `type:util`, `flow:shared`
  - `apps/shell`: `scope:shell`, `type:app`, `flow:shell`
  - `tools/`: Adição do script `mocks-hash.ts`
- **Build e Bundle**:
  - `apps/shell`: Dynamic import de `startMocks` condicionado a `VITE_ENABLE_MOCKS`. Com `VITE_ENABLE_MOCKS=false`, MSW é tree-shaked sem impactar bundle de produção.
- **Governança de Fronteiras e Lint**:
  - `eslint.config.js`: Regras de `@nx/enforce-module-boundaries` e `no-restricted-imports` atualizadas para abrir exceção estrita para `shared-testing`, enquanto `feature` e `data-access` permanecem proibidos de importar mocks.
- **Documentação**:
  - Criação de `docs/mocks.md` cobrindo arquitetura, cenários e mapeamento do §6 do `challenge.md`.
  - Atualização do `README.md` (seção de cenários, credenciais de teste e reset).
  - Atualização do `ARCHITECTURE.md` (§4, §13, §17).
