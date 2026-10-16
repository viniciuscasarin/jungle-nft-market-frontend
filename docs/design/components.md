# Inventário de Componentes de Design e Especificação de Estados

Este catálogo documenta todos os padrões de interface identificados no arquivo Figma (`dKMJKBVdX6q0Ym4OX5vd3V`), sua correspondência com os componentes de apresentação propostos para `libs/shared/ui`, variantes, props em TypeScript e a **especificação técnica rigorosa dos estados não desenhados no Figma** (hover, foco via teclado, disabled, erro e skeleton loading), garantindo coerência visual e conformidade com WCAG 2.1 AA.

---

## 1. Navegação e Estrutura Global

### 1.1 Header
- **Figma Node:** `#70486:560` (Header Row), `#70504:3017` (Header With Divider)
- **Componente em `shared/ui`:** `Header`
- **Variantes no Figma:**
  - `Active`: `Home` (Início, Perfil, Carteiras) ou `Market` (Mercado, Carrinho, Pagamento, Confirmação)
  - `Badge Count`: número de itens no carrinho
- **Props sugeridas:**
  ```ts
  interface HeaderProps {
    activeRoute?: 'home' | 'market' | 'creators' | 'learn';
    cartItemCount?: number;
    isAuthenticated?: boolean;
    userAvatarUrl?: string;
    onSignInClick?: () => void;
    onCartClick?: () => void;
    onSearch?: (term: string) => void;
  }
  ```
- **Estados desenhados:** Default (repouso)
- **Estados não desenhados:**
  - *Hover em Nav Items:* Transição de cor de `#cfb28c` para `#f7f3ec` em 150ms.
  - *Foco via teclado:* `:focus-visible` com anel `ring-2 ring-primary ring-offset-2 ring-offset-ink`.
  - *Mobile:* Colapso do menu de navegação em botão hambúrguer/Drawer lateral com busca compacta.

---

### 1.2 Footer
- **Figma Node:** `#70491:1286`, `#70492:696`
- **Componente em `shared/ui`:** `Footer`
- **Variantes no Figma:** Rodapé completo com 3 colunas de benefícios, newsletter, faixa de contato, 3 blocos de navegação e redes sociais.
- **Props sugeridas:**
  ```ts
  interface FooterProps {
    onNewsletterSubmit?: (email: string) => Promise<void>;
  }
  ```
- **Estados desenhados:** Default
- **Estados não desenhados:**
  - *Input de Newsletter - Foco:* Borda realçada com `ring-1 ring-primary` sobre `surface.dark`.
  - *Input de Newsletter - Erro:* Borda vermelha `border-feedback-error` com texto de erro acessível.
  - *Links de rodapé - Hover:* Sublinhado sutil e clareamento para `#f7f3ec`.
  - *Redes sociais - Hover:* Fundo preenchido com `color.action.primary` e ícone `#140d0a`.

---

### 1.3 Breadcrumb
- **Figma Node:** Presente em `#10:244` (Detalhes do NFT) e `#11:1278` (Carrinho)
- **Componente em `shared/ui`:** `Breadcrumb`
- **Props sugeridas:**
  ```ts
  interface BreadcrumbItem {
    label: string;
    href?: string;
    isCurrent?: boolean;
  }
  interface BreadcrumbProps {
    items: BreadcrumbItem[];
  }
  ```
- **Estados desenhados:** Default
- **Estados não desenhados:**
  - *Hover:* Cor transiciona de `text.secondary` para `text.accent`.
  - *Foco:* `:focus-visible` com contorno arredondado `ring-1 ring-primary`.

---

### 1.4 Tab Bar Mobile
- **Figma Node:** `#14:5226` (Mobile / Início)
- **Componente em `shared/ui`:** `MobileTabBar`
- **Variantes no Figma:** Barra inferior fixa de 4 botões com botão central de ação destacado.
- **Props sugeridas:**
  ```ts
  interface MobileTabBarProps {
    activeTab: 'home' | 'market' | 'cart' | 'profile';
    cartCount?: number;
    onTabChange: (tab: string) => void;
  }
  ```
- **Estados desenhados:** Default
- **Estados não desenhados:**
  - *Active:* Ícone e rótulo preenchidos em `color.text.accent` com indicador de ponto superior.
  - *Feedback de Toque:* Efeito de escala `scale-95` suave de 100ms em toque ativo.

---

