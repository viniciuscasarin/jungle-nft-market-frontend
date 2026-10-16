# Tasks: Checkout Confirmation Receipt

## 1. P0: Mocks e Fixtures de Pedidos Determinísticos

- [ ] 1.1 Criar fixtures de pedidos com snapshots imutáveis (`confirmed`, `rejected`, `pending`) em `libs/mocks/fixtures/src/orders.ts` e exportar em `libs/mocks/fixtures/src/index.ts`. Verificar que as fixtures satisfazem `OrderSchema` via teste unitário.
- [ ] 1.2 Atualizar o estado inicial do banco de dados mock em `libs/mocks/core/src/database.ts` e handlers em `libs/mocks/handlers/src/index.ts` para servir `GET /api/orders/:id` com suporte a autenticação por `userId`. Verificar via Vitest em `libs/mocks/handlers/src/index.spec.ts`.

## 2. P0: Componente Apresentacional em libs/orders/ui

- [ ] 2.1 Migrar `OrderConfirmationModal` de `feat/layouts` para `libs/orders/ui/src/order-confirmation-modal.tsx`, formatando todos os valores em ETH com `@nft/shared-money` (`formatEth`), conectando botão de fechar (`X`) e ação no Etherscan.
- [ ] 2.2 Criar testes unitários em `libs/orders/ui/src/order-confirmation-modal.spec.tsx` verificando renderização dos itens, totais, atributos de acessibilidade (`role="dialog"`, `aria-modal="true"`) e disparo do callback `onClose`.

## 3. P0: Camada de Dados e Feature Conectada em libs/orders

- [ ] 3.1 Implementar factory de query `orderQueries.detail(orderId, userId)` em `libs/orders/data-access/src/order-queries.ts` e exportar em `libs/orders/data-access/src/index.ts`. Verificar via teste unitário em `libs/orders/data-access/src/order-queries.spec.ts`.
- [ ] 3.2 Implementar `OrderConfirmationFeaturePage` em `libs/orders/feature/src/order-confirmation-feature-page.tsx`, consumindo `useParams`, `useSession`, `useShell` e a query de pedido. Garantir que apenas pedidos `confirmed` do usuário logado renderizam o modal de recibo, enquanto `rejected`, `pending` ou `404` exibem `ErrorState` explícito sem simular sucesso.
- [ ] 3.3 Criar testes unitários em `libs/orders/feature/src/order-confirmation-feature-page.spec.tsx` cobrindo: exibição do recibo para `confirmed`, recusa para `rejected` e `pending`, e bloqueio para pedido de outro usuário.

## 4. P0: Integração no Remote apps/checkout e Shell

- [ ] 4.1 Conectar `ConfirmationPage.tsx` em `apps/checkout/src/ConfirmationPage.tsx` renderizando `OrderConfirmationFeaturePage`. Verificar integração da página no remote `apps/checkout`.
- [ ] 4.2 Testar rota `/pedido/:orderId` com `requireAuth` e navegação de saída para `/` ao fechar o modal.

## 5. P1: Débitos Técnicos e Acessibilidade Responsiva

- [ ] 5.1 Aplicar adaptação responsiva direta no modal (`w-full max-w-[578px] px-4 overflow-y-auto`) garantindo ausência de overflow horizontal em 390px no mobile.
- [ ] 5.2 Adicionar 1 story CSF3 básico para o modal de confirmação em `libs/orders/ui/src/order-confirmation-modal.stories.tsx`.
- [ ] 5.3 Documentar em `ARCHITECTURE.md` (§17 e §19) a adaptação mobile simplificada como débito técnico e o registro da change.

## 6. Verificação Final e Qualidade

- [ ] 6.1 Adicionar teste Playwright em `apps/web-e2e/src/order-confirmation.spec.ts` validando o acesso direto à rota `/pedido/:orderId`, renderização de sucesso para pedido confirmado e ausência de sucesso para pedido rejeitado/não autenticado.
- [ ] 6.2 Executar `pnpm typecheck`, `pnpm lint`, `pnpm test` e `pnpm build` nos projetos afetados (`orders`, `checkout`, `shell`, `mocks`).
