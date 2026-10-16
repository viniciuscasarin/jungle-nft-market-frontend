# Shell Routing Specification

## Purpose

Define a árvore de rotas do host, os layouts com e sem chrome, os guards de acesso, a validação de search params e o comportamento acessível de navegação (foco, título, scroll, 404 e erro raiz).

## Requirements

### Requirement: Tabela de rotas do host
O host SHALL ser o único dono da tabela de rotas, com os paths `/`, `/nft/$nftId`, `/carrinho`, `/pagamento`, `/perfil`, `/carteiras`, `/login`, `/cadastro`, `/pedido/$orderId` e um curinga para paths desconhecidos. Os paths SHALL vir de constantes compartilhadas, sem literais soltos no código das rotas ou dos links.

#### Scenario: Acesso direto e refresh em rota prevista
- **WHEN** o usuário acessa diretamente ou recarrega qualquer path previsto no build integrado com mocks
- **THEN** a página correspondente carrega com o layout correto, sem resposta 404 do servidor

#### Scenario: Paths legados não existem mais
- **WHEN** o usuário acessa `/catalogo`, `/checkout` ou `/pedidos/1/confirmacao`
- **THEN** a página 404 é exibida, sem redirect

### Requirement: Layouts com e sem chrome
As rotas SHALL ser agrupadas em dois layouts sem path: `_app`, que renderiza o chrome completo, e `_modal`, que não renderiza Header, Footer nem BottomTabBar e exibe um fundo decorativo `aria-hidden` que não monta a Home real. `/`, `/nft/$nftId`, `/carrinho`, `/pagamento`, `/perfil`, `/carteiras` e a 404 usam `_app`; `/login`, `/cadastro` e `/pedido/$orderId` usam `_modal`.

#### Scenario: Rota de modal sem chrome
- **WHEN** o usuário abre `/login`
- **THEN** não há Header, Footer nem BottomTabBar no documento e o fundo decorativo possui `aria-hidden="true"`

#### Scenario: Rota de app com chrome
- **WHEN** o usuário abre `/carrinho`
- **THEN** Header (ou SearchBar e BottomTabBar abaixo de 1024 px), Breadcrumb e Footer são exibidos ao redor do conteúdo

### Requirement: Guards de acesso por rota
Rotas privadas (`/pagamento`, `/perfil`, `/carteiras`, `/pedido/$orderId`) SHALL redirecionar visitantes para `/login` com `redirect` contendo path e search de destino. Rotas só de visitante (`/login`, `/cadastro`) SHALL redirecionar usuários autenticados para o destino sanitizado ou `/`. `/carrinho` SHALL ser pública.

#### Scenario: Visitante em rota privada
- **WHEN** um visitante acessa `/perfil`
- **THEN** é levado a `/login?redirect=%2Fperfil` e, após autenticar, volta a `/perfil`

#### Scenario: Usuário autenticado em rota de visitante
- **WHEN** um usuário autenticado acessa `/login?redirect=%2Fcarteiras`
- **THEN** é levado a `/carteiras` sem ver o formulário de login

#### Scenario: Carrinho público
- **WHEN** um visitante acessa `/carrinho`
- **THEN** a página do carrinho é exibida sem redirecionamento

### Requirement: Search params validados por rota
Cada rota com estado na URL SHALL validar seus search params com o schema de contrato correspondente (catálogo em `/`, carrinho em `/carrinho`, checkout em `/pagamento`) e o `redirect` das rotas de visitante SHALL ser sanitizado. Valores inválidos SHALL ser descartados individualmente, sem erro de rota.

#### Scenario: Parâmetro inválido no catálogo
- **WHEN** o usuário acessa `/?page=abc&q=gato`
- **THEN** a rota carrega com `q=gato` preservado e `page` no valor padrão, sem tela de erro

#### Scenario: Redirect inseguro
- **WHEN** o usuário acessa `/login?redirect=https%3A%2F%2Fevil.com`
- **THEN** o parâmetro é descartado e, após autenticar, o usuário vai para `/`