### 1.5 Search Bar Mobile
- **Figma Node:** `#14:5226`
- **Componente em `shared/ui`:** `MobileSearchBar`
- **Variantes no Figma:** Input expandido com ícone de lupa à esquerda e botão de filtro lateral à direita.
- **Props sugeridas:**
  ```ts
  interface MobileSearchBarProps {
    value: string;
    onChange: (val: string) => void;
    onFilterClick: () => void;
    placeholder?: string;
  }
  ```
- **Estados não desenhados:** Focus com anel de borda primária e botão limpar (X) quando há texto digitado.

---

## 2. Catálogo e Descoberta

### 2.1 Hero Banner
- **Figma Node:** `#70347:239`, `#70342:2674`
- **Componente em `shared/ui`:** `HeroBanner`
- **Variantes no Figma:** Banner com headline `Display/43 Bold`, parágrafo de apoio, botão primário "EXPLORAR", carrossel de dots (`#3:131`) e card de NFT lateral com cantos arredondados (24px).
- **Props sugeridas:**
  ```ts
  interface HeroBannerProps {
    title: string;
    subtitle: string;
    description: string;
    ctaLabel: string;
    onCtaClick: () => void;
    artworkUrl: string;
  }
  ```
- **Estados não desenhados:** Skeleton com imagem e blocos de texto enquanto dados iniciais carregam.

---

### 2.2 Sidebar de Filtros com Slider de Preço
- **Figma Node:** `#70485:381`, `#70485:382`
- **Componente em `shared/ui`:** `CatalogFilterSidebar`
- **Variantes no Figma:** Coleções (com contagens), Faixa de preço (slider duplo + botão Aplicar), Rede (Ethereum, Polygon, Solana).
- **Props sugeridas:**
  ```ts
  interface FilterValues {
    collections: string[];
    priceRange: [number, number];
    networks: string[];
  }
  interface CatalogFilterSidebarProps {
    values: FilterValues;
    onChange: (values: FilterValues) => void;
    onApply: () => void;
  }
  ```
- **Estados não desenhados:**
  - *Slider Thumb - Hover & Focus:* Polegar do slider amplia de 15px para 18px com sombra de foco.
  - *Checkbox / Itens de Coleção - Hover:* Fundo levemente iluminado em `surface.raised`.

---

### 2.3 Tabs do Catálogo
- **Figma Node:** `#70351:240`
- **Componente em `shared/ui`:** `Tabs`
- **Variantes no Figma:** "Todos os NFTs", "Novos lançamentos", "Em alta". Aba ativa possui texto `Text/Accent` e linha sublinhada `Color/Primary` de 2px.
- **Props sugeridas:**
  ```ts
  interface TabsProps {
    tabs: { id: string; label: string }[];
    activeTabId: string;
    onTabSelect: (id: string) => void;
  }
  ```
- **Estados não desenhados:**
  - *Hover em aba inativa:* Texto muda de `#f7f3ec` para `#e89b55` em 150ms.
  - *Navegação por setas:* Teclas esquerda/direita alternam foco e ativam aba.

---

### 2.4 Sort (Ordenação)
- **Figma Node:** `#70351:241`
- **Componente em `shared/ui`:** `SortSelect`
- **Props sugeridas:**
  ```ts
  interface SortOption {
    value: string;
    label: string;
  }
  interface SortSelectProps {
    options: SortOption[];
    selected: string;
    onSelect: (val: string) => void;
  }
  ```
- **Estados não desenhados:** Popover suspenso posicionado abaixo com opções selecionáveis e foco visível.

---

### 2.5 Card de NFT
- **Figma Node:** `#70342:2678`, `#70342:2681` (com preço riscado), `#15:5536` (mobile com badge)
- **Componente em `shared/ui`:** `NftCard`
- **Variantes no Figma:**
  1. *Padrão:* Imagem (250x250, raio 15px), nome da obra, preço atual em ETH.
  2. *Preço Promocional / Alterado:* Preço atual em destaque (`#e89b55`) ao lado do preço anterior riscado (`#b39463`, `line-through`).
  3. *Badge de Raridade:* Badge "RARO" posicionado sobre o canto superior da imagem.
- **Props sugeridas:**
  ```ts
  interface NftCardProps {
    id: string;
    name: string;
    priceEth: string;
    previousPriceEth?: string;
    imageUrl: string;
    rarityBadge?: string;
    isFavorite?: boolean;
    onFavoriteToggle?: (id: string) => void;
    onClick?: () => void;
  }
  ```
- **Estados desenhados:** Default
- **Estados não desenhados:**
  - *Hover do Card:* Elevação suave `translate-y-[-4px]` e sombra `shadow-card` em 200ms.
  - *Hover do Botão de Favorito:* Escala `scale-110` e coração preenchido em coral `#f0805f`.
  - *Loading / Skeleton:* Retângulo 250x250 com shimmer, bloco de título e bloco de preço preservando dimensões.

