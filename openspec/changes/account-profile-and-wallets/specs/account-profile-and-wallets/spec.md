# Spec Delta: Account Profile and Wallets

## Purpose
Prover a gestão completa da área de Conta do colecionador autenticado no remote `apps/account` (`/perfil` e `/carteiras`), contemplando visualização e edição de dados cadastrais, upload/remoção de avatar, alteração de senha com validação criptográfica simulada, cadastro e edição de carteiras principal e secundária (`0x` + 40 hex), navegação lateral com avisos explícitos para itens fora de escopo e isolamento absoluto de cache por usuário.

## ADDED Requirements

### Requirement: Reaproveitamento do Layout de Conta e Fronteiras de Módulo
O sistema SHALL disponibilizar componentes apresentacionais sem fetch em `@nft/profile-ui` e `@nft/wallets-ui` (derivados de `feat/layouts`), aplicando tokens do tema e priorizando os rótulos visíveis do Figma sobre nomes de camadas, e conectar as páginas em `@nft/profile-feature` e `@nft/wallets-feature` expostas em `apps/account` sob `requireAuth`.

#### Scenario: Mapeamento dos rótulos visíveis nos formulários de Perfil e Carteiras
- **WHEN** o usuário autenticado acessa `/perfil` ou `/carteiras`
- **THEN** os campos rotulados como `"E-mail"` e `"Apelido da carteira"` exibem e editam os campos correspondentes do contrato (`email` e `label`), ignorando nomes internos de camadas do Figma como `Bio Field` ou `Website Field`

#### Scenario: Adaptação responsiva em desktop e mobile sem overflow horizontal
- **WHEN** as páginas `/perfil` e `/carteiras` são renderizadas nos viewports `1440px`, `768px` e `390px`
- **THEN** o layout exibe a barra lateral `AccountNavigation` em `>= 768px` e o cabeçalho compacto `AccountMobileHeader` com menu expansível em `< 768px`, empilhando os campos em coluna única no mobile sem gerar overflow horizontal (`scrollWidth <= clientWidth`)

---

### Requirement: Consulta, Edição de Perfil e Gestão de Avatar
O sistema SHALL carregar os dados do perfil via `GET /api/profile` com a chave privada `queryKeys.user(userId, 'profile')` e permitir atualizar o perfil (`PUT/PATCH /api/profile`), alterar (`POST /api/profile/avatar`) e remover (`DELETE /api/profile/avatar`) o avatar, validando com `react-hook-form` + `zod` e persistindo no MSW após refresh.

#### Scenario: Estados assíncronos no carregamento e falha do perfil
- **WHEN** a consulta `GET /api/profile` está em andamento
- **THEN** a região de conteúdo exibe `Skeleton` com `aria-busy="true"` preservando a estrutura da página
- **WHEN** a consulta `GET /api/profile` falha com erro `retryable`
- **THEN** o componente `ErrorState` é exibido com botão de nova tentativa (`retry`) que refaz a requisição e restaura o formulário em caso de sucesso

#### Scenario: Edição de dados do perfil e persistência após refresh
- **WHEN** o usuário autenticado edita `displayName`, `username`, `email`, `ensName` ou `walletNickname`, clica em `"Salvar"` e recarrega a página
- **THEN** a mutation atualiza o perfil no MSW, anuncia o sucesso em live region/toast e os novos valores permanecem preenchidos após o refresh

#### Scenario: Erro de conflito ou validação ao salvar perfil
- **WHEN** o usuário tenta salvar um `email` ou `username` já utilizado por outro usuário no MSW (`409 CONFLICT`) ou submete campos obrigatórios vazios (`400 VALIDATION_ERROR`)
- **THEN** o formulário associa a mensagem de erro diretamente ao campo correspondente com `aria-invalid="true"` e `aria-describedby` apontando para o elemento de erro

#### Scenario: Alteração e remoção de avatar persistidas no mock
- **WHEN** o usuário aciona `"Alterar"` selecionando uma imagem (ou avatar de demonstração) e depois recarrega a página
- **THEN** o `avatarUrl` atualizado é exibido no preview do perfil e persiste após refresh
- **WHEN** o usuário aciona `"Remover"` no controle de avatar
- **THEN** o `DELETE /api/profile/avatar` define `avatarUrl = null`, restaura o placeholder de avatar e persiste o estado vazio após refresh

---

### Requirement: Alteração de Senha com Validação no Servidor Simulado
O sistema SHALL permitir a troca de senha em `/perfil` via `POST /api/profile/password`, exigindo senha atual, nova senha (mínimo de 8 caracteres e diferente da atual) e confirmação, verificando o hash PBKDF2/SHA-256 da senha atual no MSW e atualizando `passwordHash`/`passwordSalt` do usuário.

