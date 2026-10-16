# Design: deploy-setup-and-preview

## Context

O projeto adota uma arquitetura de micro-frontends via Module Federation composta por 4 aplicações React/Vite (`apps/shell`, `apps/storefront`, `apps/checkout` e `apps/account`), além de uma aplicação de documentação de componentes (`apps/storybook`).
Para viabilizar publicação estática na Vercel em um único projeto (Single-Project Static Deployment), os artefatos de build dos 4 apps são consolidados em `dist/integrated/`:
- `dist/integrated/` $\leftarrow$ arquivos do host `apps/shell` e `mockServiceWorker.js` na raiz.
- `dist/integrated/remotes/<remoteName>/` $\leftarrow$ bundles dos remotes com `remoteEntry.js` e `mf-manifest.json`.
- `dist/integrated/storybook/` $\leftarrow$ Storybook estático (quando compilado).

A aplicação depende do MSW (`mockServiceWorker.js`) ativo no navegador para interceptar chamadas REST (`/api/*`) e conexões WebSocket via `@mswjs/socket.io-binding`.
Para garantir deploys automatizados e estáveis sob o prazo crítico, a arquitetura separa os requisitos em **P0 (Deploy Único Zero-Config)** e **P1 (Débito Técnico para Acelerar Build)**.

## Goals / Non-Goals

**Goals:**
- Prover um deploy público na Vercel onde qualquer branch ou preview (`*.vercel.app`) funcione de primeira, sem exigir configuração manual de variáveis de ambiente no dashboard da Vercel.
- Garantir que `mockServiceWorker.js` e `remoteEntry.js` nunca sofram cache agressivo, enquanto assets com hash (`/assets/*`) sejam cacheados imutavelmente por 1 ano.
- Assegurar que o SPA fallback no Vercel e no script `preview.js` responda `200` com `/index.html` em qualquer rota profunda sem interceptar ou quebrar arquivos estáticos de remotes ou service worker.
- Desacoplar o build pesado do Storybook do fluxo de deploy rápido da Vercel (P1).

**Non-Goals:**
- Não inclui setup de múltiplos projetos ou domínios separados na Vercel (monorepo consolidado em único projeto).
- Não inclui integração com backends reais ou carteiras de blockchain reais (MSW 100% simulado).
- Não inclui conclusão das telas pendentes 10 a 16 ou do preenchimento final do `README.md` (reservados para etapas posteriores).

## Decisions

### Decisão 1 (P0): Defaults seguros de produção e suporte a caminhos relativos em `env.ts`
- **Escolha**: Ajustar o schema Zod (`EnvSchema`) em `libs/shared/contracts/src/env.ts` para que `VITE_REMOTE_*_URL` aceite caminhos relativos (iniciando com `/`) ou URLs absolutas, e que campos essenciais possuam defaults seguros:
  - `VITE_ENABLE_MOCKS`: default `true`.
  - `VITE_DEFAULT_SCENARIO`: default `'default'`.
  - `VITE_API_BASE_URL`: default `'/api'`.
  - `VITE_SOCKET_URL`: default `''` (no cliente de realtime, herda `window.location.origin`).
  - `VITE_REMOTE_STOREFRONT_URL`: default `'/remotes/storefront/remoteEntry.js'`.
  - `VITE_REMOTE_CHECKOUT_URL`: default `'/remotes/checkout/remoteEntry.js'`.
  - `VITE_REMOTE_ACCOUNT_URL`: default `'/remotes/account/remoteEntry.js'`.
- **Alternativas consideradas**:
  - *Exigir variáveis no painel da Vercel*: Rejeitado porque qualquer preview branch gerada por pull request precisaria de injeção de env vars e urls dinâmicas com CORS.
  - *Hardcodar URLs absolutas no código*: Rejeitado porque quebraria preview deploys em URLs dinâmicas da Vercel (`*.vercel.app`).
- **Rationale**: Usar caminhos relativos do mesmo domínio elimina 100% dos problemas de CORS e permite que preview deployments da Vercel funcionem sem qualquer configuração externa.

### Decisão 2 (P0): Cabeçalhos rigorosos de Cache-Control em `vercel.json` e `preview.js`
- **Compatibilidade de roteamento**: manter `cleanUrls: false` para que os rewrites destinados a `/index.html` e `/storybook/index.html` resolvam os arquivos HTML na Vercel. Com `cleanUrls: true`, os destinos precisam omitir a extensão; manter a extensão causou 404 da hospedagem antes de iniciar o Shell.
- **Escolha**:
  - `/(.*)remoteEntry.js` e `/mockServiceWorker.js`: `Cache-Control: no-cache, no-store, must-revalidate`.
  - `/assets/(.*)` e `/remotes/(.*)/assets/(.*)`: `Cache-Control: public, max-age=31536000, immutable`.
  - `/(.*).html`: `Cache-Control: no-cache, no-store, must-revalidate`.
