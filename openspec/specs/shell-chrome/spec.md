# Shell Chrome Specification

## Purpose

Define a composição responsiva do chrome do host (Header, SearchBar, BottomTabBar, Breadcrumb, Footer), a integração das páginas com o chrome e o tratamento padronizado das ações fora de escopo.

## Requirements

### Requirement: Chrome responsivo por breakpoint
O layout `_app` SHALL exibir o chrome desktop (Header completo) a partir de 1024 px de largura e o chrome mobile (SearchBar no topo e BottomTabBar fixa na base) abaixo de 1024 px, incluindo 768 px. Em 390, 768 e 1440 px não SHALL haver overflow horizontal.

#### Scenario: Viewport desktop
- **WHEN** a largura da janela é 1440 px
- **THEN** o Header completo é exibido e a SearchBar e a BottomTabBar não são renderizadas nem focáveis

#### Scenario: Viewport tablet
- **WHEN** a largura da janela é 768 px
- **THEN** a SearchBar e a BottomTabBar são exibidas, o Header desktop não é focável e não há rolagem horizontal

### Requirement: Navegação do Header desktop
O Header SHALL exibir a marca Kurio como link para `/`, os itens Início (`/`), Mercado (`/#catalogo`), Criadores e Aprenda, a lupa, o carrinho e a área do usuário. Itens com destino SHALL ser links reais (`<a href>` sem `#` vazio). Criadores e Aprenda SHALL ser ações fora de escopo.

#### Scenario: Mercado leva ao catálogo da Home
- **WHEN** o usuário ativa "Mercado"
- **THEN** navega para `/` com a âncora `#catalogo`, sem recarregar o shell

#### Scenario: Criadores fora de escopo
- **WHEN** o usuário ativa "Criadores"
- **THEN** recebe o aviso "indisponível nesta demonstração" e permanece na página atual

### Requirement: Lupa do Header como âncora
No chrome desktop, a lupa SHALL ser um link com nome acessível para a âncora da listagem de busca da Home (`/#busca`), sem campo de texto e sem envio de busca.

#### Scenario: Ativação da lupa
- **WHEN** o usuário ativa a lupa do Header em `/carrinho`
- **THEN** navega para `/#busca` sem recarregar o shell

### Requirement: Busca mobile
A SearchBar do chrome mobile SHALL, ao ser enviada, navegar para `/` com o termo em `q` validado pelo schema do catálogo, preservando a SPA. Termo vazio SHALL remover `q` da URL.

#### Scenario: Envio de busca no mobile
- **WHEN** em 390 px o usuário digita "gato" na SearchBar e envia
- **THEN** a URL passa a ser `/?q=gato` e o documento do shell não é recarregado

### Requirement: Contador e link do carrinho
O carrinho no Header e na BottomTabBar SHALL ser um link para `/carrinho`. O contador SHALL ser exibido apenas quando um valor numérico for fornecido e o nome acessível SHALL incluir a quantidade quando exibida.

#### Scenario: Contador ainda indefinido
- **WHEN** o chrome é renderizado sem valor de contador
- **THEN** nenhum badge de quantidade é exibido e o link se chama "Carrinho de compras"

#### Scenario: Contador informado
- **WHEN** o contador recebe 3
- **THEN** o badge mostra 3 e o nome acessível do link informa 3 itens

### Requirement: Área do usuário
Para visitantes, o Header SHALL exibir "Entrar" como link para `/login` com `redirect` da rota atual. Para usuários autenticados, SHALL exibir um menu acessível por teclado com Perfil e Carteiras como links, Atividade, Watchlist, Ofertas, Downloads e Suporte como ações fora de escopo, e Sair, que encerra a sessão.

#### Scenario: Menu do usuário por teclado
- **WHEN** um usuário autenticado foca o gatilho do menu e pressiona Enter
- **THEN** o menu abre com foco no primeiro item, as setas percorrem os itens, `Esc` fecha e o foco volta ao gatilho

