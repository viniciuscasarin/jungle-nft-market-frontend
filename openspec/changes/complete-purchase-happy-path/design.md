# Design

## Context

Ver `proposal.md` para motivação e escopo. Há UI de carrinho e handlers locais ainda não commitados, mas `cart/data-access` está vazio e `CartPage` é provisório. O detalhe usa `notifyUnavailable`; pagamento usa fallback `quote-999` e metadados fixos. Auth já suporta merge guest no servidor. A integração cruza shell, catálogo, carrinho e checkout, justificando este design.

## Goals / Non-Goals

**Goals:** um único percurso de compra reutilizando APIs e componentes existentes, com mudanças pequenas e verificáveis.

**Non-Goals:** checkout paralelo de compra direta, infraestrutura nova, sincronização otimista, nova camada genérica ou expansão da conta.

## Decisions

1. **Resposta da API antes do cache.** Queries e mutations em cart/data-access recebem HttpClient/contexto da feature; após sucesso usam a resposta validada e invalidam dependências. Feedback fica na feature/shell. Alternativa otimista adiada: exigiria snapshots, rollback e tratamento de concorrência sem desbloquear a compra.
2. **Conexão na feature.** CartPage delega para cart/feature, que consome cart/ui e data-access. PDP consome apenas a API pública de cart/data-access; shell consulta contador sem importar feature de checkout. Nunca colocar fetch em UI, apesar do exemplo da change anterior. Singletons vêm de useShell e nenhuma fronteira é desativada.
3. **Identidade existente.** Usar o guest ID existente e `x-session-id`; queries privadas por userId e queries guest por identidade guest, sempre pelas factories de shared/query. Reaproveitar merge de auth e limpeza de cache, verificando também queries de cotação. Não criar segundo identificador de sessão.
4. **Uma cotação por estado atual.** Usar POST `/api/checkout/quote` com os itens atuais e cupom opcional. Após mutation do carrinho, invalidar a cotação; bloquear avanço enquanto pendente ou inválida. Em `/pagamento`, carregar o carrinho da identidade autenticada e gerar/recuperar cotação válida antes de habilitar envio. Isso cobre entrada direta e refresh sem novo search param ou ID fictício. Reutilizar query options e createCheckoutQuote existentes; respeitar retry apenas em GET retryable.
5. **Metadados reais.** Compor dados de itens já retornados pela API do carrinho/catálogo e associar por nftId/editionId, sem índices ou imagens fixas. Se faltar um campo necessário, estender contrato e resposta MSW juntos. Valores de linha e totais vêm da API; nunca recalcular subtotal na feature.
6. **Comprar agora converge no carrinho.** Adiciona a seleção e abre `ROUTES.CART`, cuja rota canônica é `/carrinho`. Alternativa de compra de um único item fora do carrinho amplia regras e fica adiada.
7. **Preservar resolução de pedidos.** Não reescrever pedido/recibo: remover apenas dependências de fixtures na entrada e verificar idempotência, recusa, pending e limpeza do carrinho. Uma resposta inconclusiva não permite recibo de sucesso.
8. **Sobreposição de changes.** Usar este plano como fechamento da entrega, reaproveitando implementação de add-to-cart-from-pdp. Na implementação, registrar nesta e na change anterior o que foi coberto e o que ficou adiado; não arquivar ou marcar tasks incompatíveis como feitas. Não executar backlog de conta ou Lighthouse.

## Risks / Trade-offs

- Sem atualização otimista → latência visível mitigada por busy/disabled e feedback existente.
- Carrinho muda durante cotação → ignorar resposta obsoleta, invalidar após alteração e revalidar no servidor antes do pedido.
- Estado mock não durável após reinicialização → respeitar persistência atual; testar refresh e documentar limites sem prometer backend permanente.
- Working tree contém outras alterações → revisar diffs e dependências; stage explícito, sem logs, dist ou segredos.
- Push pode não publicar → confirmar configuração e resultado do hosting; reportar bloqueio concreto se não houver acesso ao status/URL.

## Migration Plan

1. Integrar incrementalmente sobre arquivos existentes e adicionar testes focados.
2. Rodar E2E completo sobre build integrado, documentar premissas em ARCHITECTURE.md e instruções no README.
3. Validar projetos afetados, revisar diff e criar commit convencional; push normal para origin/main, conforme solicitado, sem force e sem reescrever histórico. Se remoto avançar, reconciliar preservando trabalho local e repetir checks afetados.
4. Conferir deploy correspondente ao commit e smoke de catálogo → compra na URL pública com conta de demonstração. Push sozinho não encerra a entrega.
5. Em regressão publicada, reverter somente o commit desta entrega por novo commit e republicar; nunca reset de histórico compartilhado.
