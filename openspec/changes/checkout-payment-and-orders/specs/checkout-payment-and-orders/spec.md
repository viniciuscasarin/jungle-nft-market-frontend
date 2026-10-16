# Checkout Payment and Orders Specification

## Purpose

Definir o formulário de pagamento, revisão da cotação e ciclo de criação e resolução de pedidos simulados, mantendo a compra idempotente e condicionando qualquer navegação de sucesso à resposta confirmada da API.

## Requirements

### Auditoria dos contratos existentes

Os contratos compartilhados já definem `CollectorSchema` (incluindo validação condicional e formato de `secondaryWallet`), `QuoteSchema` com valores ETH decimais em string, `OrderSchema`/`OrderReceiptSnapshotSchema` e os códigos `PRICE_CHANGED`, `AVAILABILITY_CONFLICT` e `IDEMPOTENCY_CONFLICT`. Os testes existentes cobrem esses schemas e a validação condicional; `ApiError` também preserva códigos e detalhes. A auditoria identificou que faltavam no collector os campos usados pelo checkout para registrar a carteira selecionada (`walletType`) e a observação opcional (`note`); ambos passam a integrar o contrato compartilhado e o snapshot. `Idempotency-Key` continua representado apenas como campo `idempotencyKey` no modelo do pedido: o header HTTP será validado no limite do handler, sem duplicar schemas de payload.

### Requirement: Payment page and collector form

O checkout SHALL expor a página de Pagamento como componente do remote `apps/checkout`, protegida no host por `requireAuth`. A página SHALL reaproveitar o layout de referência em `feat/layouts` por componentes apresentacionais de `libs/checkout/ui` e SHALL conectar o formulário em `libs/checkout/feature`. O formulário SHALL usar `react-hook-form`, `zod` e `CollectorSchema` de `@nft/shared-contracts`, pré-preenchendo os campos disponíveis a partir do perfil e da carteira principal da sessão sem persistir alterações na conta.

#### Scenario: Preencher o formulário com dados da conta

- **WHEN** um usuário autenticado abre Pagamento com perfil e carteira carregados
- **THEN** os campos correspondentes de `collector` aparecem pré-preenchidos, podem ser editados para esta compra e não alteram os dados salvos da conta.

#### Scenario: Validar carteira secundária obrigatória

- **WHEN** o usuário marca `useSecondaryWallet` e não fornece `secondaryWallet` com formato `0x` seguido por 40 dígitos hexadecimais
- **THEN** o envio é bloqueado e um erro acessivelmente associado ao campo é exibido.

#### Scenario: Estado assíncrono de dados de checkout

- **WHEN** perfil, carteiras ou cotação estão sendo carregados, falham ou não retornam itens
- **THEN** a página mostra estados de loading com dimensões estáveis e `aria-busy`, erro com retry ou estado vazio aplicável; após sucesso, mostra o formulário e o resumo.

### Requirement: Wallet selection and simulated connection

A página SHALL permitir selecionar `metamask`, `walletconnect` ou `coinbase` e SHALL refletir a carteira simulada disponível. A compra SHALL ficar bloqueada quando a conexão mock estiver recusada ou desconectada, com feedback acessível; nenhum fluxo SHALL alegar conexão real.

#### Scenario: Selecionar carteira mock conectada

- **WHEN** o usuário seleciona uma opção de carteira com conexão simulada ativa
- **THEN** a opção fica selecionada e o `collector.walletType` enviado corresponde à opção escolhida.

#### Scenario: Carteira recusada ou desconectada

- **WHEN** o cenário mock indica recusa ou desconexão da carteira selecionada
- **THEN** o botão de finalizar permanece bloqueado e a página anuncia que a conexão simulada precisa ser restabelecida.

### Requirement: Authoritative quote review and revalidation

O resumo SHALL renderizar itens, quantidades e valores da cotação ativa recebida da API, formatando ETH por `@nft/shared-money`; a interface SHALL não recalcular totais. Antes da criação, o servidor simulado SHALL revalidar cotação, preços, disponibilidade, cupom e taxas. Alteração de valores SHALL exigir nova confirmação explícita do usuário; indisponibilidade SHALL bloquear a compra.