---

### 2.6 Pagination
- **Figma Node:** `#70342:2825`
- **Componente em `shared/ui`:** `Pagination`
- **Variantes no Figma:** Botão ativo com fundo `Color/Primary` (`#d28a4c`) e texto escuro; botões inativos com borda `Color/Border` e texto claro; seta de avançar.
- **Props sugeridas:**
  ```ts
  interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
  }
  ```
- **Estados não desenhados:**
  - *Hover:* Botão inativo recebe fundo `surface.card` e borda `border.soft`.
  - *Disabled:* Seta desabilitada na última página com opacidade 0.4 e cursor `not-allowed`.

---

## 3. Detalhes do NFT e Compra

### 3.1 Galeria de NFT
- **Figma Node:** `#10:244` (Desktop), `#15:5536` (Mobile)
- **Componente em `shared/ui`:** `NftGallery`
- **Variantes no Figma:** Miniaturas verticais à esquerda + imagem principal ampliada à direita com botão flutuante de favoritar.
- **Estados não desenhados:** Miniatura ativa com borda `border-2 border-primary`; transição de fade suave ao trocar de imagem.

---

### 3.2 Chips de Edição
- **Figma Node:** `#10:244`
- **Componente em `shared/ui`:** `EditionChip`
- **Variantes no Figma:** `1/1` (Único), `1/10`, `1/50`, `ABERTA`.
- **Estados desenhados:** Chip selecionado (fundo escuro com borda primária).
- **Estados não desenhados:** Chip esgotado com opacidade 0.5, texto riscado e tooltip explicativo "Edição esgotada".

---

### 3.3 QuantityStepper
- **Figma Node:** `#10:244` (PDP), `#11:1278` (Carrinho)
- **Componente em `shared/ui`:** `QuantityStepper`
- **Props sugeridas:**
  ```ts
  interface QuantityStepperProps {
    value: number;
    min?: number;
    max?: number;
    disabled?: boolean;
    onChange: (val: number) => void;
  }
  ```
- **Estados não desenhados:**
  - *Botão Diminuir desabilitado:* Quando `value === min` (1), botão '-' exibe cursor `not-allowed` e opacidade 0.4.
  - *Botão Aumentar desabilitado:* Quando `value === max` (limite de estoque da edição).

---

### 3.4 Estrelas de Avaliação
- **Figma Node:** `#10:244`
- **Componente em `shared/ui`:** `StarRating`
- **Variantes no Figma:** 5 estrelas preenchidas/parciais + contagem "(19 avaliações)". Somente leitura.
- **Props sugeridas:**
  ```ts
  interface StarRatingProps {
    rating: number; // 0 a 5
    reviewCount: number;
  }
  ```
- **Estados não desenhados:** Tooltip acessível com nota textual (ex: "Nota 4.8 de 5 baseada em 19 avaliações").

---

## 4. Carrinho e Pagamento

### 4.1 Linha da Tabela do Carrinho
- **Figma Node:** `#11:1278`
- **Componente em `shared/ui`:** `CartItemRow` (Desktop) / `CartItemCard` (Mobile)
- **Estrutura:** Miniatura da obra, Nome do NFT, Token ID `#XXXX`, Preço unitário ETH, QuantityStepper, Subtotal ETH, Botão de exclusão (lixeira).
- **Estados não desenhados:**
  - *Exclusão - Confirmação:* Alerta/modal de remoção ou anúncio acessível via live region.
  - *Preço Alterado em Tempo Real:* Destaque pulsante sutil na célula de preço indicando atualização de cotação da API.

---

### 4.2 Resumo com Código Promocional
- **Figma Node:** `#11:1278`, `#11:2862`
- **Componente em `shared/ui`:** `OrderSummaryCard`
- **Estrutura:** Campo de cupom promocional com botão "Aplicar", linhas discriminadas:
  - Subtotal (ETH)
  - Desconto promocional (ETH, negativo)
  - Taxa estimada de rede (ETH)
  - **Total** (ETH com maior destaque tipográfico)
  - Botão principal CTA "Conectar e finalizar" / "Confirmar pagamento"
- **Estados não desenhados:**
  - *Cupom Inválido/Expirado:* Borda do input em `color.feedback.error` e mensagem de erro em vermelho coral.
  - *Cupom Aplicado:* Tag com botão (X) para remover e indicação da porcentagem/desconto.

