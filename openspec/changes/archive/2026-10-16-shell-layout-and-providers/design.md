# Design

## Context

Consolidação de `apps/shell` como aplicação host com arquitetura de Module Federation, TanStack Router e TanStack Query, conforme motivado em `proposal.md`. As implementações anteriores deixaram rotas legadas do spike (`/catalogo`, `/checkout`, `/pedidos/$orderId/confirmacao`), live regions fragmentadas e conexão imediata de socket no login.

## Goals / Non-Goals

**Goals:**
- Estruturar a árvore definitiva de rotas e layouts (`_app` e `_modal`) com centralização de constantes em `@nft/shared-router`.
- Implementar o chrome fiel às referências do Figma nos breakpoints estabelecidos (Desktop >= 1024 px; Mobile < 1024 px incluindo 768 px).
- Garantir singleton de feedback acessível (`ToastProvider` e live regions globais) via `ShellContext`.
- Implementar gerenciamento inteligente do ciclo de vida de conexão do `RealtimeClient` baseado em contagem de referências de subscriptions ativas.
- Prover hooks ergonômicos de extensão para remotes (`usePageChrome`, `useUnavailable`) em `@nft/shell-kit`.

**Non-Goals:**
- Telas reais dos remotes storefront, checkout e account (permanecem placeholders até Etapas 10 a 16).
- Implementação de handlers de eventos WebSocket ou regras de domínio de catálogo em tempo real (Etapa 12).
- Vinculação de `cartCount` com API real ou banco de dados (Etapa 9).

## Decisions

### 1. Rotas Canônicas e Constantes em `@nft/shared-router`
- **Decisão:** A tabela de rotas do host adota estritamente:
  - `/` -> `storefront/HomePage` (`_app`, público)
  - `/nft/$nftId` -> `storefront/PdpPage` (`_app`, público)
  - `/carrinho` -> `checkout/CartPage` (`_app`, público)
  - `/pagamento` -> `checkout/PaymentPage` (`_app`, privado `requireAuth`)
  - `/perfil` -> `account/ProfilePage` (`_app`, privado `requireAuth`)
  - `/carteiras` -> `account/WalletsPage` (`_app`, privado `requireAuth`)
  - `/login` e `/cadastro` -> páginas de autenticação do shell (`_modal`, só visitante)
  - `/pedido/$orderId` -> `checkout/ConfirmationPage` (`_modal`, privado `requireAuth`)
  - `*` -> `NotFoundComponent` (`_app`, público)
- As strings literais de path são exportadas por `@nft/shared-router` como constantes (ex: `ROUTES.HOME`, `ROUTES.PAYMENT`, etc.).
- Rotas antigas (`/catalogo`, `/checkout`, `/pedidos/$orderId/confirmacao`) não terão redirects legados, resultando em 404 determinística.
- *Alternativas consideradas:* Manter aliases/redirecionamentos temporários. Descartado para manter a tabela de rotas limpa e evitar código morto.

### 2. Layouts Estruturais Sem Path (`_app` e `_modal`)
- **Decisão:** Utilização de rotas de layout do TanStack Router:
  - `_app`: Renderiza o Skip Link, Header desktop (>= 1024px) ou SearchBar mobile (< 1024px), container de Breadcrumb, `<main id="main-content" tabIndex={-1}>` com foco automático e scroll restoration, Footer completo e MobileTabBar fixa (< 1024px).
  - `_modal`: Layout focado sem Header, Footer ou TabBar. Renderiza container centralizado em desktop (tela cheia em mobile) sobre fundo decorativo marketplace com `aria-hidden="true"`, sem instanciar a Home real em segundo plano.

### 3. Breakpoint do Chrome em 1024 px
- **Decisão:** A transição entre Chrome Desktop e Chrome Mobile ocorre na largura de 1024 px (`lg:` no Tailwind v4).
  - Viewports desktop (>= 1024 px): Exibe Header completo e Footer; oculta SearchBar mobile e BottomTabBar.
  - Viewports intermediários e mobile (< 1024 px, cobrindo 768 px e 390 px): Exibe SearchBar no topo e BottomTabBar fixa na base. A regra anterior em `docs/design/responsive.md` §2.2 (header compacto com gaveta lateral) é substituída formalmente por esta diretriz uniforme.

### 4. Lupa do Header Desktop como Link Âncora
- **Decisão:** O ícone de lupa no Header desktop (>= 1024 px) é implementado como `<a href="/#busca">` com rótulo acessível `aria-label="Ir para busca de NFTs"`, direcionando para a seção correspondente na Home (que será entregue na Etapa 10), sem campo de input expansível no desktop.
- No Chrome mobile (< 1024 px), a `SearchBar` mantém o campo de busca funcional que submete para `/?q=<termo>`.

