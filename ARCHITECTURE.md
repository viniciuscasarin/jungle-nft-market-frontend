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
| 2 | Fluxos como apps isolados (shell, storefront, checkout, account) integrados por Module Federation | Isolamento de fluxo e fronteiras explícitas, mantendo um único repositório. |
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
  shell/        host: layout, providers, rotas, guards, MSW, realtime, sessão, login, cadastro
  storefront/   remote: Home (catálogo) e PDP
  checkout/     remote: Carrinho, Pagamento e Confirmação
  account/      remote: Perfil e Carteiras
  web-e2e/      Playwright sobre o sistema integrado
libs/
  shared/{contracts,money,http,query,router,realtime,ui,testing}
  shell-kit/    ShellContext, bootstrapStandalone, contrato de remotes
  mocks/{core,fixtures,handlers,socket}
  {auth,catalog,favorites,cart,checkout,orders,profile,wallets}/{domain,data-access,feature,ui}
```

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

- `@module-federation/vite`. Remotes expõem apenas componentes de página: `HomePage`, `PdpPage`, `CartPage`, `PaymentPage`, `ConfirmationPage`, `ProfilePage`, `WalletsPage`.
- O host é dono da tabela de rotas, dos guards `requireAuth` e dos schemas de search params (em `shared/contracts`). As páginas dos remotes entram via `lazy`.
- Singletons com versão estrita: `react`, `react-dom`, `@tanstack/react-router`, `@tanstack/react-query`, `socket.io-client` e as libs do workspace.
- O host injeta QueryClient, HttpClient, RealtimeClient, sessão e `navigate` por `ShellContext` (`shell-kit`). Remotes só consomem.
- `RemoteBoundary`: Suspense + ErrorBoundary com skeleton, ErrorState com retry (recarrega o remote sem refresh do shell) e timeout configurável.
- `bootstrapStandalone(page)` roda um remote isolado em dev, com MSW e providers, reutilizando o código do host.
- Um teste falha se houver mais de um QueryClient, RealtimeClient ou service worker no runtime.
- Risco de performance: waterfall de `remoteEntry`. Mitigação: preload do entry das rotas prováveis, chunks pequenos e Home/PDP no mesmo remote.

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

- Build consolida os apps em uma única pasta: shell em `/`, remotes em `/remotes/<nome>/`.
- `vercel.json` com SPA fallback, sem cache longo em `remoteEntry` e cache imutável em chunks com hash. Acesso direto e refresh funcionam em qualquer rota.
- Scripts raiz: `dev:mocks`, `dev:<app>`, `build`, `preview`, `typecheck`, `lint`, `test`, `e2e`, `lighthouse`.
- Variáveis: `VITE_ENABLE_MOCKS`, `VITE_API_BASE_URL`, `VITE_SOCKET_URL`, `VITE_DEFAULT_SCENARIO`, `VITE_REMOTE_STOREFRONT_URL`, `VITE_REMOTE_CHECKOUT_URL`, `VITE_REMOTE_ACCOUNT_URL`.
- CI: cache, `nx affected` para typecheck, lint, test e build; job de E2E separado.
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
