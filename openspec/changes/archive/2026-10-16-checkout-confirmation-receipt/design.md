# Design: Checkout Confirmation Receipt

## Context
Ver `proposal.md` para motivação e `specs/order-confirmation-receipt/spec.md` para requisitos.
O layout do modal de confirmação já foi desenvolvido como protótipo estático na branch `feat/layouts` (`libs/checkout/ui/src/order-confirmation-modal.tsx`).
A rota `/pedido/:orderId` já existe na árvore de rotas de `apps/shell/src/routes.tsx` sob `modalLayoutRoute` com guard `requireAuth`, apontando para a página remota `checkout/ConfirmationPage`.
A stack consome TanStack Query v5 compartilhado via `useShell()`, com cliente HTTP padronizado e tratamento de erro via `ApiError`.

## Goals / Non-Goals

**Goals:**
- Conectar a página de confirmação (`apps/checkout/src/ConfirmationPage.tsx`) aos dados de `GET /api/orders/:orderId` através de `libs/orders/feature` e `libs/orders/data-access`.
- Migrar o componente apresentacional `OrderConfirmationModal` para `libs/orders/ui`, garantindo conformidade com as regras de fronteiras do monorepo Nx (`scope:orders`, `type:ui`, `flow:checkout`).
- Garantir que apenas pedidos `confirmed` de posse do usuário logado renderizem o recibo de compra.
- Garantir o isolamento do snapshot do recibo contra mutações subsequentes no catálogo.
- Fornecer handlers MSW com fixtures de pedidos em múltiplos estados (`confirmed`, `rejected`, `pending`).
- Estruturar a entrega em **P0 (Caminho Feliz / Obrigatório)** e **P1 (Débito Técnico)** para cumprimento do prazo crítico.

**Non-Goals:**
- Criação e envio de ordens de pagamento no checkout (escopo da Etapa 14).
- Redesenhar um layout mobile totalmente distinto para o modal (será utilizada adaptação responsiva direta via Tailwind no mesmo componente).

## Decisions

### 1. Migração de `OrderConfirmationModal` para `libs/orders/ui`
- **Decisão**: Mover o componente de modal pronto da branch `feat/layouts` para `libs/orders/ui/src/order-confirmation-modal.tsx`, com tipagem de entrada estritamente apresentacional desacoplada de chamadas de rede.
- **Alternativas consideradas**:
  - Manter em `libs/checkout/ui`: violaria o princípio de domínio onde visualização e histórico de pedidos residem em `orders`.
- **Impacto de dependência**: `libs/orders/ui` depende apenas de `@nft/shared-ui` e `@nft/shared-money`.

### 2. Camada de Acesso a Dados em `libs/orders/data-access`
- **Decisão**: Criar a query factory `orderQueries.detail(orderId, userId)` com query key `['orders', 'detail', userId, orderId]`.
- **Rationale**: Cumpre a Regra Inviolável 5 (Isolamento por usuário em query keys privadas). O `userId` é obtido da sessão através de `useSession()` / `useShell()`.

### 3. Guarda de Status e Verificação de Posse em `libs/orders/feature`
- **Decisão**: A página inteligente (`OrderConfirmationFeaturePage` ou similar) avalia:
  1. `isLoading`: Exibe skeleton ou spinner acessível com `aria-busy="true"`.
  2. `isError` ou `order.userId !== session.userId`: Exibe `ErrorState` com título "Pedido não encontrado" e botão de retorno para `/`.
  3. `order.status === 'rejected'`: Exibe `ErrorState` com o motivo da recusa (`order.rejectionReason`) sem elementos comemorativos de sucesso.
  4. `order.status === 'pending'`: Exibe alerta informativo de transação em processamento na rede.
  5. `order.status === 'confirmed'`: Renderiza `OrderConfirmationModal` passando os dados formatados do snapshot.

### 4. Resolução das Ações Interativas
- **Decisão**:
  - Fechamento (`X`, `Esc`, backdrop): dispara `navigate({ to: '/' })` via `@nft/shared-router`.
  - Botão "Ver no Etherscan": invoca `feedback.toastUnavailable('indisponível nesta demonstração')` provido por `useShell()`.

### 5. P0 vs P1 (Débito Técnico - `ARCHITECTURE.md` §17)
- **Decisão**:
  - **P0**: Lógica de renderização de `confirmed`, bloqueio de `rejected`/`pending`, formatação via `shared-money`, query keys com `userId`, navegação para `/` e ação indisponível no Etherscan.
  - **P1**: Adaptação mobile via classes Tailwind (`max-w-[578px] w-full px-4 text-center overflow-y-auto`) sem refatoração estrutural profunda e 1 story básico CSF3.

## Risks / Trade-offs

- **[Risco] Pedidos não persistidos no banco MSW ao acessar diretamente `/pedido/:orderId` via F5**:
  - *Mitigação*: Criar fixtures estáticas pré-carregadas no estado padrão do banco de mocks (`mockOrders` com pelo menos um pedido `confirmed` e um `rejected` para o usuário de teste `user_1`).
- **[Risco] Eventos de socket `nft.updated` causarem re-render com valores recalculados**:
  - *Mitigação*: Todos os valores exibidos derivam exclusivamente de `order.receipt` (snapshot imutável gravado no momento da confirmação). Não há consulta cruzada aos dados dinâmicos do catálogo.
