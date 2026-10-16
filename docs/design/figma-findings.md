# Pré-levantamento do Figma

Levantamento feito via MCP do Figma em 15/10/2026, antes da change `design-extraction-from-figma`. Serve de ponto de partida: o agente deve **confirmar** cada item (nodeIds e valores), completar o que falta e corrigir o que divergir. Coloque este arquivo em `docs/design/figma-findings.md`.

- Arquivo (cópia): https://www.figma.com/design/dKMJKBVdX6q0Ym4OX5vd3V/Frontend-Challenge--c%C3%B3pia-
- fileKey: `dKMJKBVdX6q0Ym4OX5vd3V`
- Página única: `0:1` "Marketplace de NFTs GreenMint". A marca exibida nas telas é **Kurio**.
- Tema: escuro, quente (marrom/âmbar). Uma única família tipográfica: **Roboto Mono**.

## 1. Frames de tela

Desktop 1440 px de largura; mobile 414 x 896.

| Tela | Desktop | Mobile |
|---|---|---|
| Início | `2:2` (1440x3668) | `14:5226` |
| Detalhes do NFT | `10:244` | `15:5536` |
| Carrinho de NFTs | `11:1278` | `16:360` |
| Pagamento | `11:2862` | `16:748` |
| Confirmação de pedido | `11:4385` (modal `70376:239` sobre fundo) | **sem frame** |
| Login | `9:115` (modal `70381:239` sobre a página) | `16:1022` |
| Cadastro | `9:1022` (modal `70383:239`) | `16:1228` |
| Perfil do colecionador | `9:1238` | **sem frame** |
| Carteiras | `9:1670` | **sem frame** |

Telas sem frame mobile (esperado pelo enunciado): Confirmação, Perfil e Carteiras. Tablet (768) não existe em nenhum frame.

## 2. Tokens (Variables do arquivo)

O arquivo usa Variables. Valores lidos nos frames `2:2` e `9:115`.

### Cores

| Token (Figma) | Valor | Uso provável |
|---|---|---|
| `color/ink` | `#140d0a` | Fundo da página |
| `color/surface-card` | `#241612` | Cards, rodapé |
| `color/surface-raised` | `#2f1d15` | Superfícies elevadas (modais) |
| `color/surface-dark` | `#38220f` | Faixa do rodapé |
| `color/border` | `#3f2319` | Bordas |
| `color/border-soft` | `#55321f` | Bordas de campos e divisores |
| `color/primary` | `#d28a4c` | Botão primário, destaques |
| `color/text-accent` | `#e89b55` | Preços, links ativos |
| `color/secondary` | `#b39463` | Texto secundário |
| `color/text-secondary` | `#cfb28c` | Texto de apoio |
| `color/text-primary` | `#f7f3ec` | Texto principal |
| `color/foreground` | `#f5f1eb` | Texto (quase duplicado de `text-primary`) |
| `color/text-coral` | `#f0805f` | Provável erro/alerta (confirmar uso) |
| `color/success` | `#00a66c` | Sucesso |
| `color/background-elevated` | `#fbfbfb` | Claro; uso não identificado (confirmar) |
| `logo/google-*`, `logo/facebook`, `logo/blue`, `logo/orange` | vários | Cores de marca de botões sociais; são assets, não tokens de tema |

### Tipografia

- Família: `font/family` = Roboto Mono. Pesos 400, 500 e 700.
- Tamanhos usados: 9, 10, 12, 13, 14, 15, 16, 17, 18, 20, 24 e 43. Escala irregular (15 e 17 aparecem pontualmente).
- Estilos nomeados (exemplos): `Display/43 Bold` (lh 70), `Heading/24 Bold`, `Title/20 Medium`, `Body Large/16|18`, `Body/14|15`, `Caption/12|13`, `Tiny/9|10`.
- Line-height misto: valores fixos (16, 20, 22, 24, 30, 40) e "100" (automático).
- `Body/14 Bold` e `Body/14 Medium · lh 16` têm `letterSpacing: 10`. Confirmar a unidade (provavelmente %) antes de converter.

