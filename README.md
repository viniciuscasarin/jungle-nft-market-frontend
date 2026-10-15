# Jungle NFT Marketplace Frontend

Marketplace de NFTs em React + TypeScript, com arquitetura de micro-frontends via Module Federation e backend 100% simulado (MSW + Socket.IO). Monorepo orquestrado com Nx e pnpm.

---

## 🏛️ Visão Geral da Arquitetura

O projeto é estruturado em um monorepo Nx contendo 50 projetos independentes com limites arquiteturais e isolamento estrito de domínios:

```
apps/
  shell/        Host: layout, providers, rotas, guards, MSW, realtime, sessão, login, cadastro (porta 4200)
  storefront/   Remote: Catálogo e Detalhes do NFT (porta 4201)
  checkout/     Remote: Carrinho, Pagamento e Confirmação de Pedido (porta 4202)
  account/      Remote: Perfil do Colecionador e Gestão de Carteiras (porta 4203)
  web-e2e/      Suite de testes end-to-end com Playwright sobre o sistema integrado

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
| `pnpm dev:mocks` | Sobe todos os 4 apps simultaneamente com mocks ativos |
| `pnpm dev:shell` | Executa apenas o host Shell (`http://localhost:4200`) |
| `pnpm dev:storefront` | Executa o remote Storefront standalone (`http://localhost:4201`) |
| `pnpm dev:checkout` | Executa o remote Checkout standalone (`http://localhost:4202`) |
| `pnpm dev:account` | Executa o remote Account standalone (`http://localhost:4203`) |
| `pnpm typecheck` | Executa validação de tipos TypeScript em todos os 50 projetos |
| `pnpm lint` | Valida código, acessibilidade (a11y) e regras de fronteiras de módulo |
| `pnpm test` | Executa a suite de testes unitários com Vitest |
| `pnpm build` | Compila os apps e consolida o bundle integrado em `dist/integrated/` |
| `pnpm preview` | Servidor SPA estático com headers de cache servindo `dist/integrated/` |
| `pnpm e2e` | Executa testes end-to-end com Playwright (`web-e2e`) |
| `pnpm lighthouse` | Executa auditoria de performance, acessibilidade e SEO |

---

## 📦 Build Consolidado e Deploy (Vercel)

A execução de `pnpm build` orquestra a compilação de todas as aplicações e monta uma distribuição única pronta para deploy em `dist/integrated/`:

- `apps/shell` é colocado na raiz `/` (com `index.html` e `assets/`).
- Remotes são agrupados sob `remotes/<nome>/` (`remotes/storefront`, `remotes/checkout`, `remotes/account`).
- O arquivo `vercel.json` configura o fallback SPA para `/index.html` e define cabeçalhos de cache:
  - Chunks com hash (`/assets/*`, `/remotes/*/assets/*`): `Cache-Control: public, max-age=31536000, immutable`.
  - Manifestos, `remoteEntry.js` e HTMLs: `Cache-Control: public, max-age=0, must-revalidate`.

---

## 🧪 CI/CD

O pipeline configurado em `.github/workflows/ci.yml` executa a cada push e pull request para a branch `main`:
1. Cache de dependências pnpm e cache do Nx (`.nx/cache`).
2. Jobs paralelos via `nx affected` para `typecheck`, `lint`, `test` e `build`.
3. Job isolado de `e2e` rodando Playwright no Chromium com upload automático dos relatórios e traces de execução.
