# Notas de Fidelidade Visual e Tolerâncias de Layout

Este documento cataloga a comparação visual, tolerâncias de subpixel/1px e decisões de fidelidade entre os componentes implementados em `libs/shared/ui` e os frames do arquivo Figma (`dKMJKBVdX6q0Ym4OX5vd3V` - Marketplace de NFTs GreenMint / Kurio).

---

## 1. Metodologia de Comparação

- **Referência do Figma**: `dKMJKBVdX6q0Ym4OX5vd3V`
- **Breakpoints Auditados**:
  - Desktop: 1440 px (Frame principal `2:2`)
  - Tablet: 768 px (Não desenhado no Figma; derivado do grid flexível de 12 colunas)
  - Mobile: 390 px (Viewport de referência para iPhone moderno, compatível com frame original 414 px `14:5226`)
- **Ferramentas de Validação**:
  - Storybook 8.6 em `apps/storybook` com addon `@storybook/addon-designs` e `@storybook/addon-a11y`
  - Playwright Visual Regression (`apps/web-e2e/src/visual-regression.spec.ts`) contra o Storybook em 1440 px e 390 px

---

## 2. Fidelidade de Tokens e Cores

| Token Figma | Valor Hex | Classe Tailwind v4 | Observações de Fidelidade |
|---|---|---|---|
| `color/ink` | `#140d0a` | `bg-ink` / `text-ink` | Fundo principal da aplicação. 100% fiel ao Figma. |
| `color/surface-card` | `#241612` | `bg-surface-card` | Superfície base para cards e componentes. |
| `color/surface-raised` | `#2f1d15` | `bg-surface-raised` | Superfície elevada para modais, popovers e tooltips. |
| `color/surface-dark` | `#38220f` | `bg-surface-dark` | Faixa contrastante do rodapé. |
| `color/border` | `#3f2319` | `border-border` | Bordas estruturais. |
| `color/border-soft` | `#55321f` | `border-border-soft` | Divisores e bordas de inputs secundários. |
| `color/primary` | `#d28a4c` | `bg-primary` / `text-primary` | Cor primária da marca (âmbar quente). |
| `color/text-accent` | `#e89b55` | `text-text-accent` | Destaques de preço ETH e badges de raridade. |
| `color/secondary` | `#b39463` | `text-secondary` | Rótulos secundários. |
| `color/text-secondary` | `#cfb28c` | `text-text-secondary` | Texto de apoio e links inativos. |
| `color/text-primary` | `#f7f3ec` | `text-text-primary` | Texto de alto contraste. |
| `color/text-coral` | `#f0805f` | `text-text-coral` / `border-feedback-error` | Feedback de erro e estados de cancelamento. |
| `color/success` | `#00a66c` | `text-feedback-success` / `bg-feedback-success` | Indicadores de sucesso e status confirmado. |

### Adições para WCAG 2.1 AA (Acessibilidade)
- **`color/border-accessible` (`#8a583e`)**: No Figma, algumas bordas utilizam `#3f2319` sobre fundo `#140d0a` (contraste de 1.48:1). Para cumprir WCAG 1.4.11 (3:1 para limites de controles interativos), foi introduzido o token de borda acessível com contraste de 3.40:1, aplicado a inputs em repouso e estados selecionados de radio cards.

---

## 3. Tolerâncias de Layout e Subpixel (1px)

1. **Box-Sizing e Bordas de 1px**:
   - No Figma, strokes com alinhamento `Inside` e `Center` muitas vezes não ocupam espaço no flow do auto-layout.
   - Em CSS, utilizou-se `border` padrão do Tailwind v4 (`box-sizing: border-box`). Em componentes com borda dinâmica no estado `:focus` ou `:hover` (ex: `WalletOption`), foram empregadas classes de `ring` ou bordas transparentes em repouso (`border border-transparent` alternando para `border-primary`) para evitar layout shifts de 1px na renderização.
2. **Arredondamento e Raios (Border Radius)**:
   - Raios base do Figma: 4px (`rounded-sm`), 8px (`rounded-md`), 12px (`rounded-lg`), 16px (`rounded-xl`), 9999px (`rounded-full`).
   - Todos os botões, badges e cards respeitam exatamente o raio declarado nos componentes do Figma.
3. **Alinhamento Vertical e Line-Height de Fontes**:
   - A fonte monoespaçada **Roboto Mono** possui métricas verticais distintas de fontes sans-serif como Roboto ou Inter.
   - Para garantir que ícones SVG de 16x16 e 20x20 fiquem perfeitamente centralizados com textos em botões e badges, empregou-se `inline-flex items-center justify-center gap-2` com `leading-none` ou alinhamento flex centralizado, tolerando uma variância ótica de subpixel (< 0.5px) entre navegadores.

---

## 4. Fidelidade por Componente

### 4.1 Header (`libs/shared/ui/src/components/layout/header.tsx`)
- **Figma Frame**: `#70486:560` (Desktop) e `#14:5226` (Mobile)
- **Fidelidade**:
  - Logo Kurio com dimensões fixas (32x32) e tipografia `Roboto Mono 700`.
  - Links de navegação com indicador ativo (`text-text-primary` e border inferior âmbar em desktop).
  - Contador de carrinho com badge `rounded-full` em cor de destaque âmbar.
  - No breakpoint mobile (< 768px), os links colapsam para o botão de menu que abre a gaveta de navegação (`Drawer`).
