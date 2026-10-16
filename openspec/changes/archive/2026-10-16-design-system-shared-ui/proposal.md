# Proposal: design-system-shared-ui

## Why

O marketplace de NFTs requer fidelidade estética rigorosa com as especificações do Figma, suporte responsivo completo (1440px, 768px e 390px) e conformidade estrita com as diretrizes de acessibilidade WCAG 2.1 AA.
Atualmente, `libs/shared/ui` contém apenas utilitários rudimentares e não há catálogo interativo ou implementação dos componentes identificados no Figma. Esta change implementa a biblioteca central de apresentação `@nft/shared-ui`, o pipeline de geração de tokens CSS para Tailwind v4 a partir de `tokens.json`, encapsulamento absoluto de terceiros (Radix UI) e a aplicação `apps/storybook` para documentação viva, auditoria automatizada de acessibilidade (axe) e regressão visual com Playwright.

## What Changes

- **Pipeline de Tokens Tailwind v4 (`pnpm design:tokens`)**: Script automatizado que compila `design/tokens/tokens.json` no CSS de tema Tailwind v4 (`@theme`) com variáveis de cores, tipografia, espaçamentos, raios, sombras e breakpoints responsivos (390, 768, 1440).
- **Proibição Estrita de Cores Hex Literais**: Validação automatizada (teste unitário/linter) que impede a utilização de valores hexadecimais literais nos componentes de UI, forçando o uso exclusivo dos tokens.
- **Mitigações de Acessibilidade e Tokens Ausentes**:
  - Implementação de anel de foco padronizado (`ring-2 ring-primary ring-offset-2 ring-offset-ink`) com contraste de 6.85:1 sobre `ink` (WCAG 2.4.7).
  - Disponibilização do token `color.border.accessible` (`#8a583e`, contraste 3.40:1) para conformidade com WCAG 1.4.11 em campos interativos.
  - Skeletons com efeito shimmer desativáveis sob `@media (prefers-reduced-motion: reduce)` e marcação `aria-busy="true"`.
- **Self-Hosting de Tipografia**: Inclusão de `@font-face` e preload para a família Roboto Mono (pesos 400, 500, 700) servida localmente a partir de `design/fonts/`.
- **Ícones Vetoriais Otimizados**: Exportação dos 35 ícones de `design/assets/manifest.json` como componentes React nomeados individuais, com `aria-hidden="true"`, prop opcional `title` e suporte a tree-shaking 100% eficiente para Core Web Vitals.
- **Biblioteca de Componentes Apresentacionais (`libs/shared/ui`)**:
  - *Primitivos Base*: `Button`, `Input`, `Label`, `FormField` (com amarração `aria-describedby` para erros e dicas e `aria-invalid`), `Select`, `Checkbox`, `Radio`, `Switch`, `Badge`, `Card`, `Tabs`, `Dialog` (focus trap, Esc fecha, retorno de foco), `Drawer`/`Sheet`, `Toast` (live region), `Tooltip`, `Pagination`, `Avatar`, `Skeleton`, `Spinner`, `EmptyState`, `ErrorState` (com retry), `QuantityStepper`, `Alert`.
  - *Componentes Compostos e Layout*: `Header`, `Footer`, `Breadcrumb`, `MobileTabBar`, `SearchBar`/`MobileSearchBar`, `NftCard` (com suporte a `previousPriceEth` e badge de raridade), `EditionChip`, `PriceRangeSlider` (dual thumb), `StarRating` (somente leitura), `WalletOption` (radio card), `WalletCard`, `SocialButton` (desabilitado com aviso explicativo), `AccountSidebar`, `ModalLayout`.
- **Storybook como Catálogo Vivo (`apps/storybook`)**:
  - Aplicação Nx dedicada na porta 6006 configurada com `@storybook/react-vite`.
  - Configuração de tags e fronteiras: `flow:tooling`, podendo importar `type:ui` e `flow:shared`, e proibido de importar `feature`, `data-access`, `mocks` ou apps de negócio.
  - Addon `@storybook/addon-a11y` configurado para tratar violações de acessibilidade como erro bloqueante.
  - Addon `@storybook/addon-designs` conectando cada story ao frame correspondente do Figma via `fileKey` e `nodeId`.
  - Addon `storybook-addon-pseudo-states` para inspeção visual de estados `:hover` e `:focus`.
  - Testes de interação com `play` functions para foco preso em Dialog, associação em FormField e tecla Esc.
  - Páginas Foundations em MDX geradas a partir de `tokens.json`.
