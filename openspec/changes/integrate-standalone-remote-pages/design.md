# Design

## Context

Ver proposal.md para motivação e escopo. O problema está na composição das entradas: os três `main.tsx` chamam `bootstrapStandalone(App)`, enquanto Federation expõe outros arquivos. HomePage já exporta CatalogHomePage; ProfilePage e WalletsPage já compõem features conectadas. PaymentPage, CartPage, ConfirmationPage e PdpPage ainda são placeholders; checkout-feature, cart-feature e orders-feature não exportam páginas conectadas.

O bootstrap atual fornece ShellProvider e router em memória, mas não QueryClientProvider, feedback visual ou ShellPageChromeProvider. Também não recebe inicialização de MSW dos remotes. Sua sessão padrão usa `mock-standalone-user`, que não comprova autenticação na API. Os testes de App e a regressão federada esperam expressamente as landings antigas. O alias de teste do Shell para HomePage aponta para App.tsx.

## Goals / Non-Goals

**Goals:** um único bootstrap reutilizável, páginas expostas e locais idênticas, estados de inicialização observáveis e navegação local utilizável com refresh/histórico. Preservar o contrato público existente para testes e consumidores que passam um componente simples.

**Non-Goals:** mover features para shell-kit; importar apps entre si; adicionar um segundo router ao runtime integrado; duplicar a tabela de produto ou seus guards; completar os fluxos pendentes de compra; copiar o chrome do Shell para cada remote.

## Decisions

### 1. Harness local configurável, separado da página federada

Estender a configuração de bootstrap com descritores mínimos de páginas locais, destino inicial, validação de search e origem do Shell. Os apps fornecem referências às suas próprias páginas; shell-kit não importa features de domínio. Usar browser history no harness de dev e preservar opção de history em memória para testes. A raiz do router renderiza um Outlet, evitando montar duas vezes a página.

| Remote | Entrada local | Páginas suportadas |
|---|---|---|
| storefront | `/` | HomePage em `/` com schema de filtros existente |
| account | `/` redireciona a `/perfil` | ProfilePage e WalletsPage |
| checkout | `/` | Estado indisponível; demais paths também não montam o recibo placeholder |

A navegação usada por ShellContext, links e hooks do router deve compartilhar a mesma resolução: destinos locais usam o router; destinos de produto fora do mapa local vão à origem do Shell com path/search preservados. Configurar essa origem para os testes em portas alternativas; não espalhar `localhost:4200` em componentes. Validar destinos internos para evitar redirecionamento externo arbitrário. URLs desconhecidas recebem um estado acessível de não encontrado/indisponível.

Alternativas: apenas trocar App por HomePage falha por falta de contexto; importar routes.tsx do Shell viola a fronteira entre apps e torna o modo isolado dependente dos outros remotes. O mapa de desenvolvimento não substitui as rotas canônicas de produto e deve ser documentado como exceção restrita ao harness já previsto na arquitetura.

### 2. Providers e ciclo de inicialização no shell-kit

