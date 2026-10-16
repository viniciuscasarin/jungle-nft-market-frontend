# Proposal: deploy-setup-and-preview

## Why

Com o prazo do projeto se aproximando e com múltiplos desenvolvedores e agentes trabalhando em paralelo nos fluxos de usuário e telas, é imperativo garantir com antecedência que o pipeline de build unificado e o deploy público na Vercel funcionem de ponta a ponta sem atritos.

Atualmente, o monorepo possui scripts preliminares de consolidação (`scripts/build-integrated.js` e `scripts/preview.js`), mas com riscos críticos para o deploy em produção:
1. `libs/shared/contracts/src/env.ts` rejeita URLs relativas e não possui fallbacks seguros de demonstração, quebrando a inicialização do app caso variáveis de ambiente não estejam manualmente cadastradas no painel da Vercel.
2. `vercel.json` e `preview.js` possuem cabeçalhos de `Cache-Control` permissivos para `remoteEntry.js` e não possuem regras dedicadas nem rewrites explícitos de bypass para `/mockServiceWorker.js`.
3. O build consolidado acopla a compilação pesada do Storybook ao `pnpm build` padrão, arriscando timeouts e estouro de memória no pipeline de CI/CD da Vercel.

Esta change resolve esses pontos, dividindo a entrega em **P0 (Deploy Único Zero-Config Obrigatório)** e **P1 (Débito Técnico Documentado para Acelerar Build)**.

## What Changes

### P0 (Obrigatório Agora — Deploy Único Zero-Config)
- **Validação de Variáveis de Ambiente Resiliente (`libs/shared/contracts/src/env.ts`)**:
  - Permitir caminhos relativos e URLs absolutas nos endpoints de remotes (`VITE_REMOTE_STOREFRONT_URL`, `VITE_REMOTE_CHECKOUT_URL`, `VITE_REMOTE_ACCOUNT_URL`).
  - Fornecer fallbacks seguros de demonstração (`VITE_ENABLE_MOCKS=true`, `VITE_DEFAULT_SCENARIO='default'`, caminhos relativos `/remotes/<nome>/remoteEntry.js`, `VITE_API_BASE_URL='/api'`, `VITE_SOCKET_URL=''`), permitindo preview deployments dinâmicos da Vercel (`*.vercel.app`) sem CORS e sem setup prévio no painel.
- **Configuração de Deploy Vercel (`vercel.json`)**:
  - Desativar `cleanUrls` para preservar o destino `/index.html` do fallback SPA e evitar o 404 da hospedagem no acesso direto a `/perfil`.
  - Headers `Cache-Control: no-cache, no-store, must-revalidate` para `/mockServiceWorker.js` e `/remotes/:remote/remoteEntry.js`.
  - Headers `Cache-Control: public, max-age=31536000, immutable` para `/assets/*` e `/remotes/:remote/assets/*`.
  - Rewrite de SPA fallback para `/index.html` com bypasses estritos para `/storybook/*`, `/remotes/*`, `/assets/*` e `/mockServiceWorker.js`.
- **Script de Consolidação de Build (`scripts/build-integrated.js`)**:
  - Compilação ordenada: remotes primeiro (`storefront`, `checkout`, `account`), seguidos pelo host (`shell`).
  - Estruturação estrita de `dist/integrated/`:
    - `dist/integrated/` $\leftarrow$ arquivos do `shell` (incluindo `mockServiceWorker.js` na raiz).
    - `dist/integrated/remotes/storefront/` $\leftarrow$ build de `storefront`.
    - `dist/integrated/remotes/checkout/` $\leftarrow$ build de `checkout`.
    - `dist/integrated/remotes/account/` $\leftarrow$ build de `account`.
  - Asserção automática da presença de `dist/integrated/mockServiceWorker.js` e dos manifestos/remoteEntries.
- **Servidor de Preview Fiel (`scripts/preview.js`)**:
  - Servir `dist/integrated/` com simulação precisa dos headers de cache da Vercel.
  - SPA fallback entregando `index.html` com status 200 para rotas profundas (`/nft/1`, `/carrinho`, `/checkout/pagamento`, `/pedido/1`, `/conta/perfil`, `/conta/carteiras`, `/rota-inexistente`).
- **Testes Automatizados de Build e Preview**:
  - Testes unitários para `validateEnv` com caminhos relativos e defaults.
  - Teste de integração do servidor de preview validando headers de cache e entrega de rotas profundas.

### P1 (Débito Técnico para Acelerar Build na Vercel)
- **Desacoplamento do Build do Storybook**:
  - `pnpm build` padrão compila apenas os 4 apps essenciais (`shell`, `storefront`, `checkout`, `account`) e copia `dist/apps/storybook` se previamente existente, sem falhar se ausente.
  - Novo comando `pnpm build:deploy:full` que executa explicitamente o build do Storybook antes da consolidação.
  - Decisão e impacto documentados em `ARCHITECTURE.md` §16 e §17.

## Capabilities

### New Capabilities
*(Nenhuma nova capacidade necessária; a capacidade base existente cobre o escopo).*

### Modified Capabilities
- `workspace-foundation`: Atualiza os requisitos de validação de ambiente e de prontidão de build consolidado/deploy para incluir URLs relativas para remotes, defaults seguros de produção, headers de cache rigorosos para `mockServiceWorker.js` e `remoteEntry.js`, bypass de rewrites no `vercel.json` e desacoplamento opcional do Storybook.

## Impact

### Projetos Afetados e Tags Nx
- `apps/shell` (`scope:shell`, `type:app`, `flow:shell`): host e entry point da SPA.
- `apps/storefront` (`scope:storefront`, `type:app`, `flow:storefront`): remote de catálogo.
- `apps/checkout` (`scope:checkout`, `type:app`, `flow:checkout`): remote de carrinho e checkout.
- `apps/account` (`scope:account`, `type:app`, `flow:account`): remote de perfil e carteiras.
- `apps/storybook` (`scope:storybook`, `type:app`, `flow:tooling`): compilação opcional/desacoplada de tooling.
- `libs/shared/contracts` (`scope:shared`, `type:domain`, `flow:shared`): schema de ambiente Zod (`env.ts`).

### Fora de Escopo
- Implementação ou refatoração visual das telas finais (etapas 10 a 16).
- Documentação final do `README.md` e preenchimento de métricas finais do Lighthouse (reservados para etapa 19B).

### Premissas
- **Deploy Único Estático na Vercel**: Todas as 4 aplicações são publicadas juntas no mesmo domínio da Vercel sob uma única pasta `dist/integrated`, eliminando custos e complexidades de múltiplos domínios.
- **Caminhos Relativos no Build de Produção**: Remotes são importados via `/remotes/<nome>/remoteEntry.js` em produção, viabilizando preview deployments dinâmicos da Vercel sem configuração de CORS.
- **MSW Ativo por Padrão em Produção**: `VITE_ENABLE_MOCKS=true` como default assegura que o app funcione de imediato como demonstração pública sem exigir backend externo.
- **Desacoplamento do Storybook**: Storybook é opcional no `pnpm build` padrão para preservar tempo de build e limites de memória da Vercel, com suporte a build completo via `pnpm build:deploy:full`.