- **Tolerância**: 0px de desvio em padding vertical (16px / `py-4`) e horizontal (24px a 80px conforme container).

### 4.2 Footer (`libs/shared/ui/src/components/layout/footer.tsx`)
- **Figma Frame**: `#70491:1286`, `#70492:696`
- **Fidelidade**:
  - Grid de 3 colunas de benefícios no topo, seguido de caixa de newsletter com input de email e botão de submissão.
  - Seção inferior com faixa escura `bg-surface-dark` (`#38220f`), links de termos, privacidade e copyright.
  - Ícones de redes sociais com tamanho 20x20 e transição suave de hover.
- **Aviso de Demonstração**: A submissão de newsletter não envia requisições a terceiros e apresenta toast explícito de demonstração.

### 4.3 NftCard (`libs/shared/ui/src/components/widgets/nft-card.tsx`)
- **Figma Frame**: `#70487:690`, `#70488:750`
- **Fidelidade**:
  - Aspect ratio 1:1 para a imagem do NFT com `object-cover` e `rounded-lg`.
  - Chip de edição (ex: `#1/100`) posicionado no canto superior esquerdo da imagem.
  - Botão de favorito em formato circular no canto superior direito com toggle ativo/inativo e animação suave.
  - Preço em ETH exibido com destaque e `previousPriceEth` com texto tachado (`line-through`) e cor de apoio.
  - Botão de ação rápida "Comprar Agora" / "Ver Detalhes".

### 4.4 WalletOption (`libs/shared/ui/src/components/widgets/wallet-option.tsx`)
- **Figma Frame**: `#11:2862` (Modal de Pagamento / Seleção de Carteira)
- **Fidelidade**:
  - Radio card interativo acessível (`role="radio"` com `aria-checked`).
  - Suporte a MetaMask, WalletConnect, Coinbase Wallet, Phantom e Ledger com ícones nativos.
  - Borda selecionada com realce âmbar e fundo `bg-surface-raised`.
  - Estado desabilitado com opacidade reduzida (0.5), cursor não permitido e badge informativo.

### 4.5 ModalLayout (`libs/shared/ui/src/components/widgets/modal-layout.tsx`)
- **Figma Frame**: `#70381:239` (Login), `#70383:239` (Cadastro), `#70376:239` (Confirmação)
- **Fidelidade**:
  - Layout estruturado de modal com focus trap Radix UI, fechamento por `Esc` ou clique no backdrop escurecido (`bg-black/80`).
  - Animações suaves de entrada (fade-in e zoom-in-95) respeitando `prefers-reduced-motion`.
  - Slot para botões de login social (`SocialButton`) e formulário com campos acessíveis.

### 4.6 MobileTabBar (`libs/shared/ui/src/components/layout/mobile-tab-bar.tsx`)
- **Figma Frame**: `#14:5226` (Mobile Navigation Bar)
- **Fidelidade**:
  - Barra de navegação fixa no rodapé da viewport para dispositivos móveis (`bottom-0 w-full md:hidden`).
  - 4 botões de navegação rápida: Início, Mercado, Carrinho (com badge contador) e Conta.
  - Altura de 64px com padding seguro para áreas de gestos no iOS/Android (`pb-[env(safe-area-inset-bottom)]`).

---

## 5. Especificação de Estados Não Desenhados no Figma

O arquivo do Figma não incluía artboards de estados transitórios e de interação. A implementação padronizou esses estados:

1. **Foco pelo Teclado (Keyboard Focus)**:
   - Todos os elementos focáveis utilizam a classe unificada:
     `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-ink`
   - O anel de foco possui contraste de 6.85:1 sobre o fundo `ink`.
2. **Hover e Active**:
   - Botões primários: clareamento em 10% no hover (`hover:brightness-110 active:brightness-95`).
   - Botões secundários/outline: preenchimento suave com `bg-surface-raised` no hover.
   - Transição de 150ms `transition-colors ease-out`.
3. **Disabled**:
   - `disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none`.
   - Elementos mantêm contraste mínimo perceptível e atributos `aria-disabled="true"`.
4. **Skeleton Shimmer**:
   - Gradiente linear animado (`animate-pulse` ou keyframe `shimmer`) com tonalidades entre `surface-card` e `surface-raised`.
   - Automaticamente estático sob `@media (prefers-reduced-motion: reduce)`.
5. **Erros de Formulário**:
   - Bordas vermelhas `border-feedback-error` (`#f0805f`), ícone de alerta e mensagem de erro vinculada via `aria-describedby` ao input.

---

## 6. Telas sem Frame Mobile no Figma

Conforme identificado no levantamento de requisitos, os fluxos de **Perfil do Colecionador**, **Carteiras** e **Confirmação de Pedido** não possuíam frames mobile (`390px`) no arquivo original do Figma.

- **Resolução Implementada**:
  - **Confirmação**: Exibida em Drawer deslizante de baixo para cima (`bottom sheet`) ou modal adaptado com largura total e padding lateral de 16px.
  - **Perfil e Carteiras**: Layout de coluna única com tabs horizontais no topo e cards responsivos ocupando 100% da largura útil da tela, garantindo navegação confortável em telas a partir de 360px.
