# Proposal

## Why

O projeto necessita de uma fundação sólida de monorepo que estruture os 4 fluxos da aplicação (shell, storefront, checkout, account), os testes E2E, o ferramental de qualidade (TypeScript strict, ESLint com regras de fronteiras e restrições de terceiros, Prettier, Vitest, Playwright), a automação de CI e as configurações de deploy consolidado. Configurar esta base antes da lógica de negócio garante conformidade arquitetural imediata e previne acoplamento indevido entre apps e domínios desde o primeiro commit de código.

## What Changes

- **Setup do Workspace Nx**: Inicialização do workspace Nx com gerenciador pnpm (`pnpm-lock.yaml`), TypeScript strict (`noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`) e mapeamento de aliases de importação `@nft/<scope>-<lib>` em `tsconfig.base.json`.
- **Criação dos Apps Independentes**: Configuração de 4 aplicações React + Vite + Tailwind CSS v4 (`@tailwindcss/vite`) + TanStack Router (modo code-based) com portas dedicadas e rotas placeholder (`apps/shell` em 4200 com rota 404, `apps/storefront` em 4201, `apps/checkout` em 4202, `apps/account` em 4203) e app de testes `apps/web-e2e` (Playwright com 1 smoke test funcional).
- **Estruturação de 45 Libs**:
  - 8 libs compartilhadas: `@nft/shared-contracts`, `@nft/shared-money`, `@nft/shared-http`, `@nft/shared-query`, `@nft/shared-router`, `@nft/shared-realtime`, `@nft/shared-ui`, `@nft/shared-testing`.
  - 1 lib de integração do host: `@nft/shell-kit`.
  - 4 libs de simulação de rede: `@nft/mocks-core`, `@nft/mocks-fixtures`, `@nft/mocks-handlers`, `@nft/mocks-socket`.
  - 32 libs de domínio distribuídas em 8 domínios (`auth`, `catalog`, `favorites`, `cart`, `checkout`, `orders`, `profile`, `wallets`), cada um contendo as 4 camadas padronizadas: `domain`, `data-access`, `feature`, `ui`.
- **Generator Local do Workspace**: Implementação de generator/script em `tools/workspace-generators` para criação uniforme e automatizada das bibliotecas de domínio com `project.json`, `index.ts`, tags de fronteira e configuração de testes.
- **Enforcement de Fronteiras de Módulo (`@nx/enforce-module-boundaries`)**:
  - `domain` só pode importar `shared/contracts` e `shared/money`.
  - `ui` só pode importar `shared/ui` e `domain` do mesmo escopo.
  - `data-access` só pode importar `shared/http`, `shared/query`, `shared/contracts` e `domain`.
  - `feature` pode importar camadas do mesmo escopo, `shared/*`, `shell-kit` e `index.ts` público de outros escopos autorizados.
  - Apps nunca podem importar outros apps.
  - `feature` e `ui` com tag `flow:X` só podem ser importados por `apps/X`.
  - `mocks/*` só pode ser importado por `apps/shell`, `shell-kit` e `apps/web-e2e`.
  - Bloqueio estrito de dependências circulares.
- **Restrição de Dependências de Terceiros (`no-restricted-imports`)**:
  - `axios` restrito a `@nft/shared-http`.
  - `socket.io-client` restrito a `@nft/shared-realtime`.
  - `decimal.js` restrito a `@nft/shared-money`.
  - `@radix-ui/*` restrito a `@nft/shared-ui`.
  - `msw` e `@mswjs/socket.io-binding` restritos a `mocks/*`, `shell-kit` e `web-e2e`.
  - `@tanstack/react-query` restrito a `shared/query`, `data-access` e `feature`.
- **Tooling e Qualidade**: ESLint unificado com `jsx-a11y`, Prettier, Vitest configurado para execução em libs, `.editorconfig`, `.nvmrc`.
- **Scripts Raiz com Cache Nx**: `dev:mocks`, `dev:shell`, `dev:storefront`, `dev:checkout`, `dev:account`, `build`, `preview`, `typecheck`, `lint`, `test`, `e2e`, `lighthouse` (stub).
- **Variáveis de Ambiente Validadas**: Schema de validação em runtime para `VITE_ENABLE_MOCKS`, `VITE_API_BASE_URL`, `VITE_SOCKET_URL`, `VITE_DEFAULT_SCENARIO`, `VITE_REMOTE_STOREFRONT_URL`, `VITE_REMOTE_CHECKOUT_URL`, `VITE_REMOTE_ACCOUNT_URL` e criação de `.env.example`.
- **Deploy Readiness e Consolidado**: Script de build consolidado montando `dist/integrated/` (Shell em `/`, remotes em `/remotes/<nome>/`) e `vercel.json` com SPA fallback e políticas de cache (sem cache longo para `remoteEntry`, cache imutável com hash para chunks).
- **Pipeline de Integração Contínua (CI)**: GitHub Actions com cache de dependências e Nx, execução de `nx affected` para typecheck, lint, test e build, e job isolado de Playwright com upload de relatórios e traces.

