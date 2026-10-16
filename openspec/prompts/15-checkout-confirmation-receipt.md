Crie a change `checkout-confirmation-receipt`.

## Contexto
Implementa a rota `/pedido/:orderId` com visual de modal e o recibo imutável do pedido no remote `apps/checkout` (`libs/orders/ui`, `libs/orders/feature`), conforme `openspec/project.md`, `ARCHITECTURE.md` (§6, §12, §18 e §19), `AGENTS.md` e `challenge.md`.
Referência Figma (arquivo cópia `dKMJKBVdX6q0Ym4OX5vd3V`, página `0:1`): Confirmação de pedido desktop `11:4385` (modal `70376:239` sobre fundo); **sem frame mobile** (adaptar do desktop seguindo `docs/design/responsive.md`).

**IMPORTANTE — Layout já pronto na branch `feat/layout`:**
O layout do modal de Confirmação de pedido (ícone thank-you, ID da transação, data, total, carteira, lista de itens comprados, taxas, botão "Ver no Etherscan" e botão de fechar `X`) **já está pronto na branch `feat/layout` apenas com o visual estático**. Extraia/reaproveite esse visual em `libs/orders/ui` e conecte-o em `libs/orders/feature` e `apps/checkout` aos dados reais de `GET /orders/:orderId` e às regras de negócio.

**URGENTE — Prazo crítico (Foco no Caminho Feliz e Débito Técnico):**
Estamos muito perto do deadline do projeto. Esta etapa é curta: **foque em ligar rapidamente o modal pronto de `feat/layout` ao endpoint `GET /orders/:orderId`**, garantindo o critério eliminatório (só renderizar o recibo de sucesso se `order.status === 'confirmed'`). Qualquer refinamento não essencial deve ser registrado como **Débito Técnico** em `ARCHITECTURE.md` §17. Separe as tasks em **P0 (Caminho Feliz — Obrigatório agora)** e **P1 (Débito Técnico)**.

## Estratégia de Prazo Crítico e Débito Técnico (P0 vs P1)
- **P0 (Fazer funcionar agora — Caminho Feliz + Critério Eliminatório)**:
  - Conectar o modal visual de `feat/layout` em `ConfirmationPage` (`/pedido/:orderId`) consumindo `GET /orders/:orderId`.
  - Renderizar o recibo de compra concluída **somente quando `order.status === 'confirmed'`**, exibindo o snapshot imutável do pedido (ID, `txHash`, data, total, taxas, carteira, `collector` e itens formatados via `@nft/shared-money`).
  - Se o pedido for `rejected`, `pending` ou `NOT_FOUND` (ou de outro `userId`), exibir um `ErrorState` / card simples de status sem jamais mostrar a confirmação de sucesso.
  - Botão "Ver no Etherscan" disparando o toast padrão `"indisponível nesta demonstração"`, e botão fechar (`X`) / `Esc` voltando para `/`.
- **P1 (Candidatos a Débito Técnico para acelerar a entrega — documentar em `ARCHITECTURE.md` §17)**:
  - **Adaptação mobile**: aplicar apenas classes responsivas diretas (`w-full max-w-... overflow-y-auto px-4`) sobre o modal já existente de `feat/layout` para que caiba em `390px` sem overflow horizontal, sem redesenhar um layout mobile separado.
  - **Stories CSF3**: manter apenas 1 story básico do recibo confirmado ou postergar stories adicionais como débito técnico.

## Requisitos
1. **Reaproveitamento do layout (`feat/layout`) e fronteiras de módulo**:
   - Extraia o modal de confirmação vindo de `feat/layout` em `libs/orders/ui` (`flow:checkout`), sem fetch, e conecte a página em `libs/orders/feature`, expondo `ConfirmationPage` em `apps/checkout` para `/pedido/:orderId` (`requireAuth`).
2. **Rota com visual de modal e regra inviolável de confirmação**:
   - Renderizar sobre fundo decorativo (`aria-hidden="true"`), suportando acesso direto pela URL e refresh, com foco controlado e fechamento por `Esc` ou botão `X` navegando para `/`.
   - **Só renderizar o recibo de sucesso quando `order.status === 'confirmed'`** e pertencer ao `userId` autenticado. Para `pending`, `rejected` ou inexistente, renderizar o estado correspondente sem aparentar sucesso.
3. **Recibo como snapshot imutável**:
   - Exibir todos os valores a partir do snapshot gravado no pedido (`orderId`, `txHash`, data, rede, carteira, `collector`, itens, preços, taxas e total via `@nft/shared-money`). Alterações posteriores no catálogo (`nft.updated`) não mudam o recibo.
   - Botão "Ver no Etherscan" exibe aviso explícito `"indisponível nesta demonstração"`.
4. **Testes e documentação**:
   - Teste unitário/componente garantindo que `rejected`/`pending` não exibem confirmação e verificação no E2E do Fluxo 6. Documentar em `ARCHITECTURE.md` §17/§19 a adaptação mobile simplificada e eventuais débitos técnicos.

## Cenários de aceitação
- WHEN um pedido está `confirmed` e acesso `/pedido/:orderId` (após o checkout ou via refresh) THEN vejo o modal de confirmação com os dados do snapshot do pedido.
- WHEN `nft.updated` altera o preço de um NFT após a confirmação do pedido THEN o recibo continua exibindo o valor pago no snapshot.
- WHEN acesso `/pedido/:orderId` de um pedido `pending`, `rejected`, inexistente ou de outro usuário THEN o recibo de sucesso NÃO é exibido.

## Fora de escopo
Páginas de Perfil e Carteiras da conta do colecionador (Etapa 16).

Gere proposal, specs e tasks (separando claramente P0 Caminho Feliz vs P1 Débito Técnico). Não implemente nesta etapa: a implementação segue depois, uma task por vez, com pausa entre elas.