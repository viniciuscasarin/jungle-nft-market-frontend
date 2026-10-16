# Jungle NFT Marketplace Frontend

Marketplace de NFTs em React + TypeScript, com arquitetura de micro-frontends via Module Federation e backend 100% simulado (MSW + Socket.IO). Monorepo orquestrado com Nx e pnpm.

---

## 🏛️ Visão Geral da Arquitetura

O projeto é estruturado em um monorepo Nx contendo 51 projetos independentes com limites arquiteturais e isolamento estrito de domínios:

```
apps/
  shell/        Host: layout, providers, rotas, guards, MSW, realtime, sessão, login, cadastro (porta 4200)
  storefront/   Remote: Catálogo e Detalhes do NFT (porta 4201)
  checkout/     Remote: Carrinho, Pagamento e Confirmação de Pedido (porta 4202)
  account/      Remote: Perfil do Colecionador e Gestão de Carteiras (porta 4203)
  storybook/    Catálogo isolado de componentes UI e documentação interativa (porta 6006)
  web-e2e/      Suite de testes end-to-end e regressão visual com Playwright sobre o sistema integrado

libs/
  shared/
    contracts/   Tipos zod, schemas e validação em runtime de env vars
    money/       Operações e formatação de ETH em strings decimais (via decimal.js)
    http/        Cliente HTTP encapsulado (Axios) com normalização de ApiError
    query/       QueryClient e factories padronizadas do TanStack Query
    router/      Abstração e utilitários para TanStack Router
    realtime/    Cliente de mensageria em tempo real encapsulado (Socket.IO client)
    ui/          Design system, primitivos Radix UI, componentes e tema Tailwind CSS v4
    testing/     Utilitários de teste, helpers e testes automatizados de fronteiras
  shell-kit/     Contexto do Shell, contratos de remotes e inicialização standalone
  mocks/
    core/        Estado reativo determinístico simulado em memória
    fixtures/    Massas de dados e fixtures tipadas
    handlers/    Handlers REST para Mock Service Worker (MSW)
    socket/      Simulação de eventos e canal de tempo real
  <domain>/      8 domínios de negócio divididos em 4 camadas (32 bibliotecas):
    ├── domain/         Regras puras sem I/O ou React (depende só de contracts e money)
    ├── data-access/    Funções de API, queries e mutations
    ├── feature/        Páginas e componentes conectados
    └── ui/             Componentes visuais e apresentacionais puros
```

### Domínios de Negócio

1. **auth**: Autenticação, sessão de usuário e formulários de login/cadastro (`flow:shell`)
2. **catalog**: Descoberta, catálogo de NFTs, busca, ordenação e filtros (`flow:storefront`)
3. **favorites**: Gestão e persistência de NFTs favoritados (`flow:storefront`)
4. **cart**: Itens do carrinho e resumo (`flow:checkout`, `flow:shared` para domain/data-access)
5. **checkout**: Fluxo de pagamento e cotação de pedidos (`flow:checkout`)
6. **orders**: Consulta de histórico e recibos de pedidos (`flow:checkout`)
7. **profile**: Dados cadastrais do colecionador e avatar (`flow:account`)
8. **wallets**: Gestão de carteiras vinculadas (`flow:account`, `flow:shared` para domain/data-access)

---

## 🔒 Regras Invioláveis de Arquitetura

1. **Isolamento de Terceiros**:
   - `axios` é permitido exclusivamente em `@nft/shared-http`.
   - `socket.io-client` é permitido exclusivamente em `@nft/shared-realtime`.
   - `decimal.js` é permitido exclusivamente em `@nft/shared-money`.
   - `@radix-ui/*` é permitido exclusivamente em `@nft/shared-ui`.
   - `msw` é permitido apenas em `mocks/*`, `shell-kit` e `web-e2e`.
   - Violações são bloqueadas via ESLint (`no-restricted-imports`) e validadas por testes automatizados em `@nft/shared-testing`.
2. **Hierarquia de Camadas**:
   - As dependências fluem unidirecionalmente: `app` → `feature` → `ui` / `data-access` → `domain` → `shared`.
   - Bibliotecas de `domain` são 100% puras (sem I/O, sem React e só podem depender de `@nft/shared-contracts` e `@nft/shared-money`).
   - Apps nunca importam diretamente outros apps.
3. **Precisão Monetária**:
   - Valores em ETH são tratados obrigatoriamente como `string` decimal via `@nft/shared-money`. Nenhum `number` toca dinheiro.

---

## 🚀 Pré-requisitos e Instalação

