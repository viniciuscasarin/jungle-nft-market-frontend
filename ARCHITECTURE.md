# ARCHITECTURE

Marketplace de NFTs em React + TypeScript, com backend 100% simulado (MSW). Este documento registra as decisões de arquitetura, as políticas de estado e as limitações da entrega. Seções marcadas com `[PREENCHER]` dependem da implementação e devem ser completadas ao final de cada change.

## 1. Objetivos e restrições

- Fluxos de descoberta, compra e conta do colecionador, em desktop e mobile.
- Stack obrigatória com uso efetivo: React, TypeScript, TanStack Router, TanStack Query, Axios, Socket.IO, Tailwind, shadcn/ui, MSW, Playwright, Lighthouse.
- Mocks apenas na camada de rede. Componentes, hooks e cliente Axios não contêm respostas fictícias.
- Tempo real passa sempre pelo `socket.io-client`. Nunca por setters ou cache direto.
- Fora de escopo: blockchain, extensões de carteira e gateways reais; páginas editoriais, suporte, atividade, ofertas e downloads.

## 2. Decisões de arquitetura

| # | Decisão | Motivo |
|---|---|---|
| 1 | Monorepo Nx único, pnpm | Um checkout, um lockfile, um CI, um deploy. Atende "checkout limpo". |
| 2 | Fluxos como apps isolados (shell, storefront, checkout, account) integrados por `@module-federation/vite` (v1.23.5) | Isolamento de fluxo e fronteiras explícitas validadas empiricamente no spike de Module Federation ([docs/spikes/module-federation.md](docs/spikes/module-federation.md)). |
| 3 | Host é dono de rotas, guards, sessão, MSW, QueryClient, HttpClient e RealtimeClient | Evita instâncias duplicadas, que quebrariam isolamento de usuário e tempo real. |
| 4 | Domínios em 4 camadas: `domain`, `data-access`, `feature`, `ui` | Regras puras separadas de I/O e de apresentação. |
| 5 | Terceiros encapsulados em libs `shared/*` | Troca de biblioteca localizada; reforço por lint. |
| 6 | Contratos zod em `shared/contracts` como fonte única de verdade | Mocks, data-access e UI compartilham os mesmos tipos. |
| 7 | ETH como string decimal, aritmética só em `shared/money` | Precisão exigida pelo desafio. |
| 8 | Rotas code-based no TanStack Router | Tabela de rotas centralizada no host, sem geração de arquivos entre bundles. |
| 9 | Libs consumidas por path alias, sem publicação | Menos custo de release; um único build. |

## 3. Topologia

```
apps/
  shell/        host: layout, providers, rotas, guards, MSW, realtime, sessão, login, cadastro (porta 4200)
  storefront/   remote: Home (catálogo) e PDP (porta 4201)
  checkout/     remote: Carrinho, Pagamento e Confirmação (porta 4202)
  account/      remote: Perfil e Carteiras (porta 4203)
  web-e2e/      Playwright sobre o sistema integrado
libs/
  shared/{contracts,money,http,query,router,realtime,ui,testing} (8 libs)
  shell-kit/    ShellContext, bootstrapStandalone, contrato de remotes
  mocks/{core,fixtures,handlers,socket} (4 libs)
  {auth,catalog,favorites,cart,checkout,orders,profile,wallets}/{domain,data-access,feature,ui} (32 libs)
```

### Inventário de Projetos Nx (51 projetos)

- **Aplicações (6)**:
  - `shell`: Host na porta `4200`, gerenciador de rotas, providers e sessão.
  - `storefront`: Remote na porta `4201`, catálogo e PDP.
  - `checkout`: Remote na porta `4202`, carrinho e checkout.
  - `account`: Remote na porta `4203`, perfil e carteiras.
  - `storybook`: Catálogo de componentes isolados na porta `6006` com tag `flow:tooling`.
  - `web-e2e`: Testes de integração e regressão visual com Playwright.
- **Bibliotecas Compartilhadas (8)**:
  - `@nft/shared-contracts`: Schemas zod, DTOs e validação de runtime de env vars.
  - `@nft/shared-money`: Operações e formatação de ETH em strings decimais via decimal.js.
  - `@nft/shared-http`: Wrapper tipado de Axios com normalização de `ApiError`.
  - `@nft/shared-query`: Configuração central do TanStack Query e query key factories.
  - `@nft/shared-router`: Abstração do TanStack Router.
  - `@nft/shared-realtime`: Wrapper tipado de Socket.IO client.
  - `@nft/shared-ui`: Design system, primitivos Radix UI e tokens Tailwind v4.
  - `@nft/shared-testing`: Utilitários de teste e asserções automatizadas de fronteiras arquiteturais.
