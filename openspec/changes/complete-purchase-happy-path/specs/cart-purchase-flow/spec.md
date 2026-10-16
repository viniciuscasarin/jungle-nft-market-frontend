## Purpose

Permitir que o colecionador selecione NFTs, gerencie seu carrinho e avance para o pagamento com uma cotação correspondente aos itens escolhidos, inclusive após autenticação.

## ADDED Requirements

### Requirement: Purchase selection
O sistema SHALL adicionar ao carrinho o NFT, edição e quantidade selecionados no detalhe, validando disponibilidade no servidor. Comprar agora SHALL adicionar a seleção e abrir o carrinho após sucesso.

#### Scenario: Adicionar e comprar
- **WHEN** o visitante seleciona edição disponível e quantidade válida e aciona adicionar
- **THEN** o servidor salva a seleção e o contador reflete a soma das quantidades; comprar agora também navega para o carrinho após sucesso.

#### Scenario: Estoque insuficiente ou falha
- **WHEN** o servidor recusa a adição por estoque ou falha de conexão
- **THEN** a interface informa o erro, preserva o carrinho anterior e permite nova tentativa sem indicar sucesso.

### Requirement: Cart management
O carrinho SHALL apresentar os itens salvos, permitir alterar quantidade, remover itens e mostrar os totais da cotação retornada pela API. Os controles SHALL aguardar a conclusão das operações antes de permitir ações concorrentes incompatíveis.

#### Scenario: Editar carrinho
- **WHEN** o usuário altera quantidade ou remove um item com sucesso
- **THEN** itens, contador e cotação são atualizados com os dados da API; remover o último item mostra estado vazio e bloqueia avanço.

#### Scenario: Falha na alteração
- **WHEN** a atualização é recusada ou a rede falha
- **THEN** o estado confirmado anterior permanece, o erro é anunciado e a interface permite tentar novamente.

#### Scenario: Cupom no resumo existente
- **WHEN** o usuário aplica um cupom no controle do resumo
- **THEN** a API valida o código e retorna a cotação; código inválido ou expirado gera mensagem sem desconto fictício e permite remover ou corrigir o código.

### Requirement: Authentication continuity
O sistema SHALL preservar os itens guest durante login/cadastro e usar o carrinho autenticado após o merge no servidor. Logout e troca de usuário SHALL impedir exibição de carrinhos e cotações privados da sessão anterior.

#### Scenario: Autenticar para pagar
- **WHEN** um visitante com itens avança para pagamento e autentica
- **THEN** os itens são preservados pelo merge, a API fornece a cotação do carrinho autenticado e o usuário pode continuar a compra.

#### Scenario: Trocar usuário
- **WHEN** o usuário sai e entra com outra conta
- **THEN** somente o carrinho e as cotações da nova identidade podem ser exibidos ou utilizados.

### Requirement: Valid payment entry
O pagamento SHALL consumir uma cotação válida do carrinho atual, sem identificador fixo de demonstração. Os nomes, imagens, edições e quantidades exibidos SHALL corresponder aos itens da compra, com preços e totais autoritativos da API.

#### Scenario: Abrir e recarregar pagamento
- **WHEN** o usuário autenticado avança do carrinho ou abre/recarrega diretamente pagamento
- **THEN** a interface obtém uma cotação válida do seu carrinho atual e apresenta os mesmos itens, sem dados de outro usuário.

#### Scenario: Sem itens ou cotação inválida
- **WHEN** o carrinho está vazio ou a cotação está ausente, expirada ou incompatível com o carrinho
- **THEN** o sistema bloqueia envio do pedido e oferece retorno ao catálogo ou nova cotação, exigindo revisão se os valores mudarem.

#### Scenario: Compra completa
- **WHEN** o usuário percorre catálogo, detalhe, carrinho e pagamento e a API confirma o pedido
- **THEN** um único pedido contém os itens e totais revisados, apenas as quantidades compradas saem do carrinho e o recibo confirmado é exibido.

### Requirement: Accessible asynchronous states
Carrinho e entrada no pagamento SHALL oferecer loading estável com aria-busy, vazio com ação útil, erro com retry e sucesso. As ações SHALL funcionar por teclado, ter foco visível e anunciar resultados, sem overflow em 390, 768 e 1440 px.

#### Scenario: Carregamento e recuperação
- **WHEN** o carregamento demora ou falha e o usuário aciona retry
- **THEN** a página comunica o estado e exibe o resultado da nova consulta sem perder conteúdo ou foco indevidamente.

#### Scenario: Navegação por teclado
- **WHEN** o usuário seleciona, altera ou remove itens e avança por teclado
- **THEN** os controles têm nomes acessíveis, o foco é visível e o resultado é anunciado por live region.
