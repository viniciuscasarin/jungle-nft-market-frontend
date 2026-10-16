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
- **THEN** estão disponíveis os componentes Button, Input, Label, FormField, Select, Checkbox, Radio, Switch, Badge, Card, Tabs, Dialog, Drawer/Sheet, Toast, Tooltip, Pagination, Avatar, Skeleton, Spinner, EmptyState, ErrorState, QuantityStepper e Alert

#### Scenario: Associação acessível de campo de formulário
- **WHEN** o componente `FormField` recebe uma mensagem de erro ou descrição
- **THEN** o input filho recebe `aria-invalid="true"` e `aria-describedby` apontando diretamente para os IDs dos elementos de mensagem e ajuda

### Requirement: Componentes Específicos e Variantes do Layout do Figma
A biblioteca `@nft/shared-ui` SHALL implementar com exatidão os componentes compostos e estruturas de layout catalogados nos frames do Figma, provendo variantes de estado para catálogo, detalhes, checkout, conta e modais de autenticação.

#### Scenario: Renderização de card de NFT com preço promocional
- **WHEN** o componente `NftCard` recebe as propriedades `priceEth` e `previousPriceEth` distintas
- **THEN** o preço atual é exibido em destaque (`text-accent`) e o preço anterior é renderizado tachado (`line-through text-muted`) preservando a fidelidade do Figma

#### Scenario: Cobertura de componentes compostos do layout
- **WHEN** as páginas do marketplace são montadas
- **THEN** estão disponíveis os componentes Header, Footer, Breadcrumb, MobileTabBar, SearchBar, NftCard, EditionChip, PriceRangeSlider, StarRating, WalletOption, WalletCard, SocialButton, AccountSidebar e ModalLayout

#### Scenario: Disparo de ação visual fora de escopo
- **WHEN** o usuário interage com o componente `SocialButton` ou o formulário de newsletter do `Footer`
- **THEN** uma notificação ou estado acessível é exibido informando categoricamente que a funcionalidade está indisponível nesta demonstração, sem aparentar sucesso falso

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
O monorepo SHALL disponibilizar o projeto `apps/storybook` na porta 6006 configurado com `@storybook/react-vite`. O Storybook SHALL agregar stories CSF3 colocalizados (`*.stories.tsx`) cobrindo todos os componentes e variantes de `shared/ui`, configurar o addon `@storybook/addon-a11y` para reprovar stories com violações WCAG como erro fatal, mapear frames do Figma via `@storybook/addon-designs` e gerar páginas Foundations em MDX a partir de `tokens.json`.

#### Scenario: Falha bloqueante por violação de acessibilidade
- **WHEN** um story do Storybook apresenta uma violação das regras de acessibilidade do axe
- **THEN** a verificação do `@storybook/addon-a11y` falha com status de erro impedindo a aprovação do teste

#### Scenario: Visualização do catálogo interativo
- **WHEN** o desenvolvedor executa `pnpm storybook`
- **THEN** a aplicação Storybook é inicializada exibindo a árvore de componentes com documentação de props, simulação de pseudo-classes (:hover, :focus) e vínculos com o Figma

### Requirement: Regressão Visual Automatizada com Playwright
O projeto SHALL fornecer testes de regressão visual via Playwright em `apps/web-e2e` que verificam a renderização de componentes-chave do Storybook servidos pelo build estático (`iframe.html?id=...`) nas resoluções desktop (1440px) e mobile (390px). Divergências em relação aos frames originais do Figma SHALL ser registradas em `docs/design/fidelity-notes.md`.

#### Scenario: Comparação visual contra baseline versionada
- **WHEN** a suíte de regressão visual do Playwright é executada contra os stories do catálogo
- **THEN** a captura de tela coincide com as imagens de referência versionadas nas resoluções 1440px e 390px