- **Host Kit (1)**:
  - `@nft/shell-kit`: ShellContext, utilitários de remote e bootstrap standalone.
- **Mocks (4)**:
  - `@nft/mocks-core`: Estado reativo simulado em memória.
  - `@nft/mocks-fixtures`: Fixtures tipadas de NFTs, usuários e pedidos.
  - `@nft/mocks-handlers`: Handlers REST MSW interceptando requisições.
  - `@nft/mocks-socket`: Simulação do canal de eventos Socket.IO.
- **Domínios (32 libs em 8 domínios e 4 camadas)**:
  - `auth`: `auth-domain`, `auth-data-access`, `auth-feature`, `auth-ui`
  - `catalog`: `catalog-domain`, `catalog-data-access`, `catalog-feature`, `catalog-ui`
  - `favorites`: `favorites-domain`, `favorites-data-access`, `favorites-feature`, `favorites-ui`
  - `cart`: `cart-domain`, `cart-data-access`, `cart-feature`, `cart-ui`
  - `checkout`: `checkout-domain`, `checkout-data-access`, `checkout-feature`, `checkout-ui`
  - `orders`: `orders-domain`, `orders-data-access`, `orders-feature`, `orders-ui`
  - `profile`: `profile-domain`, `profile-data-access`, `profile-feature`, `profile-ui`
  - `wallets`: `wallets-domain`, `wallets-data-access`, `wallets-feature`, `wallets-ui`

| App | Páginas | Domínios consumidos |
|---|---|---|
| shell | Login, Cadastro, 404, layout | auth, cart (contador no header) |
| storefront | Home, PDP | catalog, favorites, cart/data-access |
| checkout | Carrinho, Pagamento, Confirmação | cart, checkout, orders, wallets/data-access |
| account | Perfil, Carteiras | profile, wallets |

## 4. Fronteiras de módulo

Tags: `scope:*` (domínio), `type:*` (app, feature, ui, data-access, domain, util, mocks) e `flow:*` (shell, storefront, checkout, account, shared). Aplicadas com `@nx/enforce-module-boundaries`.

- `domain` depende só de `shared/contracts` e `shared/money`.
- `ui` depende só de `shared/ui` e `domain`.
- `data-access` depende de `shared/http`, `shared/query`, `shared/contracts` e `domain`.
- `feature` depende das camadas do próprio scope, de `shared/*`, `shell-kit` e do `index.ts` público de outros scopes.
- Apps nunca importam outros apps.
- `feature` e `ui` com `flow:X` só são importáveis por `apps/X`. `domain` e `data-access` são compartilháveis.
- `mocks/*` só é importável por `apps/shell`, `shell-kit` e `apps/web-e2e`.
- Sem imports circulares e sem deep imports. Cada lib expõe apenas `index.ts`.

### Encapsulamento de terceiros

| Biblioteca | Único local permitido |
|---|---|
| `axios` | `shared/http` |
| `socket.io-client` | `shared/realtime` |
| `decimal.js` | `shared/money` |
| `@radix-ui/*` e primitivos shadcn | `shared/ui` |
| `msw`, `@mswjs/socket.io-binding` | `mocks/*`, `shell-kit`, `web-e2e` |
| `@tanstack/react-query` | `shared/query`, `data-access`, `feature` |

Violações falham no lint (`no-restricted-imports`).

## 5. Module Federation

A infraestrutura e viabilidade técnica foram comprovadas e validadas empiricamente no spike documentado em [`docs/spikes/module-federation.md`](docs/spikes/module-federation.md) com decisão formal de **GO**.

