Crie a change `realtime-socketio`.

## Contexto
Implementa a comunicação em tempo real de ponta a ponta usando `socket.io-client` real conectado ao servidor simulado com `@mswjs/socket.io-binding` em `libs/mocks/socket`, integrando os eventos `nft.updated` e `order.updated` ao estado do sistema conforme `openspec/project.md`, `ARCHITECTURE.md` (§6, §11 e §13), `AGENTS.md` e `challenge.md`.

**IMPORTANTE — Regra inviolável e layouts da branch `feat/layout`:**
Tempo real passa **obrigatoriamente** pelo `socket.io-client` (`@nft/shared-realtime`). É critério eliminatório chamar setters de React, callbacks locais ou `queryClient.setQueryData` diretamente a partir de botões/controles de teste sem trafegar pelo WebSocket interceptado pelo MSW. Caso a branch `feat/layout` contenha componentes visuais de banner/toast/alerta de atualização de preço ou estoque, reaproveite esse visual e ligue-o aos eventos reais.

**URGENTE — Prazo crítico (Foco no Caminho Feliz e Débito Técnico):**
Estamos muito perto do deadline do projeto. **Foque em fazer o fluxo principal de eventos (`nft.updated` e `order.updated`) trafegar de verdade pelo `socket.io-client` + `@mswjs/socket.io-binding` e atualizar o cache do TanStack Query**, sem cair no critério eliminatório. Proponha na `proposal` e no `tasks.md` soluções pragmáticas e registre como **Débito Técnico** em `ARCHITECTURE.md` §13 e §17 qualquer sofisticação secundária. Separe as tasks em **P0 (Obrigatório agora)** e **P1 (Débito Técnico)**.

## Estratégia de Prazo Crítico e Débito Técnico (P0 vs P1)
- **P0 (Fazer funcionar agora — Caminho Feliz + Critério Eliminatório)**:
  - Conectar `socket.io-client` ao handler `@mswjs/socket.io-binding` em `libs/mocks/socket`.
  - Quando o mock mutar um NFT ou pedido (ou quando um gatilho de teste do mock for acionado), atualizar o banco em memória (`mocks/core` com `version` incrementada) e emitir `nft.updated` / `order.updated` pelo socket.
  - No cliente (`shared/realtime` + listener global no shell/domínios): validar dedupe por `event.id`, descartar `version` menor ou igual à última vista, ignorar `userId` de outro usuário e **invalidar as queries afetadas no TanStack Query (`invalidateQueries`)** + disparar um toast/live region acessível. *Dica de velocidade*: usar `queryClient.invalidateQueries` após validar `id` e `version` já garante consistência 100% com o REST sem precisar escrever lógica manual complexa de patch de cache para cada tela!
- **P1 (Candidatos a Débito Técnico para acelerar a entrega — documentar em `ARCHITECTURE.md` §13/§17)**:
  - **Painel visual elaborado de controle de eventos**: em vez de construir uma UI complexa de dev-tools para disparar eventos, exponha helpers simples em `window.__NFT_MOCK_CONTROL__` (ou query params de cenário) que acionam o servidor mock e disparam o evento via `@mswjs/socket.io-binding`.
  - **Atualização cirúrgica de cache in-place**: deixar o patch manual otimista de listas paginadas como débito técnico e usar invalidação direcionada (`invalidateQueries`) combinada ao controle de `version` no `shared/realtime`.

## Requisitos
1. **Servidor Socket.IO simulado (`libs/mocks/socket` e `libs/mocks/core`)**:
   - Implementar o binding Socket.IO com `@mswjs/socket.io-binding` integrado ao `mocks/core` e ao bootstrap do MSW em `libs/shell-kit`.
   - Mutações de preço/disponibilidade de edição ou estado de pedido no banco em memória atualizam o estado REST (incrementando `version`) e emitem o evento pelo socket no envelope `{ id, type, resource: { kind, id }, version, occurredAt, userId?, payload }`.
2. **Eventos e efeitos nos domínios (`nft.updated` e `order.updated`)**:
   - `nft.updated`: atualiza/invalida catálogo, detalhe e carrinho/cotação e anuncia a mudança de preço ou disponibilidade em live region/toast.
   - `order.updated`: atualiza/invalida o pedido do `userId` autenticado (`pending` → `confirmed` | `rejected`).
3. **Deduplicação, ordenação por versão, isolamento por `userId`, reconexão e cleanup**:
   - Deduplicar por `event.id`, descartar `version` menor ou igual à última aplicada para o mesmo `{ kind, id }` e ignorar eventos com `userId` diferente da sessão ativa.
   - Na reconexão (`onReconnect`), invalidar as queries ativas para reconciliar com o REST. Liberar listeners no unmount e no logout.
4. **Gatilhos determinísticos para E2E e documentação**:
   - Expor gatilhos simples no controlador de cenários do mock para emitir `nft.updated` (preço alterado / edição esgotada), `order.updated`, evento duplicado, evento com versão antiga e simular reconexão.
   - Preencher `ARCHITECTURE.md` §13 e §17 documentando o transporte, as limitações do `@mswjs/socket.io-binding` e os débitos técnicos assumidos.
   - Testes Vitest em `shared/realtime` e teste E2E enxuto validando a atualização via `socket.io-client`.

## Cenários de aceitação
- WHEN o servidor simulado emite `nft.updated` alterando o preço de um NFT THEN o `socket.io-client` recebe o evento, atualiza os dados exibidos e anuncia a mudança em live region.
- WHEN o mesmo evento (mesmo `id`) chega duas vezes ou chega um evento atrasado com `version` menor THEN ele é descartado sem duplicar aviso nem regredir o estado.
- WHEN um evento privado tem `userId` diferente do usuário logado THEN o cliente o ignora.
- WHEN o socket reconecta após queda THEN os recursos ativos são reconciliados via REST.

## Fora de escopo
Telas de Carrinho, Pagamento e Confirmação (Etapas 13, 14 e 15).

Gere proposal, specs e tasks (separando claramente P0 Caminho Feliz vs P1 Débito Técnico). Não implemente nesta etapa: a implementação segue depois, uma task por vez, com pausa entre elas.