---

### 4.3 Opção de Carteira (Radio Card)
- **Figma Node:** `#11:2862`
- **Componente em `shared/ui`:** `WalletOptionRadio`
- **Variantes no Figma:**
  1. *Radio selecionado:* Borda `border-primary` e preenchimento `surface.card`.
  2. *Radio não selecionado:* Borda suave `border.soft`.
- **Estados não desenhados:** Foco via teclado com contorno de alta visibilidade e indicação acessível via `aria-checked`.

---

### 4.4 Card de Carteira Conectada
- **Figma Node:** `#9:1670` (Carteiras), `#11:2862` (Pagamento)
- **Componente em `shared/ui`:** `ConnectedWalletCard`
- **Variantes no Figma:** Carteira Principal (badge de destaque), Carteira Reserva, saldo em ETH e endereço truncado (`0x1a2b...3c4d`).
- **Estados não desenhados:** Botão "Copiar endereço" com feedback de sucesso "Copiado!" temporário (2s).

---

## 5. Formulários, Modais e Controles de Conta

### 5.1 Input com Ícone e Marcador de Obrigatório
- **Figma Node:** `#9:115`, `#9:1022`, `#9:1238`, `#11:2862`
- **Componente em `shared/ui`:** `FormField` / `Input`
- **Estrutura:** Label com asterisco `*` de obrigatório, campo de texto com ícone opcional à esquerda, suporte a toggle de visibilidade de senha à direita.
- **Estados não desenhados:**
  - *Focus:* Anel contrastante `ring-2 ring-primary ring-offset-2 ring-offset-ink`.
  - *Erro de Validação:* Borda coral `#f0805f`, mensagem associada via `aria-describedby` e `aria-invalid="true"`.
  - *Disabled:* Fundo escurecido, texto atenuado e sem eventos de clique.

---

### 5.2 Campo ENS com Seletor
- **Figma Node:** `#9:1238`, `#9:1670`
- **Componente em `shared/ui`:** `EnsInput`
- **Estrutura:** Campo de texto de nome acompanhado de sufixo estático ou seletor de domínio `.eth`.
- **Estados não desenhados:** Indicador de validação de formato enquanto o usuário digita.

---

### 5.3 Select / Dropdown
- **Figma Node:** `#9:1238` (País/Idioma), `#9:1670` (Rede da Carteira)
- **Componente em `shared/ui`:** `Select`
- **Estados não desenhados:** Menu suspenso com navegação total por setas do teclado (Home, End, PageUp, PageDown) e foco no item ativo.

---

### 5.4 Avatar Controls
- **Figma Node:** `#9:1238`
- **Componente em `shared/ui`:** `AvatarControls`
- **Estrutura:** Avatar circular (raio 9999px) com botões secundários "Alterar" e "Remover".
- **Estados não desenhados:** Indicador de progresso de upload com spinner acessível e feedback de arquivo inválido.

---

### 5.5 Account Sidebar
- **Figma Node:** `#9:1238`, `#9:1670`
- **Componente em `shared/ui`:** `AccountSidebar`
- **Itens no Figma:** Perfil, Carteiras, Atividade, Watchlist, Ofertas, Downloads, Suporte.
- **Regra:** Itens fora de escopo são exibidos com aviso amigável de demonstração ("indisponível nesta demonstração").
- **Estados não desenhados:** Item ativo com barra lateral destacada e cor `text.accent`.

---

### 5.6 Botão Social
- **Figma Node:** `#9:115`, `#9:1022`
- **Componente em `shared/ui`:** `SocialButton`
- **Variantes no Figma:** Google, Facebook, etc.
- **Regra:** Exibição com aviso explícito de indisponibilidade nesta demonstração.

---

### 5.7 Modais (Login, Cadastro e Confirmação de Pedido)
- **Figma Nodes:**
  - Login: `#70381:239` (Sign In Modal, 500x600px)
  - Cadastro: `#70383:239` (Sign Up Modal, 500x600px)
  - Confirmação de Pedido: `#70376:239` (Order Confirmation Modal, 578px de largura)
- **Componente em `shared/ui`:** `Dialog`, `ModalLayout`
- **Estados não desenhados:**
  - *Backdrop:* Fundo escurecido semi-transparente `bg-ink/80 backdrop-blur-sm`.
  - *Focus Trap:* Foco preso no diálogo durante exibição; ESC para fechar; retorno do foco ao elemento de disparo ao fechar.
  - *Mobile:* Renderização fluida ocupando 100% da tela em viewports pequenos.
