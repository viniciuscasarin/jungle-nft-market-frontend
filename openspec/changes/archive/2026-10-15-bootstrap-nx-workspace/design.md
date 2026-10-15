# Design

## Context

O projeto parte de uma raiz vazia com arquivos de arquitetura e convenção pré-estabelecidos ([ARCHITECTURE.md](file:///c:/Users/Vinicius/Dev/repos/challenges/jungle-nft-market-frontend/ARCHITECTURE.md), [openspec/project.md](file:///c:/Users/Vinicius/Dev/repos/challenges/jungle-nft-market-frontend/openspec/project.md) e [AGENTS.md](file:///c:/Users/Vinicius/Dev/repos/challenges/jungle-nft-market-frontend/AGENTS.md)). A motivação e os objetivos da fundação inicial estão detalhados em `proposal.md`. As restrições exigem TypeScript em modo estrito, isolamento total entre fluxos, encapsulamento de terceiros e suporte a build consolidado para produção.

## Goals / Non-Goals

**Goals:**
- Configurar um monorepo Nx determinístico e escalável usando pnpm e TypeScript strict (`noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`).
- Criar a topologia completa de 5 apps (`apps/shell`, `apps/storefront`, `apps/checkout`, `apps/account`, `apps/web-e2e`) e 45 bibliotecas (`shared/*`, `shell-kit`, `mocks/*`, e 8 domínios nas 4 camadas).
- Automatizar a geração de bibliotecas de domínio via generator dedicado em `tools/workspace-generators`.
- Implementar regras de ESLint rígidas para `@nx/enforce-module-boundaries` e restrição de importações de terceiros (`no-restricted-imports`).
- Prover scripts raiz com cache Nx (`dev:mocks`, `dev:<app>`, `build`, `preview`, `typecheck`, `lint`, `test`, `e2e`, `lighthouse`).
- Configurar build consolidado em `dist/integrated/` e arquivo `vercel.json` com políticas de roteamento SPA e controle de cache para Module Federation futuro.
- Entregar pipeline de CI no GitHub Actions executando checagens afetadas e Playwright em jobs paralelos.

**Non-Goals:**
- Configurar plugins de Module Federation e consumo dinâmico entre remotes nesta etapa (escopo da change `module-federation-contract`).
- Implementar lógica de negócio, stores, queries ou simulação MSW de rede (escopo das changes específicas de cada domínio e mock).
- Construir componentes de UI finais ou telas estilizadas do Figma além dos placeholders acessíveis e da rota 404.

## Decisions

### 1. Monorepo com Nx e pnpm
- **Decisão**: Utilizar Nx como orquestrador do monorepo e `pnpm` como gerenciador de pacotes, travando versões em `pnpm-lock.yaml`. Mapeamento de imports via `tsconfig.base.json` sob o alias padronizado `@nft/<scope>-<lib>`.
- **Alternativas consideradas**:
  - *Turborepo*: Boa alternativa, mas com regras de lint de fronteiras menos integradas e menor suporte nativo a tags semânticas para Module Federation.
  - *npm/yarn workspaces*: Menor velocidade de cache e sem grafo de dependências nativo.
- **Justificativa**: O Nx provê o plugin `@nx/eslint-plugin` com `@nx/enforce-module-boundaries`, essencial para garantir que as regras invioláveis de arquitetura não sejam quebradas.

### 2. Stack dos Apps com Vite, Tailwind CSS v4 e TanStack Router Code-Based
- **Decisão**: Cada app (`shell`, `storefront`, `checkout`, `account`) utiliza React com Vite e plugin oficial `@tailwindcss/vite` (Tailwind v4), além de roteador TanStack Router configurado em modo programático/code-based (`createRootRoute`, `createRoute`, `createRouter`).
- **Alternativas consideradas**:
  - *TanStack Router File-Based*: Requer geração de arquivos de rota (`routeTree.gen.ts`) e plugins de build que complicam o compartilhamento de rotas em tempo de execução via host no Module Federation.
  - *Tailwind v3 com PostCSS*: Solução anterior, porém o Tailwind v4 elimina a necessidade de `postcss.config.js` e `tailwind.config.js`, simplificando a árvore de arquivos e melhorando o tempo de compilação.
- **Justificativa**: A abordagem code-based centraliza a definição das rotas do host e facilita a injeção posterior dos remotes via `lazyRouteComponent` sem acoplamento de arquivos gerados.

### 3. Generator Local para 4 Camadas de Domínio (`tools/workspace-generators`)
- **Decisão**: Criar um generator local (executável via script Node/TypeScript ou Nx plugin) que instancia as 4 camadas (`domain`, `data-access`, `feature`, `ui`) para um dado domínio, aplicando automaticamente `project.json`, `index.ts`, `tsconfig.json` e as tags `scope:<domain>`, `type:<layer>` e `flow:<target>`.
- **Alternativas consideradas**:
  - *Criação manual das 32 libs*: Propenso a erros de digitação de tags e caminhos de importação.
  - *Nx CLI generators repetitivos*: Executar o comando do Nx dezenas de vezes é lento e gera arquivos desnecessários que precisariam ser limpos.
- **Justificativa**: O generator customizado reduz o bootstrap para um comando simples e determinístico, garantindo 100% de consistência estrutural entre todos os domínios.

### 4. Política de Boundaries e Restrição de Terceiros
- **Decisão**: Configuração do ESLint com matriz de `depConstraints` no plugin do Nx e `no-restricted-imports` por projeto/camada:
  - Direção de dependência: app → feature → ui/data-access → domain → shared.
  - `flow:*` restringe o consumo de `feature` e `ui` aos respectivos apps (`flow:shell`, `flow:storefront`, `flow:checkout`, `flow:account`), permitindo `flow:shared` para camadas de dados de cart e wallets.
  - `mocks/*` estritamente isolado de componentes e hooks produtivos.
  - Terceiros encapsulados: `axios` exclusivamente em `@nft/shared-http`; `socket.io-client` exclusivamente em `@nft/shared-realtime`; `decimal.js` exclusivamente em `@nft/shared-money`; `@radix-ui/*` exclusivamente em `@nft/shared-ui`; `msw` exclusivamente em `mocks/*`, `shell-kit` e `web-e2e`; `@tanstack/react-query` exclusivamente em `shared/query`, `data-access` e `feature`.
- **Justificativa**: Cumpre diretamente a Seção 4 do [ARCHITECTURE.md](file:///c:/Users/Vinicius/Dev/repos/challenges/jungle-nft-market-frontend/ARCHITECTURE.md).

### 5. Build Consolidado e Configuração de Deploy para Vercel
- **Decisão**: Criar o script de build integrado que compila os 4 apps Vite e organiza a saída em `dist/integrated/`:
  - `apps/shell` é colocado na raiz `/`
  - Remotes são colocados em `/remotes/<app>/` (ex.: `/remotes/storefront/`, `/remotes/checkout/`, `/remotes/account/`)
  - `vercel.json` define rewrites para SPA (`/` e rotas filhas caindo no `/index.html` do shell) e headers de cache específicos: chunks com hash (`assets/*`) recebem `Cache-Control: public, max-age=31536000, immutable`, enquanto `remoteEntry.js` e HTML recebem `Cache-Control: public, max-age=0, must-revalidate`.
- **Justificativa**: Atende ao requisito do desafio de deploy readiness em um único bundle integrado, preservando a independência física dos remotes para a federation.

## Risks / Trade-offs

- **[Risco] Número elevado de projetos no workspace (50 projetos)**:
  - *Mitigação*: Cache local do Nx ativo e generator uniforme em `tools/workspace-generators`. Targets de compilação usam `@nx/vite` e `tsc --noEmit` de forma incremental.
- **[Risco] Divergência de versão do Node e pnpm entre ambientes**:
  - *Mitigação*: Arquivo `.nvmrc` fixado em `22`, versão do pnpm registrada em `packageManager` no `package.json` raiz e actions de CI travando as mesmas versões com `actions/setup-node`.
- **[Risco] Portas em conflito em desenvolvimento paralelo**:
  - *Mitigação*: Portas fixas e estritas atribuídas a cada app Vite (`4200` shell, `4201` storefront, `4202` checkout, `4203` account). O script `dev:mocks` orquestra a inicialização concorrente de todos os apps sem colisão.
