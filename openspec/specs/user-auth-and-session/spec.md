# user-auth-and-session Specification

## Purpose

Esta capacidade provê autenticação completa e ciclo de vida de sessão no Jungle NFT Marketplace, incluindo registro de novos usuários, login, expiração de sessão com preservação de rascunhos, isolamento absoluto de cache privado entre usuários e mesclagem de carrinho de visitante.

## Requirements

### Requirement: User Registration and Account Creation
O sistema SHALL permitir o cadastro de novos usuários com validação estrita de dados cadastrais, criptografia segura de senhas sem exposição de credenciais e autenticação automática após a criação bem-sucedida da conta.

#### Scenario: Cadastro com dados válidos
- **WHEN** o usuário submete o formulário de cadastro com nome, username disponível, e-mail disponível e senha de no mínimo 8 caracteres (com letras e números)
- **THEN** a conta é criada no backend simulado, uma sessão ativa com token opaco é iniciada, o usuário é redirecionado para a URL sanitizada de destino e um anúncio acessível de boas-vindas é emitido em live region.

#### Scenario: Conflito de e-mail ou username existente
- **WHEN** o usuário submete o cadastro com um e-mail ou username já cadastrado (independentemente de letras maiúsculas/minúsculas ou espaços em branco nas pontas)
- **THEN** a requisição falha com código `CONFLICT` (409), o campo em conflito exibe a mensagem de erro específica associada via `aria-describedby` e `aria-invalid`, o foco do teclado é movido para o primeiro campo inválido e nenhum dado sensível é persistido.

#### Scenario: Senha inválida no cadastro
- **WHEN** o usuário informa uma senha com menos de 8 caracteres ou sem letras ou sem números
- **THEN** o envio é bloqueado pela validação do schema, os erros de campo são associados aos inputs via atributos de acessibilidade e o botão de envio permanece bloqueado para múltiplos envios.

### Requirement: User Authentication and Login
O sistema SHALL autenticar usuários existentes com proteção contra enumeração de contas, suporte a credenciais fictícias de demonstração e integração ao carrinho de visitante.

#### Scenario: Login com credenciais válidas
- **WHEN** o usuário informa identificador (e-mail ou username) e senha corretos e submete o formulário
- **THEN** uma sessão é emitida com token opaco persistido, a máquina de estados de sessão é atualizada, quaisquer itens mantidos no carrinho anônimo são mesclados ao carrinho do usuário (respeitando a disponibilidade máxima de estoque) e o usuário é redirecionado à rota anterior sanitizada.

#### Scenario: Login com credenciais incorretas
- **WHEN** o usuário informa uma combinação inválida de identificador ou senha
- **THEN** o sistema responde com erro `UNAUTHENTICATED` (401) exibindo uma mensagem genérica em região com `role="alert"` (sem revelar se o usuário existe), o campo de senha é limpo e recebe o foco do teclado.

#### Scenario: Tentativas de envio concorrentes
- **WHEN** o usuário clica repetidamente no botão de submissão do formulário de login durante o processamento da requisição
- **THEN** o botão de envio exibe indicador de carregamento com `aria-busy="true"` e permanece desabilitado, prevenindo requisições duplicadas.

### Requirement: Session Lifecycle and Cache Isolation
O sistema SHALL gerenciar as transições de identidade do usuário (`A -> null`, `A -> B`, `null -> B`) garantindo cancelamento de consultas ativas e expurgo completo do cache privado antes de qualquer novo estado de sessão ser registrado.

#### Scenario: Troca de usuário sem vazamento de dados
- **WHEN** uma sessão ativa do usuário A é substituída pela autenticação do usuário B
- **THEN** todas as queries em andamento do usuário A são canceladas imediatamente, as chaves de query privadas indexadas por `userId` de A são expurgadas do cache, a conexão de eventos em tempo real é reiniciada com o token do usuário B e nenhuma interface exibe dados residuais do usuário A.

#### Scenario: Expiração concorrente de sessão
- **WHEN** a sessão expira e múltiplas requisições paralelas retornam erro `SESSION_EXPIRED` (401)
- **THEN** o tratamento de expiração executa apenas uma vez (idempotente), o token é removido, o contexto de retomada é gravado em `ResumeStore`, o usuário é redirecionado para `/login?redirect=<path+search>&reason=expired` e um aviso acessível anuncia `"Sua sessão expirou"`.

#### Scenario: Retomada de rascunhos após reautenticação
- **WHEN** o mesmo usuário reautentica após expiração de sessão com rascunhos pendentes em `ResumeStore`
- **THEN** o usuário é reconduzido à rota de origem e os dados de rascunho são restaurados; se outro usuário fizer login, os rascunhos salvos são descartados e apenas o caminho de retorno é preservado.

#### Scenario: Sincronização de logout entre abas
- **WHEN** o usuário realiza logout em uma aba do navegador
- **THEN** o evento de armazenamento local é detectado nas outras abas abertas, que transitam imediatamente para o estado anônimo, expurgando o cache privado e redirecionando rotas protegidas para a página de login.

### Requirement: Safe Redirect Sanitization
O sistema SHALL sanitizar parâmetros de busca de redirecionamento (`redirect`) para prevenir ataques de Open Redirect e loops de autenticação.

#### Scenario: Redirecionamento para rota interna válida
- **WHEN** um usuário não autenticado tenta acessar `/checkout?step=review` e é enviado para `/login?redirect=%2Fcheckout%3Fstep%3Dreview`
- **THEN** após autenticar com sucesso, o sistema sanitiza o caminho e navega o usuário exatamente para `/checkout?step=review`.

#### Scenario: Redirecionamento para URL externa ou rota de autenticação
- **WHEN** o parâmetro `redirect` contém valores inseguros como `https://evil.com`, `//phishing.org`, `javascript:void(0)` ou rotas de autenticação (`/login`, `/cadastro`)
- **THEN** o sanitizador descarta o parâmetro inválido e direciona o usuário com segurança para a página inicial `/`.

### Requirement: Accessible Authentication Modal and Page Layout
O sistema SHALL disponibilizar interfaces acessíveis em modal (desktop) e páginas dedicadas (mobile), com captura e liberação de foco, navegação por teclado e indicação clara de recursos fora do escopo de demonstração.

#### Scenario: Navegação e controle de foco no modal desktop
- **WHEN** o modal de autenticação é aberto em viewport desktop
- **THEN** o foco inicial é movido para dentro do modal, o ciclo de foco via `Tab` fica contido exclusivamente no diálogo, o pressionamento de `Esc` ou clique no botão de fechar encerra o modal e devolve o foco ao elemento gatilho (ou ao `<main>` caso o gatilho não esteja mais no DOM).

#### Scenario: Alternância entre abas Entrar e Criar conta
- **WHEN** o usuário navega entre as abas "Entrar" e "Criar conta"
- **THEN** a transição ocorre como links entre `/login` e `/cadastro` preservando o search param `redirect`, o link ativo é semanticamente indicado com `aria-current="page"` e o foco permanece no topo do formulário selecionado.

#### Scenario: Interação com botões sociais ou recuperação de senha
- **WHEN** o usuário clica em botões de login social (Google, Apple) ou no link "Esqueceu a senha?"
- **THEN** o sistema emite um aviso em live region informando "indisponível nesta demonstração", sem simular sucesso nem alterar o estado de autenticação.
