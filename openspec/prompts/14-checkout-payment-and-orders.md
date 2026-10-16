Crie a change `checkout-payment-and-orders`.

## Contexto
Implementa a página de Pagamento e o ciclo de criação, idempotência, revalidação e resolução de pedidos (`libs/checkout/{domain,data-access,feature,ui}`, `libs/orders/{domain,data-access,feature,ui}`, handlers em `libs/mocks/handlers` e exposição em `apps/checkout`), conforme `openspec/project.md`, `ARCHITECTURE.md` (§6, §11 e §12), `AGENTS.md` e `challenge.md`.
Referência Figma (arquivo cópia `dKMJKBVdX6q0Ym4OX5vd3V`, página `0:1`): Pagamento desktop `11:2862` e mobile `16:748`.

**IMPORTANTE — Layout já pronto na branch `feat/layout`:**
O layout da tela de Pagamento (formulário do colecionador com campos obrigatórios `*`, seletor de opções de carteira em cards radio MetaMask/WalletConnect/Coinbase Wallet, cards de carteira conectada principal e reserva, switch "Usar outra carteira?", campo ENS com `.eth` fixo, resumo "Seus NFTs" com quantidades e totais, e CTA de finalizar compra) **já está pronto na branch `feat/layout` apenas com o visual estático**. Extraia/reaproveite esse visual em `libs/checkout/ui` e `libs/orders/ui` e conecte-o em `libs/checkout/feature`, `libs/orders/data-access`, `libs/orders/domain` e `apps/checkout` ao backend simulado e às regras de negócio.

**URGENTE — Prazo crítico (Foco no Caminho Feliz e Débito Técnico):**
Estamos muito perto do deadline do projeto. Esta é a etapa mais densa de regras: **foque 100% em fazer o caminho feliz da compra funcionar de ponta a ponta** (pré-preencher formulário `collector`, selecionar carteira, enviar `POST /orders` com `Idempotency-Key`, confirmar o pedido no mock, limpar do carrinho os itens comprados e navegar para `/pedido/:orderId`) sem violar o critério eliminatório ("compra confirmada sem resposta da simulação"). Identifique na `proposal` e no `tasks.md` tudo o que pode ser simplificado ou deixado como **Débito Técnico** em `ARCHITECTURE.md` §17 para acelerar a entrega. Separe as tasks em **P0 (Caminho Feliz — Obrigatório agora)** e **P1 (Débito Técnico)**.

## Estratégia de Prazo Crítico e Débito Técnico (P0 vs P1)
- **P0 (Fazer funcionar agora — Caminho Feliz + Critérios Eliminatórios)**:
  - Conectar o layout de Pagamento da branch `feat/layout` ao formulário `react-hook-form` + `zod` (`collector` de `@nft/shared-contracts`), pré-preenchido com perfil/carteira principal.
  - Implementar `POST /orders` e `GET /orders/:orderId` no MSW com validação de `Idempotency-Key`, bloqueio do botão durante envio (`disabled` + `aria-busy`), criação do snapshot do recibo, remoção seletiva dos itens comprados do carrinho quando `confirmed` e redirecionamento para `/pedido/:orderId` **somente após resposta `confirmed` da simulação**.
  - Tratar recusa (`rejected` preservando itens no carrinho) e revalidação básica quando preço/estoque mudar (`PRICE_CHANGED` / `AVAILABILITY_CONFLICT`).
- **P1 (Candidatos a Débito Técnico para acelerar a entrega — documentar em `ARCHITECTURE.md` §17)**:
  - **Persistência de rascunho do formulário `collector` em expiração de sessão**: em vez de criar sincronização complexa de draft em `sessionStorage`, como o formulário já é pré-preenchido automaticamente com os dados do perfil e da carteira do usuário ao recarregar, você pode usar um `sessionStorage` simples ou documentar o pré-preenchimento automático do perfil como o mecanismo de retomada pós-login.
  - **Simulação de conexão de carteira**: manter a seleção do radio card (`MetaMask | WalletConnect | Coinbase`) ligada diretamente ao estado da carteira do mock com um toggle simples de cenário para simular recusa, sem criar modais intermediários extras de conexão de carteira que não existem no Figma.
  - **Fluxo `pending` longo**: no cenário padrão (caminho feliz), o mock pode confirmar o pedido imediatamente na resposta ou emitir `order.updated` logo em seguida (curto delay), deixando o polling/recuperação de `pending` apenas para o cenário específico de teste.
  - **Stories CSF3**: criar apenas 1 story básico ou deixar stories extras de `checkout/ui` como débito técnico.

