Crie a change `mocks-core-and-scenarios`.

## Contexto
Backend simulado do NFT Marketplace conforme `openspec/project.md`, `ARCHITECTURE.md` (§13) e `AGENTS.md` (§7). Esta change entrega a **infraestrutura** de mocks: estado, persistência, relógio, PRNG, cenários, condições de rede, fixtures e integração do MSW. Os handlers de cada domínio chegam nas changes de cada domínio (auth na change seguinte, `auth-and-session`). Aplique as conclusões do spike (`docs/spikes/module-federation.md`), o ponto de extensão de MSW do `bootstrapStandalone` (change `module-federation-contract`) e os schemas, fixtures de exemplo e o mapeamento de status HTTP por `ApiError.code` de `shared/contracts` e `docs/contracts.md`. Se o mapeamento de status não estiver definido, defina-o ali (sugestão: VALIDATION_ERROR 422, UNAUTHENTICATED 401, SESSION_EXPIRED 401, FORBIDDEN 403, NOT_FOUND 404, CONFLICT 409, AVAILABILITY_CONFLICT 409, PRICE_CHANGED 409, IDEMPOTENCY_CONFLICT 409, TRANSIENT 503).

Regras que valem aqui e nas próximas changes: mocks só em `libs/mocks/*`; nenhum mock em componentes, hooks, `data-access` ou Axios; erros sempre no formato `ApiError`; nada de `Math.random`, `Date.now` ou `new Date()` sem injeção; senhas nunca em claro no estado do mock.

## Requisitos

1. **Modelo de cenário** (`mocks/core`). `Scenario = { id, description, dataset, network, flags, clock }`, validado por zod, com registry tipado (`ScenarioId` é uma união fechada). Um cenário compõe: conjunto de dados inicial, perfil de rede, flags de comportamento (lidas pelos handlers de cada domínio) e modo de relógio. O perfil de rede pode ser trocado em runtime sem trocar o cenário.

2. **Banco em memória** (`mocks/core`), com coleções tipadas pelos schemas de `shared/contracts`: users (com `passwordHash` e `passwordSalt`, nunca senha), sessions (token opaco, userId, createdAt, expiresAt, revokedAt), nfts (com disponibilidade por edição), reviews, favorites, carts (por `userId` ou por `guestId` anônimo), coupons, orders (com registros de idempotência), profiles e wallets. API mínima: leitura, `transaction(fn)` atômica (rollback em exceção; persistência só após commit) e `bumpVersion` (todo recurso alterado incrementa seu `version` inteiro e monotônico). Helpers de domínio que mais de um handler vai usar (ex.: `mergeGuestCart(guestId, userId)`, respeitando disponibilidade por NFT e edição) ficam em `mocks/core` com testes.

3. **Relógio e PRNG injetáveis**. `Clock` (`now()`, `advance(ms)`, `set(date)`) com implementações `system` e `controlled(start)`. PRNG com semente fixa (ex.: mulberry32) com `next`, `int(min,max)`, `pick`, `uuid()` e geradores de token, `txHash` e ids derivados dele. Fixtures não usam datas absolutas: usam offsets relativos ao início do cenário (ex.: `expiresInDays`), para manter determinismo com qualquer relógio.

4. **Persistência local**. `StorageAdapter` (`get/set/remove/keys`) com implementação `localStorage` (navegador) e em memória (Vitest/Node). Chave versionada `nft-mocks:v<schemaVersion>:state`, guardando `{ scenarioId, seed, clock, state }`. No boot: restaura se `scenarioId` e `schemaVersion` coincidirem, senão semeia o cenário. Falha de quota ou de leitura não derruba o mock: degrada para memória e expõe `persistenceDegraded` em `getState()`. `reset()` apaga o persistido e reaplica **integralmente** o cenário atual (dados, relógio, PRNG, perfil de rede, flags, contadores de regras). Teste: snapshot após `reset()` é idêntico ao snapshot inicial do cenário. Sem sincronização entre abas (documentar como limitação).

5. **Seleção de cenário e painel de dev**. Precedência: `?scenario=<id>` > escolha de runtime persistida > `VITE_DEFAULT_SCENARIO` > `default`. Trocar de cenário faz reset para o novo; `?reset=1` força reset do atual. Os parâmetros são consumidos e removidos da URL (`history.replaceState`) antes de o router iniciar. `MocksDevPanel` em `apps/shell` (componentes de `shared/ui`, acessível, carregado com `lazy`, existe só se `VITE_ENABLE_MOCKS`), aberto **apenas** por atalho de teclado (`Ctrl+Alt+M`) ou `?mocks-panel=1`, sem botão flutuante, para não alterar o visual nem o Lighthouse. O painel permite: escolher cenário, reset, trocar perfil de rede, expirar sessão e avançar o relógio.

6. **Controles tipados** `MockControls`: `getState()`, `setScenario(id)`, `reset()`, `setNetworkProfile(profile | null)`, `expireSession(userId?)`, `advanceClock(ms)`, `setFlag(path, value)` e `events` (ponto de extensão `MockEventBus` com `emit(envelope)` e `subscribe`, implementação no-op nesta change: a emissão Socket.IO é da Etapa 12). Exposto em `window.__mocks` apenas quando os mocks estão ativos, para Playwright e demonstração. Nunca importado por componentes, hooks ou `data-access`.

