# Spec Delta: design-system-ui

## MODIFIED Requirements

### Requirement: Componentes Específicos e Variantes do Layout do Figma
A biblioteca `@nft/shared-ui` SHALL implementar com exatidão os componentes compostos e estruturas de layout catalogados nos frames do Figma, provendo variantes de estado para catálogo, detalhes, checkout, conta e modais de autenticação.

O componente `Header` SHALL possuir altura de 45px (`h-[45px]`), sem padding interno e com fundo transparente (`bg-transparent`), estruturado em 3 colunas: Coluna 1 com largura fixa de 100px contendo a marca `KURIO` em fonte tamanho 14px e altura de 34px alinhada ao topo; Coluna 2 em `flex-1` com altura de 45px, links centralizados horizontalmente (`justify-center`) e colados verticalmente no topo (`items-start`), com gap de 40px entre links (`Início`, `Mercado`, `Criadores`, `Aprenda`), exibindo o link selecionado na cor `Text Accent` (`text-text-accent`) com borda sólida inferior de 3px em `Color Primary` (`border-b-[3px] border-primary`) alinhada com a borda do header, e os links não selecionados na cor `Color Foreground` (`text-text-primary`); Coluna 3 contendo controles com gap de 28px, incluindo lupa 20x20, carrinho 24x24 e botão `Entrar` com fundo em `Color Primary` (`bg-primary`), texto em `Color Ink` (`text-ink`), tamanho de fonte 16px, `border-radius` de 6px e ícone de logout 20x20. No viewport mobile (< 768px), o componente `Header` SHALL ser ocultado (`hidden md:block`).

O componente `Footer` SHALL implementar com exatidão as 4 seções estruturais catalogadas nos frames desktop do Figma:
1. **Seção Superior de Benefícios e Newsletter**: Grade contendo 3 blocos de valor com ícones circulares (`Segurança da carteira`, `Criadores em destaque`, `Alertas de lançamentos`) e a coluna de newsletter com título `Antecipe-se ao próximo lançamento`, input `digite seu e-mail...`, botão `Enviar` (âmbar) e legenda explicativa.
2. **Faixa Intermediária de Contato**: Barra horizontal com fundo contrastante `bg-surface-dark` (`#38220f`), exibindo o logo `KURIO`, o slogan `Feito para colecionadores, criadores e cultura`, o e-mail `contato@email.com` e o telefone `+55 11 4002 8922`.
3. **Seção Inferior de Navegação e Carteiras**: 4 colunas estruturadas para `Meu perfil`, `Central de ajuda`, `Coleções` e `Redes sociais` (ícones compactos em caixa para Facebook, Instagram, Twitter, LinkedIn e YouTube) acrescida do bloco de `Carteiras compatíveis` com badges para `METAMASK`, `WALLETCONNECT` e `COINBASE`.
4. **Barra Inferior de Copyright**: Texto copyright exato `© 2026 Kurio. Propriedade digital para todos.`.

#### Scenario: Renderização de card de NFT com preço promocional
- **WHEN** o componente `NftCard` recebe as propriedades `priceEth` e `previousPriceEth` distintas
- **THEN** o preço atual é exibido em destaque (`text-accent`) e o preço anterior é renderizado tachado (`line-through text-muted`) preservando a fidelidade do Figma

#### Scenario: Cobertura de componentes compostos do layout
- **WHEN** as páginas do marketplace são montadas
- **THEN** estão disponíveis os componentes Header, Footer, Breadcrumb, MobileTabBar, SearchBar, NftCard, EditionChip, PriceRangeSlider, StarRating, WalletOption, WalletCard, SocialButton, AccountSidebar e ModalLayout

#### Scenario: Disparo de ação visual fora de escopo
- **WHEN** o usuário interage com o componente `SocialButton` ou o formulário de newsletter do `Footer`
- **THEN** uma notificação ou estado acessível é exibido informando categoricamente que a funcionalidade está indisponível nesta demonstração, sem aparentar sucesso falso

#### Scenario: Renderização do Header no Desktop com rota ativa
- **WHEN** o componente `Header` for renderizado no viewport desktop (1440px)
- **THEN** a marca `KURIO` é exibida como texto monoespaçado, os links `Início`, `Mercado`, `Criadores` e `Aprenda` são visíveis, o link correspondente à rota ativa recebe sublinhado âmbar espesso (`border-b-2 border-primary`), o ícone de busca compacto é apresentado e o botão `Entrar` exibe o estilo âmbar com ícone.

#### Scenario: Renderização das Quatro Seções do Footer
- **WHEN** o componente `Footer` for renderizado no viewport desktop
- **THEN** os 3 blocos de benefícios e a coluna de newsletter são exibidos na seção superior, a faixa horizontal `bg-surface-dark` é renderizada com as informações de contato institucionais, as 4 colunas inferiores exibem a taxonomia do Figma e os badges de `Carteiras compatíveis` são apresentados.

#### Scenario: Submissão Interativa da Newsletter
- **WHEN** o usuário submete um e-mail no formulário da newsletter do `Footer`
- **THEN** a interface aciona o callback tipado `onNewsletterSubmit` ou exibe confirmação visual acessível em live region indicando a demonstração sem dependência de serviços externos.

#### Scenario: Acessibilidade e Navegação por Teclado
- **WHEN** o usuário navega por teclado (Tab / Shift+Tab) pelos elementos de `Header` e `Footer`
- **THEN** todos os botões, links e campos interativos exibem anel de foco com contraste mínimo de 3:1 (`ring-2 ring-primary ring-offset-2 ring-offset-ink`) e possuem rótulos descritivos para leitores de tela (`aria-label`).
