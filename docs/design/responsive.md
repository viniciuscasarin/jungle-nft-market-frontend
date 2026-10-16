# Especificação de Responsividade, Grids e Adaptação Multi-Viewport

Este documento estabelece as diretrizes de responsividade, sistemas de grid, larguras de container e as regras de derivação para viewports intermediários (Tablet 768px) e para as telas sem frame mobile no Figma (`dKMJKBVdX6q0Ym4OX5vd3V`), em conformidade com as diretrizes do projeto e os requisitos de teste para 390px, 768px e 1440px sem overflow horizontal.

---

## 1. Tabela de Viewports e Breakpoints

| Viewport | Largura Alvo | Margem Lateral da Página | Largura Máxima Útil | Origem no Figma |
|---|---|---|---|---|
| **Mobile Compacto** | 390 px | 16 px | 358 px | Alinhamento com Playwright / iOS moderno |
| **Mobile Padrão** | 414 px | 24 px (`padding: 40px 24px`) | 366 px | Frames Mobile do Figma (`14:5226`, 414x896) |
| **Tablet** | 768 px | 24 px | 720 px | *Derivação formal do projeto* (sem frame) |
| **Desktop Base** | 1440 px | 120 px (`padding: 24px 120px`) | 1200 px | Frames Desktop do Figma (`2:2`, 1440px) |
| **Desktop Amplo** | >= 1920 px | Auto (centralizado) | 1200 px (ou 1440px máx) | Container centralizado com margens automáticas |

---

## 2. Layouts de Grid e Estrutura por Breakpoint

### 2.1 Desktop (1440 px)
- **Container Central:** Largura máxima de 1200px com padding lateral de 120px (`space.30`).
- **Gap entre Seções Principais:** 96px (`space.24`).
- **Catálogo / Mercado:**
  - Layout de duas colunas assimétricas com gap de 48px (`space.12`).
  - Coluna Esquerda: Sidebar de Filtros com largura fixa de 310px.
  - Coluna Direita: Product Grid com 3 colunas de cards de NFT (cards de 258px de largura com gap de 24px entre colunas e 72px entre linhas).
- **Carrinho e Pagamento:**
  - Layout dividido em 2 colunas: Tabela de itens / Formulário do colecionador (65% da largura) + Card de resumo de pedido fixo/sticky (35% da largura).
- **Perfil e Carteiras:**
  - Sidebar de conta fixa com 280px à esquerda + área de formulários e cards à direita.

---

### 2.2 Tablet (768 px) — Regras de Adaptação
Não existe frame desenhado para tablet no Figma. O comportamento responsivo para 768px segue as regras:

1. **Catálogo de NFTs:**
   - A Sidebar de Filtros (310px) colapsa e é removida do fluxo estático da página.
   - Um botão de gatilho "Filtros" com ícone e badge de filtros ativos é posicionado na barra de ferramentas superior (ao lado das abas e da ordenação).
   - Ao ser clicado, a sidebar abre como um **Drawer / Sheet lateral** acessível sobreposto, com botão de fechar e botão "Aplicar filtros".
   - A grade de produtos transiciona para **2 colunas** de cards de NFT com largura flexível (`minmax(0, 1fr)`) e gap de 24px.
2. **Carrinho e Checkout:**
   - Transição do layout horizontal para layout empilhado (`flex-col`).
   - A tabela do carrinho mantém a visualização em tabela ou cartões compactos; o card de resumo de pedido é renderizado imediatamente abaixo com largura total.
3. **Navegação (Header):**
   - Os links de navegação principais (Início, Mercado, Criadores, Aprenda) colapsam em menu gaveta (Sheet).
   - O cabeçalho exibe: Wordmark KURIO, botão de busca, ícone do carrinho com badge e botão de acesso rápido à conta.
4. **Perfil e Carteiras:**
   - A barra lateral de conta é convertida em um componente de **Abas horizontais com rolagem suave** (`Tabs` com overflow horizontal sem barra de rolagem visível), permitindo alternar entre "Perfil", "Carteiras" e opções adicionais.
   - Os formulários e cards de carteira conectada ocupam a largura total de 720px centralizada.

---

### 2.3 Mobile (390 px – 414 px)
O comportamento mobile segue os frames existentes (`14:5226`, `15:5536`, `16:360`, `16:748`, `16:1022`, `16:1228`):