- **Biblioteca e Runtime:** `@module-federation/vite` (v1.23.5) integrado ao Vite 6.2, React 19.0, TanStack Router 1.114 e Tailwind CSS v4.
- **Contrato de Exposição:** Remotes expõem apenas componentes de página: `HomePage`, `PdpPage`, `CartPage`, `PaymentPage`, `ConfirmationPage`, `ProfilePage`, `WalletsPage`.
- **Roteamento e Governança:** O host shell (`apps/shell`) é proprietário único da tabela de rotas, dos guards `requireAuth` e dos schemas de validação de search params (em `shared/contracts`). Páginas remotas são consumidas de forma preguiçosa via `lazyRouteComponent(() => import('remote/Page'))`.
- **Singletons Estritos:** `react`, `react-dom`, `@tanstack/react-router`, `@tanstack/react-query` e pacotes compartilhados do workspace (`@nft/shell-kit`) são configurados como singletons estritos (`singleton: true`, `requiredVersion` explícito e `eager: true` no host).
- **Garantia de Instância Única (`singletonProbe`):** Implementada em `@nft/shell-kit/singleton-probe` com identificador global `Symbol.for('nft.singleton.probe')` e fallback em `globalThis`, garantindo que múltiplas cargas de chunks reutilizem a mesma instância em memória (comprovado com contagem sequencial Shell=1, Storefront=2).
- **Injeção de Contexto (`ShellContext`):** O host injeta `QueryClient`, `HttpClient`, `RealtimeClient`, sessão e `navigate` por `ShellContext` (`shell-kit`). Remotes atuam puramente como consumidores e nunca criam clientes ou service workers duplicados.
- **Resiliência a Falhas do Remote (`RemoteErrorComponent` / `RemoteBoundary`):** Rota encapsulada com captura de falha de dynamic import, exibindo estado de erro acessível (`role="alert"`, `aria-live="assertive"`, botão de retry e link para Home), mantendo cabeçalho, navegação e rodapé do shell operacionais mesmo se o remote estiver indisponível.
- **Centralização de Estilos Tailwind v4:** O compilador do host escaneia os arquivos fonte do remote através da diretiva `@source "../../storefront/src"` em `apps/shell/src/styles.css`. O componente exposto pelo remote não injeta folhas de estilo duplicadas no `<head>`. Para desenvolvimento isolado (`pnpm dev:storefront`), o remote possui seu próprio `styles.css`.
- **Resolução Dinâmica e Build Consolidado:**
  - Desenvolvimento: `http://localhost:4201/remoteEntry.js` (com `server.origin` e `cors: true`).
  - Produção / Preview: `/remotes/storefront/remoteEntry.js` com `base: '/remotes/storefront/'`.
  - Servidor de preview com SPA fallback para `/index.html` e políticas de cache estritas: `Cache-Control: public, max-age=0, must-revalidate` para `remoteEntry.js` e `Cache-Control: public, max-age=31536000, immutable` para chunks com hash sob `/assets/`.
- **Execução Standalone:** `bootstrapStandalone(page)` roda um remote isolado em dev, com MSW e providers, reutilizando o código do host.

## 6. Contratos REST e eventos

Documentação completa (método, path, request, response, erros e payloads) em [`docs/contracts.md`](docs/contracts.md). Os schemas zod em `@nft/shared-contracts` são a fonte única da verdade; a documentação deriva integralmente deles. Fixtures canônicas tipadas são exportadas em `@nft/shared-contracts/fixtures` para reutilização em testes e mocks.

| Recurso | Operações | Schemas Chave |
|---|---|---|
| Sessão e conta | cadastro, login, consulta da sessão, logout, expiração | `SignUpInputSchema`, `SignInInputSchema`, `SessionSchema`, `UserSchema` |
| NFTs | listagem (busca, filtros, ordenação, paginação) e detalhe | `NftItemSchema`, `NftEditionSchema`, `NftRatingSchema`, `NftListQuerySchema` |
| Avaliações | listagem pública e somente leitura (notas 1 a 5 inteiras) | `ReviewSchema`, `ReviewListQuerySchema`, `ReviewListResponseSchema` |
| Favoritos | consulta, inclusão, remoção | `FavoritesResponseSchema` |
| Carrinho | consulta, inclusão, alteração, remoção de itens | `CartItemSchema`, `CartSchema`, `AddToCartInputSchema`, `UpdateCartItemInputSchema` |
| Cotação | cupom, disponibilidade, descontos, taxas, total | `QuoteSchema`, `QuoteCouponSchema`, `ItemAvailabilitySchema`, `CreateQuoteInputSchema` |
| Pedidos | criação idempotente, consulta de estado e recibo imutável | `OrderSchema`, `CollectorSchema`, `OrderReceiptSnapshotSchema`, `CreateOrderInputSchema` |
| Perfil | consulta, atualização de dados e avatar, troca de senha | `ProfileSchema`, `UpdateProfileInputSchema`, `ChangePasswordInputSchema` |
| Carteiras | consulta, cadastro, atualização (principal e secundária) | `WalletSchema`, `UserWalletsSchema`, `CreateWalletInputSchema` |
| Search Params | parsing tolerante de URLs com fallback determinístico | `CatalogSearchParamsSchema`, `CartSearchParamsSchema`, `CheckoutSearchParamsSchema` |

