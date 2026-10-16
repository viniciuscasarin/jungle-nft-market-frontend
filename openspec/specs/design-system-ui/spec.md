# Design System UI Specification

## Purpose

Define as especificações e contratos duráveis do sistema de design (@nft/shared-ui), estabelecendo a geração automatizada de tokens para Tailwind v4, componentes primitivos e compostos com APIs tipadas próprias, regras estritas de acessibilidade WCAG 2.1 AA, catálogo Storybook integrado e testes de regressão visual com Playwright.

## Requirements

### Requirement: Geração de Tema Tailwind v4 e Integridade de Tokens
O repositório SHALL fornecer um script `pnpm design:tokens` que compila os valores de `design/tokens/tokens.json` em um arquivo CSS de tema compatível com Tailwind v4 (`@theme`), exportado por `@nft/shared-ui`. Nenhum componente de interface SHALL utilizar códigos hexadecimais literais fora das variáveis semânticas de tema, sendo essa restrição verificada por teste automatizado ou linter.

#### Scenario: Atualização automática de tokens
- **WHEN** um valor de cor ou espaçamento é alterado em `design/tokens/tokens.json` e o script `pnpm design:tokens` é executado
- **THEN** o arquivo de tema CSS é atualizado com o novo valor correspondente e os componentes refletem a alteração sem necessidade de edição de código

#### Scenario: Detecção de cor hex literal não permitida
- **WHEN** um componente em `@nft/shared-ui` declara uma cor hexadecimal literal diretamente em sua estilização
- **THEN** a suíte de testes de integridade de design tokens falha acusando a violação

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

### Requirement: Padrões de Acessibilidade e Redução de Movimento
Todos os elementos interativos em `@nft/shared-ui` SHALL possuir anel de foco visível com contraste mínimo de 3:1 sobre o fundo (`ring-2 ring-primary ring-offset-2 ring-offset-ink`). Diálogos modais SHALL gerenciar o foco de teclado com ciclo interno, fechamento por `Esc` e devolução de foco. O componente `Skeleton` SHALL preservar dimensões e desativar animações de shimmer sob a preferência `prefers-reduced-motion: reduce`.

#### Scenario: Navegação e confinamento de foco em modal
- **WHEN** um componente `Dialog` é aberto via teclado
- **THEN** o foco é imediatamente transferido para o primeiro elemento focável do diálogo, a tecla Tab cicla apenas dentro do modal e pressionar `Esc` fecha o diálogo devolvendo o foco ao botão de abertura

#### Scenario: Comportamento sob preferência de redução de movimento
- **WHEN** o usuário possui a configuração `prefers-reduced-motion: reduce` ativada no sistema operacional
- **THEN** os componentes `Skeleton` exibem fundo sólido sem animação de shimmer

### Requirement: Ativos Vetoriais Otimizados e Tipografia Self-Hosted
Os 35 ícones listados em `design/assets/manifest.json` SHALL ser exportados por `@nft/shared-ui` como componentes React nomeados individuais, contendo dimensões intrínsecas fixas, `aria-hidden="true"` padrão e suporte à prop `title` para leitores de tela. A tipografia do design system SHALL utilizar exclusivamente a família Roboto Mono servida localmente (`design/fonts/`) nos pesos 400, 500 e 700 via regras `@font-face` com `font-display: swap`.

#### Scenario: Consumo de ícone com suporte a leitor de tela
- **WHEN** um componente de ícone (ex: `IconCart`) é instanciado com a propriedade `title="Meu Carrinho"`
- **THEN** o elemento SVG renderiza com `role="img"`, elemento `<title>` interno associado e remove o atributo `aria-hidden`

### Requirement: Catálogo Storybook e Auditoria Automatizada
O monorepo SHALL disponibilizar o projeto `apps/storybook` na porta 6006 configurado com `@storybook/react-vite`. O Storybook SHALL agregar stories CSF3 colocalizados (`*.stories.tsx`) cobrindo todos os componentes e variantes de `shared/ui`, configurar o addon `@storybook/addon-a11y` para reprovar stories com violações WCAG como erro fatal, mapear frames do Figma via `@storybook/addon-designs` e gerar páginas Foundations em MDX a partir de `tokens.json`. As previews do Storybook SHALL importar integralmente a engine e o Preflight do Tailwind CSS v4 com escaneamento de classes via diretivas `@source`, e o servidor e build estático do Storybook SHALL disponibilizar diretórios de assets estáticos (`staticDirs`) garantindo resolução com status 200 para fontes locais (`/fonts/*`) e imagens (`/assets/*`).

#### Scenario: Falha bloqueante por violação de acessibilidade
- **WHEN** um story do Storybook apresenta uma violação das regras de acessibilidade do axe
- **THEN** a verificação do `@storybook/addon-a11y` falha com status de erro impedindo a aprovação do teste

#### Scenario: Visualização do catálogo interativo
- **WHEN** o desenvolvedor executa `pnpm storybook`
- **THEN** a aplicação Storybook é inicializada exibindo a árvore de componentes com documentação de props, simulação de pseudo-classes (:hover, :focus) e vínculos com o Figma

#### Scenario: Renderização com Preflight e utilities do Tailwind v4
- **WHEN** qualquer componente é visualizado no Storybook
- **THEN** os estilos nativos do navegador (botões chanfrados, links azuis padrão) são neutralizados pelo Preflight do Tailwind v4 e as classes utilitárias de tema (`bg-primary`, `font-mono`, `text-text-primary`) são ativamente aplicadas

#### Scenario: Resolução de fontes e assets estáticos
- **WHEN** a preview do Storybook requisita fontes locais (`/fonts/roboto-mono-*.woff2`) ou imagens de design (`/assets/*`)
- **THEN** o servidor de desenvolvimento e o build estático servem esses arquivos com status HTTP 200 através de `staticDirs`

### Requirement: Regressão Visual Automatizada com Playwright
O projeto SHALL fornecer testes de regressão visual via Playwright em `apps/web-e2e` que verificam a renderização de componentes-chave do Storybook servidos pelo build estático (`iframe.html?id=...`) nas resoluções desktop (1440px) e mobile (390px). Divergências em relação aos frames originais do Figma SHALL ser registradas em `docs/design/fidelity-notes.md`.

#### Scenario: Comparação visual contra baseline versionada
- **WHEN** a suíte de regressão visual do Playwright é executada contra os stories do catálogo
- **THEN** a captura de tela coincide com as imagens de referência versionadas nas resoluções 1440px e 390px