- **Node.js**: `v22` (definido em `.nvmrc`)
- **pnpm**: `v12.11.2` (especificado via `packageManager`)

```bash
# 1. Clonar o repositório e acessar a pasta
git clone <repo-url>
cd jungle-nft-market-frontend

# 2. Configurar variáveis de ambiente
cp .env.example .env

# 3. Instalar dependências (respeitando o lockfile)
pnpm install
```

---

## 🛠️ Comandos Disponíveis

| Comando | Descrição |
|---|---|
| `pnpm design:check` | Valida offline a integridade estrutural de tokens, schemas e presença física de ativos do Figma |
| `pnpm design:tokens` | Compila `tokens.json` na sintaxe `@theme` do Tailwind v4 em `libs/shared/ui/src/styles/theme.css` |
| `pnpm design:icons` | Gera os 35 componentes de ícones SVG nomeados individuais em `libs/shared/ui/src/icons/` |
| `pnpm storybook` | Inicializa o servidor interativo do Storybook na porta 6006 (`apps/storybook`) |
| `pnpm build:storybook` | Compila o catálogo estático do Storybook para `dist/apps/storybook/` |
| `pnpm dev:mocks` | Sobe todos os 4 apps simultaneamente com mocks ativos |
| `pnpm test:dev` | Valida no Chromium o cold start, reload e remotes reais em quatro servidores dev isolados |
| `pnpm dev:shell` | Executa apenas o host Shell (`http://localhost:4200`) |
| `pnpm dev:storefront` | Executa o remote Storefront standalone (`http://localhost:4201`) |
| `pnpm dev:checkout` | Executa o remote Checkout standalone (`http://localhost:4202`) |
| `pnpm dev:account` | Executa o remote Account standalone (`http://localhost:4203`) |
| `pnpm typecheck` | Executa validação de tipos TypeScript em todos os 51 projetos |
| `pnpm lint` | Valida código, acessibilidade (a11y) e regras de fronteiras de módulo |
| `pnpm test` | Executa a suite de testes unitários com Vitest |
| `pnpm build` | Compila os apps e Storybook, consolidando o bundle integrado em `dist/integrated/` |
| `pnpm preview` | Servidor estático Node.js servindo `dist/integrated/` com headers de cache simulados |
| `pnpm e2e` | Executa testes end-to-end e de regressão visual com Playwright (`web-e2e`) |
| `pnpm lighthouse` | Executa auditoria de performance, acessibilidade e SEO |

Para navegar pelo marketplace integrado, use `pnpm dev:mocks`. `dev:shell` requer os remotes em execução em outros terminais. Os quatro apps leem o `.env` da raiz, usam portas fixas estritas e caches Vite separados; após mudar a configuração de dev, reinicie os processos e recarregue o navegador.

---

## 🎨 Design System e Extração do Figma

Todos os artefatos visuais, tokens e fontes foram extraídos do arquivo Figma (`dKMJKBVdX6q0Ym4OX5vd3V`) e versionados localmente no repositório, garantindo builds e pipelines de CI 100% autônomos sem chamadas de rede externas ou tokens de API em tempo de execução:

- `design/tokens/tokens.json`: 65 tokens semânticos consolidados (cores, tipografia, espaçamentos, raios e sombras), cada um com seu respectivo `nodeId` de origem no Figma.
- `design/assets/`: Ícones vetoriais otimizados (`icons/`) e imagens rasterizadas (`images/`), catalogados em `manifest.json` com dimensões, uso e sugestões de `alt` acessível.
- `design/fonts/`: Família tipográfica Roboto Mono self-hosted (pesos 400, 500 e 700 em `.woff2`), acompanhada de `fonts.css` e documentação de escala.
- `design/screenshots/`: Capturas dos 15 frames desktop e mobile em escala 1:1 para referência e testes visuais.
- `design/figma.json`: Registro de proveniência com `fileKey`, timestamp e inventário completo de nós do Figma.
- `docs/design/`: Documentação aprofundada de telas (`screens.md`), componentes e estados não desenhados (`components.md`), notas de fidelidade e tolerâncias de layout (`fidelity-notes.md`), auditoria de contraste WCAG 2.1 AA (`token-audit.md`), responsividade (`responsive.md`), movimento e skeletons (`motion.md`) e decisões arquiteturais de design (`open-questions.md`).

A integridade estrutural e a presença física de todos os arquivos é verificada automaticamente via:
```bash
pnpm design:check
```

---

## 🎭 Simulação de Backend (MSW) e Cenários

O marketplace utiliza um backend 100% simulado via Mock Service Worker (MSW), com repositório em memória atômico, relógio e PRNG determinísticos e pipeline de rede universal.