### Erros

Toda falha é normalizada em `ApiError` (`code`, `message`, `fieldErrors?`, `details?`, `retryable`). Códigos padronizados em `ApiErrorCode`: `VALIDATION_ERROR`, `UNAUTHENTICATED`, `SESSION_EXPIRED`, `FORBIDDEN`, `NOT_FOUND`, `CONFLICT`, `AVAILABILITY_CONFLICT`, `PRICE_CHANGED`, `IDEMPOTENCY_CONFLICT`, `TRANSIENT`, `NETWORK_ERROR`, `UNKNOWN_ERROR`. Falha de rede e timeout viram `TRANSIENT` ou `NETWORK_ERROR` com `retryable=true`.

### Eventos Socket.IO

Envelope padronizado (`RealtimeEnvelopeSchema`) modelado como união discriminada por `type`:
- `nft.updated` (`NftUpdatedEnvelopeSchema`): `{ id, type: 'nft.updated', resource: 'nft', resourceId, version, timestamp, payload: { nftId, editionId?, price?, availableSupply?, maxSupply? } }`.
- `order.updated` (`OrderUpdatedEnvelopeSchema`): `{ id, type: 'order.updated', resource: 'order', resourceId, version, timestamp, userId, payload: { orderId, userId, status, transactionHash?, confirmedAt?, rejectionReason? } }`.

Helpers puros em `@nft/shared-contracts`:
- `isDuplicate(incoming, existingListOrSet)`: deduplica eventos por `id`.
- `isStale(incomingVersion, currentVersion)`: descarta eventos onde `version <= currentVersion`.

Todo recurso carrega `version` inteira e monotônica.

## 7. Dinheiro

- Implementado em `@nft/shared-money` com tipo opaco branded `EthAmount` e erro customizado `InvalidEthAmountError`.
- Encapsulamento estrito: `decimal.js` é configurado internamente com precisão 36 e `ROUND_HALF_UP`, e **nunca** vaza tipos públicos para fora da lib.
- Funções puras: `parse`, `add`, `sub`, `mul(amount, intQty)`, `percent`, `sum`, `compare`, `isZero`, `format`, `toApi`.
- Rejeição estrita de tipos `number`, strings vazias, caracteres malformados e notação científica (`1e-18`).
- Quantidades são estritamente inteiras.
- Formatação pt-BR com separador de milhar (.) e decimal (,), com casas decimais configuráveis, aplicada apenas na camada de apresentação.
- A cotação da API (`/api/quote`) é a única referência para finalizar o pedido. O cliente nunca recalcula totais para enviar.

## 8. Sessão

- Cadastro, login, logout e consulta de sessão via API simulada. Senhas nunca em claro: o mock guarda hash e o cliente não persiste senha.
- Token opaco de sessão guardado no cliente e enviado no `Authorization`. A sessão é recuperada no boot por `GET /session`.
- Rotas privadas (checkout, perfil, carteiras, favoritos, pedidos) usam `requireAuth`, que redireciona para `/login` com `redirect` (path + search) para retorno ao fluxo anterior.
- Expiração: `SESSION_EXPIRED` dispara `onSessionExpired` uma única vez, mesmo com requisições concorrentes. O contexto (rota, search params e rascunho do checkout) é preservado para retomada após novo login.
- Logout e troca de usuário: limpam o cache privado, cancelam queries, encerram o socket e liberam subscriptions.

## 9. Carrinho

- O servidor (mock) é a fonte de verdade. O cliente não guarda itens em estado próprio fora do cache do TanStack Query.
- Visitante: carrinho associado a um identificador anônimo enviado em header. No login, o servidor mescla o carrinho anônimo ao do usuário (soma limitada à disponibilidade por NFT e edição).
- Persistência após refresh vem do servidor simulado, que persiste localmente.
- Item identificado por `nftId` + edição, com quantidade inteira limitada à disponibilidade.
- Totais (subtotal, desconto, taxa de rede, total) vêm da cotação da API, nunca calculados na UI.
- Alterações de preço ou disponibilidade recebidas por `nft.updated` invalidam a cotação, exibem aviso acessível e atualizam o resumo.
- Após compra confirmada, o servidor remove do carrinho apenas itens e quantidades comprados.

## 10. Estratégia de cache (TanStack Query)

