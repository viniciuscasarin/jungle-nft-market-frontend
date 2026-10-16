# order-confirmation-receipt Specification

## Purpose
Gerenciamento da apresentação e ciclo de vida do recibo imutável de pedidos confirmados, bloqueio de estados não-confirmados e integração com a rota `/pedido/:orderId`.

## Requirements

### Requirement: Exclusividade de Renderização para Pedidos Confirmados
O sistema SHALL renderizar o modal e recibo de compra bem-sucedida exclusivamente quando o pedido consultado em `GET /api/orders/:orderId` possuir status `confirmed` e pertencer ao usuário autenticado (`order.userId === session.userId`). Para quaisquer outros status (`pending`, `rejected`), pedidos inexistentes ou pertencentes a outro usuário, o sistema SHALL renderizar estado de erro explícito (`ErrorState`), sem exibir indicativo de sucesso.

#### Scenario: Pedido confirmado com sucesso
- **WHEN** o usuário autenticado acessa `/pedido/:orderId` de um pedido com status `confirmed`
- **THEN** o sistema exibe o modal de confirmação de pedido com o envelope visual de agradecimento e os detalhes da transação.

#### Scenario: Pedido rejeitado pela simulação
- **WHEN** o usuário acessa `/pedido/:orderId` de um pedido com status `rejected`
- **THEN** o sistema exibe uma mensagem clara de recusa do pedido e NÃO renderiza o modal de confirmação de compra nem a mensagem de sucesso.

#### Scenario: Pedido pendente de processamento
- **WHEN** o usuário acessa `/pedido/:orderId` de um pedido com status `pending`
- **THEN** o sistema exibe indicativo de processamento em andamento sem aparentar confirmação definitiva de compra.

#### Scenario: Pedido inexistente ou pertencente a outro usuário
- **WHEN** o usuário acessa `/pedido/:orderId` inexistente (`404`) ou pertencente a outro `userId`
- **THEN** o sistema exibe um estado de erro com ação para retornar ao início.

### Requirement: Imutabilidade do Snapshot do Recibo
O sistema SHALL renderizar todas as informações do recibo a partir do snapshot imutável (`order.receipt` / `order`), formatando todos os valores em ETH estritamente via `@nft/shared-money`. Mutações posteriores no catálogo (como eventos `nft.updated` de alteração de preço ou edições esgotadas) SHALL NOT alterar os valores registrados no recibo.

#### Scenario: Exibição fiel do snapshot do recibo
- **WHEN** o modal de confirmação é renderizado
- **THEN** os valores de subtotal, taxa de rede e total coincidem estritamente com os dados do snapshot do pedido e utilizam formatação decimal de `@nft/shared-money`.

#### Scenario: Resistência a atualizações de preço no catálogo
- **WHEN** um evento de atualização de catálogo (`nft.updated`) altera o preço de um item adquirido após a confirmação da compra
- **THEN** o recibo exibido na rota `/pedido/:orderId` preserva inalterados os preços e totais pagos no momento da compra.

### Requirement: Ações e Acessibilidade do Modal de Confirmação
O modal de confirmação SHALL manter atributos semânticos (`role="dialog"`, `aria-modal="true"`), foco controlado e suporte a fechamento via `Esc` ou botão `X` navegando para `/`. O botão "Ver no Etherscan" SHALL acionar aviso explícito de indisponibilidade nesta demonstração. A interface SHALL ser responsiva e livre de overflow horizontal em 390px.

#### Scenario: Clique no botão Ver no Etherscan
- **WHEN** o usuário clica no botão "Ver no Etherscan"
- **THEN** o sistema exibe um toast informando "indisponível nesta demonstração" sem navegar para links externos inexistentes.

#### Scenario: Fechamento do modal via teclado ou botão
- **WHEN** o usuário pressiona a tecla `Esc` ou clica no botão de fechar (`X`)
- **THEN** o sistema fecha o modal e navega para `/`.

#### Scenario: Acesso direto e refresh (F5)
- **WHEN** o usuário recarrega (F5) ou acessa diretamente a URL `/pedido/:orderId`
- **THEN** o título da página é anunciado como "Confirmação de Pedido | Jungle NFT", o foco é posicionado no container principal e os dados do pedido são recarregados da API.
