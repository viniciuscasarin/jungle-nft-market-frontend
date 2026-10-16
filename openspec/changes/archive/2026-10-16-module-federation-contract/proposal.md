# Proposal: Module Federation Contract

## Why

Atualmente, o monorepo possui apenas uma integração inicial de Module Federation entre `apps/shell` e `apps/storefront` proveniente do spike técnico. Os remotes `apps/checkout` e `apps/account` permanecem desacoplados sem configuração de federação, e não há um contrato estrito formalizado em `libs/shell-kit` para todas as páginas remotas, injeção de contexto (`ShellContext`), tratamento resiliente de erros via `RemoteBoundary` com retry sem refresh total, nem bootstrap autônomo (`bootstrapStandalone`) padronizado para desenvolvimento isolado.

Esta change estabelece o contrato definitivo de Module Federation entre o host e os três remotes (`storefront`, `checkout`, `account`), garantindo integridade de singletons estritos, roteamento centralizado com guards, resiliência contra falhas parciais de rede e esteira de build/preview integrada.

## What Changes

- **Federação Completa dos 3 Remotes**:
  - Configurar `@module-federation/vite` em `apps/checkout` (porta 4202) e `apps/account` (porta 4203) com base dinâmica (`/remotes/<nome>/`) e singletons estritos.
  - Atualizar `apps/shell/vite.config.ts` para consumir os 3 remotes via variáveis de ambiente (`VITE_REMOTE_STOREFRONT_URL`, `VITE_REMOTE_CHECKOUT_URL`, `VITE_REMOTE_ACCOUNT_URL`) com fallback determinístico para portas locais em dev e `/remotes/<nome>/remoteEntry.js` em produção.
  - Incluir `socket.io-client` e bibliotecas `@nft/*` na lista de dependências compartilhadas (`shared`) estritas.
- **Contrato Tipado em `libs/shell-kit`**:
  - Definir tipos e manifestos canônicos `RemoteManifest` e `RemotePages` para as 7 páginas: `HomePage`, `PdpPage`, `CartPage`, `PaymentPage`, `ConfirmationPage`, `ProfilePage`, `WalletsPage`.
  - Definir declarações de tipos de módulos federados (`declare module '<remote>/<Page>'`).
  - Provedor e hooks `ShellProvider`, `useShell()` e `useSession()`, injetando `QueryClient`, `HttpClient`, `RealtimeClient`, sessão e `navigate` tipado.
- **Roteamento Centralizado no Host (`apps/shell`)**:
  - Expandir tabela do TanStack Router para cobrir todas as rotas dos remotes (`/` e `/catalogo`, `/nft/$nftId`, `/carrinho`, `/checkout`, `/pedidos/$orderId/confirmacao`, `/perfil`, `/carteiras`).
  - Conectar schemas zod de search params de `@nft/shared-contracts` (`validateSearch`).
  - Implementar guard `requireAuth` para rotas protegidas com redirecionamento preservando search e path.
- **Componente `RemoteBoundary`**:
  - Suspense com skeleton animado com shimmer (desativando animação sob `prefers-reduced-motion`).
  - ErrorBoundary acessível (`role="alert"`, `aria-live="assertive"`) com botão de retry capaz de recarregar o remote sem recarregar o shell inteiro.
  - Timeout configurável para abortar carregamento de remotes congelados ou inacessíveis.
- **Bootstrap Standalone em `libs/shell-kit`**:
  - Implementar `bootstrapStandalone(page, config)` para permitir que `pnpm dev:storefront`, `pnpm dev:checkout` e `pnpm dev:account` rodem de forma autônoma, montando providers e router mínimo.
  - Ponto de extensão assíncrono para inicialização de MSW (sem implementar handlers de negócio nesta etapa).
- **Verificação de Singletons Estritos**:
  - Utilitário e testes automatizados garantindo exatamente 1 instância no runtime para `QueryClient`, `HttpClient`, `RealtimeClient` e service worker.
- **Documentação**:
  - Criar `docs/federation.md` detalhando topologia, portas fixas, build e checklist para novos remotes.
  - Atualizar `ARCHITECTURE.md` (§5) registrando o contrato formalizado.

## Capabilities

### New Capabilities
*(Nenhuma nova capacidade durable criada; a especificação existente de runtime de federação é expandida)*

### Modified Capabilities
- `module-federation-runtime`: Expande os requisitos para cobrir os 3 remotes (`storefront`, `checkout`, `account`), contrato das 7 páginas, `ShellContext` e `useSession`, `RemoteBoundary` com retry sem refresh total do shell, `bootstrapStandalone` e verificação estrita de singletons.

## Impact

- **Aplicações afetadas**:
  - `apps/shell` (`flow:shell`, `type:app`): Tabela de rotas completa com guards, `vite.config.ts` com os 3 remotes, injeção de `ShellProvider` no `main.tsx`.
  - `apps/storefront` (`flow:storefront`, `type:app`): Exposição de `HomePage` e `PdpPage` (placeholder).
  - `apps/checkout` (`flow:checkout`, `type:app`): Configuração de Module Federation na porta 4202 e exposição de `CartPage`, `PaymentPage`, `ConfirmationPage` (placeholders).
  - `apps/account` (`flow:account`, `type:app`): Configuração de Module Federation na porta 4203 e exposição de `ProfilePage`, `WalletsPage` (placeholders).
  - `apps/web-e2e` (`flow:shared`, `type:app`): Testes de integração E2E no Playwright para todos os remotes, resiliência a quedas e retry.
- **Bibliotecas afetadas**:
  - `libs/shell-kit` (`flow:shared`, `type:util`): Contrato de tipos, `ShellProvider`, `useShell`, `useSession`, `RemoteBoundary`, `bootstrapStandalone`, verificação de singletons.
- **Documentação**:
  - `docs/federation.md` (novo documento).
  - `ARCHITECTURE.md` (seção 5 atualizada).
- **Sem quebras de retrocompatibilidade**: A arquitetura preserva as conclusões do spike técnico, elevando o escopo experimental para o contrato de produção de todos os remotes.