Detalhe em [`docs/cache-policy.md`](docs/cache-policy.md). Resumo da política:

- Query keys tipadas por factory. Recursos privados exigem `userId` na chave e incluem todos os parâmetros da consulta.
- `retry` apenas para GET e erros `retryable`, com backoff exponencial e teto. Mutations de pedido nunca têm retry automático.
- `refetchOnReconnect` ativo.
- Respostas obsoletas descartadas por `AbortSignal` e chave por parâmetros; `placeholderData` controlado para paginação.
- Invalidação após mutation e após evento de tempo real, restrita ao recurso afetado.
- Atualização otimista com rollback em favoritos; em caso de falha o estado anterior é restaurado e o erro é anunciado.
- `clearPrivateCache` no logout e na troca de usuário.

| Recurso | staleTime | Observação |
|---|---|---|
| Catálogo e detalhe | `[PREENCHER]` | Atualizado também por `nft.updated` |
| Carrinho e cotação | `[PREENCHER]` | Invalidado por mutation e por evento |
| Pedido | `[PREENCHER]` | Estados terminais não refazem polling |
| Perfil e carteiras | `[PREENCHER]` | Invalidação após mutation |

## 11. Tempo real e reconciliação com REST

- Cliente criado por factory em `shared/realtime` e instanciado pelo host. Estados de conexão: `connecting`, `connected`, `reconnecting`, `disconnected`.
- Deduplicação por `event.id`.
- Descarte de evento com `version` menor ou igual à última aplicada para o mesmo recurso. Estado mais recente nunca regride e efeitos não são reaplicados.
- Descarte de eventos de outro `userId` e de sessão anterior.
- Eventos atualizam o cache via invalidação ou escrita guiada pelo payload versionado; o REST é a referência em caso de dúvida.
- Após reconexão, os recursos ativos (catálogo visível, detalhe, carrinho, cotação e pedido pendente) são reconciliados com o REST.
- Subscriptions e listeners são liberados ao fim do ciclo de vida do componente e no logout.

## 12. Pedidos e idempotência

- Estados: `pending`, `confirmed`, `rejected`. `confirmed` e `rejected` são terminais.
- Antes de confirmar, o checkout revalida preço, disponibilidade, cupom e taxas. Qualquer mudança exige nova confirmação do usuário.
- Criação com header `Idempotency-Key`, gerada por tentativa de compra e mantida em refresh e reenvio. Mesma chave com mesmo conteúdo recupera o mesmo pedido; mesma chave com conteúdo diferente retorna `IDEMPOTENCY_CONFLICT`.
- Botão de envio bloqueado durante a mutation, para evitar cliques repetidos.
- Timeout após criação: o cliente reconsulta o pedido pela chave, sem criar outro.
- Pedido pendente é recuperado após refresh ou reconexão (identificador persistido e reconciliação por REST).
- A tela de confirmação só renderiza para pedido `confirmed`. Recusa preserva os itens no carrinho.
- O recibo reproduz o snapshot imutável do pedido (itens, preços, taxas, total, txHash simulado, explorerUrl, rede, carteira). Mudanças posteriores no catálogo não o alteram.

## 13. Mocking (MSW)

- Handlers por domínio em `mocks/handlers`, banco em memória com persistência local em `mocks/core`, fixtures em `mocks/fixtures`.
- Estado consistente entre catálogo, favoritos, carrinho, perfil, carteiras e pedidos. Mudanças refletem em REST e em eventos.
- Reset restaura integralmente o cenário conhecido.
- Ativado por `VITE_ENABLE_MOCKS`, disponível no build de demonstração. Cenário padrão por `VITE_DEFAULT_SCENARIO`, selecionável em runtime.
- Condições de rede configuráveis e reproduzíveis: lentidão, latência variável, timeout, queda de conexão, respostas 4xx/5xx.
- Fixtures: variedade para filtros e paginação, ao menos dois usuários e cenários determinísticos para sucesso e vazio, latência variável e respostas fora de ordem, falhas de conexão e HTTP, sessão expirada e acesso não autorizado, conflito de cadastro e validação, cupom inválido ou expirado, preço alterado ou esgotamento durante a compra, timeout após criação do pedido, pagamento confirmado e recusado.

### Socket.IO simulado

