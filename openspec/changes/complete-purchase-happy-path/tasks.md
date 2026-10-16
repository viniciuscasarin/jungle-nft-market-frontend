# Tasks

Auditoria da task 1.1: [mapa de reaproveitamento e lacunas](reuse-audit.md). As tasks funcionais abaixo permanecem abertas até implementação e validação; atualização otimista fica adiada conforme proposal/design.

## 1. Reaproveitamento e acesso ao carrinho

- [ ] 1.1 Revisar diffs locais e implementação de add-to-cart-from-pdp; registrar naquela change e nesta as tasks cobertas/adiadas sem marcar otimização não implementada como concluída. Verificar mapa de arquivos reaproveitados e dependências antes de editar.
- [ ] 1.2 Implementar API pública de cart/data-access com queries e mutations de adicionar, editar, remover e limpar, factories por userId/guest e atualização após resposta; testar via MSW sucesso, estoque insuficiente, validação e rede. Reusar cenários existentes, criar somente os ausentes e documentá-los no README e contratos em docs/contracts.md.

## 2. Detalhe, carrinho e autenticação

- [ ] 2.1 Conectar adicionar e comprar agora na PDP com busy/disabled e feedback acessível; comprar agora abre a rota canônica do carrinho após adicionar. Adicionar testes verificando edição/quantidade e ausência de navegação em erro; documentar a semântica no README.
- [ ] 2.2 Substituir CartPage provisória por cart/feature com UI existente, alteração/remoção, contador no shell, loading/vazio/erro/retry/sucesso e cotação autoritativa, inclusive cupom existente. Testar via MSW mutation e recotação, erro de estoque, rede e cupom inválido/expirado, com cenários determinísticos documentados; registrar premissa sem atualização otimista em ARCHITECTURE.md.
- [ ] 2.3 Integrar identidade guest, merge no login/cadastro e limpeza de carrinho/cotação privados em logout; adicionar testes de continuidade e troca de usuário, verificando x-session-id e ausência de dados da sessão anterior. Documentar a continuidade no README.

## 3. Entrada real no pagamento

- [ ] 3.1 Carregar carrinho autenticado e obter cotação válida em pagamento, inclusive acesso direto/F5; remover fallback quote-999 e bloquear envio com carrinho vazio/cotação inválida ou desatualizada. Testar com MSW cotação válida, erro recuperável, expiração, preço alterado e esgotamento; criar/reusar cenários e documentar reprodução.
- [ ] 3.2 Substituir nome/imagem fixos pelos metadados da API vinculados aos itens cotados, estendendo contratos/handlers somente se necessário, com valores de linha autoritativos. Testar correspondência de NFT/edição/quantidade no resumo e no pedido; atualizar docs/contracts.md e decisões em ARCHITECTURE.md.

## 4. Percurso integrado e entrega

- [ ] 4.1 Criar E2E sobre build integrado começando no catálogo, escolhendo edição/quantidade, adicionando, alterando/removendo, autenticando e comprando até recibo; conferir pedido, totais, carrinho restante e contador. Incluir nova conta válida além da fixture Alice, refresh e isolamento após troca de usuário. Verificar resultado por API simulada, sem sucesso criado pela UI.
- [ ] 4.2 Executar regressões de recusa, pending/timeout, idempotência e cotação alterada via cenários MSW; conferir ausência de recibo falso. Verificar teclado, foco, anúncios e ausência de overflow em 390/768/1440 px, atualizando baseline apenas se mudança visual intencional e registrando evidências no README.
- [ ] 4.3 Atualizar instruções de demonstração e limitações em README.md e ARCHITECTURE.md, reconciliar tasks sobrepostas com evidências e validar `openspec validate complete-purchase-happy-path --strict`; conferir que apenas itens comprovados estão marcados.
- [ ] 4.4 Executar typecheck, lint, test e build nos projetos afetados via nx affected (base de comparação deve incluir alterações locais), incluindo dependentes e o E2E de compra no build integrado; registrar comandos/resultados e corrigir falhas sem desativar regras nem enfraquecer testes.

## Workflow follow-up

- Após os checks, revisar diff final, criar commit convencional com stage explícito dos arquivos necessários e dar push normal para origin/main, conforme solicitado. Preservar alterações alheias e excluir logs, dist, traces, .env e segredos.
- Confirmar status do deploy correspondente ao commit no hosting existente e fazer smoke do fluxo feliz na URL pública; registrar commit, URL e resultado, ou bloqueio concreto caso o status não esteja acessível. Não declarar produção pronta apenas pelo push.
- Arquivamento das changes somente após todos os requisitos aplicáveis passarem; não faz parte da implementação automática desta proposta.