#### Scenario: Sair pelo menu
- **WHEN** o usuário ativa "Sair"
- **THEN** a sessão é encerrada e a área do usuário volta a exibir "Entrar"

#### Scenario: Item fora de escopo no menu
- **WHEN** o usuário ativa "Atividade"
- **THEN** recebe o aviso "indisponível nesta demonstração" e nenhuma navegação ocorre

### Requirement: BottomTabBar mobile
A BottomTabBar SHALL reproduzir os itens e o botão central destacado do frame mobile do Figma, mapeando cada item para uma rota existente; itens sem rota SHALL ser ações fora de escopo. O item da rota ativa SHALL usar `aria-current="page"`.

#### Scenario: Item com rota
- **WHEN** em 390 px o usuário ativa o item do carrinho na BottomTabBar
- **THEN** navega para `/carrinho` e o item passa a ter `aria-current="page"`

#### Scenario: Item sem rota
- **WHEN** o usuário ativa um item da BottomTabBar que não possui página (por exemplo, favoritos)
- **THEN** recebe o aviso "indisponível nesta demonstração" e a rota não muda

### Requirement: Breadcrumb a partir da rota
O layout `_app` SHALL exibir um Breadcrumb derivado dos metadados da rota ativa, com o último item marcado como página atual. Uma página SHALL poder substituir o rótulo do último item, e a substituição SHALL ser desfeita quando a página desmonta.

#### Scenario: Rótulo dinâmico da PDP
- **WHEN** a página de detalhe informa o nome do NFT "Gato Cósmico"
- **THEN** o último item do Breadcrumb exibe "Gato Cósmico"

#### Scenario: Limpeza ao sair da página
- **WHEN** o usuário sai da PDP para `/carrinho`
- **THEN** o Breadcrumb não exibe mais o nome do NFT

### Requirement: Botão de filtros controlado pela página
O chrome mobile SHALL exibir o botão de filtros da SearchBar apenas quando a página ativa registrar uma ação de filtros, e SHALL removê-lo quando a página desmonta ou cancela o registro.

#### Scenario: Página sem filtros
- **WHEN** a rota ativa não registrou ação de filtros
- **THEN** o botão de filtros não é renderizado

#### Scenario: Página com filtros
- **WHEN** a Home registra a ação de filtros e o usuário aciona o botão em 390 px
- **THEN** a ação registrada é executada

### Requirement: Footer completo
O layout `_app` SHALL exibir o Footer com benefícios, newsletter, faixa de contato, colunas de links e redes sociais, conforme o Figma. Links, redes sociais e newsletter sem destino SHALL ser ações fora de escopo.

#### Scenario: Envio da newsletter
- **WHEN** o usuário envia um e-mail na newsletter
- **THEN** recebe o aviso "indisponível nesta demonstração" e nenhuma confirmação de inscrição é exibida

### Requirement: Ações fora de escopo
Toda ação desenhada sem suporte na demonstração SHALL permanecer visível, ser um botão focável com `aria-disabled="true"` e aparência de link (sem o atributo `disabled`) e, ao ser acionada, exibir em toast e anunciar em live region "indisponível nesta demonstração", nunca aparentando sucesso.

#### Scenario: Link do Footer fora de escopo
- **WHEN** o usuário foca por teclado um link de "Central de ajuda" no Footer e pressiona Enter
- **THEN** o item recebe foco visível, é anunciado como indisponível e o aviso aparece em toast e na live region

### Requirement: Estado de sessão em carregamento no chrome
Enquanto a sessão inicial não estiver resolvida, a área do usuário no Header SHALL exibir skeleton com `aria-busy="true"` em vez de "Entrar" ou do menu.

#### Scenario: Sessão em resolução
- **WHEN** o shell carrega com token salvo e a consulta de sessão ainda não respondeu
- **THEN** a área do usuário exibe skeleton com `aria-busy="true"` e não exibe "Entrar"