#### Scenario: Revisar a cotação vigente

- **WHEN** a cotação está válida
- **THEN** o resumo mostra os itens e totais recebidos da API, mantendo valores monetários como strings decimais no transporte.

#### Scenario: Preço alterado antes da compra

- **WHEN** a revalidação ou um evento `nft.updated` informa preço, desconto, taxa ou total diferente
- **THEN** o checkout atualiza a cotação exibida, informa a mudança e exige uma nova confirmação do usuário antes de permitir POST do pedido.

#### Scenario: Item esgotado antes da compra

- **WHEN** a revalidação retorna `AVAILABILITY_CONFLICT`
- **THEN** o pedido não é criado, o botão fica bloqueado até a revisão do carrinho e uma mensagem acessível identifica a indisponibilidade.

### Requirement: Idempotent order creation and resolution

O cliente SHALL enviar `POST /api/orders` com `Idempotency-Key` por tentativa lógica e SHALL desabilitar o botão durante o envio, com `aria-busy`. A mutation de pedido SHALL não ter retry automático. O mock SHALL devolver o mesmo pedido para a mesma chave e payload e SHALL responder `409 IDEMPOTENCY_CONFLICT` para a mesma chave com payload diferente. O pedido confirmado SHALL conter snapshot imutável da cotação/recibo. A navegação para `/pedido/:orderId` SHALL ocorrer somente após resposta da simulação com `status: confirmed`.

#### Scenario: Compra confirmada no cenário padrão

- **WHEN** o usuário confirma dados válidos, carteira conectada e cotação vigente e a simulação responde `confirmed`
- **THEN** um único pedido é criado, o snapshot é persistido, apenas os itens e quantidades comprados são removidos do carrinho e o usuário é navegado para `/pedido/:orderId`.

#### Scenario: Cliques repetidos no envio

- **WHEN** o usuário clica várias vezes em finalizar enquanto a mutation está em andamento
- **THEN** o controle permanece desabilitado durante o envio e somente um pedido é criado.

#### Scenario: Recuperar a mesma tentativa idempotente

- **WHEN** a mesma chave e payload são reenviados após timeout ou repetição
- **THEN** a API recupera o mesmo pedido sem debitar estoque ou criar um segundo pedido.

#### Scenario: Conflito de chave com payload diferente

- **WHEN** uma chave já usada é reapresentada com payload diferente
- **THEN** a API retorna `409 IDEMPOTENCY_CONFLICT`, não cria nem confirma outro pedido, e o checkout mostra erro recuperável sem limpar o carrinho.

#### Scenario: Pagamento recusado

- **WHEN** a simulação responde `rejected`
- **THEN** os itens permanecem no carrinho, nenhuma navegação de sucesso acontece e uma mensagem acessível informa a recusa.

#### Scenario: Resposta pendente ou falha de transporte

- **WHEN** a API responde `pending` ou a conexão termina após a criação sem resposta conclusiva
- **THEN** a interface não navega nem indica compra confirmada, consulta `GET /api/orders/:orderId` ou reconcilia pelo identificador idempotente e informa o estado pendente/recuperação.

### Requirement: Order update events and private cache isolation

O checkout SHALL reconciliar pedido e cotação via `socket.io-client`/REST, ignorando eventos privados de outro `userId` e liberando subscriptions no cleanup. Query keys de pedidos SHALL ser geradas pelas factories de `shared/query` e incluir o `userId`; após confirmação, a reconciliação SHALL preservar a regra de limpar apenas itens comprados.

#### Scenario: Atualização do próprio pedido

- **WHEN** chega `order.updated` para pedido do usuário autenticado com versão mais nova
- **THEN** o pedido é reconciliado por REST/query e o estado atualizado é anunciado sem criar uma segunda mutation.

#### Scenario: Atualização de pedido de outro usuário

- **WHEN** chega `order.updated` com `userId` diferente da sessão ativa
- **THEN** o evento é ignorado e nenhum dado privado ou carrinho é alterado.