1. **Navegação e Tab Bar:**
   - Cabeçalho minimalista no topo: Wordmark KURIO, campo de busca com botão de filtro integrado.
   - Navegação primária transferida para a **Mobile Tab Bar fixa na base** da tela (`h-16 bg-surface-card border-t border-border`), contendo Início, Mercado, Carrinho (com badge) e Perfil.
2. **Catálogo:**
   - Grid em 2 colunas compactas (cards com raio de 12px e tipografia adaptada) ou lista vertical com imagem destacada.
   - Badges de raridade ("RARO") sobrepostos à imagem.
3. **Página de Detalhes do NFT (PDP - `15:5536`):**
   - Imagem principal ocupa 100% da largura útil no topo.
   - Carrossel horizontal de miniaturas logo abaixo.
   - Metadados, chips de edição e descrição em fluxo vertical contínuo.
   - **Sticky Buy Bar (Barra Fixa de Compra):** Fixada na parte inferior da tela, exibindo o preço atual em ETH e botões de ação rápida ("Comprar" e botão circular de favoritar), garantindo ergonomia de alcance com o polegar.

---

## 3. Adaptação Detalhada das Telas Sem Frame Mobile

### 3.1 Confirmação de Pedido (`11:4385`)
- **Desktop:** Modal centralizado `#70376:239` (578px) com fundo escurecido semi-transparente sobre a página de checkout.
- **Mobile (390px - 414px):**
  - Renderizado como **tela cheia dedicada** (`/pedido/:orderId` com visual limpo de recibo) ou **Bottom Sheet expandido a 100% da altura**.
  - Topo: Ícone de sucesso verde com checkmark (`#00a66c`) e mensagem "Pedido confirmado!".
  - Bloco de Transação: ID da transação em fonte monospace com botão "Copiar" e endereço truncado da carteira.
  - Resumo financeiro e lista de NFTs adquiridos com miniaturas empilhadas verticalmente.
  - Rodapé da tela: Botão primário "Ver no Etherscan" e link secundário "Voltar ao catálogo".

### 3.2 Perfil do Colecionador (`9:1238`)
- **Desktop:** Sidebar lateral (280px) + formulário com duas colunas de campos (Nome, E-mail, Bio, Notificações).
- **Mobile (390px - 414px):**
  - Colapso para coluna única vertical de 100% de largura.
  - Topo: Controles de Avatar centralizados (Avatar 80x80px com botões "Alterar" e "Remover" empilhados).
  - Campos de entrada: Largura total (`w-full`), labels com indicador obrigatório `*`, inputs com altura mínima de 44px para área de toque confortável.
  - Botão de salvar alterações fixo ou no rodapé do formulário.

### 3.3 Carteiras (`9:1670`)
- **Desktop:** Sidebar lateral + lista de carteiras à direita com cards lado a lado e formulário de adição.
- **Mobile (390px - 414px):**
  - Colapso para coluna única vertical.
  - Cards de carteira conectada empilhados verticalmente:
    - Card "Carteira Principal": borda primária, badge "Principal", saldo ETH destacado e endereço truncado com botão de cópia.
    - Card "Carteira Reserva": estilo secundário.
  - Botão / Formulário "Adicionar nova carteira": acordeão ou seção expansível logo abaixo dos cards existentes.

---

## 4. Diretrizes Técnicas de Prevenção de Overflow e Zoom

1. **Zero Overflow Horizontal:**
   - Nenhum elemento deve utilizar larguras estáticas fixas em pixels superiores ao viewport do dispositivo (`max-w-full overflow-x-hidden`).
   - Tabelas (como a tabela de itens do carrinho) devem suportar rolagem horizontal interna contida (`overflow-x-auto`) ou transicionar para layout de cartões empilhados em telas menores que 640px.
   - Textos longos como hashes de transação (`0x71C...B39`), endereços de contrato e URLs devem usar `truncate` com tooltip ou `break-all`.
2. **Suporte a Zoom de Texto até 200% (WCAG 1.4.4):**
   - Toda tipografia utiliza tamanhos base proporcionais (`rem` ou `px` em containers com altura fluida `min-h` em vez de `h` fixa).
   - Containers não devem truncar conteúdo nem sobrepor botões quando o usuário aplicar zoom de texto no navegador.
3. **Áreas de Toque Mínimas (WCAG 2.5.5 / 2.5.8):**
   - Todos os elementos interativos em mobile (botões, ícones, checkboxes, abas) devem possuir área de clique/toque de no mínimo **44 x 44 px** (utilizando padding invisível quando a arte visual for menor).
