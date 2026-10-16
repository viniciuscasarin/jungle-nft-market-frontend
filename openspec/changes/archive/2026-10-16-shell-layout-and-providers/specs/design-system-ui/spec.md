# Spec Delta

## MODIFIED Requirements

### Requirement: Encapsulamento de Terceiros e Primitivos de Apresentação
A biblioteca `libs/shared/ui` SHALL ser o único módulo autorizado a importar `@radix-ui/*` e bibliotecas primitivas correlatas, exportando componentes com APIs tipadas próprias em TypeScript sem vazar tipos internos de bibliotecas de terceiros. A biblioteca SHALL implementar todos os componentes primitivos de base necessários para o marketplace com suporte integral a estados de loading, vazio, erro e sucesso.

#### Scenario: Isolamento de imports do Radix UI
- **WHEN** um arquivo fora de `libs/shared/ui` tenta importar diretamente qualquer pacote sob `@radix-ui/*`
- **THEN** a regra de linter `no-restricted-imports` bloqueia a compilação com erro explícito

#### Scenario: Cobertura de primitivos essenciais
- **WHEN** os módulos consumidores utilizam os primitivos de `@nft/shared-ui`
- **THEN** estão disponíveis os componentes Button, Input, Label, FormField, Select, Checkbox, Radio, Switch, Badge, Card, Tabs, Dialog, Drawer/Sheet, DropdownMenu, Toast, Tooltip, Pagination, Avatar, Skeleton, Spinner, EmptyState, ErrorState, QuantityStepper e Alert

#### Scenario: Associação acessível de campo de formulário
- **WHEN** o componente `FormField` recebe uma mensagem de erro ou descrição
- **THEN** o input filho recebe `aria-invalid="true"` e `aria-describedby` apontando diretamente para os IDs dos elementos de mensagem e ajuda

### Requirement: Componentes Específicos e Variantes do Layout do Figma
A biblioteca `@nft/shared-ui` SHALL implementar com exatidão os componentes compostos e estruturas de layout catalogados nos frames do Figma, provendo variantes de estado para catálogo, detalhes, checkout, conta e modais de autenticação.

O componente `Header` SHALL possuir altura de 45px (`h-[45px]`), sem padding interno e com fundo transparente (`bg-transparent`), estruturado em 3 colunas: Coluna 1 com largura fixa de 100px contendo a marca `KURIO` como link para `/`; Coluna 2 em `flex-1` com altura de 45px, links centralizados horizontalmente (`justify-center`) e colados verticalmente no topo (`items-start`), com gap de 40px entre links (`Início`, `Mercado`, `Criadores`, `Aprenda`), exibindo o link selecionado na cor `Text Accent` (`text-text-accent`) com borda sólida inferior de 3px em `Color Primary` (`border-b-[3px] border-primary`) e os links não selecionados na cor `Color Foreground` (`text-text-primary`); Coluna 3 contendo controles com gap de 28px, incluindo lupa 20x20 como link semântico para a âncora de busca, carrinho 24x24 como link semântico com badge numérico condicional apenas quando informado, e botão `Entrar` ou menu do usuário autenticado via DropdownMenu acessível. No viewport abaixo de 1024 px (< 1024px), o componente `Header` SHALL ser ocultado (`hidden lg:block`).

O componente `Footer` SHALL implementar com exatidão as 4 seções estruturais catalogadas nos frames desktop do Figma:
1. **Seção Superior de Benefícios e Newsletter**: Grade contendo 3 blocos de valor com ícones circulares (`Segurança da carteira`, `Criadores em destaque`, `Alertas de lançamentos`) e a coluna de newsletter com input e botão `Enviar`.
2. **Faixa Intermediária de Contato**: Barra horizontal com fundo contrastante `bg-surface-dark` (`#38220f`), exibindo o logo `KURIO`, slogan e dados de contato.
3. **Seção Inferior de Navegação e Carteiras**: 4 colunas de navegação e bloco de `Carteiras compatíveis`.
4. **Barra Inferior de Copyright**: Texto copyright exato `© 2026 Kurio. Propriedade digital para todos.`.

Ações interativas sem suporte na demonstração (links de rodapé, redes sociais, newsletter) SHALL disparar callback `onUnavailable` provido pelo consumidor ou exibir aviso padronizado sem aparentar sucesso falso.

#### Scenario: Renderização de card de NFT com preço promocional
- **WHEN** o componente `NftCard` recebe as propriedades `priceEth` e `previousPriceEth` distintas
- **THEN** o preço atual é exibido em destaque (`text-accent`) e o preço anterior é renderizado tachado (`line-through text-muted`) preservando a fidelidade do Figma

#### Scenario: Cobertura de componentes compostos do layout
- **WHEN** as páginas do marketplace são montadas
- **THEN** estão disponíveis os componentes Header, Footer, Breadcrumb, MobileTabBar, SearchBar, NftCard, EditionChip, PriceRangeSlider, StarRating, WalletOption, WalletCard, SocialButton, AccountSidebar e ModalLayout

#### Scenario: Disparo de ação visual fora de escopo
- **WHEN** o usuário interage com o componente `SocialButton` ou o formulário de newsletter do `Footer`
- **THEN** a ação delegada aciona o manipulador de indisponibilidade informando que a funcionalidade está indisponível nesta demonstração, sem aparentar sucesso falso

#### Scenario: Renderização do Header no Desktop com rota ativa
- **WHEN** o componente `Header` for renderizado no viewport desktop (>= 1024px)
- **THEN** a marca `KURIO` é exibida, os links `Início`, `Mercado`, `Criadores` e `Aprenda` são visíveis, o link correspondente à rota ativa recebe sublinhado âmbar espesso (`border-b-[3px] border-primary`), o ícone de busca como link âncora é apresentado e o botão `Entrar` ou menu de usuário é exibido.

#### Scenario: Renderização das Quatro Seções do Footer
- **WHEN** o componente `Footer` for renderizado no viewport desktop
- **THEN** os 3 blocos de benefícios e a coluna de newsletter são exibidos na seção superior, a faixa horizontal `bg-surface-dark` é renderizada com as informações de contato institucionais, as 4 colunas inferiores exibem a taxonomia do Figma e os badges de `Carteiras compatíveis` são apresentados.

#### Scenario: Submissão Interativa da Newsletter
- **WHEN** o usuário submete um e-mail no formulário da newsletter do `Footer`
- **THEN** a interface aciona o callback tipado `onUnavailable` informando a indisponibilidade nesta demonstração sem registrar inscrição externa.

#### Scenario: Acessibilidade e Navegação por Teclado
- **WHEN** o usuário navega por teclado (Tab / Shift+Tab) pelos elementos de `Header` e `Footer`
- **THEN** todos os botões, links e campos interativos exibem anel de foco com contraste mínimo de 3:1 (`ring-2 ring-primary ring-offset-2 ring-offset-ink`) e possuem rótulos descritivos para leitores de tela (`aria-label`).
