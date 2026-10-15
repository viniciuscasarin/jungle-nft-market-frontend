# Tasks

## 1. Setup Base do Monorepo e Tooling

- [x] 1.1 Configurar `package.json`, `pnpm-workspace.yaml`, `.nvmrc` (Node 22) e instalar dependências essenciais do monorepo (Nx, TypeScript, Vite, Tailwind v4, TanStack Router, Vitest, Playwright, ESLint), verificando a integridade da instalação com `pnpm install --frozen-lockfile=false`.
- [x] 1.2 Configurar `nx.json`, `tsconfig.base.json` (strict com `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes` e aliases `@nft/*`), `.prettierrc` e `.editorconfig`, verificando que o comando `pnpm nx --version` responde com sucesso.
- [x] 1.3 Configurar ESLint raiz (`eslint.config.js`) com `@nx/enforce-module-boundaries` e restrições de terceiros (`no-restricted-imports`), verificando a sintaxe e carregamento de regras com `pnpm lint`.

## 2. Generator Local do Workspace

- [x] 2.1 Implementar generator em `tools/workspace-generators` para gerar de forma padronizada as 4 camadas de uma biblioteca de domínio (`domain`, `data-access`, `feature`, `ui`) com `project.json`, `index.ts`, `tsconfig.json` e tags `scope:*`, `type:*`, `flow:*`, verificando com teste de geração isolado.

## 3. Bibliotecas Compartilhadas, Host Kit e Mocks

- [x] 3.1 Criar as 8 bibliotecas `@nft/shared-*` (`contracts`, `money`, `http`, `query`, `router`, `realtime`, `ui`, `testing`) com seus respectivos `project.json`, `index.ts`, tags (`scope:shared`, `type:util`, `flow:shared`) e setup de Vitest, verificando a execução de um teste unitário baseline com `pnpm nx run shared-money:test`.
- [x] 3.2 Criar a biblioteca `@nft/shell-kit` com `project.json`, `index.ts`, tags (`scope:shell-kit`, `type:util`, `flow:shared`) e setup de teste, verificando com `pnpm nx run shell-kit:test`.
- [x] 3.3 Criar as 4 bibliotecas `@nft/mocks-*` (`core`, `fixtures`, `handlers`, `socket`) com seus respectivos `project.json`, `index.ts` e tags (`scope:mocks`, `type:mocks`, `flow:shared`), verificando a exportação pública de cada módulo.

## 4. Geração das 32 Bibliotecas de Domínio

- [x] 4.1 Executar o generator do workspace para os 8 domínios (`auth`, `catalog`, `favorites`, `cart`, `checkout`, `orders`, `profile`, `wallets`), criando as 32 libs com `index.ts`, `project.json` e tags de fronteira apropriadas (`flow:shell` para auth; `flow:storefront` para catalog e favorites; `flow:checkout` para checkout, orders e cart feature/ui; `flow:account` para profile e wallets feature/ui; `flow:shared` para cart e wallets domain/data-access), verificando a presença de todos os `project.json` no workspace.

## 5. Aplicações e Roteamento Code-Based

- [x] 5.1 Criar `apps/shell` com Vite, Tailwind CSS v4 (`@tailwindcss/vite`), TanStack Router em modo code-based (rota raiz `/` e rota 404 acessível com aviso descritivo) e porta 4200, verificando a compilação e rota 404 via `pnpm nx run shell:build`.
- [x] 5.2 Criar os remotes independentes `apps/storefront` (porta 4201), `apps/checkout` (porta 4202) e `apps/account` (porta 4203) com Vite, Tailwind v4 e páginas placeholder acessíveis, verificando que cada app possui targets de `serve`, `build` e `preview` válidos em seus `project.json`.
- [x] 5.3 Criar `apps/web-e2e` configurado com Playwright e implementar smoke test verificando renderização da rota principal e da rota 404, verificando a execução com `pnpm nx run web-e2e:e2e`.

## 6. Scripts Raiz, Variáveis de Ambiente e Deploy Integrado

- [x] 6.1 Implementar módulo de validação de variáveis de ambiente com schema tipado em runtime, criar `.env.example` e verificar que a inicialização lança erro explícito caso falte variável obrigatória.
- [x] 6.2 Configurar scripts raiz no `package.json` (`dev:mocks`, `dev:shell`, `dev:storefront`, `dev:checkout`, `dev:account`, `build`, `preview`, `typecheck`, `lint`, `test`, `e2e`, `lighthouse` stub) com cache do Nx habilitado, verificando o disparo dos comandos.
- [x] 6.3 Implementar script de build consolidado agrupando `apps/shell` na raiz e remotes sob `dist/integrated/remotes/<nome>`, e configurar `vercel.json` com SPA fallback e políticas de cache (sem cache longo para `remoteEntry.js`), verificando a estrutura final de diretórios gerada após o build.
- [x] 6.4 Configurar pipeline do GitHub Actions em `.github/workflows/ci.yml` com cache de dependências e do Nx, jobs paralelos para `nx affected` (typecheck, lint, test, build) e job isolado para E2E com upload de traces e artefatos, validando a sintaxe do arquivo de workflow.

## 7. Verificação de Arquitetura, Documentação e Validação Final

- [x] 7.1 Implementar testes de fronteiras arquiteturais e restrição de terceiros (validando que violações de app-to-app, cross-flow, layer direction e restricted imports como axios fora de shared-http falham no lint), verificando a integridade das regras.
- [x] 7.2 Atualizar [ARCHITECTURE.md](file:///c:/Users/Vinicius/Dev/repos/challenges/jungle-nft-market-frontend/ARCHITECTURE.md) e `README.md` documentando a estrutura do workspace, lista de apps e libs, instruções de inicialização e comandos disponíveis.
- [x] 7.3 Executar validação final em checkout limpo rodando `pnpm typecheck && pnpm lint && pnpm test && pnpm build && pnpm e2e` nos projetos afetados e verificar que todos passam com zero falhas.