### Requirement: Metadados de rota
Cada rota SHALL declarar título, rótulo de breadcrumb e item de navegação ativo. O `document.title` SHALL refletir o título da rota ativa.

#### Scenario: Título do documento por rota
- **WHEN** o usuário navega de `/` para `/carrinho`
- **THEN** o `document.title` passa a conter o título da rota do carrinho

### Requirement: Foco e anúncio na troca de rota
A cada navegação concluída, o foco SHALL ir para o `main` (focável por script, `tabIndex=-1`) e o novo título SHALL ser anunciado na live region `polite` global. O primeiro carregamento SHALL manter o foco inicial do documento.

#### Scenario: Navegação para outra rota
- **WHEN** o usuário ativa o link do carrinho no Header
- **THEN** o foco vai para o `main` e o título da nova página é anunciado na live region `polite`

### Requirement: Skip link e landmarks
Toda rota `_app` SHALL ter, como primeiro elemento focável, o link "Pular para o conteúdo" que leva ao `main`, e SHALL expor os landmarks `header`, `nav` (com `aria-label`), `main` e `footer`. O item de navegação ativo SHALL usar `aria-current="page"`.

#### Scenario: Primeiro Tab da página
- **WHEN** o usuário pressiona Tab após carregar `/`
- **THEN** o link "Pular para o conteúdo" recebe foco visível e, ao ativá-lo, o foco vai para o `main`

#### Scenario: Item ativo da navegação
- **WHEN** o usuário está em `/`
- **THEN** o link "Início" possui `aria-current="page"` e nenhum outro item da mesma navegação o possui

### Requirement: Restauração de scroll
O host SHALL levar o scroll ao topo em navegações novas e SHALL restaurar a posição anterior ao voltar ou avançar no histórico.

#### Scenario: Voltar no histórico
- **WHEN** o usuário rola o Footer de `/`, navega para `/carrinho` e usa o botão voltar
- **THEN** `/` é exibida na posição de scroll anterior

### Requirement: Página 404
Paths desconhecidos SHALL renderizar a página NotFound dentro do layout `_app`, com título próprio, `meta robots` `noindex`, link para Início e visual feito só com tokens.

#### Scenario: Path inexistente
- **WHEN** o usuário abre `/rota-inexistente`
- **THEN** a 404 é exibida dentro do chrome, o `document.title` identifica a página não encontrada, existe `meta name="robots" content="noindex"` e um link leva a `/`

### Requirement: Erro raiz de renderização
Um erro inesperado de renderização fora de um remote SHALL ser capturado por uma fronteira raiz que exibe ErrorState com a ação de recarregar a aplicação.

#### Scenario: Exceção de render no shell
- **WHEN** um componente do shell lança erro durante a renderização
- **THEN** o ErrorState raiz é exibido com o botão "Recarregar" e o erro é anunciado de forma acessível

### Requirement: Remotes dentro do layout
Cada página de remote SHALL ser carregada sob demanda dentro de uma fronteira de remote posicionada dentro do layout, de modo que uma falha de carregamento mantenha o chrome visível, e o retry recarregue só o remote.

#### Scenario: Remote fora do ar
- **WHEN** o `remoteEntry` do storefront está bloqueado e o usuário abre `/`
- **THEN** Header e Footer continuam visíveis e a área da página mostra ErrorState com retry

#### Scenario: Retry com remote de volta
- **WHEN** o remote volta a responder e o usuário aciona o retry
- **THEN** a página carrega sem recarregar o documento do shell

### Requirement: Preload por intenção
Links do chrome que levam a rotas de remote SHALL iniciar o preload do `remoteEntry` e do chunk da página ao receber hover ou foco.

#### Scenario: Foco no link do carrinho
- **WHEN** o link do carrinho recebe foco por teclado
- **THEN** o `remoteEntry` do checkout é requisitado antes da ativação do link
