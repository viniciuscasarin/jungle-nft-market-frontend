# Tasks: deploy-setup-and-preview

## 1. P0 — Resilient Environment Configuration (Zero-Config)

- [x] 1.1 Atualizar `libs/shared/contracts/src/env.ts` para que `VITE_REMOTE_*_URL` aceite caminhos relativos (iniciando com `/`) ou URLs absolutas, e configurar defaults seguros de demonstração (`VITE_ENABLE_MOCKS=true`, `VITE_DEFAULT_SCENARIO='default'`, `VITE_API_BASE_URL='/api'`, `VITE_SOCKET_URL=''`, `VITE_REMOTE_*_URL='/remotes/<remote>/remoteEntry.js'`) garantindo que `validateEnv` funcione sem variáveis manuais no painel da Vercel.
- [x] 1.2 Atualizar e expandir testes unitários em `libs/shared/contracts/src/env.spec.ts` cobrindo caminhos relativos e inicialização com objeto vazio `{}` sem lançar `EnvValidationError`, verificando com `npx vitest run libs/shared/contracts/src/env.spec.ts`.

## 2. P0 — Vercel Deployment Configuration (`vercel.json`)

- [x] 2.1 Atualizar `vercel.json` configurando cabeçalhos de cache estritos (`Cache-Control: no-cache, no-store, must-revalidate` para `/mockServiceWorker.js` e `/(.*)remoteEntry.js`; `Cache-Control: public, max-age=31536000, immutable` para `/assets/(.*)` e `/remotes/(.*)/assets/(.*)`).
- [x] 2.2 Atualizar rewrites em `vercel.json` com bypass explícito para `/mockServiceWorker.js` antes do fallback de SPA para `/index.html`, assegurando que requisições ao Service Worker nunca sejam reescritas para HTML.

## 3. P0 — Consolidated Build & Service Worker Pipeline (`scripts/build-integrated.js`)

- [x] 3.1 Refatorar `scripts/build-integrated.js` para compilar os remotes (`storefront`, `checkout`, `account`) e o host (`shell`) na ordem adequada, consolidando `apps/shell` na raiz de `dist/integrated/`, remotes em `dist/integrated/remotes/<remote>/`, e garantindo que `mockServiceWorker.js` esteja presente na raiz `/mockServiceWorker.js`.
- [x] 3.2 Adicionar asserções de integridade em `scripts/build-integrated.js` verificando a existência de `dist/integrated/mockServiceWorker.js`, `dist/integrated/index.html` e dos bundles `remoteEntry.js` de cada remote, abortando o build com código 1 caso algum arquivo essencial falte.

## 4. P0 — Preview Server Fidelity & Deep Links Verification (`scripts/preview.js`)

- [x] 4.1 Atualizar `scripts/preview.js` para simular com fidelidade os cabeçalhos de cache da Vercel (`no-cache, no-store, must-revalidate` para `mockServiceWorker.js` e `remoteEntry.js`; `immutable` para chunks com hash em `/assets/*`) e servir `index.html` com status 200 para SPA fallback.
- [x] 4.2 Criar teste automatizado de integração para o servidor de preview (`scripts/preview.spec.ts`) validando resposta HTTP 200 e cabeçalhos corretos para `/mockServiceWorker.js`, `/remotes/storefront/remoteEntry.js`, `/assets/*` e rotas profundas (`/`, `/nft/1`, `/login`, `/cadastro`, `/carrinho`, `/checkout/pagamento`, `/pedido/1`, `/conta/perfil`, `/conta/carteiras`, `/rota-inexistente`).

## 5. P1 — Technical Debt & Storybook Pipeline Decoupling

- [x] 5.1 Desacoplar o build do Storybook do comando padrão `pnpm build` em `scripts/build-integrated.js` (copiando `dist/apps/storybook` se já existir, mas sem falhar se estiver ausente), e adicionar o script `pnpm build:deploy:full` no `package.json` para compilação completa com Storybook.
- [x] 5.2 Documentar em `ARCHITECTURE.md` (§16 e §17) a estratégia de deploy estático único na Vercel, o isolamento de escopo do Service Worker na raiz, os headers de cache e o desacoplamento do Storybook como decisão de débito técnico para otimização de build.

## 6. Final Verification & Quality Gates

- [ ] 6.1 Executar a validação completa de qualidade nos projetos afetados (`pnpm typecheck`, `pnpm lint`, `pnpm test` e `pnpm build`), confirmando saída com zero erros e build consolidado íntegro em `dist/integrated/`.
- [x] 6.2 Corrigir o 404 de deep links na Vercel desativando `cleanUrls` e documentar a compatibilidade com destinos `.html`. JSON e OpenSpec strict validados; `nx affected -t typecheck,lint,test,build --files=...` não selecionou projetos para a alteração de configuração e documentação. E2E existente `module-federation.spec.ts` / `guard requireAuth` passou no preview integrado, cobrindo acesso direto a `/perfil` e redirecionamento para login (1 teste). A confirmação do roteamento na Vercel depende do próximo deploy.
