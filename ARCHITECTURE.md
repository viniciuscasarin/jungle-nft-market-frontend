# ARCHITECTURE

Marketplace de NFTs em React + TypeScript, com backend 100% simulado (MSW). Este documento registra as decisões de arquitetura, as políticas de estado e as limitações da entrega. Seções marcadas com `[PREENCHER]` dependem da implementação e devem ser completadas ao final de cada change.

---

## 🏛️ Motivações da Arquitetura em Monorepo

A escolha por uma arquitetura em **Monorepo orquestrado com Nx e pnpm**, combinada com **Micro-frontends via Module Federation**, foi concebida para atender não apenas aos requisitos de escopo do desafio, mas aos padrões de engenharia de software de alta maturidade para sistemas modernos, escaláveis e prontos para produção (*production-ready*). As principais motivações técnicas que fundamentam esta arquitetura incluem:

### 1. Desacoplamento Estrito e Domínios Independentes (DDD)
- **Separação em Camadas Limpas**: Cada domínio de negócio (`auth`, `catalog`, `favorites`, `cart`, `checkout`, `orders`, `profile`, `wallets`) é estritamente particionado em 4 camadas com responsabilidades bem demarcadas:
  - `domain`: Regras de negócio 100% puras, sem I/O, sem React e sem dependências externas (apenas `@nft/shared-contracts` e `@nft/shared-money`).
  - `data-access`: Encapsulamento de chamadas de API, query options e mutations do TanStack Query.
  - `ui`: Componentes apresentacionais puros e desacoplados de estado remoto.
  - `feature`: Composição de páginas e componentes conectados aos hooks de dados.
- **Fronteiras Arquiteturais Automatizadas**: Através de tags Nx (`scope:*`, `type:*`, `flow:*`) e do plugin `@nx/enforce-module-boundaries` no ESLint, o desacoplamento deixa de ser uma diretriz abstrata e passa a ser uma regra mecânica bloqueante em CI. O código de um fluxo (ex.: `checkout`) não pode vazar nem ser importado indevidamente por outro (ex.: `catalog`).

### 2. Escalabilidade Organizacional e Desenvolvimento Paralelo
- **Autonomia de Fluxos e Times**: A separação das aplicações em `apps/shell` (host orquestrador), `apps/storefront` (catálogo e PDP), `apps/checkout` (carrinho, pagamento e recibo) e `apps/account` (perfil e carteiras) espelha a divisão de squads de grandes plataformas digitais.
- **Harness Standalone para Agilidade**: Cada remote possui um ponto de entrada autônomo com `bootstrapStandalone()` (`@nft/shell-kit`). Um engenheiro focado em pagamentos pode subir e iterar exclusivamente sobre `apps/checkout` na porta dedicada (4202) com mocks e roteamento local, sem a sobrecarga de rodar o ecossistema inteiro.
- **Ambiente Isolado de Design e Testes**: O Storybook (`apps/storybook`) na porta 6006 e a suite E2E Playwright (`apps/web-e2e`) operam como aplicações dedicadas no grafo, garantindo que o desenvolvimento visual e os testes de regressão não interfiram no código produtivo.

### 3. Pronto para Produção (Enterprise-Ready & Checkout Limpo)
- **Zero Dependency Drift**: Um único lockfile estrito (`pnpm-lock.yaml`) assegura que todas as 51 bibliotecas e aplicações compartilhem exatamente as mesmas versões de dependências essenciais (React 19, Vite 6, TanStack Query 5, TanStack Router e Zod), eliminando inconsistências clássicas de múltiplos repositórios (*dependency hell*).
- **Checkout Limpo e Autônomo**: Atende com rigor à exigência do enunciado de execução a partir de um checkout limpo. Todas as bibliotecas de domínio e contratos são consumidas via TypeScript path aliases (`@nft/*`), dispensando pipelines complexos de publicação, controle de versão semântica intermediário ou acesso a registries privados npm.
- **Deploy Estático Unificado na Vercel**: A compilação integrada (`scripts/build-integrated.js`) reúne o host Shell na raiz e remotes sob `/remotes/<app>/` em um único artefato estático (`dist/integrated/`). Isso proporciona performance de CDN global, elimina latência de rede entre microsserviços e extingue problemas de CORS e orquestrações frágeis de múltiplos deploys.

### 4. Bundle Otimizado e Performance Superior
- **Compartilhamento de Singletons via Module Federation**: Dependências pesadas de runtime (`react`, `react-dom`, `@tanstack/react-router`, `@tanstack/react-query`, `socket.io-client`, Tailwind CSS) são declaradas como `singleton: true` e `eager: true` no host, sendo compartilhadas entre todos os remotes. Isso evita que cada micro-frontend carregue sua própria cópia de bibliotecas compartilhadas, reduzindo drasticamente o tamanho do bundle final.
- **Code-Splitting Dinâmico e Prefetching**: Remotes e páginas são carregados sob demanda com `React.lazy` e `RemoteBoundary`. O layout do Shell injeta `preload="intent"` em links de navegação, iniciando o download do bundle no momento do hover ou foco do teclado, resultando em transições de tela instantâneas.
- **Granularidade e Tree-Shaking Máximo**: Ícones do Figma e componentes Radix UI são exportados como módulos individuais em `@nft/shared-ui`. Apenas o código estritamente utilizado por cada tela é incluído no bundle, garantindo First Contentful Paint (FCP) e Largest Contentful Paint (LCP) otimizados para as metas do Lighthouse (≥ 90 em Performance).

### 5. Governança e Encapsulamento de Terceiros
- **Isolamento de Fornecedores Externos**: Bibliotecas de terceiros são estritamente encapsuladas em módulos de infraestrutura (`@nft/shared-http` para Axios, `@nft/shared-realtime` para Socket.IO, `@nft/shared-money` para Decimal.js, `@nft/shared-ui` para Radix UI).
- **Blindagem e Evolutividade**: Caso a biblioteca de mensageria em tempo real ou o cliente HTTP precisem ser atualizados ou substituídos no futuro, nenhuma regra de negócio ou componente de UI precisará ser alterado; a manutenção é restrita à sua respectiva biblioteca compartilhada.

### 6. Eficiência de Build e CI Inteligente (Nx Affected)
- **Computação Afetada e Cache Distribuído**: O grafo de dependências do Nx calcula a árvore de impacto de cada alteração (`nx affected`). Se um commit modifica apenas a tela de perfil em `apps/account`, as suites de teste, tipagem e lint do catálogo e checkout utilizam o cache local/CI (`.nx/cache`), economizando tempo de execução e acelerando os loops de feedback.

---

## 📋 Metodologia de Desenvolvimento (OpenSpec)

O projeto foi construído integralmente seguindo a metodologia **OpenSpec (Spec-Driven Development)**, uma disciplina rigorosa de engenharia orientada a contratos e especificações formais criada para guiar o pareamento com agentes autônomos de IA.

