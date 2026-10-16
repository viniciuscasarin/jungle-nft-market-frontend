# Design

## Context

Consulte `proposal.md` para a motivação e `specs/checkout-payment-and-orders/spec.md` para os requisitos. A branch `feat/layouts` contém componentes visuais de Pagamento, mas alguns usam conteúdo de demonstração como defaults e controlam feedback de compra internamente. Os contratos atuais em `@nft/shared-contracts` já representam perfil, carteiras, cotação, collector, pedido e snapshot; a auditoria registrou na spec que o header HTTP `Idempotency-Key` precisa ser validado no handler.

## Goals / Non-Goals

**Goals:**

- Preservar a composição visual da referência, deixando itens, totais, perfil e carteiras como dados fornecidos pelas camadas de feature/API.
- Manter UI apresentacional; estado do formulário, cotação, carteira simulada e resolução do pedido pertencem à feature/data-access.
- Fazer a confirmação depender exclusivamente da resposta `confirmed` do mock de pedidos.
- Reutilizar contratos compartilhados e ampliá-los apenas quando a auditoria de integração demonstrar que um campo de transporte necessário está ausente.

**Non-Goals:**

- Conectar carteiras, blockchain ou gateways reais.
- Introduzir uma segunda fonte de dados ou cálculos de totais no cliente.
- Exibir sucesso otimista antes da confirmação do pedido.

## Decisions

1. **UI recebe dados por props e não fornece defaults de domínio.** Stories podem fornecer fixtures explícitas para demonstração visual; componentes de produção recebem dados da feature. Isso evita que o layout sugira itens, carteiras ou totais que não vieram do backend. Alternativa considerada: manter defaults do Figma e sobrescrevê-los durante a integração; rejeitada porque esses defaults podem ser renderizados como dados reais.
2. **A feature controla o formulário e os estados de compra.** Componentes UI emitem ações e mostram estados recebidos por props, sem abrir modal de sucesso ou anunciar processamento por conta própria. A feature somente navega/exibe confirmação após validar `status: confirmed`. Alternativa considerada: manter o modal no callback visual; rejeitada porque o callback não prova que a simulação confirmou o pedido.
3. **Contratos de transporte são compartilhados e mocks permanecem em `libs/mocks`.** Perfil, carteiras e cotação usam os schemas existentes. Se campos de resposta necessários pelo layout estiverem ausentes, a mudança será feita em `shared/contracts` e no handler/fixture correspondente, em vez de introduzir tipos paralelos ou dados locais. O header idempotente é validado no limite HTTP.
4. **Valores monetários são renderizados a partir da cotação da API.** Valores passam por `shared/money` para formatação, sem recálculo de subtotais, taxas ou total na UI. Alternativa considerada: calcular resumo dos itens no cliente; rejeitada pela regra de total autoritativo.

## Risks / Trade-offs

- [O layout de referência contém placeholders além dos defaults identificados] → Auditar cada componente durante a extração e mover qualquer dado de demonstração para stories/fixtures de mock; produção usa apenas props vindas da feature.
- [A API atual pode não expor todos os campos visuais necessários] → Comparar os schemas e handlers antes de conectar e ampliar contratos/fixtures/handlers em conjunto, sem criar fallback local.
- [A resposta pode ser `pending` ou perder-se após criação] → Não navegar nem anunciar sucesso; consultar o pedido e/ou recuperar a tentativa pela chave idempotente conforme os contratos existentes.

## Migration Plan

1. Extrair os componentes da branch de layout para as libs de UI e converter conteúdo de domínio em props.
2. Implementar helpers e data-access usando os contratos existentes; adicionar campos somente onde a integração comprovar lacuna.
3. Ligar UI, mocks e resolução de pedido; validar os estados confirmados, recusados e pendentes.
4. Se a integração falhar, reverter as mudanças da change mantendo intactos os contratos e módulos preexistentes.
