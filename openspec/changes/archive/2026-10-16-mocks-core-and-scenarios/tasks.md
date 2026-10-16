# Tasks: Mocks Core and Scenarios

## 1. Relógio, PRNG e Tooling de Credenciais

- [x] 1.1 Implementar `Clock` (`system` e `controlled(start)`) com métodos `now()`, `advance(ms)` e `set(date)` em `@nft/mocks-core`, garantindo timestamps consistentes sem chamadas diretas a `Date.now()`.
- [x] 1.2 Implementar motor PRNG Mulberry32 determinístico em `@nft/mocks-core` com suporte a semente fixa, `next()`, `int(min, max)`, `pick(array)`, `uuid()` e geradores de token/txHash.
- [x] 1.3 Criar script `tools/mocks-hash.ts` e comando npm `mocks:hash` para gerar pares determinísticos `passwordHash` e `passwordSalt` via PBKDF2/SHA-256, e exportar credenciais fictícias `demoCredentials` (Alice e Bob).
- [x] 1.4 Adicionar testes em Vitest para `Clock`, PRNG (mesma semente gerando sequência idêntica) e validação de conferência de hash das credenciais de demonstração.

## 2. Fixtures Determinísticas de Domínio

- [x] 2.1 Criar fixtures de catálogo em `@nft/mocks-fixtures` com no mínimo 48 NFTs (4 páginas de 12 itens), 5+ coleções com contagens coerentes, 3 redes (`ethereum`, `polygon`, `solana`), edições variadas e preços em string decimal.
- [x] 2.2 Criar fixtures de avaliações em `@nft/mocks-fixtures` incluindo um NFT com >= 25 avaliações paginadas, um NFT sem avaliações e ratings inteiros de 1 a 5.
- [x] 2.3 Criar fixtures de 2 usuários distintos (`user_alice` e `user_bob`) com perfil, carteira primária e secundária, carrinho inicial, favoritos, e senhas exclusivamente representadas por `passwordHash` e `passwordSalt`.
- [x] 2.4 Criar fixtures de cupons (percentual válido, valor fixo válido, expirado e inexistente/inválido).
- [x] 2.5 Adicionar testes unitários em `@nft/mocks-fixtures` validando todas as fixtures contra os schemas Zod de `@nft/shared-contracts` e garantindo os mínimos exigidos.

## 3. Banco de Dados em Memória, Transações e Persistência Resiliente

- [x] 3.1 Implementar banco em memória em `@nft/mocks-core` com coleções tipadas (`users`, `sessions`, `nfts`, `reviews`, `favorites`, `carts`, `coupons`, `orders`, `profiles`, `wallets`) e versionamento monotônico incremental via `bumpVersion()`.
- [x] 3.2 Implementar `transaction(fn)` atômica em `@nft/mocks-core`, aplicando snapshot deep-copy com commit na conclusão e rollback completo em caso de exceção.
- [x] 3.3 Implementar helper puro de domínio `mergeGuestCart(guestId, userId)` em `@nft/mocks-core`, respeitando estoque e disponibilidade máxima por edição de NFT.
- [x] 3.4 Implementar `StorageAdapter` com `LocalStorageAdapter` e `MemoryStorageAdapter` na chave `nft-mocks:v1:state`, com fallback gracioso para memória (`persistenceDegraded: true`) em caso de quota excedida ou erro de leitura.
- [x] 3.5 Implementar `resetMockDatabase()` garantindo que o snapshot pós-reset é estritamente idêntico ao snapshot inicial do cenário ativo.
- [x] 3.6 Adicionar testes unitários em Vitest cobrindo transação atômica, rollback, versionamento monotônico, `mergeGuestCart`, degradação de storage e restauração integral após reset.

## 4. Pipeline Universal de Condições de Rede e Helpers de Handlers

