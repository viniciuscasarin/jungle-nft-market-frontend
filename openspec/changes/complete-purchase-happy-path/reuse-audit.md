# Auditoria de reaproveitamento — task 1.1

Revisão em 2026-10-16 sobre `git diff HEAD` e arquivos não rastreados. As alterações existentes foram preservadas. Presença de arquivo ou checkbox anterior não comprova integração nem aprovação dos checks.

## Mapa de implementação e dependências

| Área | Evidência local | Reaproveitamento e próxima task |
|---|---|---|
| Domain | `libs/cart/domain/src/cart-calculations.ts` e respectivo `.spec.ts`, exportados pelo `index.ts` | Helpers puros usam contracts/money. Não usar cálculo de domain para substituir totais da cotação; validar quantidades inteiras na borda. |
| UI | `libs/cart/ui/src/cart-{page-content,item-row,item-card,quantity-stepper,recommended-carousel,mobile-header}.tsx`, `order-summary-card.tsx`, `types.ts`, stories e exports | Reaproveitar composição visual em 2.2. Ainda contém fixtures, estado de negócio local, desconto fictício, `parseFloat` e chrome duplicado. Tornar apresentacional, receber valores autoritativos e callbacks da feature antes de conectar. Tipos locais não estão integralmente derivados dos contratos. |
| REST | `libs/mocks/handlers/src/cart.ts`, registro em `index.ts`, `cart.spec.ts` | GET/POST/PUT/DELETE implementados via `defineHandler`, identidade guest/token e validação Zod. Reusar em 1.2; testes cobrem persistência, estoque, validação, isolamento e falhas. Merge limita quantidade ao estoque; não assumir recusa de soma excedente sem revisão do contrato. |
| Cenários | `libs/mocks/fixtures/src/carts.ts`, `libs/mocks/core/src/scenarios.ts`, README | Fixture de Alice já tem múltiplos itens; existem `sold-out-at-checkout`, `connection-down`, `http-4xx`, `http-5xx`, `slow-network`. Não existe cenário selecionável de carrinho guest para merge nem cenário específico de carrinho esgotado. Testes que alteram estoque não equivalem a cenários registrados. Reavaliar necessidade em 1.2/2.3/3.1. |
| Query keys | `libs/shared/query/src/query-keys.ts`, export e testes em `index.spec.ts` | List/count por usuário disponíveis. Guest atual usa literal único `guest`; falta distinguir guestId. Cotação usa apenas quoteId. Adequar isolamento e conferir consumidores em 1.2/2.3/3.1. |
| Data access/feature | `libs/cart/{data-access,feature}/src/index.ts` | Apenas constantes de placeholder. Implementar API pública em 1.2 e conexão em 2.2. |
| PDP | `libs/catalog/feature/src/pdp-feature-page.tsx` | Seleção existente; adicionar/comprar ainda chamam `notifyUnavailable`. Conectar à API pública em 2.1 com busy e feedback. |
| Carrinho/shell | `apps/checkout/src/CartPage.tsx`, `apps/shell/src/layouts/app-layout.tsx` | Página provisória; contador recebido por prop, sem consulta ao carrinho. Integrar em 2.2, preservando chrome do host. |
| Sessão | `libs/auth/data-access/src/token-store.ts`, `libs/mocks/handlers/src/auth.ts`, `libs/shared/query/src/index.ts`, `libs/shell-kit/src/bootstrap.tsx` | Guest ID existente e merge por `x-session-id` no login/cadastro. Há limpeza de cache privado e cancelamento; continuidade e cotações ainda precisam de teste em 2.3. Não criar outro ID. |
| Pagamento | `libs/checkout/feature/src/payment-feature-page.tsx` | Ainda usa `quote-999` e imagem fixa. Reusar APIs existentes de cotação/pedido; resolver entrada e metadados em 3.1/3.2. |
| E2E | `apps/web-e2e/src/cart-api.spec.ts` | Exercita REST pelo worker, sem percorrer compra pela UI. Reaproveitar como regressão de rede; não substitui 4.1/4.2. |

## Reconciliação com add-to-cart-from-pdp

- Fases 1–3 e task 4.1 têm implementação local parcial reaproveitável conforme mapa. Os checkboxes anteriores não autorizam tratar a UI copiada como pronta para produção.
- Tasks 4.2–4.5, fases 5–8 e testes de integração/compra das fases 9–10 continuam pendentes. A implementação funcional é coordenada pelas tasks 1.2–4.4 desta change; marcar sobreposições somente após evidência específica.
- Atualização otimista e rollback (4.3.4, partes de 4.3.6, 6.2.2 e 9.1.3 da change anterior) ficam adiados, com checkboxes abertos. Mutations aguardam resposta da API conforme proposal/design.
- O exemplo da task 7.1 anterior que faz fetch em UI não será seguido: a conexão pertence a `cart/feature`. A rota `/cart` da task 7.3 não é canônica; preservar `/carrinho` e os limites atuais do standalone.
- Reabertos os itens 1.2.3 e 3.7.2–3.7.4 anteriores por ausência de evidência da remoção integral de tipos duplicados e dos cenários/documentação específicos.

## Alterações locais adjacentes

Grid de conteúdo (`page-container`, `layout.css`, tokens, generator, Header/Footer, shell, catálogo, checkout e perfil), galeria/PDP e tracking de outras changes já estavam modificados. Preservar esses diffs e suas dependências; não atribuir sua implementação a esta auditoria. Logs locais (`.build.log`, `.e2e.log`, `.nx-out.log`) são artefatos temporários, fora da entrega.

## Checks e bloqueio

Executado `node_modules/.bin/nx.cmd affected -t typecheck,lint,test,build --base=HEAD --parallel=2 --output-style=static` com Node 22.23.3, `NX_DAEMON=false` e `NX_ISOLATE_PLUGINS=false`. Resultado: exit 1, 84 alvos em 29 projetos, seis alvos falharam. Log local: `dist/purchase-audit-checks.log`.

- `cart-domain:typecheck`: import `multiply` inexistente em `shared-money`.
- `cart-ui:typecheck`: prop `priceEth` incompatível com `NftCarouselItem` em três objetos do story, além do erro transitivo de domain.
- `catalog-ui:lint`: interações e tabIndex em `article` não interativo, e role redundante em `home-page-content.tsx`.
- `catalog-feature:lint`: import na linha 17 de `pdp-feature-page.tsx` viola fronteira de fluxo.
- `shell:test` e `cart-domain:test`: alvos reportados como falhos; saída do executor não trouxe diagnóstico de asserção, requer execução focada para determinar causa.

Builds não constam entre as falhas. E2E não executado nesta task documental. Não foi alterado código funcional para contornar problemas existentes. A task 1.1 permanece aberta até resolver o gate de checks exigido pelo projeto; implementação pausada conforme a skill ao encontrar erro.
