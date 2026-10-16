# Tasks: fix-storybook-styles

## 1. Configuração do Tailwind CSS v4 e Assets Estáticos no Storybook

- [x] 1.1 Atualizar `apps/storybook/.storybook/styles.css` adicionando `@import "tailwindcss";`, `@import "../../../libs/shared/ui/src/styles/theme.css";` e diretivas `@source` para `libs/shared/ui/src` e `apps/storybook/src`, verificando que a compilação do Storybook gera o CSS com Preflight e utilitários Tailwind via `nx build storybook`.
- [x] 1.2 Configurar a propriedade `staticDirs` em `apps/storybook/.storybook/main.ts` apontando para `../../shell/public` (fontes `/fonts/*`) e `../../../design/assets` (`/assets/*`), verificando resolução estática de arquivos de fonte e imagens.

## 2. Baselines de Regressão Visual e Verificação Completa

- [x] 2.1 Executar a suíte de testes de regressão visual com Playwright em `apps/web-e2e` com `--update-snapshots` e verificar que as 19 baselines versionadas são atualizadas refletindo os componentes com estilização completa, cores de tema e tipografia Roboto Mono.
- [x] 2.2 Executar a verificação integral da change com `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm build` e `pnpm e2e` nos projetos afetados (`storybook`, `web-e2e`, `shared-ui`), garantindo zero erros.