- [x] 4.1 Definir tipos de `NetworkProfile` e comportamentos: `latency` (fixa ou PRNG), `outOfOrder` determinístico, `timeout` (com suporte a `AbortSignal`), `connectionError`, `httpError` (com payload `ApiError`), `failTimes(n, behavior)` e `sequence([...])`.
- [x] 4.2 Implementar wrapper de alta ordem `defineHandler(method, path, handlerFn)` em `@nft/mocks-core` executando as fases `phase: 'before'` e `phase: 'after'` para todos os handlers.
- [x] 4.3 Implementar helpers de protocolo em `@nft/mocks-core`: `apiPath(path)`, `apiError(code, options)` com mapeamento padronizado de status HTTP, `parseBody(schema)` com erros 422 e `fieldErrors`, `requireSession(request)`, `paginate` e endpoint de diagnóstico `GET /api/__mocks/ping`.
- [x] 4.4 Adicionar testes com `msw/node` em Vitest validando cada comportamento de rede, demonstrando que `phase: 'after'` com timeout persiste o dado no banco antes da falha e que `failTimes(2, 503)` recupera na 3ª requisição.

## 5. Registry de Cenários, Seleção em Runtime e Dev Panel

- [x] 5.1 Implementar o registry completo dos 16 cenários obrigatórios em `@nft/mocks-core` (`default`, `empty`, `slow-network`, `variable-latency`, `out-of-order`, `connection-down`, `http-4xx`, `http-5xx`, `recovering-5xx`, `session-expired`, `forbidden-access`, `price-changed-at-checkout`, `sold-out-at-checkout`, `order-timeout-after-create`, `payment-confirmed`, `payment-rejected`).
- [x] 5.2 Implementar precedência de seleção de cenários (`?scenario` > storage > `VITE_DEFAULT_SCENARIO` > `default`), sanitização limpa de URL via `history.replaceState` e exposição de `MockControls` em `window.__mocks`.
- [x] 5.3 Implementar ponto de extensão `MockEventBus` com interface `emit(envelope)` e `subscribe` (implementação no-op em memória para emissão futura via Socket.IO).
- [x] 5.4 Construir `MocksDevPanel` em `apps/shell` usando componentes acessíveis de `@nft/shared-ui`, carregamento `lazy`, sem botões flutuantes na tela e acionamento estrito por `Ctrl+Alt+M` ou `?mocks-panel=1`.
- [x] 5.5 Adicionar testes unitários para a precedência de cenários, sanitização de parâmetros na URL e manipulação de estado via `MockControls`.

## 6. Integração MSW no Shell, Standalone e Alinhamento de Fronteiras

- [x] 6.1 Implementar inicialização idempotente `startMocks()` em `@nft/shell-kit` e `createMockServer()` para Node/Vitest em `@nft/mocks-core`.
- [x] 6.2 Integrar `startMocks()` no boot de `apps/shell/src/main.tsx` condicionado a `VITE_ENABLE_MOCKS`, gerando e versionando `apps/shell/public/mockServiceWorker.js` e adicionando script de dev para remotes.
- [x] 6.3 Atualizar `eslint.config.js` (`@nx/enforce-module-boundaries` e `no-restricted-imports`) permitindo que `@nft/shared-testing` importe `@nft/mocks-*` e `msw`, enquanto `feature` e `data-access` permanecem proibidas.
- [x] 6.4 Restringir o consumo de `@nft/shared-testing` exclusivamente para arquivos de teste (`*.spec.*`, `*.test.*`) e stories.
- [x] 6.5 Adicionar e atualizar testes de boundary em `libs/shared/testing/src/boundaries.spec.ts` comprovando que `@nft/shared-testing` importa mocks legalmente e que código de produção falha no lint.

## 7. Documentação e Verificação Integrada

- [x] 7.1 Criar documentação completa em `docs/mocks.md` cobrindo arquitetura, ciclo de vida, guia de cenários e tabela mapeando cada item do §6 do `challenge.md`.
- [x] 7.2 Atualizar `README.md` (seção de cenários, reset e credenciais fictícias) e `ARCHITECTURE.md` (§4, §13, §17).
- [x] 7.3 Executar bateria de verificação final (`pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm build`) e verificar que o bundle de produção do shell não contém `msw` quando `VITE_ENABLE_MOCKS=false`.
