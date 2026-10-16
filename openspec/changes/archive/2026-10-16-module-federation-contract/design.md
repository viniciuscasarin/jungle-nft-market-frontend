# Technical Design: Module Federation Contract

## Context

O monorepo Nx contém 4 aplicações React/Vite (`shell`, `storefront`, `checkout`, `account`) e a biblioteca de infraestrutura `@nft/shell-kit`. O spike técnico validou `@module-federation/vite` em um canal preliminar entre `shell` e `storefront`. Para atender ao desafio completo, é necessário formalizar o contrato de produção abrangendo todos os 3 remotes, 7 páginas federadas, injeção de contexto via `ShellContext`, proteção por `RemoteBoundary` resiliente e bootstrap autônomo para desenvolvimento isolado.

## Goals / Non-Goals

**Goals:**
- Configurar `@module-federation/vite` de forma homogênea em `apps/checkout` (4202) e `apps/account` (4203), integrando-os ao `apps/shell` (4200) juntamente com `apps/storefront` (4201).
- Definir contratos de tipos canônicos em `libs/shell-kit` para `RemoteManifest`, `RemotePages` e declarações de módulos (`declare module '<app>/<Page>'`).
- Implementar `ShellProvider` no host fornecendo `QueryClient`, `HttpClient`, `RealtimeClient`, sessão e `navigate`, consumidos por `useShell()` e `useSession()`.
- Centralizar rotas no host (`apps/shell`) com `lazyRouteComponent`, validação de search params via schemas zod de `@nft/shared-contracts` e guard `requireAuth`.
- Implementar `RemoteBoundary` em `shell-kit` com Suspense, skeleton com shimmer (desativando animações sob `prefers-reduced-motion`), timeout configurável e ErrorBoundary com retry sem recarregar o host shell.
- Implementar `bootstrapStandalone` em `shell-kit` permitindo que qualquer remote rode de forma autônoma com providers e router mínimo.
- Garantir verificação estrita de singletons (exatamente 1 instância de cliente e service worker no runtime).
- Documentar em `docs/federation.md` e atualizar `ARCHITECTURE.md`.

**Non-Goals:**
- Telas reais com lógica completa de catálogo, carrinho, checkout ou perfil (usam páginas placeholder que validam o contrato; a lógica de negócio virá nas respectivas changes de domínio).
- Handlers reais de mock MSW (esta change apenas prepara o ponto de extensão assíncrono no bootstrap).

## Decisions

### 1. Configuração Homogênea de Module Federation e Singletons

Configuramos `@module-federation/vite` nos 4 apps com as seguintes diretrizes:
- **Portas Fixas em Dev**:
  - `apps/shell`: `4200`
  - `apps/storefront`: `4201`
  - `apps/checkout`: `4202`
  - `apps/account`: `4203`
- **Resolução de URLs por Ambiente**:
  No host shell, as URLs dos remotes derivam das variáveis de ambiente validadas por `validateEnv()`:
  - `VITE_REMOTE_STOREFRONT_URL` (default dev: `http://localhost:4201/remoteEntry.js`, prod: `/remotes/storefront/remoteEntry.js`)
  - `VITE_REMOTE_CHECKOUT_URL` (default dev: `http://localhost:4202/remoteEntry.js`, prod: `/remotes/checkout/remoteEntry.js`)
  - `VITE_REMOTE_ACCOUNT_URL` (default dev: `http://localhost:4203/remoteEntry.js`, prod: `/remotes/account/remoteEntry.js`)
- **Shared Scope Estrito**:
  Garantia de singleton estrito no host e remotes para:
  `react`, `react-dom`, `@tanstack/react-router`, `@tanstack/react-query`, `socket.io-client`, `@nft/shell-kit` e pacotes `@nft/*`.

*Alternativas descartadas*: Carregamento dinâmico manual via script tag injeção direta sem `@module-federation/vite` foi descartado pois perderia o compartilhamento de runtime e tree-shaking do plugin oficial.

### 2. Contratos Tipados em `libs/shell-kit`

`libs/shell-kit` é o ponto de encontro de contratos entre host e remotes:
- `RemoteManifest`: metadados estáticos do remote (nome, porta, rotas e páginas expostas).
- `RemotePages`: mapeamento estrito das 7 páginas:
  - `storefront`: `HomePage`, `PdpPage`
  - `checkout`: `CartPage`, `PaymentPage`, `ConfirmationPage`
  - `account`: `ProfilePage`, `WalletsPage`
- Arquivo `remote-modules.d.ts`: declaração de tipos ambientais TypeScript para que imports dinâmicos como `import('checkout/CartPage')` tenham tipagem estrita sem gerar erros de compilação.

### 3. Injeção de Contexto (`ShellContext`) e Hooks

O host shell instancia:
- `QueryClient` via `createQueryClient()` de `@nft/shared-query`
- `HttpClient` via `createHttpClient()` de `@nft/shared-http`
- `RealtimeClient` via `createRealtimeClient()` de `@nft/shared-realtime`
- Estado de sessão `ShellUserSession | null`

