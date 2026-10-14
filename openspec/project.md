# Jungle NFT Marketplace Frontend

## 1. Visão Geral
NFT Marketplace em React + TypeScript para descoberta, compra e gerenciamento de conta do colecionador (desktop e mobile).
O backend é 100% simulado através de MSW (Mock Service Worker) e Socket.IO simulado com `@mswjs/socket.io-binding`. Não há conexões com blockchain, carteiras reais ou gateways de pagamento reais.

## 2. Estrutura do Monorepo (Nx + pnpm)
- **`apps/shell`** (Host): Layout principal, rotas, guards, sessão, MSW, QueryClient, HttpClient, RealtimeClient, autenticação.
- **`apps/storefront`** (Remote): Home (catálogo de NFTs, filtros, busca) e PDP (página de detalhes do NFT).
- **`apps/checkout`** (Remote): Carrinho, cotação, pagamento e confirmação de pedido.
- **`apps/account`** (Remote): Perfil do colecionador e gestão de carteiras.
- **`apps/web-e2e`**: Testes ponta a ponta com Playwright.
- **`libs/shared/*`**: Bibliotecas compartilhadas (`contracts`, `money`, `http`, `query`, `router`, `realtime`, `ui`, `testing`).
- **`libs/shell-kit`**: Contratos de remotes, ShellContext e bootstrap standalone.
- **`libs/mocks/*`**: Handlers MSW, fixtures, core state e socket simulado.
- **`libs/<domain>/*`**: Camadas `domain`, `data-access`, `feature` e `ui` por domínio de negócio.

## 3. Diretrizes Críticas e Regras Invioláveis
1. **Mocks restritos à rede**: Respostas simuladas vivem exclusivamente em `libs/mocks/*`. Componentes, hooks e clients não contêm dados mockados ou flags de mock.
2. **Tempo real via Socket.IO**: Eventos em tempo real obrigatoriamente passam por `socket.io-client`. Proibido disparar eventos simulados via setters ou manipulação direta de cache.
3. **Moeda e Valores (ETH)**: Valores monetários em ETH são estritamente strings decimais (usando `decimal.js` encapsulado em `shared/money`). Proibido uso de `number` ou aritmética nativa para valores monetários.
4. **Cotação centralizada**: Todos os totais (subtotal, desconto, taxa, total) vêm da cotação calculada pela API simulada.
5. **Isolamento de Sessão**: Query keys privadas devem incluir `userId`. Logout deve limpar cache privado, cancelar queries e desconectar realtime.
6. **Idempotência e Confirmação**: Criação de pedidos usa `Idempotency-Key`. Tela de confirmação só renderiza para pedidos `confirmed`.
7. **Documentação Complementar**: Consulte [`ARCHITECTURE.md`](../ARCHITECTURE.md) para detalhes técnicos de arquitetura e [`AGENTS.md`](../AGENTS.md) para diretrizes e regras de implementação.