- Transporte: `@mswjs/socket.io-binding` sobre a interceptação de WebSocket do MSW. O `socket.io-client` real conecta no mock.
- Limitações `[PREENCHER na implementação]`: esperado o uso apenas do transporte WebSocket (sem long-polling), cobertura de recursos do protocolo limitada ao que a binding suporta, e o servidor simulado vive no navegador (ou no processo de teste), sem broadcast entre abas além do que a persistência local permitir.
- Eventos são disparados pelo mesmo estado que atende o REST, por mutações do mock ou por controles de cenário. Nunca pelo cliente de UI.

## 14. Interface, acessibilidade e performance

- **Tokens e Tailwind v4 CSS-First**: Tokens do Figma extraídos em `design/tokens/tokens.json` são compilados via `pnpm design:tokens` (`scripts/generate-tokens.js`) para a sintaxe `@theme` do Tailwind v4 em `libs/shared/ui/src/styles/theme.css`. O host (`apps/shell`) importa esse CSS uma única vez; remotes standalone o importam apenas no bootstrap standalone via `@nft/shell-kit`.
- **Biblioteca `@nft/shared-ui`**: Estruturada modularmente em primitivos Radix UI encapsulados (`components/primitives`), estruturas globais de layout (`components/layout`), componentes ricos de catálogo e conta (`components/widgets`) e 35 componentes de ícones SVG nomeados individuais com suporte completo a tree-shaking (`icons/`). Nenhuma classe de cor hexadecimal literal é permitida fora dos tokens, com teste automatizado bloqueante.
- **Storybook (`apps/storybook`)**: Aplicação isolada na porta 6006 com builder `@storybook/react-vite`, tag `flow:tooling`, suporte a dark mode `ink`, viewports de referência (390, 768 e 1440), toggle de acessibilidade para `prefers-reduced-motion`, addon `@storybook/addon-a11y` (violações tratadas como erro bloqueante), `@storybook/addon-designs` e 5 páginas Foundations em MDX geradas dos tokens (`Cores`, `Tipografia`, `Espaçamento`, `Raios`, `Sombras`).
- **Notas de Fidelidade e Tolerâncias**: Catálogo minucioso de alinhamento visual, tolerâncias de subpixel/1px, regras de arredondamento de bordas e especificação de estados não desenhados documentados em `docs/design/fidelity-notes.md`.
- **Fontes e Assets Self-Hosted**: Família Roboto Mono baixada e servida localmente (`design/fonts/`) nos pesos 400, 500 e 700 em `.woff2` com `font-display: swap` e preload crítico no `index.html` do host.
- **Skeleton Shimmer**: Gradiente animado em catálogo, detalhe e carrinho preservando dimensões fixas contra CLS (Cumulative Layout Shift) e desativado sob `@media (prefers-reduced-motion: reduce)`.
- **Acessibilidade (WCAG 2.1 AA)**: Teclado e foco visível com anel unificado `ring-2 ring-primary ring-offset-2 ring-offset-ink` (6.85:1 sobre `ink`), token de demarcação `color.border.accessible` (`#8a583e`, 3.4:1), focus trap e retorno de foco em Dialog e Drawer, labels e erros associados por `aria-describedby` e `aria-invalid`, live regions para feedback de ações assíncronas, e avisos explícitos para ações fora de escopo ("Funcionalidade indisponível nesta demonstração").
- **Viewports de referência**: 390, 768 e 1440.
- **Lighthouse**: Em Início e Detalhe, perfis mobile e desktop, três medições e mediana. Metas: Performance ≥ 90, Accessibility ≥ 95, Best Practices ≥ 95, SEO ≥ 90. Registro de LCP, CLS e TBT em `docs/lighthouse/`. Resultados abaixo da meta são justificados aqui. `[PREENCHER]`

## 15. Testes

- Vitest e Testing Library nas libs (domain, money, contracts, wrappers, ui).
- Playwright em `apps/web-e2e`, em Chromium, desktop e mobile, contra o sistema integrado com mocks. Cobre os 12 fluxos do desafio (busca e filtros, detalhe, conta e sessão, favoritos, carrinho, compra, falhas de pagamento e timeout, perfil e carteiras, tempo real, duplicatas e reconexão, teclado e foco, skeletons e recuperação).
- Cada teste parte de estado isolado (reset do cenário). Relógio, latência e disparo de eventos são controlados.
- Testes de tempo real passam pelo `socket.io-client`; os de REST passam pelos handlers MSW.
- Regressão visual de início, detalhe, carrinho, pagamento e componentes isolados do Storybook (`iframe.html?id=...`), com baselines versionadas em viewports 1440px e 390px.
- Relatório HTML e traces de falha como artefatos do CI.

