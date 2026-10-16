# Design: align-header-footer-figma

## Context

Consulte `proposal.md` para a motivação e `specs/design-system-ui/spec.md` para os requisitos formais.

Os componentes `Header` e `Footer` residem em `libs/shared/ui/src/components/layout/` e são consumidos pelo host `apps/shell` em todas as rotas e pelos stories em `apps/storybook`.
A referência visual absoluta são os screenshots de alta resolução extraídos do Figma e versionados em `design/screenshots/` (`inicio-desktop.png`, `detalhes-desktop.png`, `carrinho-desktop.png` e `inicio-mobile.png`), bem como os tokens consolidados em `libs/shared/ui/src/styles/theme.css`.

## Goals / Non-Goals

**Goals:**
- Reestruturar `Header` para refletir fielmente o frame do Figma:
  - Marca `KURIO` em tipografia Roboto Mono Bold uppercase com espaçamento ótico (`tracking-wider`).
  - Navegação desktop com os 4 links originais: `Início`, `Mercado`, `Criadores`, `Aprenda`.
  - Indicador ativo com sublinhado âmbar espesso (`border-b-2 border-primary` ou elemento pseudo/borda inferior alinhada).
  - Ações à direita compactas: botão com ícone de busca (lupa), botão de carrinho com badge circular âmbar, e botão `Entrar` em estilo pílula/retângulo preenchido âmbar (`bg-primary text-ink font-bold hover:bg-primary-hover`) com ícone de login.
  - No mobile, colapso gracioso mantendo compatibilidade com `MobileTabBar`.
- Reestruturar `Footer` com as 4 seções exatas do Figma:
  - **Seção 1 (Benefícios e Newsletter)**: Grade de 4 colunas:
    - 3 cards com badges circulares `(W)`, `(C)`, `(D)` para "Segurança da carteira", "Criadores em destaque" e "Alertas de lançamentos".
    - 1 bloco de newsletter "Antecipe-se ao próximo lançamento" com input e botão âmbar "Enviar".
  - **Seção 2 (Faixa Institucional)**: Barra horizontal contrastante com classe `bg-surface-dark` (`#38220f`), exibindo logo `KURIO`, slogan "Feito para colecionadores, criadores e cultura", e-mail e telefone.
  - **Seção 3 (Navegação Inferior)**: 4 colunas organizadas: "Meu perfil", "Central de ajuda", "Coleções" e "Redes sociais" (ícones em caixas compactas) + "Carteiras compatíveis" (chips MetaMask, WalletConnect, Coinbase).
  - **Seção 4 (Copyright)**: Barra com `© 2026 Kurio. Propriedade digital para todos.`.
- Preservar acessibilidade rigorosa (WCAG 2.1 AA): anéis de foco visíveis (`ring-2 ring-primary ring-offset-2 ring-offset-ink`), `aria-label`, contraste de texto e live regions para feedback de demonstração.

**Non-Goals:**
- Não criar páginas reais para links institucionais de demonstração ("Aprenda", "Criadores", "Denunciar item" exibem feedback amigável de demonstração acessível).
- Não integrar envio de newsletter com endpoints reais (mock local com mensagem acessível em conformidade com as regras do desafio).

## Decisions

### 1. Logo tipográfico em texto puro vs. SVG
- **Decisão**: Utilizar `<span className="font-mono font-bold text-xl tracking-widest text-text-primary">KURIO</span>` como logo principal no Header e na faixa do Footer, garantindo alinhamento tipográfico perfeito com a fonte Roboto Mono do Figma.
- **Alternativa descartada**: Manter o ícone SVG geométrico `IconKurioLogo`, que não corresponde à identidade desenhada no Figma.

### 2. Estrutura e Grid do Footer em 4 Seções
- **Decisão**: Modelar o `Footer` como um contêiner com 4 subseções empilhadas:
  - `Seção 1`: Container com grid de 4 colunas (`grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 py-12`).
  - `Seção 2`: Faixa de largura total com `bg-surface-dark border-y border-border-default px-6 py-4 flex flex-col md:flex-row items-center justify-between text-caption-12 text-text-secondary`.
  - `Seção 3`: Container com grid de 4 colunas (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 py-12`).
  - `Seção 4`: Barra inferior centralizada com padding e texto copyright.
- **Alternativa descartada**: Manter um layout de grid único genérico de 5 colunas que comprimia os blocos e suprimia a faixa de contato.

### 3. Preservação da Interface de Props
- **Decisão**: Manter compatibilidade com a interface pública existente de `HeaderProps` e `FooterProps` para evitar regressões de compilação em `apps/shell`:
  - `HeaderProps`: `user`, `cartCount`, `activePath`, `navLinks`, `onLoginClick`, `onLogoutClick`, `onCartClick`, `onSearchClick`, etc.
  - `defaultNavLinks`: `[ { label: 'Início', href: '/' }, { label: 'Mercado', href: '/mercado' }, { label: 'Criadores', href: '/criadores' }, { label: 'Aprenda', href: '/aprenda' } ]`.

## Risks / Trade-offs

- **[Regressão de Snapshots do Playwright]** → A reformulação do Header e Footer alterará os testes visuais de `apps/web-e2e`. Mitigação: atualizar as baselines de teste visual com `--update-snapshots` e verificar que todas as asserções passam contra o build consolidado.
- **[Espaço Horizontal em Viewports Intermediários]** → Em 768px (Tablet), a faixa de contato e a grade de 4 colunas podem quebrar em múltiplas linhas. Mitigação: usar flex-wrap responsivo e transição suave de `grid-cols-1` para `grid-cols-2` e `grid-cols-4`.