### Problemas de naming nos tokens

- Cada cor aparece duas vezes, com a mesma cor e dois estilos de nome (`color/ink` e `Color/Ink`, `Text/Accent` etc.). Consolidar em um único conjunto.
- `text-primary` (`#f7f3ec`) e `foreground` (`#f5f1eb`): consolidar.
- Não há tokens de spacing, raio ou sombra nas Variables. Devem ser derivados dos frames (`get_design_context`).

## 3. Contraste (calculado)

| Par | Razão |
|---|---|
| texto principal sobre `ink` | 17,4:1 |
| `text-secondary` sobre `surface-card` | 8,7:1 |
| `secondary` sobre `ink` | 6,7:1 |
| `secondary` sobre `surface-card` | 6,1:1 |
| `text-accent` sobre `surface-card` | 7,7:1 |
| `ink` sobre `primary` (texto do botão) | 6,9:1 |
| `text-coral` sobre `ink` | 7,3:1 |
| `success` sobre `ink` | 6,1:1 |
| `border` sobre `ink` | **1,3:1** |
| `border-soft` sobre `ink` | **1,7:1** |

- Todos os pares de **texto** passam AA com folga.
- As bordas de campos (`border`, `border-soft`) ficam abaixo de 3:1 exigido para delimitar componentes de formulário (WCAG 1.4.11). Os campos precisam de borda mais forte ou outro indicador. Registrar como ajuste de acessibilidade.
- Não há estado de **foco** desenhado. Criar token de anel de foco (sugestão: `primary`).
- Cores de placeholder e de estados desabilitado, erro e hover não foram verificadas; medir na extração.

## 4. Padrões e componentes identificados

Navegação e layout: Header (logo KURIO, links Início/Mercado/Criadores/Aprenda, busca, carrinho com badge de contagem, botão "Entrar"), Footer (3 colunas de benefícios, newsletter, faixa de contato, links, redes sociais), Breadcrumb, **Tab bar mobile** (com botão central destacado), Search bar mobile com botão de filtros, Account sidebar (Perfil, Carteiras e itens fora de escopo).

Descoberta: Hero (banner com CTA e dots), Sidebar de filtros (Coleções com contagem, Faixa de preço com slider, Rede com contagem, botão Aplicar), Featured NFT banner, Tabs (Todos os NFTs, Novos lançamentos, Em alta), Sort ("Ordenar por"), **Card de NFT** (imagem, nome, preço; variante com preço anterior riscado; badge "RARO" no mobile), Pagination (1 a 4 e seta), Promo cards, Blog cards.

Detalhe: Galeria (miniaturas + imagem principal), botão de favorito sobre a imagem, estrelas e contagem de avaliações, **chips de edição** (1/1, 1/10, 1/50 e "ABERTA"), **QuantityStepper**, botões Comprar e Favoritar, bloco de metadados (ID, coleção, atributos), compartilhamento, abas Detalhes/Avaliações, carrossel "Mais desta coleção".

Carrinho e pagamento: Tabela de itens (miniatura, nome, ID do token, preço, stepper, total, remover), campo de **código promocional** com "Aplicar", resumo (subtotal, desconto, taxa de rede com "Taxa estimada", total), CTA "Conectar e finalizar", **opções de carteira** (radio em card), cards de carteira conectada (principal e reserva), resumo "Seus NFTs" com (x N) e subtotal.

Conta: formulários de perfil e de carteiras, **Avatar controls** (Alterar/Remover), campo ENS com prefixo/seletor `.eth`, Select, Password input com ícone de ocultar, marcador de obrigatório (`*`).

Modais: Sign in, Sign up (abas Entrar/Criar conta), Confirmação de pedido (ID da transação, data, total, carteira, itens, taxas, botão "Ver no Etherscan"), botão de fechar (X), **Social buttons** (Google e outro).

Ícones: conjunto Iconly (Curved/Bold/Light-Outline) e ícones soltos (heart, shopping, thank-you, redes sociais). Imagens: artes de NFT em raster (várias).

