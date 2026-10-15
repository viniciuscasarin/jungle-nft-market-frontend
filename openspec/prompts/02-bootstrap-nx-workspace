Crie a change `bootstrap-nx-workspace`.

## Contexto
Monorepo Nx do NFT Marketplace conforme `openspec/project.md`, `ARCHITECTURE.md` e `AGENTS.md` (já na raiz; não os sobrescreva, só ajuste comandos se divergirem). Esta change entrega estrutura e tooling, sem lógica de negócio e sem federation.

## Requisitos
1. **Workspace**: Nx + pnpm (lockfile versionado), TypeScript strict (`noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`), `tsconfig.base.json` com aliases `@nft/<scope>-<lib>` (ex.: `@nft/shared-http`, `@nft/catalog-feature`).
2. **Apps** (React + Vite + Tailwind v4 via `@tailwindcss/vite` + TanStack Router em modo code-based, decisão já registrada em `ARCHITECTURE.md` §2): `apps/shell` (rota `/` placeholder e rota 404; porta 4200), `apps/storefront` (4201), `apps/checkout` (4202), `apps/account` (4203), cada um com uma página placeholder, e `apps/web-e2e` (Playwright, 1 smoke test).
3. **Libs vazias** com `index.ts` público, `project.json` e tags: `shared/{contracts,money,http,query,router,realtime,ui,testing}`, `shell-kit`, `mocks/{core,fixtures,handlers,socket}` e, para cada domínio (auth, catalog, favorites, cart, checkout, orders, profile, wallets), as camadas `domain`, `data-access`, `feature`, `ui`.
4. **Tags**: `scope:*` (domínio), `type:*` (app|feature|ui|data-access|domain|util|mocks) e `flow:*` (shell|storefront|checkout|account|shared). Atribua `flow` conforme o app consumidor: auth → shell; catalog e favorites → storefront; cart, checkout e orders → checkout; profile → account; wallets (feature/ui) → account. `domain` e `data-access` de cart e wallets recebem `flow:shared`.
5. **Boundaries** com `@nx/enforce-module-boundaries`:
   - domain → só shared/contracts e shared/money
   - ui → shared/ui e domain
   - data-access → shared/http, shared/query, shared/contracts, domain
   - feature → camadas do próprio scope, shared/*, shell-kit e `index.ts` público de outros scopes
   - apps nunca importam outros apps
   - `feature` e `ui` com `flow:X` só importáveis por `apps/X`
   - `mocks/*` só importáveis por `apps/shell`, `shell-kit` e `apps/web-e2e`
   - bloqueio de imports circulares
6. **Restrição de terceiros** (`no-restricted-imports` por projeto): `axios` só em shared/http; `socket.io-client` só em shared/realtime; `decimal.js` só em shared/money; `@radix-ui/*` só em shared/ui; `msw` e `@mswjs/socket.io-binding` só em mocks/*, shell-kit e web-e2e; `@tanstack/react-query` só em shared/query, data-access e feature.
7. **Tooling**: ESLint (incluindo `jsx-a11y`), Prettier, Vitest configurado nas libs, `.editorconfig`, `.nvmrc`.
8. **Scripts raiz** via Nx com cache: `dev:mocks` (sobe todos os apps), `dev:shell|storefront|checkout|account`, `build`, `preview`, `typecheck`, `lint`, `test`, `e2e`, `lighthouse` (stub).
9. **Env** tipadas e validadas em runtime: `VITE_ENABLE_MOCKS`, `VITE_API_BASE_URL`, `VITE_SOCKET_URL`, `VITE_DEFAULT_SCENARIO`, `VITE_REMOTE_STOREFRONT_URL`, `VITE_REMOTE_CHECKOUT_URL`, `VITE_REMOTE_ACCOUNT_URL`; `.env.example`.
10. **Deploy readiness**: script de build que consolida os apps em uma única pasta de saída (shell em `/`, remotes em `/remotes/<nome>/`) e `vercel.json` com SPA fallback e headers (sem cache longo em `remoteEntry`, cache imutável em chunks com hash).
11. **CI** (GitHub Actions): cache de dependências e do Nx, `nx affected` para typecheck, lint, test e build; job de E2E separado com upload do relatório e traces.
12. **Generator local do workspace** (ex.: `tools/workspace-generators`) que cria uma lib de domínio com as 4 camadas, `index.ts`, `project.json`, tags `scope/type/flow` e config de teste de forma uniforme. Use-o para gerar todas as libs, em vez de rodar o generator padrão do Nx dezenas de vezes.
13. **Targets por app**: defina `serve`, `build` e `preview` manualmente para cada app Vite (não há generator oficial do Nx para Vite + Module Federation). A federation fica para a change `module-federation-contract`; aqui os apps são independentes.

## Cenários de aceitação
- WHEN rodo `pnpm typecheck && pnpm lint && pnpm test && pnpm build` em checkout limpo THEN tudo passa.
- WHEN `apps/storefront` importa algo de `apps/checkout` THEN o lint falha.
- WHEN `apps/account` importa a `feature` de `cart` THEN o lint falha.
- WHEN uma lib `ui` importa de `data-access` THEN o lint falha.
- WHEN qualquer pacote fora de `shared/http` importa `axios` THEN o lint falha.
- WHEN abro `/rota-inexistente` no preview THEN vejo a tela 404.

## Fora de escopo
Federation, lógica de domínio, mocks e UI além de placeholders.

Gere proposal, specs com cenários e tasks.md detalhado. Não implemente nesta etapa: a implementação segue depois, uma task por vez, com pausa entre elas.