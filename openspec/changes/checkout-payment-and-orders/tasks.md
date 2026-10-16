# Tasks: Checkout Payment and Orders

## P0 — Caminho feliz e critérios eliminatórios

- [x] 1.1 Conferir os schemas e testes já existentes de `Collector`, cotação e pedido em `@nft/shared-contracts`, incluindo validação condicional de `secondaryWallet`, `Idempotency-Key`, `PRICE_CHANGED`, `AVAILABILITY_CONFLICT` e snapshot; manter os contratos atuais como fonte única e registrar na spec qualquer lacuna comprovada antes de implementá-la.
- [x] 1.2 Extrair o layout estático de Pagamento da branch `feat/layouts` para `libs/checkout/ui` e componentes de pedido necessários para `libs/orders/ui`, preservando tokens, responsividade e acessibilidade. Manter as camadas UI livres de fetch e lógica de negócio. Criar ao menos um story CSF3 básico do pagamento.
- [x] 1.3 Implementar helpers puros em `libs/checkout/domain` para mapear perfil/carteira ao valor inicial de `collector` e detectar mudança na cotação que exige nova confirmação. Cobrir com Vitest sem lidar com dinheiro como `number`.
- [x] 1.4 Implementar em `libs/checkout/data-access` query options de perfil, carteiras e cotação e mutations de revisão necessárias; usar factories de query keys, erros `ApiError` e retry somente em GET retryable.
- [x] 1.5 Conectar o formulário em `libs/checkout/feature` com `react-hook-form`, `zod` e `CollectorSchema`; implementar estados loading/erro com retry/sucesso, erros associados, prefill sem persistir mudanças na conta e estado de seleção/conexão simulada de carteira.
- [x] 1.6 Implementar domínio puro em `libs/orders/domain` para preparar tentativa, comparar chave/payload e interpretar estados terminais sem permitir transição de `confirmed`/`rejected`.
- [ ] 1.7 Implementar `POST /api/orders` e `GET /api/orders/:orderId` em `libs/mocks/handlers`, com validação de `Idempotency-Key`, revalidação autoritativa da cotação/disponibilidade, idempotência, snapshot imutável, débito de estoque e remoção seletiva do carrinho somente no desfecho confirmado. Preservar o carrinho em `rejected` e conflitos; emitir `order.updated` pela infraestrutura simulada quando aplicável.
- [ ] 1.8 Criar testes Vitest dos handlers e fixtures determinísticas para confirmed, rejected, pending, chave repetida, conflito de payload, preço alterado e estoque esgotado; garantir que retry/timeout não duplique pedido nem baixa de estoque.
- [ ] 1.9 Implementar `libs/orders/data-access` para POST sem retry automático, consulta do pedido e recuperação por chave após timeout; garantir query keys privadas com `userId` e validação das respostas pelos schemas.
- [ ] 1.10 Conectar revisão, mutation e resolução de pedido em `libs/checkout/feature`: botão disabled + `aria-busy`, nova confirmação depois de mudança de preço/taxa, bloqueio por indisponibilidade, anúncio acessível de recusa e navegação para `/pedido/:orderId` somente com resposta `confirmed`.
- [ ] 1.11 Expor `PaymentPage` de `libs/checkout/feature` em `apps/checkout`; confirmar que a rota protegida e sua propriedade permanecem no host `apps/shell` com `requireAuth`.
- [ ] 1.12 Adicionar testes Vitest focados em validação do collector, prefill, carteira recusada, revalidação, envio único, confirmed, rejected, recuperação idempotente e ausência de navegação em `pending`/erro.
- [ ] 1.13 Adicionar E2E Playwright do Fluxo 6 (compra confirmada), além dos casos críticos dos Fluxos 7/9 para recusa, clique repetido/idempotência e alteração de preço/estoque. Iniciar cada caso com reset determinístico do cenário e verificar API/resultado visível.
- [ ] 1.14 Atualizar `README.md` e `docs/contracts.md` com endpoints, headers, cenários de compra/recusa e passos reprodutíveis; registrar os débitos P1 em `ARCHITECTURE.md` §17.

## P1 — Débitos técnicos aceitos para acelerar a entrega

- [ ] 2.1 Persistência de rascunho completo do formulário collector em `sessionStorage`; no P0, retomar pelo prefill atualizado de perfil e carteira após refresh/reautenticação.
- [ ] 2.2 Fluxo visual de conexão com modal intermediário de carteira; no P0, usar seleção de radio card ligada ao estado determinístico conectado/recusado/desconectado do mock.
- [ ] 2.3 Processamento prolongado de `pending`, polling adaptativo e recuperação avançada de refresh/reconexão; no P0, o cenário padrão pode confirmar na resposta e o pending permanece coberto por consulta simples/teste sem confirmação visual.
- [ ] 2.4 Stories CSF3 granulares de cada campo, resumo, carteira e estado de pedido; no P0, manter somente um story representativo.

## Verificação final

- [ ] 3.1 Rodar `typecheck`, `lint`, `test` e `build` com `nx affected` para os projetos alterados; rodar os E2E de compra e falhas relacionados. Corrigir falhas sem enfraquecer ou remover testes.