## Capabilities

### New Capabilities
- `workspace-foundation`: Estabelece a infraestrutura do monorepo Nx, padronização de apps e libs, regras de lint para module boundaries e terceiros restritos, scripts de ciclo de vida e pipeline de validação e deploy integrado.

### Modified Capabilities
<!-- Nenhuma capability existente está sendo modificada -->

## Impact

- **Código e Configuração**: Criação da árvore de monorepo Nx na raiz, gerando `nx.json`, `pnpm-workspace.yaml`, `tsconfig.base.json`, `eslint.config.js`, `.prettierrc`, `.editorconfig`, `.nvmrc`, `.env.example`, `vercel.json` e o workflow `.github/workflows/ci.yml`.
- **Projetos Nx e Tags Afetadas**:
  - `apps/shell`: `scope:shell`, `type:app`, `flow:shell`
  - `apps/storefront`: `scope:storefront`, `type:app`, `flow:storefront`
  - `apps/checkout`: `scope:checkout`, `type:app`, `flow:checkout`
  - `apps/account`: `scope:account`, `type:app`, `flow:account`
  - `apps/web-e2e`: `scope:web-e2e`, `type:app`, `flow:shared`
  - `libs/shared/*` (`contracts`, `money`, `http`, `query`, `router`, `realtime`, `ui`, `testing`): `scope:shared`, `type:util`, `flow:shared`
  - `libs/shell-kit`: `scope:shell-kit`, `type:util`, `flow:shared`
  - `libs/mocks/*` (`core`, `fixtures`, `handlers`, `socket`): `scope:mocks`, `type:mocks`, `flow:shared`
  - `libs/auth/*`: `scope:auth`, `flow:shell` (todas as 4 camadas)
  - `libs/catalog/*`: `scope:catalog`, `flow:storefront` (todas as 4 camadas)
  - `libs/favorites/*`: `scope:favorites`, `flow:storefront` (todas as 4 camadas)
  - `libs/cart/*`: `scope:cart`, `domain` e `data-access` recebem `flow:shared`; `feature` e `ui` recebem `flow:checkout`
  - `libs/checkout/*`: `scope:checkout`, `flow:checkout` (todas as 4 camadas)
  - `libs/orders/*`: `scope:orders`, `flow:checkout` (todas as 4 camadas)
  - `libs/profile/*`: `scope:profile`, `flow:account` (todas as 4 camadas)
  - `libs/wallets/*`: `scope:wallets`, `domain` e `data-access` recebem `flow:shared`; `feature` e `ui` recebem `flow:account`
- **Dependências Externas**: Instalação e travamento em `pnpm-lock.yaml` de `nx`, `@nx/vite`, `@nx/eslint`, `@nx/eslint-plugin`, `@nx/playwright`, `react`, `react-dom`, `@tanstack/react-router`, `@tanstack/react-query`, `axios`, `socket.io-client`, `decimal.js`, `tailwindcss` (v4), `@tailwindcss/vite`, `msw`, `@mswjs/socket.io-binding`, `zod`, `vitest`, `playwright`, `eslint`, `prettier`.

## Fora de Escopo

- Implementação do Module Federation em runtime (fica para a change subsequente `module-federation-contract`).
- Lógica de negócio, contratos de API reais e integração com mocks ou dados simulados além de placeholders.
- Componentes visuais completos do catálogo, carrinho, pagamento, perfil e tokens detalhados do Figma (além de placeholders com layout básico e rota 404).

## Premissas

1. O Node.js padrão do workspace será definido no `.nvmrc` como `22` (ou compatível com a versão instalada no ambiente de desenvolvimento).
2. O pnpm será o gerenciador oficial e exclusivo de pacotes, garantindo resolução determinística de dependências e workspace monorepo.
3. Cada app Vite funcionará de modo independente em desenvolvimento local na sua respectiva porta (4200, 4201, 4202, 4203) antes da integração por Module Federation.
4. As bibliotecas de domínio são criadas vazias apenas com `index.ts`, `project.json` e configuração base, prontas para receberem suas respectivas implementações nas changes de cada domínio.