### Cenários Disponíveis
São 16 cenários prontos para testes e validação da UI:
- `default`: Catálogo completo com 48 NFTs, 2 usuários e rede sem falhas.
- `empty`: Catálogo, avaliações, pedidos e carrinhos vazios (estados de empty state).
- `slow-network`: Latência de 2000ms para inspecionar skeletons e shimmers.
- `variable-latency`: Latência variável pseudo-aleatória entre 300ms e 1500ms.
- `out-of-order`: Inversão determinística de respostas concorrentes.
- `connection-down`: Falha universal de rede (`HttpResponse.error()`).
- `http-4xx` e `http-5xx`: Erros simulados com payload `ApiError` estruturado.
- `recovering-5xx`: Falha transitória 503 com recuperação automática na 3ª tentativa.
- `session-expired`: Tokens expirados retornando HTTP 401 `SESSION_EXPIRED`.
- `forbidden-access`: Acesso negado retornando HTTP 403 `FORBIDDEN`.
- `price-changed-at-checkout`: Cotação com preço alterado (409 `PRICE_CHANGED`).
- `sold-out-at-checkout`: Estoque esgotado no checkout (409 `AVAILABILITY_CONFLICT`).
- `order-timeout-after-create`: Timeout de rede após gravar o pedido no banco (testa recuperação idempotente).
- `payment-confirmed` e `payment-rejected`: Confirmação ou recusa terminal de pagamentos.

### Como Acionar
1. **Via URL**: Acesse `http://localhost:3000/?scenario=<id>` (ex.: `?scenario=slow-network`). A URL é sanitizada limpa e imediatamente via `history.replaceState`.
2. **Via Dev Panel**: Pressione `Ctrl+Alt+M` (ou `Cmd+Alt+M` no Mac) ou acesse `/?mocks-panel=1` para abrir o modal de controle.
3. **Via Automação (`window.__mocks`)**:
   ```javascript
   window.__mocks.setScenario('sold-out-at-checkout');
   window.__mocks.reset(); // Restaura integralmente o snapshot inicial
   window.__mocks.expireSession(); // Força expiração imediata
   window.__mocks.advanceClock(3600000); // Avança relógio em 1 hora
   ```

### Credenciais Fictícias de Demonstração
As senhas são exclusivamente armazenadas na forma de `passwordHash` e `passwordSalt` via PBKDF2/SHA-256 (nunca em texto claro).
- **Alice**: `alice@example.com` ou username `alice` | Senha: `Password123!`
- **Bob**: `bob@example.com` ou username `bob` | Senha: `Password123!`

Para gerar novos hashes de senha: `pnpm mocks:hash <senha>`

#### Como Testar Expiração de Sessão e Retomada de Contexto
1. Faça login com Alice (`alice@example.com` / `Password123!`).
2. Acesse uma rota protegida (ex: `/checkout`, `/perfil` ou `/carteiras`).
3. No console do desenvolvedor, execute `window.__mocks.expireSession()` ou navegue para `/?scenario=session-expired`.
4. Ao disparar uma requisição ou recarregar a tela, a API retornará 401 `UNAUTHENTICATED`. O `SessionController` captura o erro, armazena a rota e os parâmetros atuais no `ResumeStore` (`sessionStorage`) e redireciona para `/login?redirect=...&reason=expired`.
5. Uma mensagem acessível em alerta com `role="alert"` informa: *"Sua sessão expirou. Faça login novamente para continuar."*
6. Ao submeter o formulário de login novamente, a aplicação redireciona automaticamente para a rota onde o usuário estava, retomando o fluxo anterior de onde parou.

#### Como Testar Troca de Conta (Isolamento de Cache A -> B)
1. Faça login como Alice (`alice@example.com`).
2. No menu do usuário no Header, clique em "Desconectar" (ou "Sair").
3. O `SessionController` limpa o `tokenStore`, cancela queries pendentes e executa `queryClient.removeQueries()` para todas as chaves privadas vinculadas a `user_alice`.
4. Faça login com Bob (`bob@example.com`).
5. O Header e as rotas privadas exibem exclusivamente os dados de Bob Santos, garantindo isolamento total sem resquícios ou vazamento de dados do usuário anterior.
#### Como Testar Eventos em Tempo Real (Socket.IO + MSW)
1. Inicie a aplicação com mocks via `pnpm dev:mocks` ou `pnpm preview`.
2. Abra o **Mocks Dev Panel** pelo atalho `Ctrl+Alt+M` (ou acesse `/?mocks-panel=1`).
3. Clique em **⚡ Emitir Preço Alterado (nft.updated)**:
   - O preço do item é atualizado no banco em memória com `version` incrementada e emitido pelo WebSocket via `@mswjs/socket.io-binding`.
   - O `socket.io-client` recebe o evento, o `RealtimeSync` invalida as queries ativas do TanStack Query e um toast/live region anuncia a mudança.
