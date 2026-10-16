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

## 📦 Build Consolidado e Deploy (Vercel)

A execução de `pnpm build` orquestra a compilação de todas as aplicações e monta uma distribuição única pronta para deploy em `dist/integrated/`:

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