#### Scenario: Alteração de senha com sucesso e novo login
- **WHEN** o usuário informa a senha atual correta, uma nova senha válida e sua confirmação idêntica e submete a alteração
- **THEN** o MSW atualiza o hash da senha do usuário, limpa os campos de senha com feedback acessível de sucesso, e o usuário consegue fazer logout e autenticar-se novamente usando a nova senha

#### Scenario: Rejeição por senha atual incorreta ou confirmação divergente
- **WHEN** o usuário informa uma senha atual incorreta ou uma confirmação diferente da nova senha
- **THEN** a submissão é rejeitada, o erro é associado ao campo correspondente (`currentPassword` ou `confirmPassword`) com `aria-invalid="true"` e `aria-describedby`, e a senha anterior permanece ativa

---

### Requirement: Consulta, Cadastro e Edição de Carteiras Principal e Secundária
O sistema SHALL consultar (`GET /api/wallets`) e salvar (`POST/PUT /api/wallets`) as carteiras principal e secundária do usuário autenticado usando a chave privada `queryKeys.user(userId, 'wallets')`, validando endereço hexadecimal (`0x` + 40 hex), rede, tipo de carteira e nome ENS sem o sufixo `.eth`.

#### Scenario: Estados assíncronos de carteiras (loading, vazio de secundária, erro com retry e sucesso)
- **WHEN** a consulta `GET /api/wallets` está em carregamento
- **THEN** a página exibe `Skeleton` com `aria-busy="true"`
- **WHEN** o usuário ainda não possui carteira secundária cadastrada
- **THEN** a seção `"Carteira secundária"` exibe o estado vazio `"Você ainda não adicionou uma carteira secundária."` com controles para `"Igual à carteira principal"` e `"Adicionar"`
- **WHEN** a consulta `GET /api/wallets` falha
- **THEN** o `ErrorState` é renderizado com ação de `retry` funcional

#### Scenario: Cadastro e atualização de carteira principal e secundária com persistência no refresh
- **WHEN** o usuário edita os dados da carteira principal (apelido, rede, tipo de carteira, endereço `0x` + 40 hex válido, ENS sem `.eth`) ou adiciona/atualiza a carteira secundária e clica em `"Salvar carteira"`
- **THEN** a API simulada persiste as carteiras para o usuário autenticado, atualiza o cache privado, anuncia o sucesso em live region e mantém os dados após refresh da página

#### Scenario: Validação de endereço hexadecimal inválido ou ENS com sufixo `.eth`
- **WHEN** o usuário informa um endereço fora do padrão `^0x[a-fA-F0-9]{40}$` ou digita `.eth` dentro do campo de texto do nome ENS
- **THEN** a validação bloqueia o envio (ou retorna `VALIDATION_ERROR` da API) e exibe a mensagem de erro associada ao campo via `aria-invalid="true"` e `aria-describedby`

---

### Requirement: Navegação do Menu de Conta, Ações Fora de Escopo e Isolamento por Usuário
O sistema SHALL permitir navegar por teclado e clique entre `"Dados do perfil"` (`/perfil`) e `"Carteiras"` (`/carteiras`), exibir o aviso explícito `"indisponível nesta demonstração"` ao acionar itens fora de escopo (`"Atividade"`, `"Lista de interesse"`, `"Ofertas"`, `"Arquivos baixados"`, `"Suporte"`), encerrar a sessão ao clicar em `"Sair"` e garantir que nenhum dado de perfil ou carteira vaze entre diferentes usuários.

#### Scenario: Clique em itens fora de escopo no menu da conta
- **WHEN** o usuário clica em `"Atividade"`, `"Lista de interesse"` (Watchlist), `"Ofertas"`, `"Arquivos baixados"` (Downloads) ou `"Suporte"` na `AccountNavigation` ou no `AccountMobileHeader`
- **THEN** o sistema dispara o aviso acessível contendo `"indisponível nesta demonstração"` via `useUnavailable()` sem aparentar sucesso funcional nem navegar para rota quebrada

#### Scenario: Isolamento de dados privados no logout e troca de usuário
- **WHEN** o Usuário A (ex.: Alice) edita seu perfil ou carteira, realiza logout e o Usuário B (ex.: Bob) faz login em seguida e acessa `/perfil` e `/carteiras`
- **THEN** o cache privado de Alice foi limpo por `clearPrivateCache`, e apenas os dados e carteiras de Bob são exibidos