- **Build Consolidado e Deploy Estático**:
  - Integração do build do Storybook em `dist/integrated/storybook/`.
  - Atualização do `vercel.json` para proteger a rota `/storybook/*` do SPA rewrite fallback.
- **Suíte de Testes e Fidelidade**:
  - Testes unitários com Vitest + Testing Library para comportamento, acessibilidade e `prefers-reduced-motion`.
  - Testes de regressão visual com Playwright nas resoluções 1440px e 390px contra o iframe do Storybook com baselines versionadas.
  - Documentação de tolerâncias em `docs/design/fidelity-notes.md`.

## Capabilities

### New Capabilities
- `design-system-ui`: Define a especificação formal do design system em `@nft/shared-ui`, cobrindo geração de tokens Tailwind v4, componentes primitivos e compostos com APIs tipadas próprias, regras estritas de acessibilidade WCAG 2.1 AA, catálogo Storybook integrado e testes de regressão visual com Playwright.

### Modified Capabilities
- `workspace-foundation`: Atualiza as regras de fronteira arquitetural no linter para incluir o fluxo `flow:tooling` de `apps/storybook` e atualiza a rotina de consolidação de build (`scripts/build-integrated.js` e `vercel.json`) para incorporar o Storybook estático sob `/storybook/`.

## Impact

### Projetos Afetados e Tags Nx

| Projeto | Tipo | Tags | Impacto |
|---|---|---|---|
| `libs/shared/ui` | Lib | `scope:shared`, `type:ui`, `flow:shared` | Implementação de todos os componentes, ícones, tema Tailwind v4 e CSS de fontes |
| `apps/storybook` | App | `scope:tooling`, `type:app`, `flow:tooling` | Novo app Nx com Vite, catálogo interativo, addons e docs MDX |
| `apps/shell` | App | `scope:shell`, `type:app`, `flow:shell` | Importa o CSS de tema gerado em `shared/ui` uma única vez no host |
| `apps/storefront` | App | `scope:storefront`, `type:app`, `flow:storefront` | Valida compatibilidade com o tema compartilhado |
| `apps/checkout` | App | `scope:checkout`, `type:app`, `flow:checkout` | Valida compatibilidade com o tema compartilhado |
| `apps/account` | App | `scope:account`, `type:app`, `flow:account` | Valida compatibilidade com o tema compartilhado |
| `apps/web-e2e` | App | `scope:e2e`, `type:app`, `flow:tooling` | Execução dos testes de regressão visual do Storybook via Playwright |

### Dependências
- Adição de dependências de desenvolvimento para Storybook: `@storybook/react`, `@storybook/react-vite`, `@storybook/addon-essentials`, `@storybook/addon-a11y`, `@storybook/addon-interactions`, `@storybook/addon-designs`, `storybook-addon-pseudo-states`, `@storybook/test`, `axe-core`.

### Arquivos de Configuração do Workspace
- `eslint.config.js`: Inclusão da regra de fronteira para `flow:tooling`.
- `scripts/build-integrated.js`: Adição da etapa de cópia de `dist/apps/storybook` para `dist/integrated/storybook`.
- `vercel.json`: Adição do rewrite explícito para `/storybook/:path*`.
- `package.json`: Adição dos scripts `storybook`, `build:storybook` e `design:tokens`.

### Premissas e Fora de Escopo
- **Premissas**:
  - As fontes Roboto Mono (400, 500 e 700) são estritamente self-hosted a partir de `design/fonts/`.
  - O tema Tailwind v4 opera via CSS puro (`@theme`), sem `tailwind.config.js`.
  - Componentes expõem APIs próprias e não vazam tipos do Radix UI.
- **Fora de Escopo**:
  - Chamadas de rede e serviços externos como Chromatic.
  - Implementação de regras de negócio, queries TanStack Query ou mocks MSW dentro de `shared/ui` ou `apps/storybook` (estes são estritamente apresentacionais).
  - Ações visuais fora de escopo (ex: botões sociais, newsletter) exibem notificação amigável de demonstração indisponível, sem simular sucesso.