## 5. Pontos do design que exigem decisão

1. **Formulário de Pagamento (desktop)** reaproveita campos do formulário de carteiras (Rede, Tipo de carteira, Código de indicação, Nome ENS, Observação, "Usar outra carteira?"), todos marcados como obrigatórios (`*`), inclusive "Código de indicação" e "Nome ENS". Decidir quais campos são reais, quais são obrigatórios e como mapeiam para o contrato de pedido. Registrar em `ARCHITECTURE.md`.
2. **Opções de carteira no Pagamento**: a primeira opção exibe uma imagem combinada ("MetaMask · WalletConnect · Coinbase") com camadas ocultas no Figma. Confirmar o intento (três carteiras: MetaMask, WalletConnect, Coinbase Wallet).
3. **Nomes de campos inconsistentes** nos frames de Perfil e Carteiras (layers "Bio Field", "Website Field" com rótulos "E-mail" e "Apelido da carteira"). Os rótulos visíveis prevalecem sobre os nomes das camadas.
4. **Login e Cadastro são modais** sobre uma página de fundo, e **Confirmação** é um modal. Decidir se viram rotas (`/login`, `/cadastro`, `/pedido/:id`) renderizadas com o visual de modal sobre o fundo. O enunciado exige acesso direto e retorno ao fluxo anterior, o que favorece rotas.
5. **Elementos fora de escopo presentes no layout**: seção de blog, promo cards, newsletter, links de rodapé, itens do menu de conta (Atividade, Watchlist, Ofertas, Downloads, Suporte), compartilhamento social, botões de login social, "Esqueceu a senha?", "Aprenda" e "Criadores" no menu. Devem existir visualmente, mas sem aparentar sucesso funcional ("indisponível nesta demonstração").
6. **Avaliações** (estrelas, "19 avaliações") não têm contrato no enunciado. Decidir se são dados estáticos do NFT ou ocultos.
7. **Preço anterior riscado** em um card (1,99 e 2,29 ETH) sugere preço alterado. Tratar como variante do card, alimentada por dados do NFT.
8. **Tablet (768)** não tem frame: documentar regras de adaptação.

## 6. Ativos

- Artes de NFT (cards, detalhe, carrinho, recibo, promos, blog), miniaturas e imagens mobile.
- Logo/wordmark KURIO, ícone "thank-you", ícones de redes sociais e de carteiras (MetaMask, WalletConnect, Coinbase).
- Ícones Iconly: setas, busca, carrinho, usuário, coração, estrela, lixeira, olho, filtro, download, logout, aviso, localização.
- Fonte: Roboto Mono (licença aberta; distribuir self-hosted, por exemplo via pacote `@fontsource`).

## 7. Decisões do projeto sobre os pontos da seção 5

| # | Ponto | Decisão |
|---|---|---|
| 1 | Formulário de Pagamento | Todos os campos marcados com `*` são obrigatórios, validados no cliente e no servidor simulado, e os dados são fictícios (validação só de formato, nada é verificado on-chain). "Observação" e "ENS ou carteira secundária" seguem como o Figma os rotula: opcionais, sendo a carteira secundária obrigatória apenas quando "Usar outra carteira?" estiver ligado. Os dados formam o objeto `collector`, gravado no pedido e no recibo. |
| 4 | Avaliações | Somente leitura. `rating` (média e contagem) vem no detalhe do NFT e a lista vem de `GET /nfts/{id}/reviews`. Sem criação, edição ou voto. Ver `ARCHITECTURE.md` §6. |
| 2 | Modais | Login, Cadastro e Confirmação viram rotas (`/login`, `/cadastro`, `/pedido/:orderId`) com visual de modal. |
| 3 | Fora de escopo | Elementos presentes no layout permanecem visíveis, sem aparentar sucesso: aviso "indisponível nesta demonstração". |

Os demais pontos (2 e 3 da seção 5, 7 e 8) seguem pendentes para a extração: opções de carteira, nomes de camadas inconsistentes, preço riscado e tablet.
