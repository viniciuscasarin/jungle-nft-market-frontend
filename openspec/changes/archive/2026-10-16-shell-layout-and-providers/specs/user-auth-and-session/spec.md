# Spec Delta

## MODIFIED Requirements

### Requirement: Session Lifecycle and Cache Isolation
O sistema SHALL gerenciar as transições de identidade do usuário (`A -> null`, `A -> B`, `null -> B`) garantindo cancelamento de consultas ativas e expurgo completo do cache privado antes de qualquer novo estado de sessão ser registrado.

#### Scenario: Troca de usuário sem vazamento de dados
- **WHEN** uma sessão ativa do usuário A é substituída pela autenticação do usuário B
- **THEN** todas as queries em andamento do usuário A são canceladas imediatamente, as chaves de query privadas indexadas por `userId` de A são expurgadas do cache, o cliente de eventos em tempo real é desconectado e limpo (reabrindo conexão apenas sob demanda se houver subscriptions ativas para o usuário B) e nenhuma interface exibe dados residuais do usuário A.

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
- **WHEN** um usuário não autenticado tenta acessar `/pagamento?step=review` e é enviado para `/login?redirect=%2Fpagamento%3Fstep%3Dreview`
- **THEN** após autenticar com sucesso, o sistema sanitiza o caminho e navega o usuário exatamente para `/pagamento?step=review`.

#### Scenario: Redirecionamento para URL externa ou rota de autenticação
- **WHEN** o parâmetro `redirect` contém valores inseguros como `https://evil.com`, `//phishing.org`, `javascript:void(0)` ou rotas de autenticação (`/login`, `/cadastro`)
- **THEN** o sanitizador descarta o parâmetro inválido e direciona o usuário com segurança para a página inicial `/`.