- **Alternativas consideradas**:
  - `max-age=0, must-revalidate`: Não impede navegadores agressivos ou proxies intermediários de manter o Service Worker ou manifestos antigos em cache em caso de nova release.
- **Rationale**: `remoteEntry.js` e `mockServiceWorker.js` controlam o runtime de carregamento de código. Eles nunca podem ficar em cache para que deploys imediatos entrem em vigor sem exigir limpeza de cache pelo usuário.

### Decisão 3 (P0): Rewrites com bypass explícito para Service Worker e Remotes
- **Escolha**:
  Configurar a lista de rewrites no `vercel.json`:
  1. `/storybook/:path*` $\rightarrow$ `/storybook/:path*`
  2. `/storybook` $\rightarrow$ `/storybook/index.html`
  3. `/remotes/:path*` $\rightarrow$ `/remotes/:path*`
  4. `/assets/:path*` $\rightarrow$ `/assets/:path*`
  5. `/mockServiceWorker.js` $\rightarrow$ `/mockServiceWorker.js`
  6. `/(.*)` $\rightarrow$ `/index.html`
- **Rationale**: Garante que requisições ao Service Worker e aos chunks dos remotes nunca sejam reescritas para `/index.html` (o que geraria erros de sintaxe JS ao interpretar HTML como script).

### Decisão 4 (P0): Ordem determinística de compilação e asserção em `build-integrated.js`
- **Escolha**: O script compila remotes primeiro (`storefront`, `checkout`, `account`) e em seguida o host (`shell`). Após a cópia para `dist/integrated`, ele valida programaticamente a existência de `dist/integrated/mockServiceWorker.js` e dos 3 `remoteEntry.js`. Se algum arquivo faltar, o build aborta imediatamente com erro claro.
- **Rationale**: Evita falsos positivos onde o build do shell ocorre antes dos remotes estarem prontos ou onde o service worker é esquecido.

### Decisão 5 (P1 — Débito Técnico): Desacoplamento do build de Storybook
- **Escolha**:
  - O comando `pnpm build` padrão compila apenas as 4 aplicações de produto (`shell`, `storefront`, `checkout`, `account`). Se `dist/apps/storybook` já existir, ele é copiado para `dist/integrated/storybook/`; se não existir, o build não falha e prossegue normalmente.
  - O comando `pnpm build:deploy:full` é introduzido para compilar o Storybook antes de rodar o `build-integrated.js`.
  - A decisão é registrada em `ARCHITECTURE.md` (§16 e §17) como escolha de engenharia para evitar timeouts de build no plano gratuito da Vercel.
- **Alternativas consideradas**:
  - *Compilar Storybook em todo deploy*: Rejeitado porque adiciona ~45s e alto consumo de memória ao build da Vercel, arriscando atingir o teto de tempo de execução.

## Risks / Trade-offs

- **[Risco]** Navegadores que já registraram um Service Worker prévio com escopo incorreto.
  $\rightarrow$ **Mitigação**: O Service Worker é servido na raiz `/mockServiceWorker.js` com cabeçalho `no-cache, no-store, must-revalidate` e escopo `/`, garantindo atualização imediata no ciclo de vida do MSW.
- **[Risco]** Acesso direto a rotas profundas em remotes via browser (`/remotes/storefront/`).
  $\rightarrow$ **Mitigação**: Remotes expõem `remoteEntry.js` para consumo via Module Federation pelo host. O SPA fallback entrega `/index.html` do Shell caso um usuário tente navegar diretamente para caminhos inexistentes.
- **[Risco]** Falha silenciosa caso `mockServiceWorker.js` não seja copiado para a raiz.
  $\rightarrow$ **Mitigação**: O script `build-integrated.js` realiza asserção `fs.existsSync` obrigatória com saída de código de erro (`process.exit(1)`).

## Migration & Verification Plan

1. **Testes Unitários**:
   - `libs/shared/contracts/src/env.spec.ts`: testar que `validateEnv` aceita caminhos relativos e provê defaults sem quebrar.
2. **Build Integrado e Asserção**:
   - Executar `pnpm build` e inspecionar a árvore de diretórios em `dist/integrated`.
3. **Teste Automatizado de Preview**:
   - Teste automatizado (`scripts/preview.spec.ts` ou Playwright) subindo o preview server e verificando:
     - Header `no-cache, no-store, must-revalidate` em `/mockServiceWorker.js` e `/remotes/storefront/remoteEntry.js`.
     - Header `immutable` em `/assets/*`.
     - Resposta 200 em rotas profundas (`/`, `/nft/1`, `/login`, `/carrinho`, `/rota-inexistente`).