### Como a Metodologia Foi Aplicada
1. **Especificação Prévia e Verificável**: Nenhuma linha de código ou componente foi implementado sem antes passar por um ciclo formal de especificação. Cada funcionalidade nasce como uma proposta (`proposal.md`), acompanhada de requisitos normativos com palavras-chave RFC 2119 (`SHALL`, `MUST`) e cenários comportamentais testáveis no formato BDD (`WHEN ... THEN ...`).
2. **Execução Rastreada e Fatiada**: O plano de implementação é dividido em tarefas atômicas e incrementais em `tasks.md`, com critérios estritos de aceitação e checagem contínua de tipos, lint e testes.
3. **Zero Alucinação e Integridade Arquitetural**: Premissas de negócio, contratos de API e restrições técnicas são fixados antes da codificação, prevenindo desvios de escopo e atalhos arquiteturais.

### Onde Encontrar os Artefatos do Fluxo de Desenvolvimento

O avaliador pode auditar todo o processo decisório, evolução e rastreabilidade da solução nos seguintes diretórios:

- **Manifesto do Projeto ([`openspec/project.md`](./openspec/project.md))**: Define a visão global do sistema, o inventário das aplicações e bibliotecas, as convenções de código, critérios de qualidade e as regras invioláveis.
- **Especificações de Domínio e Sistema ([`openspec/specs/`](./openspec/specs/))**:
  Contém as especificações canônicas que documentam os comportamentos de cada subsistema:
  - `user-auth-and-session/`: Políticas de autenticação, tokens, expiração e retomada de contexto.
  - `checkout-payment-and-orders/`: Regras de pagamento, validação de carteiras e idempotência.
  - `order-confirmation-receipt/`: Contratos de recibo imutável e transições terminais de pedido.
  - `realtime-connection-lifecycle/`: Protocolo Socket.IO, envelopes tipados e tolerância a falhas.
  - `mock-infrastructure/`: Determinismo PRNG, perfis de rede e simulação de MSW.
  - `module-federation-runtime/`: Topologia de micro-frontends, singletons e boundary de resiliência.
  - `monetary-precision/`: Operações matemáticas em ETH via string decimal.
  - `design-system-ui/` e `design-tokens-and-assets/`: Tokens extraídos do Figma e primitivos acessíveis.
- **Ciclo de Mudanças e Tarefas ([`openspec/changes/`](./openspec/changes/))**:
  Registra o histórico de execução de cada entrega:
  - `openspec/changes/<change-id>/proposal.md`: Motivação, escopo, premissas de UX e impactos.
  - `openspec/changes/<change-id>/tasks.md`: Lista passo a passo das tarefas executadas com status de conclusão (`[x]`).
  - `openspec/changes/archive/`: Mudanças arquivadas que consolidaram as fundações do workspace, contratos, camada de mocks e infraestrutura de federação.
- **Documentação Aprofundada ([`docs/`](./docs/))**:
  Spikes técnicos e guias complementares gerados a partir das especificações:
  - `docs/contracts.md`: Catálogo completo de endpoints REST e envelopes Socket.IO.
  - `docs/cache-policy.md`: Estratégia de cache do TanStack Query e chaves de consulta.
  - `docs/federation.md`: Contrato de Module Federation e execução standalone.
  - `docs/spikes/module-federation.md`: Spike exploratório inicial de viabilidade técnica.
  - `docs/design/`: Notas de fidelidade visual do Figma, acessibilidade e responsividade.

---

## ⚖️ Trade-offs, Priorizações e Pontos Não Concluídos a 100%

Construir uma aplicação desse porte em prazo estrito exige escolhas deliberadas de engenharia. A decisão fundamental adotada neste projeto foi **priorizar a fundação arquitetural, a resiliência do sistema e a modelagem formal de domínio**, em detrimento do polimento puramente cosmético ou de um ajuste visual *pixel-perfect* exaustivo.

### 1. A Decisão pela Fundação Técnica Robusta
A maior parte do esforço foi alocada para construir alicerces que tornam o software verdadeiramente pronto para produção (*enterprise-ready*):
- **Isolamento e Limites Rígidos**: Estruturação de 51 projetos em monorepo com fronteiras mecânicas DDD (4 camadas por domínio) e isolamento estrito de dependências de terceiros;
- **Stack Obrigatória Operacional**: Uso efetivo de TanStack Router centralizado no shell, TanStack Query com políticas de cache granulares, Module Federation funcional com singletons compartilhados e precisão matemática de ETH via strings decimais (`@nft/shared-money`);
- **Backend Simulado e Tempo Real Verdadeiro**: Pipeline de rede MSW completo com semente PRNG determinística, controle de relógio, idempotência e WebSocket nativo via `@mswjs/socket.io-binding`;
- **Metodologia Rigorosa (OpenSpec)**: Especificação formal prévia com contratos Zod e cenários BDD antes da escrita de qualquer código.

### 2. O Trade-off no Frontend: Fundação Sólida vs. Pixel-Perfect no Prazo
Como consequência direta do tempo investido na arquitetura de micro-frontends, testes e contratos de dados, **o acabamento visual do frontend não atingiu 100% de precisão *pixel-perfect*** em relação aos frames do Figma:
- **Alinhamentos Subpixel e Espaçamentos Finos**: Embora os tokens oficiais de cor, tipografia e raios tenham sido extraídos do Figma (`tokens.json`), pequenos espaçamentos internos, alturas de linha ou gaps em determinados breakpoints apresentam variações toleradas de alguns pixels em relação ao layout estático.
- **Adaptações Responsivas Fluidas**: Os frames do Figma focam prioritariamente em 1440px (desktop) e alguns em 390px (mobile). Telas como Perfil, Carteiras e Confirmação de Pedido não possuíam desenho mobile no Figma; a responsividade intermediária (incluindo tablet 768px) foi implementada priorizando usabilidade fluida e ausência de overflow horizontal, mas sem o refinamento estético que um protótipo dedicado forneceria.
- **Simplificação de Microinterações**: Interações não críticas — como carrossel dinâmico infinito no Hero, recorte visual interativo no upload de avatar do perfil e animações complexas de transição entre rotas — foram simplificadas para elementos funcionais determinísticos, preservando o foco nas regras de negócio e nos fluxos eliminatórios de compra.

