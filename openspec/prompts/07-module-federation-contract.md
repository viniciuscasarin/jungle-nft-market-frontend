Crie a change `module-federation-contract`.

## Contexto
Integra `apps/storefront`, `apps/checkout` e `apps/account` ao host `apps/shell` via Module Federation, tudo no mesmo monorepo. Regras em `openspec/project.md` e `ARCHITECTURE.md` (seção 5). Aplique as conclusões de `docs/spikes/module-federation.md` (Etapa 1S). Usa os clientes de `shared/http`, `shared/query` e `shared/realtime` (factories) e o tema de `shared/ui`.

## Requisitos
1. **Federation** com `@module-federation/vite`: o host consome remotes por env (`VITE_REMOTE_*_URL`); cada remote expõe apenas páginas. Singletons com versão estrita: `react`, `react-dom`, `@tanstack/react-router`, `@tanstack/react-query`, `socket.io-client` e as libs `@nft/*` do workspace.
2. **Contrato** em `libs/shell-kit`: tipos `RemoteManifest` e `RemotePages` (`HomePage`, `PdpPage`, `CartPage`, `PaymentPage`, `ConfirmationPage`, `ProfilePage`, `WalletsPage`), cada um um componente React sem props além de um `ShellContext` mínimo tipado.
3. **ShellContext**: fornece QueryClient, HttpClient, RealtimeClient, sessão atual e `navigate` tipado. Hooks `useShell()` e `useSession()`. Remotes não criam essas instâncias.
4. **Rotas no host**: tabela TanStack Router com `lazy` para as páginas dos remotes, `requireAuth` nas privadas e schemas de search params vindos de `shared/contracts`.
5. **RemoteBoundary**: Suspense + ErrorBoundary com skeleton shimmer, ErrorState com retry (recarrega o remote sem refresh total) e timeout configurável.
6. **Bootstrap standalone** em `shell-kit`: `bootstrapStandalone(page)` sobe providers, router mínimo e (quando habilitado) o MSW para rodar um remote isolado em dev, reutilizando o código do host. Preparar o ponto de extensão para o MSW sem implementar handlers (vêm na etapa de mocks).
7. **Performance**: preload do `remoteEntry` das rotas prováveis, chunks pequenos e Home/PDP no mesmo remote.
8. **Build integrado**: um comando gera a pasta única de deploy (shell em `/`, remotes em `/remotes/<nome>/`) e um `preview` que a serve, com SPA fallback.
9. **Verificação de singletons**: teste que falha se houver mais de um QueryClient, RealtimeClient ou service worker MSW no runtime.
10. **Documentação** em `docs/federation.md`: portas fixas (4200 a 4203), `pnpm dev:mocks`, estrutura do build e como criar um novo remote (generator Nx ou checklist).

## Cenários de aceitação
- WHEN um remote está fora do ar THEN o shell continua funcional e a rota do remote mostra ErrorState com retry.
- WHEN o remote volta e clico em retry THEN a página carrega sem recarregar o shell.
- WHEN host e remote estão abertos THEN existe um único QueryClient e um único service worker.
- WHEN dois consumidores pedem o cliente pelo contexto THEN recebem a mesma instância.
- WHEN rodo um remote em standalone THEN ele sobe com providers e sessão sem o host.
- WHEN acesso `/` direto ou dou refresh em uma rota de remote no preview THEN a página carrega.

## Fora de escopo
Telas reais dos remotes; use páginas placeholder só para validar o contrato. Handlers de mock.

Gere proposal, specs e tasks (com os testes previstos). Não implemente nesta etapa: a implementação segue depois, uma task por vez, com pausa entre elas. Atualize `docs/federation.md` e `ARCHITECTURE.md`.