# Proposal

## Why

O `apps/shell` ainda carrega a estrutura provisória do spike de federation: paths divergentes do Figma e do ARCHITECTURE §18 (`/catalogo`, `/checkout`, `/pedidos/$orderId/confirmacao`), um único layout em que login herda o Header, Footer e 404 com cores literais, live regions espalhadas por libs e um `RealtimeClient` que conecta no login mesmo sem nenhum assinante. Antes das telas reais (Etapas 10 a 16), o host precisa entregar a estrutura final: árvore de rotas, chrome fiel ao Figma, feedback acessível centralizado e ciclo de vida de clientes, para que os remotes apenas preencham páginas.

## What Changes

- **BREAKING** Tabela de rotas final no host com constantes em `shared/router`: `/` (HomePage), `/nft/$nftId`, `/carrinho` (público), `/pagamento`, `/perfil`, `/carteiras` (privados), `/login` e `/cadastro` (só visitante), `/pedido/$orderId` (privado) e `*` (404). Os paths `/catalogo`, `/checkout` e `/pedidos/$orderId/confirmacao` são removidos **sem redirect** (passam a cair na 404). `REMOTE_MANIFESTS` é atualizado.
- Duas rotas de layout sem path: `_app` (chrome completo) e `_modal` (sem chrome, fundo decorativo `aria-hidden`), com `staticData` (`title`, `breadcrumb`, item de navegação ativo) por rota.
- Search params por rota validados com os schemas de `shared/contracts` e `redirect` sanitizado, com parse tolerante.
- Chrome responsivo: desktop a partir de **1024 px** (Header completo), abaixo disso SearchBar + BottomTabBar (768 px usa o chrome mobile). Breadcrumb a partir do `staticData`, Footer de `shared/ui`.
- **BREAKING (shared-ui)** Header: a lupa vira `<a href>` para a âncora da listagem da Home (`/#busca`, constante em `shared/router`; a seção é entregue na Etapa 10); carrinho vira link para `/carrinho`; `cartCount` opcional e oculto quando `undefined`; menu do usuário com Radix DropdownMenu (novo primitivo em `shared/ui`); `onSearchClick`/`onSearchSubmit` removidos. A busca com envio (`/?q=`) existe apenas na SearchBar mobile.
- `useUnavailable()` em `shell-kit`: ações fora de escopo visíveis como `<button type="button" aria-disabled="true">` com aparência de link, que avisam "indisponível nesta demonstração" e nunca aparentam sucesso. Componentes de `shared/ui` recebem `onUnavailable` por prop.
- Feedback acessível centralizado: `ToastProvider` e duas live regions globais (`polite`, `assertive`) únicas por runtime, expostas como `feedback` em `ShellContext`. Live regions locais de auth, Footer e SocialButton migram para ele.
- `usePageChrome()` em `shell-kit`: `setBreadcrumbLabel` e `setFiltersHandler`, limpos no unmount.
- Acessibilidade de rota: skip link, landmarks, foco no `main` e anúncio do título a cada navegação, `document.title` do `staticData`, restauração de scroll, `aria-current="page"`.
- `RemoteBoundary` dentro do layout por rota, retry só do remote, preload de `remoteEntry` por intenção nos links do chrome.
- `NotFound` e `RootErrorBoundary` com tokens, ErrorState e `noindex`.
- Boot `mocks → clientes → sessão → router`, área do usuário em skeleton com `aria-busy` enquanto a sessão resolve, rotas privadas só após a resolução.
- **BREAKING (shared-realtime)** `RealtimeClient` deixa de ser o `Socket` cru: passa a ser um wrapper que conecta na primeira `subscribe` com sessão ativa e desconecta ao zerar as subscriptions ou no logout. `SessionController` só chama `disconnect()` em transições de usuário.
- Metadados e SEO: `lang="pt-BR"`, `meta description`, `viewport`, `theme-color`, favicon, `robots.txt`, `<title>` por rota, console limpo no cenário `default`.
- Stories, testes Vitest e Playwright (390, 768, 1440) e documentação (`docs/federation.md`, `docs/design/responsive.md`, `docs/design/fidelity-notes.md`, ARCHITECTURE §5, §14, §18, §19, tabela de rotas).