## 16. Build, deploy e execução

- Build consolida os apps em uma única pasta (`dist/integrated/`): shell na raiz `/`, remotes sob `/remotes/<nome>/` (`remotes/storefront`, `remotes/checkout`, `remotes/account`) e Storybook estático sob `/storybook/`.
- `vercel.json` com SPA fallback para `/index.html`, rewrite dedicado `{ "source": "/storybook/:path*", "destination": "/storybook/:path*" }`, sem cache longo em `remoteEntry.js` (`Cache-Control: public, max-age=0, must-revalidate`) e cache imutável em chunks com hash (`Cache-Control: public, max-age=31536000, immutable`). Acesso direto e refresh funcionam em qualquer rota.
- Scripts raiz no `package.json`:
  - `pnpm dev:mocks`: Inicializa simultaneamente os 4 apps Vite via Nx.
  - `pnpm dev:shell`: Host na porta `4200`.
  - `pnpm dev:storefront`: Remote catálogo na porta `4201`.
  - `pnpm dev:checkout`: Remote carrinho/pagamento na porta `4202`.
  - `pnpm dev:account`: Remote perfil/carteiras na porta `4203`.
  - `pnpm storybook`: Servidor interativo do Storybook na porta `6006`.
  - `pnpm build:storybook`: Compilação estática do Storybook para `dist/apps/storybook`.
  - `pnpm design:tokens`: Compilação de `tokens.json` em `@theme` Tailwind v4 em `theme.css`.
  - `pnpm design:icons`: Geração dos 35 ícones vetoriais React nomeados individuais.
  - `pnpm build`: Executa `scripts/build-integrated.js` compilando todos os apps e Storybook, montando `dist/integrated/`.
  - `pnpm preview`: Servidor estático Node.js servindo `dist/integrated/` com headers de cache simulados.
  - `pnpm typecheck`: Checagem de tipos estrita em todos os 51 projetos (`nx run-many -t typecheck`).
  - `pnpm lint`: ESLint com regras de fronteiras e restrição de imports de terceiros.
  - `pnpm test`: Vitest rodando em paralelo em todas as bibliotecas.
  - `pnpm e2e`: Execução dos testes integrados com Playwright em `apps/web-e2e`.
  - `pnpm lighthouse`: Runner de auditoria Lighthouse.
- Variáveis de ambiente validadas via schema Zod em `libs/shared/contracts/src/env.ts` (`.env.example` fornecido na raiz).
- CI em `.github/workflows/ci.yml`: cache de dependências e do Nx, jobs paralelos para `nx affected` (typecheck, lint, test, build) e job isolado de E2E.
- Setup, credenciais fictícias, seleção e reset de cenários e reprodução dos fluxos de falha ficam no `README.md`.

## 17. Limitações conhecidas

`[PREENCHER ao final]`

- Limitações do transporte Socket.IO no ambiente de mocks.
- Persistência local do mock: escopo por navegador, sem sincronização entre dispositivos.
- Integrações de blockchain, carteira e pagamento são simuladas.

## 18. Decisões de UX

