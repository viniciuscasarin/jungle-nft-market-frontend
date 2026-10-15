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

### Inventário de Projetos Nx (50 projetos)

- **Aplicações (5)**:
  - `shell`: Host na porta `4200`, gerenciador de rotas, providers e sessão.
  - `storefront`: Remote na porta `4201`, catálogo e PDP.
  - `checkout`: Remote na porta `4202`, carrinho e checkout.
  - `account`: Remote na porta `4203`, perfil e carteiras.
  - `web-e2e`: Testes de integração Playwright.
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

Documentação completa (método, path, request, response, erros) em [`docs/contracts.md`](docs/contracts.md). Os schemas zod em `shared/contracts` são a fonte; a documentação deriva deles.

| Recurso | Operações |
|---|---|
| Sessão e conta | cadastro, login, consulta da sessão, logout, expiração |
| NFTs | listagem (busca, filtros, ordenação, paginação) e detalhe |
| Favoritos | consulta, inclusão, remoção |
| Carrinho | consulta, inclusão, alteração, remoção de itens |
| Cotação | cupom, disponibilidade, descontos, taxas, total |
| Pedidos | criação idempotente, consulta de estado e recibo |
| Perfil | consulta, atualização de dados e avatar, troca de senha |
| Carteiras | consulta, cadastro, atualização |

### Erros

Toda falha é normalizada em `ApiError` (`code`, `message`, `fieldErrors?`, `details?`, `retryable`). Códigos: `VALIDATION_ERROR`, `UNAUTHENTICATED`, `SESSION_EXPIRED`, `FORBIDDEN`, `NOT_FOUND`, `CONFLICT`, `AVAILABILITY_CONFLICT`, `PRICE_CHANGED`, `IDEMPOTENCY_CONFLICT`, `TRANSIENT`. Falha de rede e timeout viram `TRANSIENT` com `retryable=true`.

### Eventos Socket.IO

Envelope: `{ id, type, resource: { kind, id }, version, occurredAt, userId?, payload }`, união discriminada por `type`.

| Evento | Efeito |
|---|---|
| `nft.updated` | Atualiza preço e disponibilidade em catálogo, detalhe e carrinho |
| `order.updated` | Atualiza estado do pedido; exibe confirmação ou recusa |

Todo recurso carrega `version` inteira e monotônica.

## 7. Dinheiro

- ETH trafega, persiste e é calculado como string decimal. `number` é rejeitado nos schemas e na API de `shared/money`.
- Precisão mínima de 18 casas, arredondamento `ROUND_HALF_UP`, sem notação científica.
- Quantidades são inteiras.
- Formatação pt-BR com casas configuráveis, apenas na apresentação.
- A cotação da API é a referência para finalizar o pedido. O cliente nunca recalcula total para enviar.

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

- Tokens do Figma como CSS variables e preset Tailwind exportado por `shared/ui`. O CSS de tokens é carregado uma vez pelo host; remotes standalone o importam só no bootstrap standalone.
- shadcn/ui adaptado em `shared/ui`, com API própria tipada, sem vazar tipos Radix.
- Fontes e assets self-hosted, com `font-display: swap` e preload da fonte crítica.
- Skeleton com shimmer em catálogo, detalhe e resumo do carrinho, com dimensões preservadas (sem layout shift) e animação desativada sob `prefers-reduced-motion`.
- Acessibilidade: teclado e foco visível, trap e retorno de foco em Dialog e Drawer, labels e erros associados por `aria-describedby`, `aria-invalid`, live regions para mutations e eventos em tempo real, estados que não dependem só de cor, contraste AA, sem overflow horizontal. Verificação com axe.
- Viewports de referência: 390, 768 e 1440.
- Lighthouse em Início e Detalhe, perfis mobile e desktop, três medições e mediana. Metas: Performance ≥ 90, Accessibility ≥ 95, Best Practices ≥ 95, SEO ≥ 90. Registro de LCP, CLS e TBT em `docs/lighthouse/`. Resultados abaixo da meta são justificados aqui. `[PREENCHER]`

## 15. Testes

- Vitest e Testing Library nas libs (domain, money, contracts, wrappers, ui).
- Playwright em `apps/web-e2e`, em Chromium, desktop e mobile, contra o sistema integrado com mocks. Cobre os 12 fluxos do desafio (busca e filtros, detalhe, conta e sessão, favoritos, carrinho, compra, falhas de pagamento e timeout, perfil e carteiras, tempo real, duplicatas e reconexão, teclado e foco, skeletons e recuperação).
- Cada teste parte de estado isolado (reset do cenário). Relógio, latência e disparo de eventos são controlados.
- Testes de tempo real passam pelo `socket.io-client`; os de REST passam pelos handlers MSW.
- Regressão visual de início, detalhe, carrinho e pagamento, com baselines versionadas.
- Relatório HTML e traces de falha como artefatos do CI.

## 16. Build, deploy e execução

- Build consolida os apps em uma única pasta (`dist/integrated/`): shell na raiz `/`, remotes sob `/remotes/<nome>/` (`remotes/storefront`, `remotes/checkout`, `remotes/account`).
- `vercel.json` com SPA fallback para `/index.html`, sem cache longo em `remoteEntry.js` (`Cache-Control: public, max-age=0, must-revalidate`) e cache imutável em chunks com hash (`Cache-Control: public, max-age=31536000, immutable`). Acesso direto e refresh funcionam em qualquer rota.
- Scripts raiz no `package.json`:
  - `pnpm dev:mocks`: Inicializa simultaneamente os 4 apps Vite via Nx.
  - `pnpm dev:shell`: Host na porta `4200`.
  - `pnpm dev:storefront`: Remote catálogo na porta `4201`.
  - `pnpm dev:checkout`: Remote carrinho/pagamento na porta `4202`.
  - `pnpm dev:account`: Remote perfil/carteiras na porta `4203`.
  - `pnpm build`: Executa `scripts/build-integrated.js` compilando todos os apps e montando `dist/integrated/`.
  - `pnpm preview`: Servidor estático Node.js servindo `dist/integrated/` com headers de cache simulados.
  - `pnpm typecheck`: Checagem de tipos estrita em todos os 50 projetos (`nx run-many -t typecheck`).
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

`[PREENCHER ao final]`

- Ações fora de escopo mostram aviso "indisponível nesta demonstração" e não aparentam sucesso.
- Mudança de preço ou disponibilidade durante o checkout bloqueia a confirmação até nova revisão do usuário.

## 19. Desvios do Figma e ajustes de acessibilidade

`[PREENCHER ao final]`

| Item | Figma | Entrega | Motivo |
|---|---|---|---|
| Estados não desenhados (erro, vazio, skeleton) | ausente | seguem o padrão visual existente | exigência do enunciado |
| Perfil, carteiras e confirmação em mobile | sem frame | adaptados dos frames desktop | exigência do enunciado |
| Substituição de assets ou fontes | `[PREENCHER]` | `[PREENCHER]` | `[PREENCHER]` |
