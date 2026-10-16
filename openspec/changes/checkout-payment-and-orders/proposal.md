# Proposal: Checkout Payment and Orders

## Why

O marketplace já possui um layout estático de Pagamento na branch `feat/layouts`, mas ainda precisa conectar a revisão da cotação, os dados do colecionador e as carteiras à criação simulada do pedido. Esta etapa entrega o caminho de compra ponta a ponta e preserva a regra eliminatória: a navegação para `/pedido/:orderId` só acontece depois que a API simulada responde com `confirmed`.

## What Changes

- Extrair e reaproveitar os componentes visuais de Pagamento da branch `feat/layouts` em `libs/checkout/ui` e completar os componentes de pedido em `libs/orders/ui`, sem I/O nessas camadas.
- Conectar o formulário `collector`, a cotação e a seleção da carteira em `libs/checkout/feature`, usando `react-hook-form` e `zod` com os contratos existentes.
- Implementar o domínio e o acesso a dados de pedidos em `libs/orders/domain` e `libs/orders/data-access`, incluindo criação com `Idempotency-Key`, recuperação e consulta do pedido.
- Criar handlers determinísticos em `libs/mocks/handlers` para validar a chave, revalidar cotação/disponibilidade, persistir snapshot e limpar do carrinho somente os itens comprados após confirmação.
- Expor `PaymentPage` no remote `apps/checkout`; o host mantém rota e `requireAuth`.
- Separar execução em P0 (compra funcional, regras eliminatórias e falhas críticas) e P1 (débitos técnicos de prazo documentados em `ARCHITECTURE.md` §17).

## Capabilities

### New Capabilities
- `checkout-payment-and-orders`: formulário de pagamento, revisão da cotação, criação idempotente e desfechos simulados do pedido.

## Impact

### Apps e libs afetados

| Projeto | Tags Nx | Papel |
|---|---|---|
| `apps/checkout` | `scope:checkout`, `type:app` | Exportar a página remota `PaymentPage`. |
| `apps/shell` | `scope:shell`, `type:app` | Manter rota protegida por `requireAuth`; não transferir ownership de rotas ao remote. |
| `libs/checkout/domain` | `scope:checkout`, `type:domain`, `flow:checkout` | Regras puras de preparação/comparação da revisão do checkout, quando não cobertas pelos contratos. |
| `libs/checkout/data-access` | `scope:checkout`, `type:data-access`, `flow:checkout` | Consulta da cotação e acesso a mutations necessárias ao fluxo. |
| `libs/checkout/feature` | `scope:checkout`, `type:feature`, `flow:checkout` | Formulário conectado, estado de revisão e orquestração da compra. |
| `libs/checkout/ui` | `scope:checkout`, `type:ui`, `flow:checkout` | Extração do layout de Pagamento; apenas apresentação. |
| `libs/orders/domain` | `scope:orders`, `type:domain`, `flow:checkout` | Regras puras de transição, idempotência e recibo/snapshot. |
| `libs/orders/data-access` | `scope:orders`, `type:data-access`, `flow:checkout` | POST/GET, query options e mutations sem retry automático de pedido. |
| `libs/orders/feature` | `scope:orders`, `type:feature`, `flow:checkout` | Integração dos estados do pedido e resolução após envio/recuperação. |
| `libs/orders/ui` | `scope:orders`, `type:ui`, `flow:checkout` | Apresentação do resumo/estados de pedido; recibo de confirmação visual completo continua na Etapa 15. |
| `libs/mocks/handlers` | `scope:mocks`, `type:handler` | Endpoints de pedidos e validação/revalidação dentro da fronteira de rede simulada. |
| `libs/mocks/core` e `libs/mocks/fixtures` | `scope:mocks`, `type:util` / `type:fixture` | Estado determinístico, estoque, pedido e snapshot. |
| `apps/web-e2e` | `scope:web-e2e`, `type:app` | E2E dos fluxos de compra e cenários críticos. |

### Fora de escopo

- Implementar a tela/modal do recibo de confirmação em `/pedido/:orderId`, pertencente à Etapa 15 (`checkout-confirmation-receipt`). Esta change só navega após a confirmação simulada e deixa a página de destino para aquela etapa.
- Integrações reais de blockchain, extensões de carteira ou gateways de pagamento.
- Alterar o perfil/carteiras persistidos ao editar os dados no checkout.

### Premissas e débitos técnicos propostos

- A branch de referência disponível chama-se `feat/layouts` (plural); seus componentes são fonte visual estática a extrair, não lógica de negócio.
- A retomada de sessão pode depender do pré-preenchimento atualizado de perfil/carteira; persistência completa de rascunho do `collector` fica como P1.
- A escolha da carteira seleciona a carteira mock conectada existente; cenário de recusa/desconexão pode ser um controle determinístico simples, sem modal intermediário.
- No cenário padrão, o mock pode devolver `confirmed` na resposta de criação. `pending` e reconciliação após timeout/refresh permanecem cobertos por contrato/teste, com fluxo prolongado simplificado como P1.
- Um story CSF3 básico é suficiente nesta etapa; cobertura granular de stories fica como P1.
- A sequência de confirmação visual e recibo continua separada. A resposta `confirmed` e o snapshot do pedido são evidência da simulação, mas a página de confirmação só deverá exibir sucesso quando a Etapa 15 consultar o pedido confirmado.

