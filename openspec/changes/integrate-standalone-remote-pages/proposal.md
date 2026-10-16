# Proposal

## Why

Os comandos `dev:storefront`, `dev:checkout` e `dev:account` ainda montam os `App.tsx` demonstrativos do spike, apesar de Home, Perfil e Carteiras já terem features reais expostas por Federation. Isso torna o desenvolvimento isolado divergente do Shell e transmite a impressão de que as telas implementadas não foram roteadas.

## What Changes

- Substituir as entradas demonstrativas por um harness standalone que monta as mesmas páginas expostas ao Shell: Home no storefront; Perfil e Carteiras no account.
- Completar `bootstrapStandalone` com QueryClientProvider, feedback acessível, page chrome, inicialização assíncrona de MSW, sessão compatível com o backend simulado e navegação local mínima.
- Manter o host como dono das rotas e guards de produto. O harness local apenas adapta páginas do próprio remote para desenvolvimento; destinos externos ao remote levam ao Shell.
- No checkout, substituir a landing técnica por um estado explícito de funcionalidade indisponível, com acesso ao ambiente integrado, até as features de compra estarem prontas. Não montar a confirmação placeholder que declara sucesso sem consultar pedido.
- Corrigir o alias de teste `storefront/HomePage` no Shell, atualmente apontando ao `App.tsx` antigo; substituir as expectativas de landing técnica por testes de páginas reais.
- Documentar portas, páginas disponíveis e dependências pendentes, preservando as regressões de cold start e singletons.

## Capabilities

### New Capabilities

Nenhuma.

### Modified Capabilities

- `module-federation-runtime`: completar o contrato de execução standalone para páginas reais, bootstrap de dados, navegação local e comportamento explícito de páginas ainda indisponíveis.

## Impact

| Projeto Nx | Tags | Alteração prevista |
|---|---|---|
| storefront | scope:storefront, type:app, flow:storefront | Entrada Home e testes |
| account | scope:account, type:app, flow:account | Entrada Perfil/Carteiras e testes |
| checkout | scope:checkout, type:app, flow:checkout | Estado indisponível no harness, sem sucesso fictício |
| shell | scope:shell, type:app, flow:shell | Alias de teste e regressão integrada |
| shell-kit | scope:shell-kit, type:util, flow:shared | Bootstrap, providers e adaptação standalone |
| web-e2e | scope:web-e2e, type:app, flow:shell | Testes dos modos integrado e isolado |

Scripts afetados: `scripts/federated-dev.test.js`, `scripts/storefront-dev.test.js` e cópia do worker/comandos de dev se necessário. Documentação: README.md, ARCHITECTURE.md, docs/federation.md e openspec/project.md caso seja necessário explicitar a convenção do harness. Sem novos endpoints de negócio ou dependências externas.

### Premissas

- O ambiente integrado continua acessível por `pnpm dev:mocks` em `http://localhost:4200`; ports 4201–4203 são ambientes isolados de desenvolvimento.
- Reutilizar somente features conectadas existentes. Componentes apresentacionais de pagamento não equivalem a um fluxo de compra pronto.
- O account standalone usa uma sessão obtida pela API MSW para o usuário de desenvolvimento determinístico, identificada como tal; não fabricar uma sessão ou respostas privadas em componentes. Estado e tokens permanecem isolados por origem.
- Registrar essas premissas em ARCHITECTURE.md durante a implementação.

### Fora de escopo e dependências

- Implementar PDP, carrinho, pagamento, pedidos ou recibo; as changes `checkout-payment-and-orders` e `checkout-confirmation-receipt` continuam responsáveis pelos respectivos fluxos. PDP e carrinho precisam de planejamento funcional próprio quando não houver change correspondente.
- Alterar a tabela canônica de rotas ou guards de produção, integrar blockchain/pagamento real, reproduzir todo o chrome do Shell no harness, ou corrigir falhas preexistentes sem relação com esta integração.
- Não declarar a compra funcional nem a aplicação inteira pronta após concluir esta change.
