# Tasks: Module Federation Contract

## 1. Contratos e Infraestrutura em `libs/shell-kit`

- [x] 1.1 Definir contratos de tipos `RemoteManifest`, `RemotePages` e declarações ambientais de módulos federados em `libs/shell-kit/src/contracts.ts` e exportar no `index.ts`. Verificar com `nx test shell-kit`.
- [x] 1.2 Implementar `ShellProvider`, `useShell()` e `useSession()` em `libs/shell-kit/src/context.tsx` com validação de uso estrito fora do provider. Verificar com teste unitário em `context.spec.tsx`.
- [x] 1.3 Implementar registro e verificação de singletons em `libs/shell-kit/src/singleton-registry.ts` garantindo instância única de clientes e service worker. Verificar com teste em `singleton-registry.spec.ts`.
- [x] 1.4 Implementar `RemoteBoundary` em `libs/shell-kit/src/remote-boundary.tsx` com Suspense, shimmer skeleton (desativando animações sob `prefers-reduced-motion`), timeout configurável e ErrorBoundary com retry sem recarregar a janela. Verificar com testes unitários em `remote-boundary.spec.tsx`.
- [x] 1.5 Implementar `bootstrapStandalone` em `libs/shell-kit/src/bootstrap.tsx` fornecendo `ShellProvider`, router mínimo e ponto de extensão assíncrono para MSW. Verificar com testes unitários em `bootstrap.spec.tsx`.

## 2. Configuração de Module Federation nos Remotes e Páginas Placeholder

- [x] 2.1 Configurar `@module-federation/vite` em `apps/storefront/vite.config.ts` com shared scope completo (`socket.io-client`, `@nft/*`), expondo `./HomePage` e `./PdpPage`. Criar componente placeholder `PdpPage.tsx` e atualizar `src/main.tsx` com `bootstrapStandalone`. Verificar com `nx test storefront`.
- [x] 2.2 Configurar `@module-federation/vite` em `apps/checkout/vite.config.ts` (porta 4202, base `/remotes/checkout/`, origin e CORS) expondo `./CartPage`, `./PaymentPage` e `./ConfirmationPage`. Criar componentes placeholder e atualizar `src/main.tsx` com `bootstrapStandalone`. Verificar com `nx test checkout`.
- [x] 2.3 Configurar `@module-federation/vite` em `apps/account/vite.config.ts` (porta 4203, base `/remotes/account/`, origin e CORS) expondo `./ProfilePage` e `./WalletsPage`. Criar componentes placeholder e atualizar `src/main.tsx` com `bootstrapStandalone`. Verificar com `nx test account`.

## 3. Host Shell: Providers, Roteamento Centralizado e Preload

- [x] 3.1 Atualizar `apps/shell/vite.config.ts` para consumir os remotes `storefront`, `checkout` e `account` via variáveis de ambiente (`VITE_REMOTE_*_URL`) com fallback determinístico e shared scope estrito. Verificar com `nx test shell`.
- [x] 3.2 Atualizar `apps/shell/src/main.tsx` para inicializar factories de `shared/http`, `shared/query`, `shared/realtime` e montar `ShellProvider` no topo da árvore. Verificar com `nx test shell`.
- [x] 3.3 Expandir a tabela do TanStack Router em `apps/shell/src/routes.tsx` para mapear todas as 7 rotas com `lazyRouteComponent`, validação de search params via zod de `@nft/shared-contracts`, guard `requireAuth` e fallback com `RemoteBoundary`. Verificar com testes em `routes.spec.tsx`.
- [x] 3.4 Configurar preload preditivo de rotas (`preload="intent"`) no layout do Shell para otimização de navegação entre remotes. Verificar comportamento em teste unitário.

## 4. Testes Integrados e End-to-End

- [x] 4.1 Expandir `apps/web-e2e/src/module-federation.spec.ts` para cobrir carregamento dinâmico de todos os remotes (`storefront`, `checkout`, `account`), verificação de singleton único de `QueryClient` e `RealtimeClient`, e integridade das rotas protegidas (`requireAuth`). Verificar com `pnpm e2e`.
- [x] 4.2 Adicionar testes E2E em `apps/web-e2e` para resiliência a quedas de remotes: simular remote offline, verificar exibição do `RemoteBoundary`, simular recuperação de rede e validar clique em "Tentar Novamente" com sucesso sem recarregar o shell. Verificar com `pnpm e2e`.
- [x] 4.3 Adicionar testes E2E para execução autônoma (standalone) dos remotes nas portas 4201, 4202 e 4203 e SPA fallback no preview consolidado (`pnpm build && pnpm preview`). Verificar com `pnpm e2e`.

## 5. Documentação e Validação Final

- [x] 5.1 Criar `docs/federation.md` detalhando a topologia das portas fixas (4200 a 4203), comando `pnpm dev:mocks`, estrutura do build integrado e checklist/guia para criação de novos remotes. Verificar presença e formatação do arquivo.
- [x] 5.2 Atualizar `ARCHITECTURE.md` (§5) registrando o contrato formalizado de Module Federation, `ShellContext`, `RemoteBoundary` e `bootstrapStandalone`. Verificar consistência documental.
- [x] 5.3 Executar validação final do monorepo: `pnpm typecheck`, `pnpm lint`, `pnpm test` e `pnpm build` em todos os projetos afetados. Verificar que todos os checks passam com 100% de sucesso.
