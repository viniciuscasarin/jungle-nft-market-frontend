# Design: design-system-shared-ui

## Context

A change prévia (`design-extraction-from-figma`) extraiu e versionou os artefatos de design em `design/tokens/tokens.json`, `design/fonts/`, `design/assets/` e documentou decisões em `docs/design/*` e `ARCHITECTURE.md` §19.
Atualmente, `libs/shared/ui` possui apenas utilitários de classe (`cn`), sem tema consolidado e sem catálogo interativo. A stack obrigatória estabelece Tailwind v4, shadcn/ui encapsulado em `shared/ui` e testes rigorosos de acessibilidade e regressão visual.
Veja `proposal.md` para a motivação detalhada desta change.

## Goals / Non-Goals

**Goals:**
- Implementar o script gerador `pnpm design:tokens` compilando `tokens.json` em `@theme` Tailwind v4 em `libs/shared/ui/src/styles/theme.css`.
- Estabelecer teste automatizado bloqueante que impeça cores hex literais fora do tema.
- Encapsular 100% dos primitivos do Radix UI dentro de `libs/shared/ui`, expondo APIs tipadas e limpas para os domínios.
- Fornecer 35 componentes de ícones SVG nomeados individuais com suporte integral a tree-shaking para preservação de Core Web Vitals.
- Construir todos os componentes primitivos (23) e compostos/layout (13) com suporte aos estados do Figma e estados não desenhados (hover, focus, disabled, erro, skeleton).
- Criar a aplicação Nx dedicada `apps/storybook` com builder Vite, addon `@storybook/addon-a11y` (erros bloqueantes), `@storybook/addon-designs` e páginas Foundations em MDX geradas de `tokens.json`.
- Integrar os testes de regressão visual do Playwright contra o iframe estático do Storybook.

**Non-Goals:**
- Não incluir chamadas de rede reais, queries TanStack Query ou mocks MSW dentro de `shared/ui` ou `apps/storybook`.
- Não utilizar serviços em nuvem proprietários como Chromatic.
- Não reconfigurar o tema via arquivos JavaScript legados (`tailwind.config.js`).

## Decisions

### 1. Tailwind v4 CSS-First (@theme) e Carregamento Único
- **Decisão**: O tema é compilado diretamente para sintaxe `@theme` do Tailwind v4 em `libs/shared/ui/src/styles/theme.css`. O host (`apps/shell`) importa esse CSS uma única vez; remotes standalone importam o CSS apenas no bootstrap isolado via `@nft/shell-kit`.
- **Alternativas consideradas**:
  - *Tailwind v3 com presets em JS*: Descartado porque o monorepo já adotou `@tailwindcss/vite` v4 e a especificação do desafio exige CSS-first sem `tailwind.config` JS.
  - *CSS Modules / Styled Components*: Descartado por incompatibilidade com a stack de Tailwind estabelecida.

### 2. Ícones como Componentes Nomeados com Tree-Shaking Rigoroso
- **Decisão**: Os 35 ícones são exportados como funções React individuais (`export function IconCart(props: IconProps)`), contendo atributos nativos `viewBox`, `width`, `height`, `aria-hidden="true"` e prop opcional `title`.
- **Alternativas consideradas**:
  - *Componente polimórfico `<Icon name="cart" />`*: Descartado após cálculo de Core Web Vitals, pois um mapa único ou switch de strings bloquearia o tree-shaking do Vite/Rollup e arrastaria todos os 35 SVGs (~18 KB minificados) para qualquer bundle que importasse um único ícone.
  - *SVG Sprites externos com `<use href="...">`*: Descartado por riscos de FOUC/flash no primeiro carregamento e problemas de CORS/cross-origin no runtime do Module Federation.

### 3. Encapsulamento Absoluto de Radix UI e Shadcn Adaptado
- **Decisão**: Todos os primitivos Radix (`@radix-ui/react-dialog`, `@radix-ui/react-slot`, etc.) residem estritamente dentro de `libs/shared/ui`. Suas props são remapeadas para interfaces TypeScript explícitas (ex: `DialogProps`, `FormFieldProps`) sem reexportar tipos internos de terceiros.
- **Alternativas consideradas**:
  - *Permitir import de Radix em `feature` ou `ui` de domínios*: Descartado por violar frontalmente a regra de encapsulamento de terceiros (ARCHITECTURE.md §4 e ESLint `no-restricted-imports`).

### 4. Estrutura Modular Interna de `libs/shared/ui/src`
- **Decisão**: Organização em subdiretórios funcionais:
  - `components/primitives/`: Elementos base atômicos (Button, Input, FormField, Label, Select, Checkbox, Radio, Switch, Badge, Card, Tabs, Dialog, Drawer, Toast, Tooltip, Pagination, Avatar, Skeleton, Spinner, EmptyState, ErrorState, QuantityStepper, Alert).
  - `components/layout/`: Estruturas de página globais (Header, Footer, Breadcrumb, MobileTabBar, SearchBar).
  - `components/widgets/`: Componentes ricos orientados ao marketplace (NftCard, PriceRangeSlider, EditionChip, StarRating, WalletOption, WalletCard, SocialButton, AccountSidebar, ModalLayout).
  - `icons/`: Os 35 componentes vetoriais nomeados.
  - `styles/`: `theme.css`, `fonts.css` e tokens compilados.