### 3. Transparência Técnica e Rastreabilidade
Nenhum desvio foi mascarado ou ignorado. Todas as limitações conhecidas, débitos técnicos de priorização e divergências em relação ao layout estão abertamente mapeados e documentados em:
- [**§17. Limitações conhecidas e Débitos Técnicos**](#17-limitações-conhecidas);
- [**§18. Decisões de UX para Ações Fora de Escopo**](#18-decisões-de-ux);
- [**§19. Desvios do Figma e Ajustes de Acessibilidade**](#19-desvios-do-figma-e-ajustes-de-acessibilidade);
- [**Notas de Fidelidade e Tolerâncias de Layout (`docs/design/fidelity-notes.md`)**](docs/design/fidelity-notes.md).

---

## 1. Objetivos e restrições

- Fluxos de descoberta, compra e conta do colecionador, em desktop e mobile.
- Stack obrigatória com uso efetivo: React, TypeScript, TanStack Router, TanStack Query, Axios, Socket.IO, Tailwind, shadcn/ui, MSW, Playwright, Lighthouse.
- Mocks apenas na camada de rede. Componentes, hooks e cliente Axios não contêm respostas fictícias.
- Tempo real passa sempre pelo `socket.io-client`. Nunca por setters ou cache direto.
- Fora de escopo: blockchain, extensões de carteira e gateways reais; páginas editoriais, suporte, atividade, ofertas e downloads.

## 2. Decisões de arquitetura

O grid externo usa a utility `page-container` de `shared/ui`, com a mesma largura do conteúdo do footer: máximo de 1280px, centralização e padding horizontal pelos tokens 4, 6 (sm) e 8 (lg). Header, breadcrumb e conteúdo de página compartilham esses limites, inclusive estados assíncronos. Cada página mantém suas colunas internas; modais mantêm suas larguras próprias. Containers não devem ser aninhados para evitar padding duplicado. A galeria da PDP é fluida para caber também no desktop de 1024px.

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
- `mocks/*` só é importável por `apps/shell`, `shell-kit`, `shared-testing` (para testes) e `apps/web-e2e`. Bibliotecas de `feature`, `ui` e `data-access` permanecem estritamente proibidas de importar mocks.
- `@nft/shared-testing` é restrito exclusivamente a arquivos de teste (`*.spec.*`, `*.test.*`) e stories (`*.stories.*`, `.storybook/**`). O código de produção falha no lint se importar `shared-testing`.
- Sem imports circulares e sem deep imports. Cada lib expõe apenas `index.ts`.

### Encapsulamento de terceiros

| Biblioteca | Único local permitido |
|---|---|
| `axios` | `shared/http` |
| `socket.io-client` | `shared/realtime` |
| `decimal.js` | `shared/money` |
| `@radix-ui/*` e primitivos shadcn | `shared/ui` |
| `msw`, `@mswjs/socket.io-binding` | `mocks/*`, `shell-kit`, `shared-testing`, `web-e2e` |
| `@tanstack/react-query` | `shared/query`, `data-access`, `feature` |

Violações falham no lint (`no-restricted-imports`).

O isolamento de mocks em features e apps remotos usa uma lista positiva de tipos de biblioteca nos imports diretos (`feature`, `ui`, `data-access`, `domain`, `util`), excluindo `type:mocks` e `type:app`. Isso preserva o acesso autorizado aos contextos e ao bootstrap de `shell-kit`, que encapsula a inicialização de MSW. Restrições de fluxo, hierarquia e terceiros continuam cumulativas; testes de lint verificam tanto os imports permitidos quanto a rejeição dos quatro módulos de mocks.


## 5. Module Federation

- **Desenvolvimento integrado:** `dev:mocks` seleciona os quatro apps com `--parallel=4`; cada app usa `strictPort`, `envDir` na raiz e cache em `node_modules/.vite/<app>`. O host usa `loaded-first` em dev para carregar remotes sob demanda com os singletons existentes; produção preserva `version-first`.
- **Entrada de CSS:** Os quatro documentos HTML carregam `/src/styles.css` por `<link rel="stylesheet">`. Importar esse CSS no entry JavaScript fazia o aquecimento de Federation seguir dependências de observação do Tailwind e transformar testes/configurações como módulos do navegador. O CSS continua sendo processado pelo Vite/Tailwind em dev e build.
- **Runtime JSX em standalone:** `react/jsx-runtime` e `react/jsx-dev-runtime` são compartilhados explicitamente com `singleton: true` e `eager: true` nos quatro apps, disponibilizando os exports antes de avaliar componentes com JSX no escopo do módulo, também sem o host.

A infraestrutura e viabilidade técnica foram comprovadas e validadas empiricamente no spike documentado em [`docs/spikes/module-federation.md`](docs/spikes/module-federation.md) com decisão formal de **GO**, e o contrato completo operacionalizado e documentado em [`docs/federation.md`](docs/federation.md).

- **Biblioteca e Runtime:** `@module-federation/vite` (v1.23.5) integrado ao Vite 6.2, React 19.0, TanStack Router 1.114 e Tailwind CSS v4.
- **Cold start do storefront:** As dependências de UI, contratos, HTTP e MSW do bootstrap standalone são registradas em `optimizeDeps.include`, evitando a falha `browserHash` no commit do otimizador com Vite 6.4.4/Federation 1.23.5. A descoberta automática permanece ativa; regressão e comando em `docs/federation.md`.
- **Topologia de Aplicações e Portas:**
  - `apps/shell` (Host): porta fixa `4200`, dono do layout, rotas globais, orquestração e clientes únicos.
  - `apps/storefront` (Remote): porta fixa `4201`, base `/remotes/storefront/`, expondo `./HomePage` e `./PdpPage`.
  - `apps/checkout` (Remote): porta fixa `4202`, base `/remotes/checkout/`, expondo `./CartPage`, `./PaymentPage` e `./ConfirmationPage`.
  - `apps/account` (Remote): porta fixa `4203`, base `/remotes/account/`, expondo `./ProfilePage` e `./WalletsPage`.
- **Roteamento Centralizado no Host e Layouts Sem Path:** O host shell (`apps/shell`) é proprietário único da tabela de rotas (`routes.tsx`), organizada em layouts sem path `_app` (chrome completo, landmarks, breadcrumb, footer, tab bar) e `_modal` (fundo decorativo com `aria-hidden="true"`, sem chrome). Rotas canônicas: `/` (Home/Catálogo), `/nft/$nftId` (PDP), `/carrinho` (Carrinho público), `/pagamento` (Checkout com guard), `/perfil` (Perfil com guard), `/carteiras` (Carteiras com guard), `/pedido/$orderId` (Confirmação com guard), `/login` (Visitante), `/cadastro` (Visitante) e wildcard 404 (`$`). Rotas legadas (`/catalogo`, `/checkout`, `/pedidos/1/confirmacao`) retornam 404. Páginas remotas são carregadas dinamicamente via `createRemoteRouteComponent` com `RemoteBoundary`.
- **Preload Preditivo:** O layout do Shell configura `preload="intent"` nos links principais de navegação para pré-carregamento imediato no hover/foco.
- **Singletons Estritos e Compartilhamento:**
  - Configuração estrita de shared scope: `react`, `react-dom`, `react-dom/client`, `react/jsx-runtime`, `@tanstack/react-router`, `@tanstack/react-query`, `socket.io-client` e `@nft/shell-kit` configurados com `singleton: true`, `requiredVersion` explícito e `eager: true` no host.
  - Verificação de instâncias em tempo de execução via `singletonRegistry` (`Symbol.for('nft.singleton.registry')`) e `singletonProbe` (`Symbol.for('nft.singleton.probe')`), assegurando que `QueryClient`, `HttpClient`, `RealtimeClient` e Service Worker MSW existam em instância estritamente única no browser.
- **Injeção de Contexto (`ShellContext`):** Disponibilizado via `ShellProvider` em `@nft/shell-kit`. Remotes consomem `useShell()` e `useSession()` sem recriar clientes ou bibliotecas encapsuladas.
- **Resiliência e Recuperação sem Recarregar a Janela (`RemoteBoundary`):**
  - Integra `Suspense` com fallback visual `DefaultRemoteSkeleton` (shimmer com desativação automática sob `prefers-reduced-motion`).
  - Timeout de carregamento configurável via `withRemoteTimeout` (padrão de 10s).
  - ErrorBoundary com anúncio acessível (`role="alert"`, `aria-live="assertive"`) e botão de retry que reexecuta o carregamento dinâmico sem necessidade de recarregar a janela do Shell (`window.location.reload()`).
- **Execução Standalone dos Remotes (`bootstrapStandalone`):** Cada remote possui ponto de entrada autônomo em `src/main.tsx` invocando `bootstrapStandalone(entry, options)` de `@nft/shell-kit`. Remotes podem registrar uma página única ou descritores de páginas locais (`pages: StandalonePageDescriptor[]`) com validação de search params (`validateSearch`) e redirecionamentos locais para desenvolvimento isolado nas portas 4201, 4202 e 4203.
  - **Limites do Harness e Dono das Rotas:** O host Shell permanece como proprietário exclusivo de todas as rotas e guards de produto (`requireAuth`, `requireGuest`). O harness standalone destina-se apenas ao desenvolvimento isolado daquele remote e não reproduz a tabela canônica de rotas nem importa features de outros apps.
  - **Composição e Inicialização Ordenada:** Fornece `QueryClientProvider` com o mesmo cliente do `ShellContext`, `ShellToastProvider`, `GlobalLiveRegions` e `ShellPageChromeProvider`. Consumidores conectados podem consultar dados, registrar chrome e anunciar feedback visual/acessível. A inicialização aguarda MSW e sessão opcional antes de montar a página, com loading acessível e `ErrorState` com retry no mesmo root e clientes, sem duplicar worker ou instâncias de clientes.
  - **Roteador e Histórico:** O router standalone utiliza `<Outlet />` na raiz e suporta `historyType: 'browser'` (padrão em dev para histórico nativo e refresh) e `historyType: 'memory'` (para testes determinísticos).
  - **Resolução de Destinos e Segurança:** Destinos locais usam o router do remote. Destinos externos ao remote (ex: PDP `/nft/$nftId`, Login `/login`, Checkout `/carrinho`) são resolvidos para a URL canônica na origem configurável do Shell (`shellOrigin`, padrão `http://localhost:4200` ou alternativa em E2E) preservando path, search e hash. Tentativas de open redirect ou destinos inseguros (`//evil.com`, `/\evil.com`, `javascript:`, etc.) são rejeitados para o fallback seguro `/`. URLs locais desconhecidas renderizam o estado acessível `StandaloneNotFound` (`role="region"`, `role="alert"`) com links de recuperação para o remote e para o Shell.
  - **Limites e Dependências Funcionais de Checkout e Recibos:** O remote `apps/checkout` em modo standalone renderiza um estado explícito e acessível de indisponibilidade ("Fluxo Integrado Obrigatório") em todas as suas rotas (`/`, `/carrinho`, `/pagamento`, `/pedido/:orderId`), com botão de navegação direta ao Shell integrado (`http://localhost:4200`). Em estrita aderência à regra inviolável 8 ("Ação fora de escopo não aparenta sucesso"), o checkout standalone nunca simula compras ou gera recibos fora do fluxo integrado, pois depende do carrinho ativo, cálculo de cotação da API com cupom e taxas de rede, e confirmação idempotente de pedido com emissão de recibo gerido pelo Shell.
- **Distribuição Consolidada de Produção:**
  - Build consolidado via `scripts/build-integrated.js` (`pnpm build`) gerando `dist/integrated/` com Shell na raiz e remotes sob `/remotes/<app>/`.
  - Servidor de preview (`pnpm preview`) escutando na porta 4200 com SPA fallback total para qualquer subrota e headers de cache apropriados (`no-cache` em `remoteEntry.js` e imutável para assets com hash).


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
- Token opaco de sessão guardado no cliente via `tokenStore` (`localStorage['nft_auth_token']`) e enviado no cabeçalho `Authorization: Bearer <token>`. A sessão é inicializada no boot por `GET /api/auth/session` (ou `/api/auth/me`).
- Rotas privadas (checkout, perfil, carteiras, favoritos, pedidos) usam `requireAuth`, que redireciona para `/login` com parâmetro `redirect` (path + search) para retorno transparente ao fluxo anterior.
- Expiração: Resposta 401 `UNAUTHENTICATED` / `SESSION_EXPIRED` interceptada pelo `SessionController`, disparando expiração uma única vez mesmo sob requisições concorrentes. O contexto de navegação é salvo no `ResumeStore` (`sessionStorage['nft_auth_resume']`) e o usuário é redirecionado para `/login?reason=expired`, exibindo alerta acessível.
- Retomada de Contexto: Ao autenticar com sucesso, o `ResumeStore` restaura a rota e search params prévios caso correspondam ao usuário autenticado, devolvendo o usuário ao ponto onde estava.
- Sincronização entre Abas: O `tokenStore` escuta eventos nativos de `window.addEventListener('storage', ...)` para `nft_auth_token`. Um logout realizado em uma aba é propagado instantaneamente para todas as outras abas abertas da aplicação.
- Logout e troca de usuário: O `SessionController` limpa o `tokenStore`, cancela queries pendentes, limpa o cache privado via `queryClient.removeQueries()`, desconecta o socket e encerra subscriptions ativas.

## 9. Carrinho

- `auth-data-access` e `catalog-data-access` usam `flow:shared`: seus serviços de rede são consumidos por mais de um remote. Isso alinha as tags à regra de compartilhamento de domain/data-access; features e UI preservam seus fluxos exclusivos. O card acionável do catálogo usa semântica de link e permanece operável por teclado.

- Os handlers usam `defineHandler` com caminhos relativos (`/cart`, `/cart/items`), que aplica o prefixo `/api` uma única vez e o pipeline de cenários de rede. Identidade autenticada é validada por `requireSession`; sem token, `X-Session-Id` identifica o visitante. Token inválido ou expirado nunca recai no carrinho visitante. Timestamps usam o relógio injetável e alterações de quantidade revalidam o estoque atual, inclusive zero.
- As query keys ficam em `shared/query/src/query-keys.ts`, expostas pelo `index.ts` público. `cart.all()` abrange o domínio, `lists()` e `counts()` separam invalidações, e `list(userId)`/`count(userId)` isolam usuários (fallback `guest`), preservando a API de factories existente.
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
| Sessão (`auth.session`) | 0 (imediato) | Revalidado no boot e limpo no logout |
| Catálogo e detalhe | 60s (list) / 30s (detail) | Atualizado também por `nft.updated` |
| Carrinho e cotação | 0 (imediato) | Invalidado por mutation, login (merge) e evento |
| Pedido | Infinito | Estados terminais (`confirmed`/`rejected`) não refazem polling |
| Perfil e carteiras | 5 min | Invalidação após mutation e isolamento estrito por `userId` |

## 11. Tempo real e reconciliação com REST

- Cliente criado por factory em `shared/realtime` (`createRealtimeClient`) e instanciado pelo host via singleton (`realtimeClient`).
- Transporte estrito: `['websocket']` conectado ao interceptor WebSocket `@mswjs/socket.io-binding` (`ws.link(/\/socket\.io\//)`).
- Máquina de estados de conexão observável: `connecting`, `connected`, `reconnecting`, `disconnected` acessível via `client.connectionState` e `client.onConnectionStateChange`.
- Conexão sob demanda: Conecta automaticamente quando há ao menos 1 subscription ativa (`subscriptionCount > 0`), inclusive para visitantes não autenticados (permitindo recepção de eventos públicos `nft.updated` no Catálogo, PDP e Carrinho anônimo).
- Normalização de envelopes tolerante: Validação rigorosa via `RealtimeEnvelopeSchema`, pré-normalizando envelopes canônicos `{ id, type, resource, resourceId, version, timestamp, userId?, payload }` e formatos alternativos `{ resource: { kind, id }, occurredAt }`.
- Pipeline de recepção seguro em `@nft/shared-realtime`:
  1. **Isolamento por `userId`**: Eventos privados (`order.updated` ou qualquer envelope com `userId`) são ignorados imediatamente se não houver usuário autenticado ou se `event.userId !== currentUserId`.
  2. **Deduplicação por `event.id`**: Utiliza `isDuplicate(event.id, processedEventIds)` de `@nft/shared-contracts` para descartar pacotes duplicados.
  3. **Ordenação monotônica por versão**: Mantém tabela de versões por recurso (`nft:<id>`, `order:<id>`) via `isStale(event.version, lastVersion)` de `@nft/shared-contracts`, rejeitando pacotes antigos ou com versão igual/menor.
- Sincronização centralizada no Shell (`RealtimeSync` / `useRealtimeSync` em `@nft/shell-kit`):
  - `nft.updated`: Invalida queries ativas de catálogo (`catalog.all()`, `catalog.detail(id)`), carrinho e cotação, emitindo aviso acessível via `feedback.notify` (Toast e live region `polite`).
  - `order.updated`: Invalida queries do pedido (`orders.all()`, `orders.list(userId)`, `orders.detail(id)`), esvazia/invalida o carrinho quando confirmado e emite feedback acessível.
  - Reconexão (`onReconnect`): Detecta restabelecimento da conexão WebSocket e invalida as queries ativas para reconciliação instantânea com a fonte da verdade REST.
- Desconexão e limpeza completa no unmount e no logout (`setAuthToken(null)`).
- **Débito Técnico P1 (Invalidação Direcionada vs Patch Manual In-Place)**: Conforme registrado no plano de prazo crítico, o marketplace adota `queryClient.invalidateQueries` direcionado após a validação de `id` e `version`, garantindo 100% de consistência com o banco em memória REST sem implementar patches otimistas manuais complexos (`setQueryData`) em listas paginadas no cliente.

## 12. Pedidos e idempotência

- **UI de Pagamento:** `checkout-ui` recebe collector, carteiras, itens e valores já formatados por props, sem I/O ou confirmação interna. Uma única árvore de formulário atende desktop e mobile, com IDs exclusivos, radio inputs nativos e Drawer de resumo com foco controlado. Header, Footer e breadcrumb pertencem ao shell. O story `Checkout/PaymentPageContent` usa assets locais; `payment-ui.spec.ts` verifica teclado, Drawer, 390/768/1440 px e zoom de 200% sobre esse story, antes da integração da feature.

- Estados: `pending`, `confirmed`, `rejected`. `confirmed` e `rejected` são terminais.
- Antes de confirmar, o checkout revalida preço, disponibilidade, cupom e taxas. Qualquer mudança exige nova confirmação do usuário.
- Criação com header `Idempotency-Key`, gerada por tentativa de compra e mantida em refresh e reenvio. Mesma chave com mesmo conteúdo recupera o mesmo pedido; mesma chave com conteúdo diferente retorna `IDEMPOTENCY_CONFLICT`.
- Botão de envio bloqueado durante a mutation, para evitar cliques repetidos.
- Timeout após criação: o cliente reconsulta o pedido pela chave, sem criar outro.
- Pedido pendente é recuperado após refresh ou reconexão (identificador persistido e reconciliação por REST).
- A tela de confirmação só renderiza para pedido `confirmed`. Recusa preserva os itens no carrinho.
- O recibo reproduz o snapshot imutável do pedido (itens, preços, taxas, total, txHash simulado, explorerUrl, rede, carteira). Mudanças posteriores no catálogo não o alteram.

## 13. Mocking (MSW)

- Handlers por domínio em `mocks/handlers`, banco em memória reativo com transações atômicas `transaction(fn)` e versionamento monotônico incremental em `mocks/core`, fixtures canônicas em `mocks/fixtures`.
- Determinismo absoluto: gerador pseudo-aleatório PRNG Mulberry32 com semente fixa (`next`, `int`, `pick`, `uuid`, gerador de hashes e tokens) e relógio injetável `Clock` (`system` e `controlled`), eliminando qualquer dependência descontrolada de `Math.random` ou `Date.now()`.
- Pipeline de rede universal configurável com perfis `NetworkProfile`: regras em duas fases (`phase: 'before'` e `phase: 'after'`), com suporte a latência (fixa ou intervalo PRNG), `outOfOrder` determinístico, `timeout` (honrando `AbortSignal`), `connectionError`, `httpError` normalizado com `ApiError`, `failTimes(n)` e sequenciamento.
- Estado consistente entre catálogo, favoritos, carrinho, perfil, carteiras e pedidos. Mudanças refletem em REST e em eventos.
- Persistência e resiliência via `StorageAdapter`: namespace versionado `nft-mocks:v1:state` no `localStorage`, com degradação graciosa para memória (`MemoryStorageAdapter`, `persistenceDegraded: true`) em caso de quota excedida ou restrição de storage.
- Reset integral via `resetMockDatabase()`: restaura o estado profundo idêntico ao snapshot inicial do cenário ativo e reinicializa a sequência determinística de eventos.
- Ativado por `VITE_ENABLE_MOCKS` no boot do Shell via dynamic import (removendo 100% de `msw` do bundle de produção com `VITE_ENABLE_MOCKS=false`). Cenário padrão por `VITE_DEFAULT_SCENARIO`, selecionável em runtime via `?scenario=<id>`, storage local ou console (`window.__mocks` / `window.__NFT_MOCK_CONTROL__`).
- Mocks Dev Panel acessível (`MocksDevPanel`) carregado sob demanda (`lazy`) em `apps/shell`, ativado estritamente por atalho de teclado `Ctrl+Alt+M` (ou `Cmd+Alt+M`) ou `?mocks-panel=1`, sem interferência visual na página ou impacto no Lighthouse.
- Fixtures ricas: ao menos 48 NFTs, 5 coleções, 3 redes (`ethereum`, `polygon`, `solana`), avaliações paginadas (>= 25) e vazias, 2 usuários com senhas armazenadas estritamente na forma de `passwordHash` e `passwordSalt` gerados via PBKDF2/SHA-256 (`tools/mocks-hash.ts`), cupons válidos, expirados e inválidos.
- 16 cenários obrigatórios mapeados conforme o §6 do `challenge.md` (detalhes em [`docs/mocks.md`](docs/mocks.md)).

### Socket.IO simulado

- **Transporte**: `@mswjs/socket.io-binding` integrado à interceptação WebSocket do MSW via `ws.link(/\/socket\.io\//)`. O `socket.io-client` real conecta no mock utilizando exclusivamente o transporte WebSocket (`transports: ['websocket']`).
- **Limitações do transporte e ambiente simulado**:
  - Opera exclusivamente sobre WebSocket; não suporta fallback para HTTP long-polling no `@mswjs/socket.io-binding`.
  - O servidor simulado vive na memória do Service Worker no navegador (ou no processo Node/Vitest); não há broadcast de frames WebSocket entre abas distintas do navegador (a sincronização entre abas ocorre por eventos de storage e reconciliação REST).
  - Cobertura de protocolos avançados (ex.: namespaces múltiplos simultâneos, streams binários raw) restrita ao subconjunto suportado pelo `@mswjs/socket.io-binding v0.2.0`.
- **Gatilhos Determinísticos para E2E e Automação**:
  - `emitNftUpdated({ nftId, editionId, price, availableSupply, maxSupply, version })`: Atualiza atomicamente o `MockDatabaseState`, incrementa a versão da entidade e emite o envelope `nft.updated` no WebSocket.
  - `emitOrderUpdated({ orderId, userId, status, transactionHash, rejectionReason })`: Atualiza o status do pedido, limpa o carrinho no banco quando confirmado e emite `order.updated`.
  - `emitDuplicateEvent()`: Reenvia o último envelope emitido mantendo idênticos o `id` e `version` sem alterar o banco de dados.
  - `emitStaleEvent()`: Envia envelope com versão obsoleta (`version <= versão atual`) sem alterar o estado do banco.
  - `simulateSocketDisconnect()` e `simulateSocketReconnect()`: Força o fechamento da conexão do socket para testar detecção de queda e reconciliação.
  - Expostos em `window.__mocks` e `window.__NFT_MOCK_CONTROL__` para testes Playwright e no `MocksDevPanel` (`Ctrl+Alt+M`).
- **Débito Técnico P1 (Painel Visual de Construção Livre de Eventos)**: Substituído no P0 por helpers programáticos determinísticos (`window.__mocks`) e ações rápidas no `MocksDevPanel`, priorizando agilidade na entrega do caminho feliz e conformidade com os critérios eliminatórios.

## 14. Interface, acessibilidade e performance

- **Tokens e Tailwind v4 CSS-First**: Tokens do Figma extraídos em `design/tokens/tokens.json` são compilados via `pnpm design:tokens` (`scripts/generate-tokens.js`) para a sintaxe `@theme` do Tailwind v4 em `libs/shared/ui/src/styles/theme.css`. O host (`apps/shell`) importa esse CSS uma única vez; remotes standalone o importam apenas no bootstrap standalone via `@nft/shell-kit`.
- **Biblioteca `@nft/shared-ui`**: Estruturada modularmente em primitivos Radix UI encapsulados (`components/primitives`), estruturas globais de layout (`components/layout`), componentes ricos de catálogo e conta (`components/widgets`) e 35 componentes de ícones SVG nomeados individuais com suporte completo a tree-shaking (`icons/`). Nenhuma classe de cor hexadecimal literal é permitida fora dos tokens, com teste automatizado bloqueante.
- **Storybook (`apps/storybook`)**: Aplicação isolada na porta 6006 com builder `@storybook/react-vite`, tag `flow:tooling`, suporte a dark mode `ink`, viewports de referência (390, 768 e 1440), toggle de acessibilidade para `prefers-reduced-motion`, addon `@storybook/addon-a11y` (violações tratadas como erro bloqueante), `@storybook/addon-designs` e 5 páginas Foundations em MDX geradas dos tokens (`Cores`, `Tipografia`, `Espaçamento`, `Raios`, `Sombras`).
- **Notas de Fidelidade e Tolerâncias**: Catálogo minucioso de alinhamento visual, tolerâncias de subpixel/1px, regras de arredondamento de bordas e especificação de estados não desenhados documentados em `docs/design/fidelity-notes.md`. Alinhamento estrito de `Header` (altura 45px sem padding, fundo transparente, 3 colunas com título de 100px alinhado ao topo com 14px e altura 34px, navegação centralizada horizontalmente e alinhada ao topo com gap de 40px e borda inferior 3px na cor primária para rota ativa, ações com gap de 28px, lupa 20x20 como link para `/#busca`, carrinho 24x24 com link para `/carrinho` e botão Entrar com link para `/login` no estado visitante; DropdownMenu acessível por teclado no estado autenticado).
- **Chrome Responsivo e Breakpoints**: Breakpoint estrito em **1024 px (`lg:`)**. Em viewports `>= 1024 px`, exibe o `Header` desktop completo; em viewports `< 1024 px` (incluindo tablet 768 px e mobile 390 px), o `Header` desktop é ocultado (`hidden lg:block`) e são ativados a `SearchBar` no topo (com suporte a busca e botão de filtros dinâmico via `usePageChrome`) e a `MobileTabBar` fixa na base (Início, Buscar, Carrinho e Conta), sem overflow horizontal.
- **Fontes e Assets Self-Hosted**: Família Roboto Mono baixada e servida localmente (`design/fonts/`) nos pesos 400, 500 e 700 em `.woff2` com `font-display: swap` e preload crítico no `index.html` do host.
- **SEO e Metadados**: `apps/shell/index.html` configurado com `lang="pt-BR"`, viewport responsivo, `<meta name="description">`, `<meta name="theme-color" content="#121212">` e `robots.txt` estático em `public/robots.txt`. A página 404 injeta `<meta name="robots" content="noindex" />`.
- **Skeleton Shimmer**: Gradiente animado em catálogo, detalhe e carrinho preservando dimensões fixas contra CLS (Cumulative Layout Shift) e desativado sob `@media (prefers-reduced-motion: reduce)`.
- **Acessibilidade (WCAG 2.1 AA)**: Teclado e foco visível com anel unificado `ring-2 ring-primary ring-offset-2 ring-offset-ink` (6.85:1 sobre `ink`), token de demarcação `color.border.accessible` (`#8a583e`, 3.4:1), focus trap e retorno de foco em Dialog e Drawer, labels e erros associados por `aria-describedby` e `aria-invalid`, live regions para feedback de ações assíncronas, troca de rota com foco no `main` (`tabIndex={-1}`) e anúncio em live region `polite`, e avisos explícitos para ações fora de escopo ("indisponível nesta demonstração").
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

- **Contratos dos mocks no build:** `parseBody` diferencia os tipos de entrada e saída dos schemas Zod para preservar defaults e transforms após validação. O bootstrap deriva `MockControls` de `mocks-core` e registra `socketHandler` (retorno de `addEventListener`), enquanto `socketInterceptor` continua sendo o link WebSocket. A checagem de tipos dos apps permanece habilitada.

- Build consolida os apps em uma única pasta (`dist/integrated/`): shell na raiz `/`, remotes sob `/remotes/<nome>/` (`remotes/storefront`, `remotes/checkout`, `remotes/account`) e Storybook estático sob `/storybook/`.
- **Estratégia de Deploy Estático Único na Vercel (Zero-Config)**: O projeto consolida todas as aplicações em um único projeto estático na Vercel (`outputDirectory: "dist/integrated"`). As variáveis de ambiente possuem defaults seguros relativos (`/remotes/<remote>/remoteEntry.js`), eliminando problemas de CORS e dispensando configuração manual de variáveis no dashboard da Vercel para branches de preview.
- **Fallback SPA e `cleanUrls`**: `cleanUrls: false` preserva os destinos explícitos `/index.html` e `/storybook/index.html` nos rewrites da Vercel. Habilitar `cleanUrls` sem remover as extensões desses destinos provoca 404 da hospedagem ao abrir ou atualizar rotas profundas como `/perfil`, antes de executar o router e os guards do Shell.
- **Isolamento de Escopo do Service Worker**: O Service Worker (`mockServiceWorker.js`) reside na raiz `/` de `dist/integrated/` com escopo global `/`, garantindo que todas as chamadas de API (`/api/*`) e conexões WebSocket disparadas tanto pelo host quanto pelos remotes sejam interceptadas de forma unificada.
- `vercel.json` com SPA fallback para `/index.html`, rewrite dedicado `{ "source": "/storybook/:path*", "destination": "/storybook/:path*" }`, bypass explícito para `/mockServiceWorker.js`, cabeçalhos de cache estritos (`Cache-Control: no-cache, no-store, must-revalidate` para `mockServiceWorker.js`, `remoteEntry.js` e documentos HTML) e cache imutável em chunks com hash (`Cache-Control: public, max-age=31536000, immutable`). Acesso direto e refresh funcionam em qualquer rota profunda.
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
  - `pnpm build`: Executa `scripts/build-integrated.js` compilando os 4 apps de produto e montando `dist/integrated/` (desacoplado do Storybook por padrão para evitar timeout de build).
  - `pnpm build:deploy:full`: Compilação completa incluindo o Storybook antes da montagem de `dist/integrated/`.
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

- **Persistência local do mock em múltiplas abas**: O estado em memória reside no processo do Service Worker do navegador e é persistido via `localStorage`. Abas abertas simultaneamente não compartilham eventos de mutação em memória em tempo real de forma cruzada, reconciliando o estado apenas ao recarregar (refresh).
- **Escopo do Service Worker**: O Service Worker é registrado com escopo raiz `/` pelo Shell ou na porta de dev do remote em modo standalone. Remotes servidos em `/remotes/<remoteName>/` no build integrado não registram workers próprios para evitar colisões de escopo.
- **Limitações do transporte Socket.IO no ambiente de mocks e Débitos Técnicos P1**:
  - **Transporte estritamente WebSocket**: O `@mswjs/socket.io-binding v0.2.0` intercepta conexões WebSocket (`ws.link(/\/socket\.io\//)`). O cliente `socket.io-client` opera exclusivamente com `transports: ['websocket']`, sem fallback para HTTP long-polling.
  - **Isolamento de processo no navegador**: O servidor Socket.IO simulado reside na memória do Service Worker da aba ativa. Mensagens em tempo real não realizam broadcast entre múltiplas abas abertas simultaneamente (a sincronização entre abas ocorre por eventos de storage e reconciliação via REST).
  - **Débito Técnico P1 (Atualização Cirúrgica de Cache In-Place)**: Para garantir entrega pontual sem risco de inconsistências com as regras de cotação do servidor, o cliente executa invalidação direcionada no TanStack Query (`queryClient.invalidateQueries`) em vez de atualizar manualmente (`setQueryData`) dezenas de páginas cacheadas do catálogo na memória da UI.
  - **Débito Técnico P1 (Painel Visual de Criação de Eventos)**: Em vez de desenvolver uma interface visual de devtools com construtor livre de payloads JSON para eventos de socket, foram implementados helpers determinísticos programáticos em `window.__mocks` (`window.__NFT_MOCK_CONTROL__`) e botões de ação rápida no `MocksDevPanel` (`Ctrl+Alt+M`).
  - **Débito Técnico P1 (Desacoplamento do Storybook no Pipeline de Build Padrão)**: Para evitar tempos de compilação excessivos e riscos de estouro de memória ou timeout no plano de hospedagem estática da Vercel, a compilação do Storybook foi desacoplada de `pnpm build`. O comando `pnpm build` compila estritamente as 4 aplicações de produto (`shell`, `storefront`, `checkout`, `account`), integrando o Storybook caso já tenha sido pré-compilado, enquanto `pnpm build:deploy:full` realiza a compilação completa com o Storybook sob demanda.
- **Débitos Técnicos P1 da Home (`storefront-home-catalog`)**: Para atender ao prazo crítico de entrega P0 do catálogo, foram adotadas as seguintes simplificações registradas como débito técnico:
  - **Stories CSF3 Mínimos**: Mantido apenas o story principal `home-page-content.stories.tsx` cobrindo a composição completa da Home (Hero, Catálogo, Filtros, Promo e Blog) com cenários de loading, empty, error e filtros aplicados. A expansão de stories individuais granulares por subcomponente (`HomeHeroBanner`, `CatalogFilterSidebar`, `HomePromoSection`, `HomeBlogSection`) e pseudo-estados interativos é registrada como débito técnico.
  - **Contagens de Facetas Fixas por Cenário**: O handler `GET /api/nfts` retorna as contagens de itens por coleção e por rede (`facets`) calculadas sobre o conjunto base do cenário ativo no MSW (`default`, `empty`, `slow-network`, etc.). O recálculo cruzado dinâmico facetado (N×M contagens por combinação de filtros ativos) é registrado como débito técnico.
  - **Hero e Featured NFT Determinísticos**: O Hero Banner e o banner lateral "NFT EM DESTAQUE" apontam para NFTs fixos da fixture (`nft-01` e `nft-02`). Os dots de navegação do Hero alternam slides visuais fixos sem carrossel dinâmico de dados. A implementação de carrossel dinâmico com rotação de NFTs em destaque baseada em metadados da API é registrada como débito técnico.
- **Débitos Técnicos P1 de Checkout Payment and Orders (`checkout-payment-and-orders`)**: Para priorizar o caminho feliz da compra sem violar a exigência de confirmação pela simulação, ficam registrados os seguintes itens adiados:
  - **Retomada do formulário collector**: o P0 pode retomar pelo pré-preenchimento atualizado de perfil e carteira após refresh/reautenticação, sem salvar um rascunho completo em `sessionStorage`.
  - **Conexão simulada de carteira**: o P0 pode ligar os radio cards de carteira ao estado determinístico do mock (conectada, recusada ou desconectada), sem modal intermediário de conexão.
  - **Pedido pending prolongado**: no cenário padrão, o mock pode responder `confirmed` imediatamente. O processamento prolongado, polling adaptativo e recuperação abrangente ficam adiados; `pending` jamais autoriza navegação ou mensagem de compra confirmada.
  - **Stories CSF3 granulares**: o P0 mantém um story representativo para Pagamento; stories adicionais dos campos, carteira, resumo e estados de pedido ficam adiados.
- **Débitos Técnicos P1 de Account Profile and Wallets (`account-profile-and-wallets`)**: Para atender ao prazo crítico de entrega da gestão de perfil e carteiras no remote `apps/account`, foram adotadas as seguintes simplificações registradas como débito técnico:
  - **Upload de Avatar Simplificado**: O controle de avatar (`Alterar` e `Remover`) converte o `<input type="file">` para Data URL simples (leitura via `FileReader.readAsDataURL`) no `POST /api/profile/avatar` e limpa com `avatarUrl = null` no `DELETE /api/profile/avatar`, sem cropper de imagem interativo ou upload binário multipart. A implementação de recorte (crop) visual e otimização de tamanho é registrada como débito técnico.
  - **Stories CSF3 Mínimos**: Mantidos apenas os stories básicos para `ProfilePageContent` (`profile-page-content.stories.tsx`) e `WalletsPageContent` (`wallets-page-content.stories.tsx`) cobrindo os cenários principais (default, com avatar, sucesso, erros de campo, salvando). A expansão de stories granulares para todos os subcomponentes (`AccountLayout`, `AccountNavigation`, `AccountMobileHeader`) e pseudo-estados interativos adicionais é registrada como débito técnico.
  - **Adaptação Mobile por Empilhamento Responsivo**: A responsividade mobile (`390px`, `768px`) utiliza o empilhamento responsivo existente (`grid-cols-1 md:grid-cols-2`, `AccountMobileHeader` visível em `< 768px`) para evitar overflow horizontal, sem criar árvore de componentes mobile separada. A validação de zoom (`200%`) e a otimização de touch targets em dispositivos menores são registradas como débito técnico.
- **Débitos Técnicos P1 de Recibo e Confirmação de Pedido (`checkout-confirmation-receipt`)**: Para atender ao prazo crítico da conclusão do pedido garantindo fidelidade de dados imutáveis:
  - **Adaptação Mobile Simplificada**: O modal de confirmação utiliza adaptação fluida direta com Tailwind (`w-full max-w-[578px] px-4 overflow-y-auto max-h-[90vh]`) em vez de redesenho dedicado para mobile ou gaveta/drawer inferior. A ausência de overflow horizontal é assegurada em `390px`.
  - **Stories CSF3 Mínimos**: Mantido 1 story representativo para o modal de confirmação em `libs/orders/ui/src/order-confirmation-modal.stories.tsx` (Default e ModalOverlay), adiando variações granulares de múltiplos itens ou textos longos de carteira.
  - **Ação Externa Etherscan**: Botão "Ver no Etherscan" exibe aviso informativo explícito via feedback da shell (`indisponível nesta demonstração`) sem abrir URLs externas.
- **Simulação de Blockchain e Gateways**: Todas as carteiras, assinaturas de transação, transferências de tokens e pagamentos são estritamente simulados, sem interação com redes reais de blockchain (Ethereum, Polygon, Solana).
- **Sincronização de Sessão entre Abas**: A sincronização de logout entre abas apoia-se em eventos nativos `storage` do `localStorage` (`nft_auth_token`). A invalidação de cache privado no TanStack Query ocorre reativamente na aba que recebe o evento.

## 18. Decisões de UX

- **Layouts Sem Path (`_app` e `_modal`) e Modais como Rotas URL**: A tabela de rotas do TanStack Router é particionada em dois layouts sem path: `_app` (chrome completo, skip link, landmarks, breadcrumb dinâmico e footer) e `_modal` (fundo decorativo com `aria-hidden="true"` que não monta a Home real, sem Header, Footer ou TabBar). As rotas `/login`, `/cadastro` e `/pedido/:orderId` utilizam `_modal`. No Desktop, renderizam como modais suspensos centralizados sobre backdrop escurecido; no mobile, adaptam-se para layout de tela cheia vertical com foco controlado (focus trap). Essa arquitetura permite navegação direta, links compartilháveis de recibo, histórico de navegação e foco controlado.
- **Navegação Acessível e Anúncios Globais**: Cada troca de rota aciona o `NavigationAnnouncer`, que transfere o foco por script para o container principal (`#main-content`, `tabIndex={-1}`) e anuncia o título da nova página na live region global `polite`. A restauração de scroll (`ScrollRestoration`) mantém a posição anterior ao voltar/avançar no histórico e leva ao topo em novas navegações.
- **Ações Fora de Escopo**: Seções e controles visuais desenhados no Figma que não possuem suporte de backend no escopo do desafio (login social com Google/Facebook, newsletter no rodapé, seção de blog, promo cards, "Esqueceu a senha?", menus "Aprenda" e "Criadores", e abas da conta como "Downloads" e "Suporte") permanecem visíveis para preservar a fidelidade visual e a pontuação estética. Ao serem acionados, exibem feedback acessível imediato via toast e live region: *"indisponível nesta demonstração"*, nunca aparentando sucesso falso.
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
| Resolução Tablet (768px) e Breakpoint de Chrome (1024px) | Ausente no Figma | Breakpoint em 1024px: `>= 1024px` chrome desktop; `< 1024px` chrome mobile com `SearchBar` e `MobileTabBar`. Catálogo em grade de 2 colunas e filtros em Sheet/Drawer | Prevenir overflow horizontal e garantir ergonomia de toque em viewports intermediários |
| Layouts sem path `_app` e `_modal` | Modais desktop sobrepostos à Home estática | Layout `_modal` dedicado para `/login`, `/cadastro` e `/pedido/:orderId` com backdrop decorativo `aria-hidden="true"`, sem montar a Home real | Eliminar duplicação de landmarks e requisições de rede pesadas em rotas de modal |
| Self-hosting de Fontes | Fontes remotas Google Fonts | Família Roboto Mono baixada e servida localmente (`design/fonts/`) nos pesos 400, 500 e 700 em formato woff2 | Eliminar dependência externa de rede no CI e tempo de execução, assegurando estabilidade e métricas Lighthouse |
| Resolução de Letter-Spacing | Valor percentual sem unidade (`letterSpacing: 10`) | Convertido proporcionalmente para `0.1em` (ou `1.4px` sobre base de 14px) | Fidelidade geométrica aos estilos tipográficos do Figma |
| Contraste de Bordas de Formulário | Bordas `#55321f` e `#3f2319` com contraste 1.34:1 a 1.71:1 sobre `ink` | Mantida estilização do Figma com preenchimento diferenciado de container (`surface-card`/`surface-dark`), disponibilização do token `color.border.accessible` (`#8a583e`, 3.4:1) e anel de foco de alto contraste (6.85:1) | Sinalização de não-conformidade com WCAG 1.4.11 (< 3:1) e mitigação via indicadores de foco e preenchimento |
| Nomenclatura de Camadas no Figma | Layers com identificadores divergentes do texto visível (`Bio Field` exibindo `"E-mail"`) | Prevalência estrita do rótulo visível para o usuário sobre identificadores internos de camadas do Figma | Evitar ambiguidades conceituais e garantir correspondência exata com o que o usuário visualiza |
| Seleção de Carteiras no Pagamento | Imagem única combinando 3 carteiras | 3 Radio cards independentes com ícones vetoriais individuais | Acessibilidade por teclado (teclas direcionais e barra de espaço), suporte a leitores de tela e usabilidade Web3 |


