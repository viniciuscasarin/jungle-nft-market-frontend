# Tasks: Spike Vite + Module Federation

## 1. Dependências e Infraestrutura do Module Federation

- [x] 1.1 Instalar `@module-federation/vite` em `devDependencies` e configurar declarações de tipos para remotes em `apps/shell/src/vite-env.d.ts`, verificando com `pnpm typecheck`.
- [x] 1.2 Implementar utilitário `singletonProbe` em `@nft/shell-kit` e adicionar teste unitário comprovando a integridade do contador de instâncias em `libs/shell-kit/src/singleton-probe.spec.ts`, verificando com `nx test shell-kit`.

## 2. Configuração do Remote Storefront

- [x] 2.1 Configurar o plugin `@module-federation/vite` em `apps/storefront/vite.config.ts` expondo `./HomePage`, ajustando `server.origin`, CORS e `base` condicional para build consolidado, verificando com `nx build storefront`.
- [x] 2.2 Integrar chamada ao `singletonProbe.increment()` dentro do componente exposto em `apps/storefront/src/App.tsx` e validar execução do teste unitário com `nx test storefront`.

## 3. Configuração do Host Shell e Consumo Lazy

- [x] 3.1 Configurar o plugin `@module-federation/vite` em `apps/shell/vite.config.ts` com singletons estritos (`react`, `react-dom`, `@tanstack/react-router`, `@tanstack/react-query`, `@nft/shell-kit`) e resolução dinâmica do remote entry, verificando com `nx build shell`.
- [x] 3.2 Adicionar rota `/catalogo` com lazy loading de `storefront/HomePage` e `errorComponent` acessível em `apps/shell/src/routes.tsx`, integrando chamada ao `singletonProbe.increment()` e verificando com `nx test shell`.
- [x] 3.3 Configurar centralização de estilos Tailwind v4 em `apps/shell/src/styles.css` com a diretiva `@source` apontando para os fontes do remote storefront, verificando que o build não duplica CSS e aplica os utilitários aos componentes federados.

## 4. Orquestração de Build, Preview e Cache Headers

- [x] 4.1 Configurar dependência de targets em `apps/shell/project.json` e atualizar `scripts/preview.js` para garantir headers `Cache-Control: public, max-age=0, must-revalidate` para `remoteEntry.js` e `mf-manifest.json`, verificando os cabeçalhos de resposta HTTP no servidor de preview.
- [x] 4.2 Executar o build integrado (`pnpm build`) e validar os cenários de aceitação de SPA fallback, refresh em `/catalogo` e resiliência a remote offline com teste automatizado Playwright em `apps/web-e2e`.

## 5. Medições Técnicas, Documentação e Validação Final

- [x] 5.1 Realizar medições de tempo de build, número de requisições e tamanho de `remoteEntry.js`, documentando a configuração funcional, problemas encontrados e a decisão Go/No-Go em `docs/spikes/module-federation.md`.
- [x] 5.2 Atualizar `ARCHITECTURE.md` registrando as decisões consolidadas do spike e preenchendo as premissas técnicas validadas.
- [x] 5.3 Executar suite completa de validação (`pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm build`) garantindo zero erros e zero warnings no workspace.