7. **Condições de rede**. `NetworkProfile` = lista de regras `{ match: { method?, path (glob) }, phase: 'before' | 'after', behavior }`. Comportamentos:
   - `latency` fixa ou em faixa `{ minMs, maxMs }` (valores vindos do PRNG);
   - `outOfOrder`: para requisições consecutivas ao mesmo matcher, a resposta da mais antiga chega depois da mais recente, de forma determinística;
   - `timeout`: a resposta não chega (ou excede o timeout do cliente), respeitando `AbortSignal`;
   - `connectionError`: `HttpResponse.error()`;
   - `httpError({ status, code? })` com corpo `ApiError`;
   - `failTimes(n, behavior)` (falha as `n` primeiras ocorrências e depois recupera) e `sequence([...])`.
   `phase: 'after'` executa o handler de domínio (o efeito persiste no estado) e só então aplica o comportamento. É o que viabiliza "timeout após criação do pedido, com recuperação por idempotência". Toda regra passa por um único wrapper aplicado a **todos** os handlers (via `defineHandler`); nenhum handler o contorna. Contadores por regra são zerados no `reset()`.

8. **Helpers de handler** (`mocks/core`): `defineHandler`; `apiPath(path)` a partir de `VITE_API_BASE_URL`; `apiError(code, opts)` com o mapeamento de status do contexto; `parseBody(schema)` que devolve `VALIDATION_ERROR` com `fieldErrors`; `requireSession(request, ctx)` (`UNAUTHENTICATED` sem token ou token desconhecido ou revogado; `SESSION_EXPIRED` para token vencido); leitura do header de visitante (`guestId`); `paginate`. Handler de diagnóstico `GET {api}/__mocks/ping`, existente só com mocks ativos, usado nos testes de infraestrutura e fora do contrato de produto.

9. **Cenários registrados** (registry completo agora; handlers futuros leem as flags e cada change de domínio adiciona seus testes):

   | id | Efeito |
   |---|---|
   | `default` | Dataset completo; latência baixa e estável (30 a 120 ms); é o cenário do Lighthouse e da regressão visual |
   | `empty` | Catálogo, avaliações, favoritos e carrinho vazios; usuários mantidos |
   | `slow-network` | Latência fixa de 2500 ms em todas as rotas de dados |
   | `variable-latency` | Latência de 100 a 3000 ms (PRNG) |
   | `out-of-order` | `outOfOrder` em `GET /nfts` (listagem) |
   | `connection-down` | `connectionError` em todas as rotas, exceto `/__mocks/*` |
   | `http-4xx` | Leituras de catálogo respondem 422 `VALIDATION_ERROR` |
   | `http-5xx` | Leituras de catálogo respondem 500 de forma persistente |
   | `recovering-5xx` | Leituras falham com 503 `TRANSIENT` nas 2 primeiras tentativas e depois recuperam (retry e "tentar novamente") |
   | `session-expired` | TTL de sessão de 15 s |
   | `forbidden-access` | `FORBIDDEN` em recursos privados (perfil, carteiras, favoritos, pedidos) |
   | `price-changed-at-checkout` | Flag `quote.priceChange`: preço muda entre a cotação e a criação do pedido |
   | `sold-out-at-checkout` | Flag `quote.soldOut`: uma edição esgota durante a compra |
   | `order-timeout-after-create` | Regra `phase: 'after'` + `timeout` em `POST /orders` |
   | `payment-confirmed` | Flag `payment.outcome = confirmed` |
   | `payment-rejected` | Flag `payment.outcome = rejected` |

   Conflito de cadastro, validação de formulário e cupom inválido ou expirado são determinísticos pelos **dados** do cenário `default` (usuários existentes e cupons de fixture), não por cenário próprio. Mapeie no `docs/mocks.md` **cada item** da lista do §6 do `challenge.md` para um cenário ou para uma receita de reprodução.

10. **Fixtures** (`mocks/fixtures`), determinísticas e validadas pelos schemas de `shared/contracts`:
    - Mínimo de 48 NFTs (4 páginas com `pageSize` 12, como a paginação do Figma), no mínimo 5 coleções com contagens coerentes (a sidebar exibe contagem por coleção), as 3 redes (`ethereum`, `polygon`, `solana`) e faixas de preço variadas, em string decimal, algumas com muitas casas. Edições com disponibilidade variada: esgotada, única (1/1), limitada e aberta. Dados suficientes para toda combinação de filtro, ordenação e aba definida no contrato de listagem (inclusive novos lançamentos e em alta). Ao menos um NFT com preço anterior, se o contrato o expuser; senão, registre a lacuna em `docs/mocks.md`.
    - Imagens servidas de assets self-hosted derivados de `design/assets`, reaproveitadas ciclicamente quando houver menos artes que NFTs; documente o reaproveitamento.
    - Avaliações: um NFT com 25 ou mais (paginação), um com `count = 0`, e os demais variados.
    - **Dois usuários** com dados claramente distintos (perfil, carteira principal, carteira secundária em um deles, favoritos e carrinho semeados e diferentes entre si, para tornar vazamento detectável). Senhas representadas só por `passwordHash` e `passwordSalt` pré-calculados (script `pnpm mocks:hash <senha>` em `tools/`). Exporte `demoCredentials` para testes e E2E (credenciais fictícias, também documentadas no `README.md`) e teste que cada credencial confere com o hash.
    - Cupons: percentual válido, valor fixo válido, expirado e um código inexistente documentado como inválido.
    - Carteiras (`metamask`, `walletconnect`, `coinbase`) e redes coerentes com `collector`.