## Capabilities

### New Capabilities
- `shell-routing`: árvore de rotas do host, layouts `_app`/`_modal`, guards de acesso, search params, 404, erro raiz e acessibilidade de navegação (foco, título, scroll, preload).
- `shell-chrome`: composição responsiva do chrome (Header, SearchBar, BottomTabBar, Breadcrumb, Footer), breakpoint de 1024 px, `usePageChrome` e ações fora de escopo via `useUnavailable`.
- `shell-feedback`: toast e live regions globais únicas por runtime, expostas por `ShellContext.feedback`.
- `realtime-connection-lifecycle`: conexão do socket governada por contagem de subscriptions e pela sessão.
- `shell-bootstrap`: ordem de boot, estado de sessão em carregamento e metadados/SEO do documento.

### Modified Capabilities
- `module-federation-runtime`: cenários de rota passam aos novos paths; `RemoteBoundary` fica dentro do layout; `ShellContext` ganha `feedback` e o `RealtimeClient` com contagem de subscriptions.
- `design-system-ui`: Header oculto abaixo de 1024 px (`lg`), lupa como link de âncora, carrinho como link, `cartCount` opcional, menu do usuário; newsletter e SocialButton delegam o aviso a `onUnavailable` sem confirmar inscrição; DropdownMenu entra nos primitivos.
- `user-auth-and-session`: troca de usuário desconecta o socket em vez de reconectá-lo diretamente; exemplos de redirect usam `/pagamento`; anúncios usam o `feedback` do shell.

## Impact

Projetos Nx afetados (tags):
- `apps/shell` (`scope:shell,type:app,flow:shell`): rotas, layouts, providers, boot, `index.html`, `public/robots.txt`.
- `libs/shell-kit` (`scope:shell-kit,type:util,flow:shared`): `feedback`, `useUnavailable`, `usePageChrome`, contrato `ShellContextValue`, `REMOTE_MANIFESTS`, teste de singleton.
- `libs/shared/router` (`scope:shared,type:util,flow:shared`): constantes de path e âncoras.
- `libs/shared/realtime` (`scope:shared,type:util,flow:shared`): wrapper com contagem de subscriptions.
- `libs/shared/ui` (`scope:shared,type:ui,flow:shared`): Header, MobileTabBar, Footer, SocialButton, DropdownMenu, stories.
- `libs/auth/feature` (`scope:auth,type:feature,flow:shell`): `SessionController`, anúncios migrados, layout de modal.
- `apps/storefront`, `apps/checkout`, `apps/account`: apenas ajustes de `bootstrapStandalone` ao novo contrato (páginas seguem placeholders).
- `apps/web-e2e` (`scope:web-e2e,type:app,flow:shell`) e `apps/storybook` (`scope:tooling,type:app,flow:tooling`).

Premissas (também registradas em ARCHITECTURE.md):
- Paths do prompt prevalecem sobre os do spike; paths antigos não recebem redirect.
- Não há frame de tablet: chrome desktop a partir de 1024 px substitui a regra de header compacto com gaveta de `responsive.md` §2.2.
- A lupa do desktop é âncora (`/#busca`), sem campo de busca; o alvo é entregue na Etapa 10.
- O Figma é consultado com `get_figma_data` (Framelink MCP), equivalente ao `get_design_context` citado no prompt.
- Itens da BottomTabBar são lidos do frame `14:5226`; item sem rota vira ação fora de escopo.

Fora de escopo: telas reais dos remotes (Etapas 10 a 16), ligação de `cartCount` aos dados (Etapa 9), eventos de tempo real (Etapa 12), blog, promos e a seção de busca da Home (Etapa 10).
