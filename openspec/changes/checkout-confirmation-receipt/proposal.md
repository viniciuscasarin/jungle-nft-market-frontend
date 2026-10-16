# Proposal: Checkout Confirmation Receipt

## Why

A conclusão de uma compra no Jungle NFT Marketplace exige um recibo imutável e verificável que certifique ao colecionador a aquisição bem-sucedida de suas edições de NFT, detalhando transação, carteiras, itens e valores envolvidos.
Como critério eliminatório de negócio, a tela de confirmação (`/pedido/:orderId`) **só pode renderizar o recibo de compra se o pedido estiver com status `confirmed`** e pertencer ao usuário autenticado, prevenindo que pedidos pendentes, recusados ou de outros usuários exibam falsas confirmações de sucesso.

## What Changes

- **Integração do Recibo de Confirmação na Rota `/pedido/:orderId`**: Conectar a página de confirmação em `apps/checkout` e `libs/orders/feature` ao endpoint `GET /api/orders/:orderId`.
- **Apresentação do Modal de Confirmação (`libs/orders/ui`)**: Migrar e adaptar o layout pronto existente em `feat/layouts` para `libs/orders/ui`, exibindo envelope visual com `IconThankYou`, dados de resumo (ID, data, total em ETH, carteira), tabela de itens e taxas calculadas.
- **Regra Inviolável de Confirmação de Sucesso**:
  - Exibir o recibo de sucesso com snapshot imutável **exclusivamente quando `order.status === 'confirmed'`** e o pedido pertencer ao `userId` da sessão ativa.
  - Para pedidos `pending`, `rejected`, `404` (inexistente) ou pertencentes a outro usuário, renderizar componentes dedicados de `ErrorState` ou status pendente sem jamais exibir o modal ou indicativo de compra bem-sucedida.
- **Snapshot Imutável**:
  - Todos os valores exibidos são obtidos a partir do snapshot gravado no pedido (`receipt`), formatados estritamente via `@nft/shared-money`. Alterações posteriores no catálogo (ex: evento em tempo real `nft.updated`) não alteram os valores do recibo.
- **Ações e Interações no Modal**:
  - Botão "Ver no Etherscan" aciona feedback informativo explícito (`feedback.toastUnavailable('indisponível nesta demonstração')`).
  - Botão de fechar (`X`) e tecla `Esc` fecham o modal e redirecionam o usuário para a página inicial (`/`).
- **Suporte a Acesso Direto e F5**:
  - Rota suporta refresh de página e acesso direto via deep linking com foco acessível e atualização de título (`document.title = 'Confirmação de Pedido | Jungle NFT'`).
- **Divisão P0 (Caminho Feliz / Obrigatório) vs P1 (Débito Técnico)**:
  - P0: Conexão ponta a ponta com `GET /api/orders/:orderId`, renderização estrita de `confirmed`, bloqueio de `rejected`/`pending`, botão Etherscan indisponível, navegação de fechamento para `/` e testes unitários.
  - P1 (Débito técnico documentado em `ARCHITECTURE.md` §17): Adaptação mobile direta via utilitários responsivos em `390px` sobre o modal único (sem redesenho dedicado) e storybook mínimo.

## Capabilities

### New Capabilities
- `order-confirmation-receipt`: Gerenciamento da apresentação e ciclo de vida do recibo imutável de pedidos confirmados, bloqueio de estados não-confirmados e integração com a rota `/pedido/:orderId`.

### Modified Capabilities
- `domain-contracts`: Adição de fixtures e especificações de validação para pedidos determinísticos (`confirmed`, `rejected`, `pending`) suportando cenários de confirmação e recusa.

## Impact

- **Apps e Libs afetados**:
  - `apps/checkout` (`scope:checkout`, `type:app`): Exporta a página remota `ConfirmationPage` consumida pelo host.
  - `apps/shell` (`scope:shell`, `type:app`): Mantém a rota `/pedido/:orderId` em `modalLayoutRoute` com guard `requireAuth`.
  - `libs/orders/ui` (`scope:orders`, `type:ui`, `flow:checkout`): Componente apresentacional `OrderConfirmationModal` e subcomponentes.
  - `libs/orders/feature` (`scope:orders`, `type:feature`, `flow:checkout`): Container de página com hook de busca de pedido, validação de propriedade e guarda de status `confirmed`.
  - `libs/orders/data-access` (`scope:orders`, `type:data-access`): Query options para `GET /api/orders/:orderId` com query keys isoladas por `userId`.
  - `libs/mocks/handlers` e `libs/mocks/core`: Fornece dados determinísticos em `GET /api/orders/:id` com suporte a pedidos em múltiplos status.
  - `apps/web-e2e`: Testes end-to-end do fluxo de confirmação e verificação de não exibição em status de erro.
- **Fora de Escopo**:
  - Páginas de Perfil e Carteiras da conta do colecionador (pertencentes à Etapa 16).
  - Fluxo de pagamento e criação de pedido (Etapa 14).
