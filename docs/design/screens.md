# Mapeamento de Telas do Figma

- **Arquivo Figma:** [Frontend Challenge (cópia)](https://www.figma.com/design/dKMJKBVdX6q0Ym4OX5vd3V/Frontend-Challenge--c%C3%B3pia-)
- **fileKey:** `dKMJKBVdX6q0Ym4OX5vd3V`
- **Página Única:** `0:1` ("Marketplace de NFTs GreenMint")
- **Marca Visual:** KURIO

---

## 1. Inventário de Frames de Nível de Tela

Todos os 15 frames de tela existentes na página `0:1` foram identificados e confirmados via MCP do Figma:

| Nome do Frame no Figma | Node ID | Viewport | Largura x Altura (px) | Observação |
|---|---|---|---|---|
| `Desktop / Início` | `2:2` | Desktop | 1440 x 3668 | Layout coluna, padding 24px 120px, gap 96px |
| `Desktop / Detalhes do NFT` | `10:244` | Desktop | 1440 x 2862 | Layout coluna, padding 24px 120px, gap 96px |
| `Desktop / Carrinho de NFTs` | `11:1278` | Desktop | 1440 x 1440 | Layout coluna, padding 24px 120px, gap 96px |
| `Desktop / Pagamento` | `11:2862` | Desktop | 1440 x 1657 | Layout coluna, padding 24px 120px, gap 96px |
| `Desktop / Confirmação de Pedido` | `11:4385` | Desktop | 1440 x 1657 | Modal sobre checkout |
| `Desktop / Login` | `9:115` | Desktop | 1440 x 1981 | Modal sobre marketplace |
| `Desktop / Cadastro` | `9:1022` | Desktop | 1440 x 1981 | Modal sobre marketplace |
| `Desktop / Perfil do Colecionador` | `9:1238` | Desktop | 1440 x 1080 | Layout coluna, padding 24px 120px, altura fixa |
| `Desktop / Carteiras` | `9:1670` | Desktop | 1440 x 1080 | Layout coluna, padding 24px 120px, altura fixa |
| `Mobile / Início` | `14:5226` | Mobile | 414 x 896 | Padding 40px 24px 0px, gap 16px, raio 40px |
| `Mobile / Detalhes do NFT` | `15:5536` | Mobile | 414 x 896 | Gap -114px, raio 40px |
| `Mobile / Carrinho de NFTs` | `16:360` | Mobile | 414 x 896 | Padding 32px 0px 0px, gap 4px, raio 40px |
| `Mobile / Pagamento` | `16:748` | Mobile | 414 x 896 | Padding 32px 28px, raio 40px |
| `Mobile / Login` | `16:1022` | Mobile | 414 x 896 | Padding 80px 28px 24px, gap 40px, raio 40px |
| `Mobile / Cadastro` | `16:1228` | Mobile | 414 x 896 | Padding 80px 28px 24px, gap 40px, raio 40px |

---

## 2. Mapeamento das Telas do Enunciado

Mapeamento de cada tela solicitada no enunciado do desafio com correspondência direta aos frames do Figma e detalhes de modais e composições.

| Tela do Enunciado | Frame Desktop | Frame Mobile | Frame Tablet (768px) | Detalhes de Composição e Modais |
|---|---|---|---|---|
| **Início** (Catálogo) | `2:2` (1440x3668) | `14:5226` (414x896) | *Sem frame* | Desktop com grid de 4 colunas; mobile com 2 colunas e busca compacta. |
| **Detalhes do NFT** (PDP) | `10:244` (1440x2862) | `15:5536` (414x896) | *Sem frame* | Desktop com galeria lateral + metadados; mobile com imagem empilhada e barra fixa de compra. |
| **Carrinho de NFTs** | `11:1278` (1440x1440) | `16:360` (414x896) | *Sem frame* | Desktop com tabela de itens à esquerda e resumo à direita; mobile em lista de cards verticais. |
| **Pagamento** (Checkout) | `11:2862` (1440x1657) | `16:748` (414x896) | *Sem frame* | Formulário de dados do colecionador e seleção de carteira conectada. |
| **Confirmação de Pedido** | `11:4385` (1440x1657) | *Sem frame* | *Sem frame* | **Modal sobre fundo:**<br>• Fundo/Overlay: `11:5105` ("BG", 1440x1657) sobre Checkout `70522:3496`<br>• Modal: `70376:239` ("Order Confirmation Modal", 578px de largura) |
| **Login** (Entrar) | `9:115` (1440x1981) | `16:1022` (414x896) | *Sem frame* | **Modal sobre fundo (Desktop):**<br>• Fundo/Overlay: `9:945` ("BG", 1440x1981) sobre Marketplace `70522:3671`<br>• Modal: `70381:239` ("Sign In Modal", 500x600px)<br>**Mobile:** Frame dedicado `16:1022` em tela cheia com formulário centralizado. |
| **Cadastro** (Criar conta) | `9:1022` (1440x1981) | `16:1228` (414x896) | *Sem frame* | **Modal sobre fundo (Desktop):**<br>• Fundo/Overlay: Retângulo sobre Marketplace<br>• Modal: `70383:239` ("Sign Up Modal", 500x600px)<br>**Mobile:** Frame dedicado `16:1228` em tela cheia com formulário centralizado. |
| **Perfil do Colecionador** | `9:1238` (1440x1080) | *Sem frame* | *Sem frame* | Sidebar de conta à esquerda + formulário de perfil à direita (Avatar, Nome, E-mail, Bio, Notificações). |
| **Carteiras** | `9:1670` (1440x1080) | *Sem frame* | *Sem frame* | Sidebar de conta à esquerda + cards de carteiras (Principal e Reserva) e formulário de adição à direita. |

---

## 3. Telas Sem Frame Mobile e Estratégia de Derivação

Três telas do enunciado não possuem frame mobile correspondente no Figma:

1. **Confirmação de Pedido (`11:4385`):**
   - *Comportamento Desktop:* Modal centralizado (`70376:239`, 578px) com resumo do pedido, ID da transação, carteira, itens adquiridos e link para o explorador de blocos.
   - *Estratégia Mobile:* Renderização do modal como tela completa (ou Bottom Sheet ocupando 100% da largura útil em viewports <= 414px), preservando a mesma hierarquia de tipografia, espaçamento e dados do modal desktop.
2. **Perfil do Colecionador (`9:1238`):**
   - *Comportamento Desktop:* Duas colunas (Account Sidebar com 280px + formulário principal).
   - *Estratégia Mobile:* Colapso em coluna única vertical. A navegação de abas da conta passa a ser exibida como abas horizontais roláveis (Tabs) ou menu sanfona no topo, seguido pelos controles de avatar e campos do formulário com largura total (`w-full`).
3. **Carteiras (`9:1670`):**
   - *Comportamento Desktop:* Duas colunas (Account Sidebar + lista de carteiras conectadas e formulário).
   - *Estratégia Mobile:* Colapso em coluna única vertical. Cards de carteira (`Principal` e `Reserva`) ocupam 100% da largura, empilhados verticalmente, seguidos pelo formulário de adição de carteira.

---

## 4. Ausência de Frames Tablet (768px) e Estratégia de Adaptação

Não existe nenhum frame desenhado para viewport intermediário (Tablet / 768px). A estratégia formal de adaptação responsiva (detalhada em `docs/design/responsive.md`) adota:
- **Grid do Catálogo:** Transição suave de 4 colunas (desktop >= 1200px) para 2 colunas (tablet 768px - 1024px) e 1 a 2 colunas (mobile < 640px).
- **Sidebar de Filtros do Catálogo:** Em 768px a sidebar colapsa em um Drawer / Sheet lateral acionado por botão flutuante ou barra de ferramentas "Filtros".
- **Páginas de Duas Colunas (Carrinho, Pagamento, Perfil, Carteiras):** Transição de layout horizontal (`flex-row`) para layout empilhado (`flex-col`) com largura máxima de conteúdo limitada a 720px centralizada.
