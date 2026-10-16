# Registro de Decisões de Design e Resolução de Questões em Aberto

Este documento consolida as decisões arquiteturais tomadas a partir da inspeção do arquivo Figma (`dKMJKBVdX6q0Ym4OX5vd3V`), distinguindo entre **decisões já fechadas** (não reabertas) e **questões de design resolvidas** com suas respectivas propostas de implementação e impactos em contratos e UX, alinhadas com `ARCHITECTURE.md` §18 e §19.

---

## 1. Decisões Arquiteturais Fechadas (Não Reabrir)

Conforme estabelecido no pré-levantamento (`docs/design/figma-findings.md` §7) e nos requisitos do projeto, os seguintes pontos estão formalmente decididos:

### 1.1 Formulário de Pagamento e Coleta de Dados
- **Status:** **Decidido**
- **Decisão:** Todos os campos rotulados visualmente com asterisco (`*`) no formulário de Pagamento são obrigatórios. A validação ocorre tanto no cliente (via Zod + React Hook Form) quanto no servidor simulado (MSW).
- **Tratamento de Dados:** Os dados fornecidos são puramente simulados (sem validações on-chain ou dados de cartão de crédito real).
- **Obrigatoriedade Condicional:**
  - "Observação" e "ENS ou carteira secundária" são opcionais.
  - Caso o usuário acione a opção "Usar outra carteira?", o campo de carteira secundária torna-se obrigatório.
- **Contrato:** Os dados do formulário compõem o objeto `collector` associado ao pedido (`Order`), persistido e renderizado no recibo da confirmação.

---

### 1.2 Avaliações de NFTs (Reviews)
- **Status:** **Decidido**
- **Decisão:** O sistema de avaliações é estritamente **somente leitura** (`read-only`).
- **Origem dos Dados:** A média de nota (`rating`) e o total de avaliações (`reviewCount`) são fornecidos diretamente no payload do detalhe do NFT (`GET /nfts/:id`).
- **Comentários:** A lista textual de avaliações é carregada via `GET /nfts/:id/reviews`. Não há funcionalidades de criação, edição ou votação de avaliações nesta aplicação.

---

### 1.3 Modais Renderizados como Rotas URL
- **Status:** **Decidido**
- **Decisão:** Os fluxos de **Login**, **Cadastro** e **Confirmação de Pedido** são modelados como rotas URL completas gerenciadas pelo TanStack Router:
  - `/login`
  - `/cadastro`
  - `/pedido/:orderId`
- **Comportamento Visual:** No Desktop, essas rotas renderizam visualmente como um modal suspenso centralizado sobre a página de fundo (com backdrop escurecido semi-transparente).
- **Usabilidade e Acessibilidade:** Permite navegação direta por URL, links compartilháveis de recibo de pedido, suporte natural ao botão voltar do navegador e foco restrito (focus trap) no diálogo.

---

### 1.4 Elementos Visuais Fora de Escopo
- **Status:** **Decidido**
- **Decisão:** Seções presentes no design do Figma mas fora do escopo funcional do desafio (ex.: botões de login social Google/Facebook, formulário de newsletter no rodapé, seção de blog, promo cards, "Esqueceu a senha?", itens de menu "Aprenda" e "Criadores", e abas da conta como "Downloads" e "Suporte") **permanecem visíveis** para preservar fidelidade estética.
- **Comportamento:** Ao serem acionados, exibem feedback acessível e imediato com aviso amigável: *"Funcionalidade indisponível nesta demonstração"*, nunca aparentando sucesso falso.

---

## 2. Questões de Design Resolvidas e Propostas de Implementação

Os quatro pontos pendentes da seção 5 do pré-levantamento foram avaliados e resolvidos da seguinte forma:

### 2.1 Opções de Carteira na Tela de Pagamento
- **Problema no Figma:** O frame de Pagamento (`11:2862`) exibe na primeira opção uma imagem combinada estática com o texto "MetaMask · WalletConnect · Coinbase" e camadas ocultas de seleção individual.
- **Proposta Adotada:**
  - Desmembrar a seleção em 3 opções de carteira reais e independentes via radio card:
    1. **MetaMask** (com ícone da raposa)
    2. **WalletConnect** (com ícone azul oficial)
    3. **Coinbase Wallet** (com ícone azul oficial)
  - Cada opção exibe o nome, o ícone vetorial correspondente (disponibilizado em `design/assets/icons/`) e permite selecionar a carteira conectada para a transação.
- **Impacto:** Melhora substancial de UX e fidelidade ao modelo mental de checkout Web3, sem violar a regra de simulação de dados.

---

### 2.2 Nomes de Camadas Inconsistentes nos Frames de Perfil e Carteiras
- **Problema no Figma:** No frame de Perfil (`9:1238`) e Carteiras (`9:1670`), algumas camadas internas foram duplicadas com nomes técnicos divergentes (ex.: layer chamada `"Bio Field"` com rótulo visual `"E-mail"`, layer `"Website Field"` com rótulo visual `"Apelido da carteira"`).
- **Proposta Adotada:**
  - **Prevalência estrita do rótulo visível:** Os textos desenhados visivelmente para o usuário prevalecem sempre sobre identificadores internos de camadas do Figma.
  - O campo de formulário do Perfil é implementado como "E-mail" e o campo de Carteiras como "Apelido da carteira".
- **Impacto:** Elimina ambiguidades e assegura correspondência perfeita entre o que o avaliador vê na tela e a validação do formulário.

---

### 2.3 Preço Anterior Riscado nos Cards de NFT
- **Problema no Figma:** O card do item "Neon Vessel #552" (`#70342:2681`) exibe simultaneamente o preço atual em destaque (`1.99 ETH`) e um preço anterior riscado (`2.29 ETH`).
- **Proposta Adotada:**
  - Modelar o contrato de NFT com o campo opcional `previousPriceEth?: string`.
  - Quando `previousPriceEth` estiver preenchido e for diferente de `priceEth`, o componente `NftCard` renderiza a variante promocional com o valor antigo riscado (`line-through text-muted`) ao lado do valor ativo (`text-accent font-bold`).
  - Quando ausente, o card renderiza apenas o preço ativo.
- **Impacto:** Flexibilidade de exibição de promoções ou alterações de preço em tempo real sem código rígido ou divergências de schema.

---

### 2.4 Comportamento Responsivo em Tablet (768 px)
- **Problema no Figma:** Inexistência de frame desenhado para tablet (768px).
- **Proposta Adotada:**
  - Seguir rigorosamente as regras documentadas em `docs/design/responsive.md`:
    - Catálogo: Transição de 4 para 2 colunas de produtos.
    - Sidebar de Filtros: Colapso em Drawer / Sheet lateral acessível via botão "Filtros".
    - Carrinho e Pagamento: Transição de 2 colunas para layout empilhado verticalmente.
    - Perfil e Carteiras: Sidebar colapsa em abas horizontais roláveis no topo da página.
- **Impacto:** Garante 100% de aprovação nos testes E2E do Playwright na resolução de 768px sem estouro de layout ou perda de usabilidade.
