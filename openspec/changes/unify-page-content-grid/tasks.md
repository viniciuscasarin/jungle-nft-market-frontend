## Tasks
- [x] 1. Centralizar o container do footer e aplicar ao chrome e às páginas.
- [x] 2. Cobrir alinhamento responsivo e ausência de overflow em E2E.
- [x] 3. Documentar a convenção e executar typecheck, lint, test, build e E2E afetados.

## Validação
- 20 E2E de grid passaram, cobrindo 390, 768, 1024 e 1440px: catálogo, PDP, NFT inexistente, carrinho, perfil, carteiras e pagamento autenticados.
- Testes de shared-ui: 67 passaram. Testes de catalog-ui passaram após atualizar a expectativa de largura da galeria para a composição fluida.
- Builds dos apps e consolidação do deploy passaram.
- `nx affected -t typecheck,lint,test,build --base=HEAD` foi executado. A execução final ainda tem falhas fora do ajuste de grid: lint de acessibilidade nos cards existentes do catálogo; arquivos do carrinho em encoding não reconhecido pelo lint; uso de `multiply` não exportado em cart-domain; stories de carrinho usando `priceEth` ausente no contrato do carrossel.
- A suíte existente da PDP teve 2 testes passando e 1 falhando: o retorno ao catálogo inclui search params, mas o teste espera URL terminando em `/`.
- Não arquivar enquanto as checagens gerais não estiverem passando. Logs locais em `dist/grid-*.log`.
