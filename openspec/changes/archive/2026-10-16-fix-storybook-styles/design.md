# Design: fix-storybook-styles

## Context

No Tailwind CSS v4, a engine de compilação é ativada exclusivamente via `@import "tailwindcss";` no arquivo CSS de entrada. Atualmente, `apps/storybook/.storybook/styles.css` continha apenas o `@import` de `theme.css` (o qual declara as variáveis `@theme`), sem importar o núcleo do Tailwind e sem especificar diretivas `@source`. Como consequência, o Vite não injetava o reset CSS (Preflight) nem gerava as classes utilitárias no iframe do Storybook. Além disso, as fontes self-hosted declaradas em `fonts.css` apontam para a URL absoluta `/fonts/*`, que não estavam mapeadas no Storybook por ausência de `staticDirs` em `.storybook/main.ts`.

Veja `proposal.md` para a motivação detalhada desta change.

## Goals / Non-Goals

**Goals:**
- Configurar `apps/storybook/.storybook/styles.css` com `@import "tailwindcss";`, importação do `theme.css` e diretivas `@source` apontando para `libs/shared/ui/src` e `apps/storybook/src`.
- Configurar `staticDirs` em `apps/storybook/.storybook/main.ts` para servir `apps/shell/public` (fontes `/fonts/*`) e `design/assets` (`/assets/*`).
- Atualizar as 19 baselines de regressão visual do Playwright em `apps/web-e2e/src/visual-regression.spec.ts-snapshots/` para que reflitam a renderização fiel com tema dark âmbar, Preflight e tipografia Roboto Mono.
- Garantir que `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm build` e `pnpm e2e` passem sem erros.

**Non-Goals:**
- Não alterar a implementação de nenhum componente em `libs/shared/ui/src/components/`.
- Não alterar as regras de fronteiras do ESLint (`flow:tooling` já está autorizado a importar `type:ui`).
- Não instalar novos pacotes npm.

## Decisions

### 1. Inclusão de `@import "tailwindcss";` e Diretivas `@source`
- **Decisão**: Em `apps/storybook/.storybook/styles.css`, declarar explicitamente:
  ```css
  @import "tailwindcss";
  @import "../../../libs/shared/ui/src/styles/theme.css";
  @source "../../../libs/shared/ui/src";
  @source "../src";
  ```
- **Rationale**: Sem `@import "tailwindcss";`, o plugin `@tailwindcss/vite` não processa as classes utilitárias nem injeta o Preflight. As diretivas `@source` garantem que o compilador do Tailwind varra todos os arquivos TSX de componentes e arquivos MDX de foundations.
- **Alternativas consideradas**:
  - *Importar Tailwind v3 via postcss*: Descartado por incompatibilidade com a arquitetura CSS-first Tailwind v4 do monorepo.

### 2. Configuração de `staticDirs` no Storybook
- **Decisão**: Em `apps/storybook/.storybook/main.ts`, adicionar a chave `staticDirs`:
  ```ts
  staticDirs: [
    '../../shell/public',
    { from: '../../../design/assets', to: '/assets' },
  ],
  ```
- **Rationale**: Permite que tanto o servidor de desenvolvimento (`pnpm storybook`) quanto o build estático (`pnpm build:storybook`) sirvam `/fonts/roboto-mono-*.woff2` e os assets gráficos sem intervenção manual.
- **Alternativas consideradas**:
  - *Duplicar as fontes dentro de `apps/storybook/public`*: Descartado para evitar duplicação de binários no repositório.

### 3. Regeneração das Baselines de Regressão Visual
- **Decisão**: Atualizar as 19 baselines via `npx playwright test -c apps/web-e2e/playwright.config.ts visual-regression.spec.ts --update-snapshots`.
- **Rationale**: As baselines anteriores haviam sido capturadas contra o iframe desestilizado. Com o tema ativo, as novas baselines serão a referência definitiva e versionada.

## Risks / Trade-offs

- **[Risk] Aumento do tamanho do CSS gerado no Storybook**: A inclusão do Preflight e das classes utilitárias aumenta o CSS do iframe.
  - *Mitigation*: Comportamento esperado e desejado; no build estático, o Vite e Tailwind v4 realizam purge automático eliminando classes não utilizadas.