- **Modais como Rotas URL**: Os fluxos de Login (`/login`), Cadastro (`/cadastro`) e Confirmação de Pedido (`/pedido/:orderId`) são modelados como rotas URL completas gerenciadas pelo TanStack Router. No Desktop, essas telas renderizam como modais suspensos centralizados sobre backdrop semi-transparente escurecido; no mobile, adaptam-se para layout de tela cheia vertical. Essa arquitetura permite navegação direta, links compartilháveis de recibo, histórico de navegação e foco controlado (focus trap).
- **Ações Fora de Escopo**: Seções e controles visuais desenhados no Figma que não possuem suporte de backend no escopo do desafio (login social com Google/Facebook, newsletter no rodapé, seção de blog, promo cards, "Esqueceu a senha?", menus "Aprenda" e "Criadores", e abas da conta como "Downloads" e "Suporte") permanecem visíveis para preservar a fidelidade visual e a pontuação estética. Ao serem acionados, exibem feedback acessível imediato com aviso amigável: *"Funcionalidade indisponível nesta demonstração"*, nunca aparentando sucesso falso.
- **Formulário de Pagamento e Coleta de Dados**: Todos os campos rotulados com asterisco (`*`) no formulário de Pagamento são obrigatórios e validados tanto no cliente (React Hook Form + Zod) quanto na API simulada (MSW). Os campos "Observação" e "ENS ou carteira secundária" são opcionais, tornando-se obrigatório o campo secundário apenas se a opção "Usar outra carteira?" estiver marcada. Os dados coletados compõem o objeto `collector` do pedido.
- **Opções de Carteira no Checkout**: A opção combinada estática do frame do Figma ("MetaMask · WalletConnect · Coinbase") foi desmembrada em 3 radio cards acessíveis e independentes (MetaMask, WalletConnect, Coinbase Wallet), cada um com seu respectivo ícone vetorial oficial e seleção individual por teclado e clique.
- **Avaliações Somente Leitura**: As avaliações de NFTs são estritamente `read-only`. A média (`rating`) e o total (`reviewCount`) são consumidos de `GET /nfts/:id`, e a listagem textual de avaliações é carregada via `GET /nfts/:id/reviews`, sem formulários de criação/edição.
- **Preço Promocional e Anterior Riscado**: Cards de NFT suportam o campo opcional `previousPriceEth`. Quando presente e divergente do preço atual, o valor anterior é renderizado riscado (`line-through text-muted`) ao lado do preço ativo em destaque (`text-accent`), preservando a fidelidade com os cards promocionais do Figma.
- **Mudança de Preço ou Disponibilidade**: Caso haja alteração de preço, taxa ou esgotamento de item durante o fluxo de checkout, a confirmação do pedido é bloqueada e o usuário é notificado para revisar os novos valores antes de confirmar.

## 19. Desvios do Figma e ajustes de acessibilidade

> Consulte [docs/design/fidelity-notes.md](docs/design/fidelity-notes.md) para o catálogo completo de tolerâncias visuais, fidelidade de 1px e notas de alinhamento por componente.

| Item | Figma | Entrega | Motivo |
|---|---|---|---|
| Estados não desenhados (hover, focus, disabled, erro, vazio, skeleton) | Ausente | Padronizados com os tokens extraídos: foco visível via `ring-2 ring-primary ring-offset-2 ring-offset-ink` (contraste 6.85:1), feedback de erro com texto e ícone (`color.feedback.error`, 7.29:1), skeletons com shimmer desativável sob `prefers-reduced-motion` | Exigência do enunciado e conformidade com WCAG 2.1 AA (2.4.7, 1.4.1) |
| Telas sem frame mobile (Confirmação, Perfil, Carteiras) | Ausente em mobile (apenas desktop 1440px) | Layout adaptado para coluna única fluida (390px/414px) com botões e formulários empilhados verticalmente | Exigência do enunciado para suporte desktop e mobile completos |
| Resolução Tablet (768px) | Ausente no Figma | Catálogo colapsado em grade de 2 colunas, filtros colapsados em Sheet/Drawer lateral e formulários em coluna única | Prevenir overflow horizontal e garantir usabilidade em viewports intermediários |
| Self-hosting de Fontes | Fontes remotas Google Fonts | Família Roboto Mono baixada e servida localmente (`design/fonts/`) nos pesos 400, 500 e 700 em formato woff2 | Eliminar dependência externa de rede no CI e tempo de execução, assegurando estabilidade e métricas Lighthouse |
| Resolução de Letter-Spacing | Valor percentual sem unidade (`letterSpacing: 10`) | Convertido proporcionalmente para `0.1em` (ou `1.4px` sobre base de 14px) | Fidelidade geométrica aos estilos tipográficos do Figma |
| Contraste de Bordas de Formulário | Bordas `#55321f` e `#3f2319` com contraste 1.34:1 a 1.71:1 sobre `ink` | Mantida estilização do Figma com preenchimento diferenciado de container (`surface-card`/`surface-dark`), disponibilização do token `color.border.accessible` (`#8a583e`, 3.4:1) e anel de foco de alto contraste (6.85:1) | Sinalização de não-conformidade com WCAG 1.4.11 (< 3:1) e mitigação via indicadores de foco e preenchimento |
| Nomenclatura de Camadas no Figma | Layers com identificadores divergentes do texto visível (`Bio Field` exibindo `"E-mail"`) | Prevalência estrita do rótulo visível para o usuário sobre identificadores internos de camadas do Figma | Evitar ambiguidades conceituais e garantir correspondência exata com o que o usuário visualiza |
| Seleção de Carteiras no Pagamento | Imagem única combinando 3 carteiras | 3 Radio cards independentes com ícones vetoriais individuais | Acessibilidade por teclado (teclas direcionais e barra de espaço), suporte a leitores de tela e usabilidade Web3 |