## Requisitos
1. **Reaproveitamento do layout (`feat/layout`) e fronteiras de módulo**:
   - Extraia os componentes visuais da tela de Pagamento vindos de `feat/layout` em `libs/checkout/ui` e `libs/orders/ui` (`flow:checkout`), sem fetch, e conecte a página em `libs/checkout/feature`, expondo `PaymentPage` no remote `apps/checkout` (protegida por `requireAuth`).
2. **Formulário do colecionador (`collector`) e carteira (`ARCHITECTURE.md` §6)**:
   - `react-hook-form` + `zod` validando o schema `collector` de `@nft/shared-contracts`: `displayName`, `username`, `email`, `profileName`, `network` (`ethereum|polygon|solana`), `walletAddress` (`0x` + 40 hex), `walletType` (`metamask|walletconnect|coinbase`), `referralCode`, `ensName` (sem `.eth`), `useSecondaryWallet`, `secondaryWallet?` (obrigatório se `useSecondaryWallet` for `true`) e `note?` (opcional).
   - Pré-preencher com dados do perfil e carteira principal do usuário autenticado, sem alterar os registros da conta ao editar no checkout.
   - Suportar seleção da opção de carteira e bloqueio caso a conexão simulada seja recusada/desconectada.
3. **Revisão e revalidação antes do envio (`ARCHITECTURE.md` §12)**:
   - Exibir o resumo "Seus NFTs" com os totais da cotação ativa formatados via `@nft/shared-money`.
   - Se o preço mudar (`PRICE_CHANGED` ou evento `nft.updated`), atualizar os totais exibidos e exigir nova confirmação do usuário; se esgotar (`AVAILABILITY_CONFLICT`), bloquear e avisar.
4. **Pedidos idempotentes, bloqueio de clique repetido e desfechos (`orders/domain`, `orders/data-access`, `mocks/handlers`)**:
   - `POST /orders` com header `Idempotency-Key` (sem retry automático). Mesma chave + mesmo payload recupera o mesmo pedido; mesma chave + payload diferente retorna `409` (`IDEMPOTENCY_CONFLICT`).
   - Botão de envio desabilitado durante a mutation para impedir cliques repetidos.
   - **Desfecho `confirmed`**: baixa no estoque, remoção do carrinho apenas dos itens/quantidades comprados, snapshot imutável do recibo salvo no pedido e navegação para `/pedido/:orderId`. **Jamais navegar para confirmação sem estado `confirmed` da simulação.**
   - **Desfecho `rejected`**: preserva itens no carrinho e anuncia o erro de recusa.
   - Suporte a `order.updated` e consulta `GET /orders/:orderId` para recuperação após timeout/refresh.
5. **Testes e documentação**:
   - Testes focados no caminho feliz da compra (`confirmed`) e nos cenários críticos de recusa/idempotência (Vitest e E2E do Fluxo 6 e principais casos do Fluxo 7/9). Documentar os débitos técnicos em `ARCHITECTURE.md` §17.

## Cenários de aceitação
- WHEN preencho/confirmo os dados válidos do `collector` com carteira conectada e finalizo a compra no cenário padrão THEN o pedido é confirmado pela simulação, os itens comprados saem do carrinho e sou redirecionado para `/pedido/:orderId`.
- WHEN marco "Usar outra carteira?" (`useSecondaryWallet = true`) sem informar `secondaryWallet` válido (`0x` + 40 hex) THEN a validação bloqueia o envio com erro no campo.
- WHEN o preço muda por `nft.updated` antes da conclusão THEN o checkout exibe os novos valores e exige nova confirmação.
- WHEN clico repetidamente no botão de finalizar ou ocorre recuperação por `Idempotency-Key` THEN apenas um único pedido é criado.
- WHEN o pagamento é recusado (`rejected`) THEN os itens permanecem no carrinho e vejo o aviso de recusa.

## Fora de escopo
Renderização do modal de Confirmação e recibo em `/pedido/:orderId` (Etapa 15).

Gere proposal, specs e tasks (separando claramente P0 Caminho Feliz vs P1 Débito Técnico). Não implemente nesta etapa: a implementação segue depois, uma task por vez, com pausa entre elas.