4. Clique em **⚡ Emitir Esgotado (nft.updated)**:
   - A disponibilidade do NFT cai para 0 e a alteração é propagada em tempo real com anúncio acessível.
5. Em testes ou console DevTools, utilize os helpers determinísticos:
   ```js
   window.__mocks.emitNftUpdated({ nftId: 'nft-01', price: '5.20' });
   window.__mocks.emitDuplicateEvent(); // Descartado silenciosamente por deduplicação
   window.__mocks.emitStaleEvent({ nftId: 'nft-01', price: '0.10' }); // Descartado por versionamento monotônico
   window.__mocks.simulateSocketDisconnect(); // Simula queda do socket
   window.__mocks.simulateSocketReconnect(); // Reconcilia catálogo com a API REST
   ```

---

## 📦 Build Consolidado e Deploy (Vercel)

A execução de `pnpm build` orquestra a compilação de todas as aplicações e monta uma distribuição única pronta para deploy em `dist/integrated/`:

O build mantém a verificação de tipos habilitada. Na infraestrutura de mocks, `parseBody` preserva os tipos de saída do Zod (incluindo defaults e transforms); o bootstrap consome o contrato de controles de `mocks-core` e registra o handler WebSocket de `mocks-socket` no MSW.

- `apps/shell` é colocado na raiz `/` (com `index.html` e `assets/`).
- Remotes são agrupados sob `remotes/<nome>/` (`remotes/storefront`, `remotes/checkout`, `remotes/account`).
- `apps/storybook` é gerado e copiado para `dist/integrated/storybook/`, acessível diretamente em `/storybook/`.
- O arquivo `vercel.json` configura o rewrite `{ "source": "/storybook/:path*", "destination": "/storybook/:path*" }` protegendo o Storybook do fallback SPA, além de configurar o fallback SPA para `/index.html` e definir cabeçalhos de cache:
  - Chunks com hash (`/assets/*`, `/remotes/*/assets/*`, `/storybook/assets/*`): `Cache-Control: public, max-age=31536000, immutable`.
  - Manifestos, `remoteEntry.js` e HTMLs: `Cache-Control: public, max-age=0, must-revalidate`.

---

## 🧪 CI/CD

O pipeline configurado em `.github/workflows/ci.yml` executa a cada push e pull request para a branch `main`:
1. Cache de dependências pnpm e cache do Nx (`.nx/cache`).
2. Jobs paralelos via `nx affected` para `typecheck`, `lint`, `test` e `build`.
3. Job isolado de `e2e` rodando Playwright no Chromium com upload automático dos relatórios e traces de execução.

---

## 📋 Débitos Técnicos e Simplificações P1

Para atender ao prazo crítico de entrega, algumas funcionalidades foram deliberadamente simplificadas e registradas como débito técnico. Todos os débitos estão documentados em [`ARCHITECTURE.md` §17](./ARCHITECTURE.md#17-limitações-conhecidas).

### Débitos Técnicos da Home (`storefront-home-catalog`)

- **Stories CSF3 Mínimos**: Criado apenas o story principal `home-page-content.stories.tsx` cobrindo a composição completa da Home (Hero, Catálogo, Filtros, Promo e Blog) com cenários de loading, empty, error e filtros aplicados. A expansão de stories individuais granulares por subcomponente (`HomeHeroBanner`, `CatalogFilterSidebar`, `HomePromoSection`, `HomeBlogSection`) e pseudo-estados interativos está registrada como débito técnico para iterações futuras.

- **Contagens de Facetas Fixas por Cenário**: O handler `GET /api/nfts` retorna as contagens de itens por coleção e por rede (`facets`) calculadas sobre o conjunto base do cenário ativo no MSW. O recálculo cruzado dinâmico facetado (N×M contagens por combinação de filtros ativos) está registrado como débito técnico.

- **Hero e Featured NFT Determinísticos**: O Hero Banner e o banner lateral "NFT EM DESTAQUE" apontam para NFTs fixos da fixture (`nft-01` e `nft-02`). Os dots de navegação do Hero alternam slides visuais fixos sem carrossel dinâmico de dados. A implementação de carrossel dinâmico com rotação de NFTs em destaque baseada em metadados da API está registrada como débito técnico.