### 5. Menu de Usuário Autenticado via `DropdownMenu`
- **Decisão:** Criação do primitivo acessível `DropdownMenu` em `libs/shared/ui` encapsulando `@radix-ui/react-dropdown-menu`.
- O Header renderiza o avatar e nome do usuário como gatilho do menu; ao abrir, disponibiliza navegação por teclado (`Perfil`, `Carteiras`, itens fora de escopo e `Sair`).

### 6. Singleton de Feedback Acessível no Host
- **Decisão:** O host shell monta uma única instância de `ToastProvider` e exatamente duas live regions permanentes:
  - `<div role="status" aria-live="polite" id="shell-live-polite" className="sr-only" />`
  - `<div role="alert" aria-live="assertive" id="shell-live-assertive" className="sr-only" />`
- Expõe no `ShellContextValue`:
  ```ts
  feedback: {
    notify: (options: { message: string; tone?: 'info' | 'success' | 'warning' | 'error'; politeness?: 'polite' | 'assertive' }) => void;
    announce: (message: string, politeness?: 'polite' | 'assertive') => void;
  }
  ```
- Componentes de apresentação em `libs/shared/ui` (ex: `Footer`, `SocialButton`) continuam puros sem dependência de `useShell()`, recebendo `onUnavailable` via props. O shell injeta `useUnavailable().notifyUnavailable` nessas props.

### 7. Tratamento de Ações Fora de Escopo (`useUnavailable`)
- **Decisão:** Criação do hook `useUnavailable` em `libs/shell-kit`:
  - Retorna a função `notifyUnavailable(label?: string)`.
  - Dispara toast informativo e anúncio acessível via `ShellContext.feedback` com a mensagem `"Funcionalidade indisponível nesta demonstração"`.
  - Elementos fora de escopo são renderizados como `<button type="button" aria-disabled="true">` estilizados como links, permanecendo focáveis por teclado.

### 8. Coordenação Dinâmica de Página via `usePageChrome`
- **Decisão:** Hook de contexto em `libs/shell-kit` para comunicação entre páginas (remotes) e o chrome do host:
  - `setBreadcrumbLabel(label: string | null)`: permite que a PDP injete o título do NFT ativo.
  - `setFiltersHandler(fn: (() => void) | null)`: permite que a Home registre o callback para abrir o Drawer de filtros no mobile.
  - Ambos os estados são limpos automaticamente no unmount da página consumidora.

### 9. Ciclo de Vida do Realtime por Contagem de Subscriptions
- **Decisão:** Reformulação do encapsulamento em `libs/shared/realtime`:
  - `createRealtimeClient` retorna um objeto que gerencia internamente uma contagem de subscriptions ativas (`subscriptionCount`).
  - Chamadas a `subscribe(event, handler)` incrementam o contador; ao passar de 0 para 1, conecta o socket caso haja token autenticado.
  - O retorno de `subscribe` é uma função de unsubscription que decrementa o contador; ao atingir 0, chama `disconnect()`.
  - `SessionController` apenas atualiza o token de autenticação e chama `disconnect()` em deslogues e trocas de identidade.

### 10. Sequência Determinística de Bootstrap
- **Decisão:** Ordem estrita no boot de `apps/shell`:
  1. `startMocks()` (se mocks ativados).
  2. Inicialização dos singletons (`queryClient`, `httpClient`, `realtimeClient`).
  3. Resolução da sessão via token persistido (`getSession`), salvando no `sessionController`.
  4. Renderização do `RouterProvider` com `context={{ session }}`.
  - Enquanto a sessão inicial carrega, a área do usuário exibe skeleton com `aria-busy="true"` e guards `requireAuth` aguardam a resolução sem emitir falsos redirecionamentos anônimos.

## Risks / Trade-offs

- [Breakpoint 1024 px diverge do texto de responsive.md §2.2] → Atualizar formalmente `docs/design/responsive.md` e `ARCHITECTURE.md` §19 na mesma change, documentando a decisão aprovada.
- [Header desktop sem busca textual direta] → O link da lupa direciona com âncora `/#busca` para o catálogo da Home; no mobile (< 1024 px), a `SearchBar` executa busca direta por query param.
- [Realtime wrapper altera tipo de RealtimeClient] → Atualizar tipos em `shared-realtime`, `shell-kit` e `auth-feature` de forma coordenada, assegurando retrocompatibilidade onde a assinatura de eventos for consumida.
- [DropdownMenu Radix adicionado a shared-ui] → Manter encapsulamento estrito sem exportar tipos internos do Radix UI.