O bootstrap cria/reutiliza clientes pelo registro existente, inicia MSW quando habilitado e só então resolve a sessão e monta a página. A composição inclui QueryClientProvider via shared/query, ShellProvider, ShellToastProvider, GlobalLiveRegions, ShellPageChromeProvider e sincronização realtime quando houver sessão. Os cenários e respostas continuam em mocks/*; Axios e Socket.IO continuam encapsulados nos wrappers existentes.

Renderizar loading de inicialização, erro com retry e sucesso no mesmo root React. Retry não cria outro root, cliente ou worker; falha de worker deve permitir nova tentativa sem reutilizar indefinidamente uma Promise rejeitada. Fazer cleanup de listeners/subscriptions e limpar cache privado na troca de sessão, expiração e logout. Preservar CSS pelo HTML, caches por app, portas estritas e otimização já corrigida.

Alternativa de providers copiados em cada main.tsx aumenta divergência e duplica gerenciamento de recursos.

### 3. Autenticação determinística apenas no harness com MSW

Remover a sessão fictícia padrão como pré-condição das páginas privadas reais. O storefront começa visitante. O account obtém token/sessão por autenticação HTTP simulada para o usuário de desenvolvimento, após o worker iniciar; validar respostas com contratos existentes e derivar ShellUserSession da resposta. Credenciais de cenário ficam no adaptador de desenvolvimento de mocks, acessível por shell-kit, nunca em features/UI ou data-access de produto. Esse adaptador usa o HttpClient normal e não altera estado do servidor diretamente.

Tokens ficam na origem do remote e alimentam o callback do HttpClient. O harness identifica visualmente a sessão de desenvolvimento e oferece recuperação explícita após expiração/logout, sem login automático repetido. Falha de autenticação bloqueia as páginas privadas e mantém retry acessível. O bootstrap aceita inicialização de sessão injetável para evitar dependência de shell-kit em auth-feature ou outros scopes. O adaptador de mocks não entra nos módulos de página expostos por Federation nem executa em produção; com mocks desabilitados, exibir instrução explícita para usar o Shell, sem realizar login de desenvolvimento.

Alternativas: inventar userId ou injetar token sem REST quebraria isolamento e esconderia falhas reais; implementar formulários de login próprios em cada remote duplicaria o fluxo do Shell.

### 4. Integração das páginas existentes e limites honestos

Storefront e account usam as mesmas exportações de página para desenvolvimento e Federation. Substituir as landings técnicas e remover somente código demonstrativo tornado obsoleto; preservar a verificação de singletons por registry/probes em testes adequados. O checkout standalone usa um estado composto com shared/ui, tokens, link para o Shell e texto de indisponibilidade; não ligar UI estática de pagamento a respostas locais.

Não alterar nesta change os módulos de checkout/PDP consumidos pelo host: continuam pendências explícitas das changes funcionais. Em particular, a mensagem de sucesso incondicional do ConfirmationPage integrado é um risco preexistente e bloqueia considerar o fluxo de compra pronto; a correção de recibo pertence a checkout-confirmation-receipt. Documentar que acessar o ambiente integrado não garante que todas as rotas estejam concluídas.

### 5. Verificação de comportamento

Atualizar alias de teste para HomePage.tsx e os testes que assumem a landing antiga, preservando ou transferindo a cobertura de singletons e independência. Unitários do bootstrap verificam ordem MSW/sessão/página, providers, retry sem duplicação, navegação e limpeza. Testes REST usam handlers MSW; testes de realtime usam socket.io-client.

Regressão de navegador cobre cold start nos quatro servidores, catálogo real em 4201, account com dados reais em 4203 e checkout indisponível em 4202. Também executar cada remote sem host para comprovar independência local. Resetar cenários por teste e controlar latência/eventos; preservar verificações de 504, erros JS, otimização e arquivos de teste servidos no navegador. Validar 390/768/1440, zoom 200%, teclado, foco, labels e live regions. Baselines só mudam para remoção intencional das landings.

## Risks / Trade-offs

- Bootstrap mais completo aumenta imports e pode reabrir falhas do otimizador → manter imports dinâmicos de mocks, seeds de optimizeDeps e regressão de cold start.
- Sessão por origem pode surpreender ao seguir links ao Shell → mostrar identificação de dev e documentar que o login do Shell é independente; nunca transferir tokens pela URL.
- Conflito entre navegação por hook e ShellContext → testar ambos, incluindo links de Perfil/Carteiras e links externos do catálogo.
- Changes em andamento e muitos arquivos locais modificados → preservar trabalho existente e limitar diffs à integração; registrar falhas anteriores separadamente sem enfraquecer testes.
- Confirmação integrada ainda placeholder → manter dependência de recibo explícita; nenhuma validação desta change equivale a validar compra.

## Migration Plan

Implementar primeiro o bootstrap com testes de contrato, depois conectar storefront, account e estado do checkout. Atualizar regressões e documentação em seguida. Manter nomes dos módulos expostos e rotas canônicas. Não há migração de dados; rollback consiste em reverter os commits da integração, preservando mudanças funcionais de outras changes. Não arquivar antes de checks, build e E2E relacionados passarem.