Essas instâncias são envolvidas no `ShellProvider`. Os remotes nunca instanciam clientes ou service workers: eles consomem as instâncias por `useShell()` e `useSession()`. Se `useShell()` for chamado fora do provider, um erro explícito e descritivo é disparado.

### 4. Resiliência e Retry no `RemoteBoundary`

O componente `RemoteBoundary` encapsula a carga assíncrona de páginas federadas:
```tsx
<RemoteBoundary timeoutMs={10000} fallback={<PageSkeleton />}>
  <LazyRemotePage />
</RemoteBoundary>
```

- **Suspense com Shimmer**: Renderiza um skeleton preservando o layout da tela. Em `@media (prefers-reduced-motion: reduce)`, a animação shimmer de gradiente é congelada em opacidade estática.
- **Timeout**: Promessa de carregamento envelopada com `Promise.race` contra um temporizador rejeitável.
- **Retry sem Refresh**: O ErrorBoundary armazena uma chave de montagem (`retryKey`). Ao clicar em "Tentar Novamente", o ErrorBoundary redefine seu estado e incrementa a chave, forçando a re-execução da importação dinâmica no TanStack Router sem dar F5 na janela inteira, preservando o estado do shell (header, busca, carrinho e sessão).

### 5. Roteamento Centralizado no Host (`apps/shell`)

O TanStack Router centraliza a tabela de rotas com `createRoute`:
- `/` e `/catalogo`: `storefront/HomePage` com validação de `CatalogSearchParamsSchema`
- `/nft/$nftId`: `storefront/PdpPage`
- `/carrinho`: `checkout/CartPage` com validação de `CartSearchParamsSchema`
- `/checkout`: `checkout/PaymentPage` com validação de `CheckoutSearchParamsSchema` e `beforeLoad: requireAuth`
- `/pedidos/$orderId/confirmacao`: `checkout/ConfirmationPage` com `beforeLoad: requireAuth`
- `/perfil`: `account/ProfilePage` com `beforeLoad: requireAuth`
- `/carteiras`: `account/WalletsPage` com `beforeLoad: requireAuth`
- `*`: `NotFoundComponent` acessível

`requireAuth` inspeciona o contexto da sessão; se for nula, emite `throw redirect({ to: '/login', search: { redirect: location.href } })`.

### 6. Execução Autônoma via `bootstrapStandalone`

Para permitir o desenvolvimento isolado (`pnpm dev:storefront`, etc.):
```typescript
export function bootstrapStandalone(
  component: React.ComponentType,
  config?: StandaloneBootstrapConfig
): void
```
- Monta a página com `createRoot` no elemento `#root`.
- Envolve o componente com `ShellProvider` fornecendo instâncias de desenvolvimento locais simuladas.
- Cria um TanStack Router mínimo para que links e hooks de roteamento funcionem sem falhas.
- Fornece hook assíncrono para inicialização de MSW quando `VITE_ENABLE_MOCKS=true`.

### 7. Verificação de Singletons no Runtime

Implementamos em `libs/shell-kit/src/singleton-registry.ts`:
- Uso de `Symbol.for('nft.singleton.registry')` anexado a `globalThis`.
- Registro estrito com método `assertSingleton(key, instance)`.
- Teste unitário e teste de integração no Playwright que assere que `QueryClient`, `HttpClient`, `RealtimeClient` e service worker possuem no máximo 1 instância ativa.

## Risks / Trade-offs

| Risco | Mitigação |
|---|---|
| Módulo remoto travar o carregamento indefinidamente (queda silenciosa de rede) | `RemoteBoundary` com timeout configurável (10s por padrão), abortando a espera e disparando o ErrorState acessível com retry. |
| Browser reter a rejeição do dynamic import em cache ao clicar em retry | Envelopar o loader com gerador dinâmico de promise ou reset do TanStack Router, permitindo que novas tentativas de requisição HTTP sejam feitas ao servidor. |
| Inconsistência de caminhos estáticos em produção (`/assets/...` vs `/remotes/...`) | `base: isProduction ? '/remotes/<app>/' : '/'` configurado em todos os remotes, comprovado pelo preview server com roteamento e SPA fallback. |
| Remotes criando conexões Socket.IO ou QueryClients secundários | Bloqueio arquitetural via ESLint e asserção automática em tempo de execução via `singleton-registry`. |

## Migration Plan

1. Definir contratos, tipos e `RemoteBoundary` em `libs/shell-kit`.
2. Configurar `@module-federation/vite` em `apps/checkout` e `apps/account` e atualizar `apps/storefront` e `apps/shell`.
3. Criar páginas placeholder nos 3 remotes expostas em seus respectivos `remoteEntry.js`.
4. Atualizar rotas, guards e injeção de contexto no `apps/shell`.
5. Implementar `bootstrapStandalone` e conectar aos pontos de entrada dos remotes.
6. Executar build consolidado e testes unitários e E2E.
7. Escrever `docs/federation.md` e atualizar `ARCHITECTURE.md`.