- **Alternativas consideradas**:
  - *Estrutura flat em raiz única*: Descartado devido ao alto número de componentes (mais de 36 componentes e 35 ícones), o que prejudicaria a manutenibilidade.

### 5. Arquitetura da Aplicação Storybook (`apps/storybook`)
- **Decisão**:
  - Novo projeto Nx `apps/storybook` (porta 6006) com tag `flow:tooling`.
  - Configurado com `@storybook/react-vite` reutilizando o `vite.config` e `vite-tsconfig-paths` para resolver `@nft/*`.
  - Stories CSF3 colocalizados (`*.stories.tsx`) ao lado dos componentes em `libs/shared/ui/src/`.
  - Regra no `eslint.config.js`: `flow:tooling` tem autorização para importar `type:ui` de qualquer fluxo e `flow:shared`, sendo impedido de importar `type:feature`, `type:data-access`, `scope:mocks` ou apps de negócio.
- **Alternativas consideradas**:
  - *Storybook hospedado dentro de `apps/shell` sob rota `/__ui`*: Descartado porque aumentaria o bundle do host, introduziria dependências de tooling no app de produção e violaria o isolamento de Module Federation.

### 6. Mitigações e Desvios de Acessibilidade (WCAG 2.1 AA & 1.4.11)
- **Decisão**:
  - *Anel de Foco (WCAG 2.4.7)*: Padronizado em `ring-2 ring-primary ring-offset-2 ring-offset-ink` (6.85:1 sobre `ink`).
  - *Borda Acessível (WCAG 1.4.11)*: Criação do token `color.border.accessible` (`#8a583e`, contraste de 3.40:1) para demarcação de campos interativos quando requerido.
  - *Skeleton Shimmer*: Aceita `width`/`height` ou classe de aspect-ratio fixa para prevenir CLS; shimmer desativado sob `@media (prefers-reduced-motion: reduce)`.
  - *Ações Fora de Escopo*: Componentes como `SocialButton` ou newsletter exibem aviso claro ("Funcionalidade indisponível nesta demonstração"), sem simular sucesso.

### 7. Estratégia de Regressão Visual com Playwright
- **Decisão**: O Playwright executa testes visuais contra os stories do Storybook em modo estático (`iframe.html?id=...&viewMode=story`) nas viewports 1440px e 390px. As baselines de imagem são salvas e versionadas no repositório.
- **Alternativas consideradas**:
  - *Playwright contra componentes montados em páginas simuladas*: Descartado porque o Storybook já isola cada componente em seus estados oficiais (default, hover, disabled, erro, loading), eliminando a necessidade de fixtures ad-hoc de página.

## Risks / Trade-offs

- **[Risk] Suporte a React 19 no ecossistema do Storybook**: Versões mais antigas do Storybook falham com React 19.
  - *Mitigation*: Utilizar a linha estável atual do Storybook (`^8.5.0` ou `^8.6.0`) com `@storybook/react-vite`, testado e validado para peer dependencies do React 19.
- **[Risk] Layout Shift com Fontes Self-Hosted (CLS)**: FONT swap pode causar salto no LCP se o fallback tiver métricas métricas muito diferentes.
  - *Mitigation*: Adotar `font-display: swap`, preload da fonte regular crítica (`roboto-mono-400.woff2`) no `index.html` do host e dimensões explícitas em containers.
- **[Risk] Interceptação do Storybook estático pelo SPA Fallback da Vercel**: `/(.*)` no `vercel.json` poderia redirecionar acessos a `/storybook/*` para o shell `index.html`.
  - *Mitigation*: Inserir uma regra de rewrite explícita no `vercel.json` antes do fallback genérico: `{ "source": "/storybook/:path*", "destination": "/storybook/:path*" }`.

## Migration Plan

1. Criar o script de compilação de tokens `pnpm design:tokens` gerando `theme.css`.
2. Adicionar as dependências de Storybook e utilitários de acessibilidade no `package.json`.
3. Atualizar regras de ESLint para permitir `flow:tooling`.
4. Implementar componentes em `libs/shared/ui/src/`.
5. Scaffold e configuração de `apps/storybook`.
6. Adicionar scripts raiz no `package.json` (`storybook`, `build:storybook`, `design:tokens`).
7. Atualizar `scripts/build-integrated.js` e `vercel.json` para consolidação do Storybook estático.
8. Criar testes unitários Vitest e suíte de regressão visual Playwright.
