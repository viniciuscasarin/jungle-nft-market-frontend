# Proposal

## Why

O prazo já foi ultrapassado e o percurso catálogo → detalhe → carrinho → pagamento → recibo ainda está interrompido. A prioridade é integrar o código existente, comprovar uma compra simulada completa e entregar por commit e push para produção.

## What Changes

- Conectar adicionar ao carrinho, comprar agora, edição e quantidade no detalhe.
- Conectar a UI existente de carrinho, edição/remoção de itens e contador do shell à API MSW.
- Preservar o carrinho guest ao autenticar e limpar dados privados ao trocar de usuário.
- Criar cotação dos itens atuais e consumi-la no pagamento, eliminando o fallback `quote-999` e nomes/imagens fictícios na feature.
- Reusar pedido idempotente e recibo existentes, confirmando sucesso apenas após resposta `confirmed`.
- Cobrir o percurso completo e falhas essenciais, validar build integrado e preparar commit/push com verificação do deploy.

## Capabilities

### New Capabilities

- `cart-purchase-flow`: carrinho integrado, continuidade guest/login e transição do carrinho para a cotação de pagamento.

### Modified Capabilities

Nenhuma. Os requisitos existentes de pagamento e recibo continuam válidos; esta change integra sua entrada sem substituí-los.

## Impact

- Apps `shell`, `storefront`, `checkout`: `scope:<app>`, `type:app`, `flow:<app>`; `web-e2e`: conforme tags existentes do projeto de testes.
- `cart/{domain,data-access,feature,ui}`: `scope:cart`, `type:<camada>`, `flow:checkout` nas camadas feature/ui; `catalog/feature`: `scope:catalog`, `type:feature`, `flow:storefront`.
- `checkout/{feature,data-access,ui}`: `scope:checkout`, `type:<camada>`, `flow:checkout` nas camadas feature/ui.
- `shared/{contracts,query}`: `scope:shared`, tipos existentes, `flow:shared`; `shell-kit`: tags existentes. `mocks/{core,handlers}`: `scope:mocks`, `type:mocks`, `flow:shared`.
- Alterar auth data-access apenas se necessário para transmitir a identidade guest já suportada pelo backend. Sem dependências novas nem nova infraestrutura de deploy.
- Documentar premissas e débitos em `ARCHITECTURE.md`, `README.md` e contratos afetados na implementação.

## Scope and assumptions

- Esta change coordena o fechamento funcional: reaproveitar o trabalho de `add-to-cart-from-pdp`, sem repetir extração de UI, domain ou handlers. Seu plano de atualização otimista fica adiado para depois desta entrega. Reconciliar tasks sobrepostas com evidência, sem marcar trabalho não executado como concluído.
- Simplicidade: mutations aguardam a API e atualizam/invalidate o cache; comprar agora adiciona a seleção e abre o mesmo carrinho. Não cria um checkout paralelo.
- Fora de escopo: avatar, favoritos, novos cenários de conta, novas páginas, redesign, novas abstrações, otimização Lighthouse e atualização otimista. Preservar funcionalidades existentes, inclusive cupons presentes na UI.
- Produção continua sendo a demonstração MSW, sem pagamentos reais. Push para `origin/main` foi solicitado; verificar vínculo do hosting e status do deploy, sem supor que push equivale a publicação bem-sucedida.
- Preservar alterações locais existentes: selecionar para commit apenas arquivos revisados da entrega e dependências necessárias, nunca usar stage indiscriminado.