11. **Integração MSW em `shell-kit`**. `startMocks(options)` usado pelo host e pelo `bootstrapStandalone`. Quando `VITE_ENABLE_MOCKS` é falso, o código de mocks e o `msw` **não** entram nos chunks do shell (carregamento por `import()` dinâmico; teste de build verifica a ausência). Worker `mockServiceWorker.js` versionado em `public/` do shell; para os remotes em modo standalone, script que o gera em dev sem commitá-lo e sem registrá-lo no build integrado (remotes em `/remotes/<nome>/` nunca registram worker). `onUnhandledRequest`: `error` em testes e E2E, `warn` em dev, com bypass para assets, HMR e `remoteEntry`. Inicialização idempotente: a segunda chamada devolve a mesma instância; estenda o teste de singleton da change anterior para falhar com mais de um worker. O host só renderiza após os mocks estarem prontos (ordem de boot: mocks e depois sessão). Em Vitest/Node, `createMockServer` (`msw/node`) em `mocks/core`, reutilizando os mesmos handlers e o `StorageAdapter` em memória.

12. **Ajuste de fronteira para testes**. `mocks/*` e `msw` passam a ser também importáveis por `shared/testing`. `shared/testing` expõe `createTestServer(scenarioId?)` e `renderWithProviders`, e só pode ser importada por arquivos de teste (`*.spec.*`, `*.test.*`, setup do Vitest) e stories; imposto por lint. Atualize a regra de `@nx/enforce-module-boundaries`, o `no-restricted-imports` de `msw`, `AGENTS.md` (§4), `ARCHITECTURE.md` (§4) e `openspec/project.md`. Teste de lint: importar `@nft/mocks-core` de uma `feature` continua falhando.

13. **Documentação**: `docs/mocks.md` (arquitetura, ciclo de vida, cenários e flags, perfis de rede, controles, mapeamento do §6 do enunciado, como criar cenário e handler, limitações), seção "Cenários e reset" no `README.md`, `ARCHITECTURE.md` §13 e §17 (persistência local e suas limitações) atualizados.

14. **Testes** (Vitest): mesma semente gera a mesma sequência; `transaction` com rollback; `version` monotônico; persistência restaura e `reset()` restaura o snapshot inicial; precedência de seleção de cenário; cada comportamento de rede via `msw/node` (latência, `outOfOrder` com ordem de chegada invertida, `timeout`, `connectionError`, `httpError`, `failTimes`, `phase: 'after'` persistindo o efeito antes de falhar); todos os cenários obrigatórios existem no registry; fixtures validam nos schemas e satisfazem os mínimos (48 NFTs, 2 usuários, avaliações cheias e vazias, 3 tipos de cupom); `mergeGuestCart` soma e limita à disponibilidade; build sem mocks não contém `msw`.

## Cenários de aceitação
- WHEN seleciono `?scenario=slow-network` THEN o cenário é aplicado, o estado é reiniciado e o parâmetro some da URL.
- WHEN rodo `reset()` após mutações THEN o estado é idêntico ao inicial do cenário e o localStorage reflete isso.
- WHEN dou refresh sem trocar de cenário THEN o estado persistido é restaurado.
- WHEN uma regra `phase: 'after'` com `timeout` atinge um handler que grava dados THEN o dado foi gravado e a resposta não chegou.
- WHEN `failTimes(2, httpError 503)` está ativa THEN as duas primeiras requisições falham e a terceira tem sucesso.
- WHEN duas requisições consecutivas casam com `outOfOrder` THEN a resposta da segunda chega antes da primeira, sempre.
- WHEN `VITE_ENABLE_MOCKS` é falso THEN o build do shell não contém `msw` e `window.__mocks` não existe.
- WHEN `startMocks` é chamado duas vezes THEN existe um único service worker.
- WHEN uma `feature` ou `data-access` importa `@nft/mocks-*` THEN o lint falha; WHEN `shared/testing` importa THEN passa.
- WHEN abro `docs/mocks.md` THEN cada cenário do §6 do `challenge.md` aparece mapeado.

## Fora de escopo
Handlers de domínio (auth, catálogo, carrinho, pedidos etc.), emissão de eventos Socket.IO (só o ponto de extensão), UI além do `MocksDevPanel`.

Gere proposal, specs e tasks. Não implemente nesta etapa: a implementação segue depois, uma task por vez, com pausa entre elas.