# NFT Marketplace — Contexto do Projeto

## Propósito
SPA de marketplace de NFTs com descoberta, compra e conta do colecionador, em desktop e mobile. Backend 100% simulado com MSW. Sem integração real com blockchain, carteiras ou pagamentos.

## Stack obrigatória (uso efetivo)
React, TypeScript (strict), TanStack Router, TanStack Query, Axios, Socket.IO (socket.io-client), Tailwind CSS, shadcn/ui, MSW (+ @mswjs/socket.io-binding), Playwright, Lighthouse.
Complementares permitidos: Vite, pnpm, Nx, zod, react-hook-form, decimal.js, Vitest, Testing Library, @module-federation/vite.

## Topologia
Um único monorepo Nx com 4 apps React/Vite integrados por Module Federation:
- `apps/shell` (host): layout, providers, tabela de rotas TanStack Router, guards `requireAuth`, MSW, QueryClient, HttpClient, RealtimeClient, sessão, login e cadastro.
- `apps/storefront` (remote): Home (catálogo) e PDP.
- `apps/checkout` (remote): Carrinho, Pagamento e Confirmação.
- `apps/account` (remote): Perfil e Carteiras.
- `apps/web-e2e`: Playwright sobre o sistema integrado.

## Regras de topologia
1. Remotes expõem apenas componentes de página. O host é dono das rotas, dos guards e dos schemas de search params (em `@nft/shared-contracts`).
2. Singletons compartilhados: react, react-dom, @tanstack/react-router, @tanstack/react-query, socket.io-client e as libs do workspace. Nunca existem duas instâncias de QueryClient, HttpClient, RealtimeClient ou service worker MSW.
3. O host cria e injeta as instâncias via `ShellContext` (`libs/shell-kit`). Remotes só consomem.
4. Nenhum app importa outro app. O compartilhamento ocorre apenas por libs.
5. Tags `flow:shell|storefront|checkout|account|shared` restringem quais `feature` e `ui` cada app pode importar. `domain` e `data-access` são compartilháveis.
6. MSW é iniciado só pelo host (e pelo bootstrap standalone, que reutiliza o código de `shell-kit`). Remotes nunca contêm mocks.
7. Falha ao carregar um remote exibe ErrorState com retry, sem derrubar o shell.
8. O build de produção gera uma única pasta de deploy: shell em `/` e remotes em `/remotes/<nome>/`, com SPA fallback e headers de cache corretos para `remoteEntry`.
9. Sem publicação de pacotes: as libs são consumidas por path alias (`@nft/<scope>-<lib>`).

## Arquitetura de libs
Libs por domínio em 4 camadas (`domain`, `data-access`, `feature`, `ui`), além de `shared/*`, `shell-kit` e `mocks/*`. Fronteiras, direção de dependências e encapsulamento de terceiros em [`ARCHITECTURE.md`](../ARCHITECTURE.md) §4.

## Regras transversais (viram requisitos de toda change)
1. ETH é sempre string decimal; nunca `number`/float. Quantidades são inteiras. Cálculos só via `shared/money`.
2. Totais (subtotal, desconto, taxa de rede, total) vêm da cotação da API; a UI não recalcula.
3. Mocks vivem apenas na camada de rede (`libs/mocks/*`). Componentes, hooks, data-access e o cliente Axios não contêm respostas fictícias nem caminhos alternativos de negócio.
4. Tempo real passa obrigatoriamente pelo `socket.io-client`; nunca chamar setters ou cache para simular eventos.
5. Dados privados são isolados por usuário: query keys incluem `userId`; logout e troca de usuário limpam cache, cancelam queries e encerram subscriptions.
6. Todo dado assíncrono tem estados de loading (skeleton com shimmer, sem layout shift, respeitando `prefers-reduced-motion`), vazio, erro (com retry) e sucesso.
7. Acessibilidade é requisito de cada tela: teclado, foco visível, labels e erros associados, live regions para feedback, contraste AA.
8. Contratos tipados de ponta a ponta (transporte → estado → UI), validados com zod nas bordas.
9. Pedidos são idempotentes; `confirmed` e `rejected` são terminais; a confirmação só aparece para pedido efetivamente confirmado pela simulação.
10. Estados não desenhados no Figma seguem o mesmo padrão visual.

## Fora de escopo
Páginas editoriais, suporte, atividade, ofertas e downloads; blockchain, extensões de carteira e gateways reais. Ações fora de escopo mostram aviso explícito ("indisponível nesta demonstração") e nunca aparentam sucesso.

## Critérios eliminatórios (nunca violar)
Stack não usada de verdade; fluxos só visuais; compra confirmada sem resposta da simulação; exposição de dados entre usuários; eventos simulados direto na UI; ausência de testes E2E executáveis.

## Documentos de referência
`challenge.md` (enunciado), `ARCHITECTURE.md` (decisões e políticas), `AGENTS.md` (regras para agentes). Em conflito: enunciado, depois este arquivo, depois `ARCHITECTURE.md`.
