# Jungle NFT Marketplace Frontend

Marketplace de NFTs em React e TypeScript com suporte completo para desktop e mobile, integrando catálogo, detalhes de NFT, carrinho, pagamento, confirmação de pedido, autenticação e gestão de colecionador. A aplicação utiliza um backend 100% simulado na camada de rede (MSW + Socket.IO), sem dependência de serviços externos, blockchain real ou carteiras de terceiros.

- **Repositório**: [https://github.com/viniciuscasarin/jungle-nft-market-frontend](https://github.com/viniciuscasarin/jungle-nft-market-frontend)
- **URL Pública (Deploy)**: [https://jungle-nft-market-frontend.vercel.app](https://jungle-nft-market-frontend.vercel.app)

> A versão publicada corresponde integralmente ao código entregue e permanece disponível com suporte a rotas diretas, refresh do navegador, mocks em Service Worker e mensageria em tempo real.

---

## 1. Setup e Instalação

A aplicação é executada a partir de um checkout limpo sem dependência de serviços privados ou backends externos.

### Pré-requisitos

- **Node.js**: `v22.x` (definido em `.nvmrc`)
- **pnpm**: `v12.11.2` (gerenciador oficial do monorepo Nx)

### Passo a Passo

```bash
# 1. Clonar o repositório
git clone https://github.com/viniciuscasarin/jungle-nft-market-frontend.git
cd jungle-nft-market-frontend

# 2. Configurar variáveis de ambiente
cp .env.example .env

# 3. Instalar dependências (respeitando rigorosamente o lockfile)
pnpm install
```

---

## 2. Variáveis de Ambiente

As variáveis de ambiente são validadas em tempo de compilação e execução através de schema Zod (`libs/shared/contracts/src/env.ts`). O arquivo `.env.example` na raiz já contém os valores padrão necessários:

| Variável | Valor Padrão | Descrição |
|---|---|---|
| `VITE_ENABLE_MOCKS` | `true` | Ativa o interceptor Mock Service Worker (MSW) e simulação Socket.IO |
| `VITE_DEFAULT_SCENARIO` | `default` | Cenário padrão de dados inicializado no banco em memória |
| `VITE_API_BASE_URL` | `http://localhost:4200/api` | Base URL para requisições da API simulada |
| `VITE_SOCKET_URL` | `ws://localhost:4200` | Endpoint WebSocket interceptado pelo `@mswjs/socket.io-binding` |
| `VITE_REMOTE_STOREFRONT_URL` | `http://localhost:4201` | URL do remote de Catálogo e PDP para Module Federation em dev |
| `VITE_REMOTE_CHECKOUT_URL` | `http://localhost:4202` | URL do remote de Carrinho e Checkout para Module Federation em dev |
| `VITE_REMOTE_ACCOUNT_URL` | `http://localhost:4203` | URL do remote de Perfil e Carteiras para Module Federation em dev |

---

## 3. Comandos de Execução

Todos os comandos devem ser executados a partir da raiz do monorepo:

| Comando | Descrição |
|---|---|
| `pnpm dev:mocks` | Inicializa os 4 apps de produto simultaneamente com mocks ativos |
| `pnpm dev:shell` | Inicializa apenas o host Shell (`http://localhost:4200`) |
| `pnpm dev:storefront` | Inicializa o remote Storefront standalone (`http://localhost:4201`) |
| `pnpm dev:checkout` | Inicializa o remote Checkout standalone (`http://localhost:4202`) |
| `pnpm dev:account` | Inicializa o remote Account standalone (`http://localhost:4203`) |
| `pnpm build` | Compila os 4 apps e consolida o bundle integrado em `dist/integrated/` |
| `pnpm preview` | Servidor estático Node.js servindo `dist/integrated/` na porta 4200 com fallback SPA |
| `pnpm typecheck` | Executa a verificação estrita de tipos TypeScript em todo o monorepo |
| `pnpm lint` | Valida formatação, acessibilidade (a11y) e regras de fronteiras de módulo |
| `pnpm test` | Executa a suite completa de testes unitários e de integração com Vitest |
| `pnpm e2e` | Executa a suite de testes E2E e regressão visual com Playwright (`web-e2e`) |
| `pnpm lighthouse` | Executa as auditorias de performance, acessibilidade, boas práticas e SEO |

### 3.1. Execução Standalone dos Remotes e Ciclo de Sessão

Cada remote pode ser desenvolvido e testado isoladamente sem a necessidade de subir o Shell host:

- **Storefront (`http://localhost:4201`)**: executa como visitante (`session: null`) por padrão, renderizando a `HomePage` real conectada ao Mock Service Worker (`GET /api/nfts`). Suporta filtros combinados, ordenação, paginação e busca sincronizados na URL via `parseCatalogSearchParams`. Inclui estados acessíveis com skeleton shimmer (`aria-busy`), estado vazio com limpeza de filtros e estado de erro com retry manual. Links externos para PDP (`/nft/:id`) e autenticação navegam para a origem do Shell (`http://localhost:4200`).
- **Account (`http://localhost:4203`)**: utiliza o adaptador de sessão dev (`authenticateDevSession` via `@nft/shell-kit` ou `initSession: 'dev'`) autenticando deterministicamente a fixture da Alice (`alice@example.com`). Configura redirecionamento automático de `/` para `/perfil` e rotas locais para `/perfil` (dados do perfil, bio, apelido da carteira, foto de avatar) e `/carteiras` (carteira principal MetaMask e carteiras secundárias). Toda navegação interna entre abas da conta ocorre localmente no remote, enquanto links para catálogo ou checkout apontam para a origem do Shell (`http://localhost:4200`). Em caso de expiração de sessão (401), exibe tela acessível com botão de reconexão e limpeza de cache privado.
- **Checkout (`http://localhost:4202`)**: apresenta estado explícito e acessível de indisponibilidade ("Fluxo Integrado Obrigatório") em todas as rotas (`/`, `/carrinho`, `/pagamento`, `/pedido/:orderId`), com botão de navegação direta ao Shell integrado (`http://localhost:4200`). Em consonância com a regra inviolável 8 ("Ação fora de escopo não aparenta sucesso"), o checkout não simula compras ou gera recibos fora do fluxo real, pois depende funcionalmente do carrinho ativo, cálculo de cotação da API com cupom e taxas, e confirmação idempotente de pedido com emissão de recibo garantida pelo Shell.

**Regras de Isolamento e Segurança:**
1. **Isolamento por Origem e Resolução de Links**: Links para páginas internas do remote navegam localmente. Links para recursos externos ao remote (PDP, login, carrinho, confirmação) resolvem para a URL canônica na origem do Shell (`http://localhost:4200` ou `shellOrigin` customizado). Tentativas de open redirect são sanitizadas para `/`.
2. **Ciclo de Vida da Sessão e Expiração**: Quando a sessão expira (HTTP 401 `SESSION_EXPIRED`), o harness zera o cache privado (`clearPrivateCache`), cancela requisições em voo, zera o token do `RealtimeClient` e exibe o componente acessível `StandaloneSessionExpired` com ação de "Reconectar Sessão Dev", prevenindo loops infinitos de relogin.
3. **Mocks Desabilitados e Proteção de Produção**: O adaptador de sessão automática recusa a execução se `NODE_ENV === 'production'` ou se `VITE_ENABLE_MOCKS === 'false'`, orientando o desenvolvedor a utilizar o Shell integrado para efetuar login real.
4. **Fronteira com Modo Federado**: No consumo pelo Shell integrado via Module Federation, os remotes exportam unicamente componentes de página. Os adaptadores de dev session nunca são executados no modo federado.

---

## 4. Credenciais Fictícias de Demonstração

Para atender aos requisitos de segurança sem trafegar senhas em texto claro, as credenciais são processadas e validadas por hash criptográfico PBKDF2/SHA-256 com salt aleatório determinístico:

| Usuário | E-mail / Username | Senha | Perfil e Dados |
|---|---|---|---|
| **Alice** | `alice@example.com` ou `alice` | `Password123!` | Colecionadora principal, possui carteiras e histórico de pedidos |
| **Bob** | `bob@example.com` ou `bob` | `Password123!` | Colecionador secundário, utilizado para validar isolamento de contas |

> Para gerar novos pares de hash e salt para fixtures adicionais, execute: `pnpm mocks:hash <senha>`

---

## 5. Seleção e Reset dos Cenários de Mock

O Mock Service Worker (MSW) opera com um banco de dados em memória determinístico e semente PRNG fixa, sustentando 16 cenários prontos para testes funcionais e de resiliência:

### Cenários Disponíveis

- `default`: Catálogo completo com 48 NFTs, 2 usuários cadastrados, carteiras e rede estável.
- `empty`: Catálogo, favoritos, avaliações e pedidos zerados (validação de *empty states*).
- `slow-network`: Latência fixa de 2.000 ms em todas as requisições (inspeção de skeletons e shimmers).
- `variable-latency`: Latência variável pseudo-aleatória entre 300 ms e 1.500 ms.
- `out-of-order`: Inversão determinística na ordem de respostas concorrentes de rede.
- `connection-down`: Falha total de conexão de rede (`HttpResponse.error()`).
- `http-4xx`: Erros HTTP 400 estruturados com payload tipado `ApiError`.
- `http-5xx`: Falhas internas HTTP 500 simuladas com payload `ApiError`.
- `recovering-5xx`: Falha transitória 503 com recuperação automática na 3ª tentativa.
- `session-expired`: Tokens expirados retornando HTTP 401 `SESSION_EXPIRED`.
- `forbidden-access`: Acesso negado retornando HTTP 403 `FORBIDDEN`.
- `price-changed-at-checkout`: Cotação com preço alterado retornando HTTP 409 `PRICE_CHANGED`.
- `sold-out-at-checkout`: Estoque esgotado no checkout retornando HTTP 409 `AVAILABILITY_CONFLICT`.
- `order-timeout-after-create`: Timeout de rede após gravar o pedido (testa recuperação idempotente).
- `payment-confirmed`: Pagamento aprovado com geração imediata de recibo imutável.
- `payment-rejected`: Pagamento recusado por saldo insuficiente mantendo o carrinho intacto.

### Modos de Seleção

1. **Via URL**: Adicione o parâmetro `?scenario=<id>` a qualquer rota (exemplo: `http://localhost:4200/?scenario=slow-network`). A URL é sanitizada limpa imediatamente via `history.replaceState`.
2. **Via Mocks Dev Panel**: Pressione o atalho de teclado `Ctrl + Alt + M` (ou `Cmd + Alt + M` no macOS) ou acerte a rota com `/?mocks-panel=1` para abrir o modal de controle interativo.
3. **Via Console do Navegador (`window.__mocks`)**:
   ```javascript
   window.__mocks.setScenario('sold-out-at-checkout');
   window.__mocks.expireSession();
   window.__mocks.advanceClock(3600000); // Avança 1 hora
   ```

### Reset Completo

Para restaurar integralmente o estado determinístico inicial do cenário ativo:
- Clique no botão **"Restaurar Padrão"** no painel de controle (`Ctrl+Alt+M`).
- Ou execute no console: `window.__mocks.reset()`.

---

## 6. Instruções para Reproduzir os Fluxos de Falha

### 6.1. Falha de Conexão e Erros HTTP 4xx / 5xx
1. Acesse a Home ou o Detalhe de um NFT (`/nft/nft-01`).
2. Abra o Dev Panel (`Ctrl+Alt+M`) e selecione o cenário `connection-down` ou `http-5xx` (ou passe `/?scenario=http-5xx` na URL).
3. Ao recarregar a tela ou navegar para outra página, a aplicação exibe a tela de erro acessível com `role="alert"` e botão **"Tentar novamente"**.
4. No cenário `recovering-5xx`, clique em "Tentar novamente": a requisição se recupera automaticamente e exibe o conteúdo com sucesso na 3ª tentativa.

### 6.2. Sessão Expirada e Retomada de Contexto
1. Faça login como Alice (`alice@example.com` / `Password123!`).
2. Acesse uma rota protegida (exemplo: `/pagamento`, `/perfil` ou `/carteiras`).
3. No console, dispare `window.__mocks.expireSession()` (ou selecione `session-expired` no painel `Ctrl+Alt+M`).
4. Ao realizar qualquer ação ou atualizar a tela, a API retorna HTTP 401 `SESSION_EXPIRED`. O `SessionController` intercepta o erro, armazena a rota de origem no `ResumeStore` e redireciona para `/login?reason=expired`.
5. Uma mensagem acessível anuncia: *"Sua sessão expirou. Faça login novamente para continuar."*
6. Ao fazer login novamente com a mesma conta, o usuário é automaticamente devolvido à tela onde estava, sem perder o fluxo.

### 6.3. Conflito de Cadastro e Validação de Formulário
1. Acesse a tela de cadastro em `/cadastro`.
2. Tente cadastrar uma nova conta utilizando o e-mail de um usuário existente (`alice@example.com`).
3. O formulário envia a requisição e a API simulada retorna HTTP 409 `CONFLICT` com `fieldErrors: { email: "Este e-mail já está cadastrado." }`.
4. O erro retornado pela API é mapeado diretamente no campo de e-mail com `aria-invalid="true"` e anunciado acessivelmente via `aria-describedby`.

### 6.4. Cupom Inválido ou Expirado no Carrinho
1. Adicione um NFT ao carrinho e navegue até `/carrinho`.
2. No campo de cupom de desconto:
   - Digite `EXPIRADO` e clique em aplicar: a API recusa com aviso de cupom expirado.
   - Digite `INVALIDO` e clique em aplicar: a API recusa com código de cupom inexistente.
3. Digite o cupom válido `JUNGLE10`: o desconto é concedido pela cotação da API e refletido no resumo de valores.

### 6.5. Alteração de Preço ou Edição Esgotada Durante o Checkout
1. Adicione itens ao carrinho e avance até `/pagamento`.
2. **Cenário Preço Alterado**: Selecione o cenário `price-changed-at-checkout` ou dispare via console `window.__mocks.emitNftUpdated({ nftId: 'nft-01', price: '9.99' })`.
   - A cotação em aberto é invalidada; a API retorna HTTP 409 `PRICE_CHANGED` caso o envio seja tentado.
   - A interface exibe aviso de divergência de cotação e exige revisão dos novos valores antes de confirmar.
3. **Cenário Esgotado**: Selecione o cenário `sold-out-at-checkout` ou dispare `window.__mocks.emitNftUpdated({ nftId: 'nft-01', availableSupply: 0 })`.
   - O checkout bloqueia a finalização, sinalizando item esgotado com feedback acessível.

### 6.6. Timeout após Criação do Pedido e Recuperação por Idempotência
1. Faça login como Alice e acesse `/pagamento`.
2. Ative o cenário `order-timeout-after-create` via Dev Panel (`Ctrl+Alt+M`).
3. Clique em **"Confirmar compra"**: a API grava o pedido no banco determinístico, mas simula uma queda de rede/timeout na resposta HTTP.
4. A UI aciona a rotina de recuperação idempotente reenviando a requisição com o mesmo cabeçalho `Idempotency-Key`:
   - A simulação reconhece a chave prévia e retorna o pedido já criado com sucesso, sem duplicar compras ou cobranças.
   - O usuário é direcionado para a tela de confirmação `/pedido/:orderId` com o recibo imutável.

### 6.7. Pagamento Recusado
1. No fluxo de `/pagamento`, selecione o cenário `payment-rejected`.
2. Clique em **"Confirmar compra"**.
3. O pedido é registrado como `rejected` na simulação por saldo insuficiente.
4. A aplicação **permanece na tela de pagamento** (sem navegar para a confirmação), exibe um alerta de erro acessível informando a recusa e **mantém o carrinho 100% preservado**.

### 6.8. Latência Variável e Skeletons com Shimmer
1. Ative o cenário `slow-network` via URL (`/?scenario=slow-network`) ou Dev Panel.
2. Navegue entre o Catálogo (`/`) e o Detalhe do NFT (`/nft/nft-01`).
3. Observe os skeletons com efeito shimmer preservando as dimensões exatas dos cards e imagens (sem deslocamento de layout / CLS).
4. No sistema operacional, ative a preferência de "Movimento Reduzido" (*prefers-reduced-motion*): a animação de shimmer é desativada instantaneamente, exibindo cor sólida estática.

### 6.9. Eventos de Tempo Real Obsoletos, Duplicados e Desconexão do Socket
1. Com a aplicação em execução, abra o console do navegador e execute:
   ```javascript
   // Emite evento com versão retroativa (deve ser ignorado sem regredir o estado)
   window.__mocks.emitStaleEvent({ nftId: 'nft-01', price: '0.01' });

   // Emite evento idêntico duplicado (deve ser descartado silenciosamente por ID)
   window.__mocks.emitDuplicateEvent();

   // Simula queda temporária da conexão WebSocket
   window.__mocks.simulateSocketDisconnect();

   // Simula reconexão (reconciliação automática do estado ativo com a API REST)
   window.__mocks.simulateSocketReconnect();
   ```

---

## 7. Documentação de Arquitetura

As decisões técnicas, contratos e políticas detalhadas estão documentadas em [`ARCHITECTURE.md`](./ARCHITECTURE.md), abrangendo:

- **Motivações do Monorepo**: Justificativas de desacoplamento DDD, escalabilidade, bundle otimizado e prontidão para produção ([`ARCHITECTURE.md` Motivações](./ARCHITECTURE.md#🏛️-motivações-da-arquitetura-em-monorepo)).
- **Metodologia OpenSpec**: Rastreabilidade do fluxo Spec-Driven Development, especificações e artefatos de tarefas ([`ARCHITECTURE.md` Metodologia](./ARCHITECTURE.md#📋-metodologia-de-desenvolvimento-openspec) e [`openspec/`](./openspec/)).
- **Contratos REST e Eventos**: Endpoints, schemas Zod, envelopes Socket.IO e códigos de erro normalizados ([`ARCHITECTURE.md` §6](./ARCHITECTURE.md#6-contratos-rest-e-eventos) e [`docs/contracts.md`](docs/contracts.md)).
- **Política de Sessão**: Recuperação após refresh, expiração com retomada de contexto e isolamento por usuário ([`ARCHITECTURE.md` §8](./ARCHITECTURE.md#8-sessão)).
- **Estado do Carrinho**: Fonte de verdade no servidor, fusão ao autenticar e integridade monetária ([`ARCHITECTURE.md` §9](./ARCHITECTURE.md#9-carrinho)).
- **Estratégia de Cache**: TanStack Query, chaves tipadas, revalidação e rollback otimista ([`ARCHITECTURE.md` §10](./ARCHITECTURE.md#10-estratégia-de-cache-tanstack-query) e [`docs/cache-policy.md`](docs/cache-policy.md)).
- **Reconciliação REST e Socket.IO**: Invalidação direcionada, deduplicação e ordenação monotônica ([`ARCHITECTURE.md` §11](./ARCHITECTURE.md#11-tempo-real-e-reconciliação-com-rest)).
- **Limitações e Débitos Técnicos**: Decisões de escopo e particularidades de mock ([`ARCHITECTURE.md` §17](./ARCHITECTURE.md#17-limitações-conhecidas)).
- **Decisões de UX**: Ações fora de escopo, modais como URLs e navegação acessível ([`ARCHITECTURE.md` §18](./ARCHITECTURE.md#18-decisões-de-ux)).
- **Desvios do Figma e Acessibilidade**: Tolerâncias visuais, contrastes WCAG e adequações mobile ([`ARCHITECTURE.md` §19](./ARCHITECTURE.md#19-desvios-do-figma-e-ajustes-de-acessibilidade) e [`docs/design/fidelity-notes.md`](docs/design/fidelity-notes.md)).
