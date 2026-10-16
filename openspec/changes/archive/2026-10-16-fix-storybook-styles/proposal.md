# Proposal: fix-storybook-styles

## Why

Ao abrir o Storybook (`apps/storybook`) via `pnpm storybook`, os componentes nos previews são renderizados sem estilização (botões cinzas chanfrados do navegador, links azuis padrão, inputs sem tema e fonte do sistema em vez de Roboto Mono). Isso ocorre porque `apps/storybook/.storybook/styles.css` não importa o motor do Tailwind CSS v4 (`@import "tailwindcss";`) e não declara as diretivas `@source`, impedindo a geração do Preflight (reset) e das classes utilitárias. Além disso, `apps/storybook/.storybook/main.ts` carece de configuração de `staticDirs`, gerando 404 para `/fonts/*` e `/assets/*`.

## What Changes

- **Importação do Tailwind v4 no Storybook**: Adicionar `@import "tailwindcss";` e diretivas `@source` para `libs/shared/ui/src` e `apps/storybook/src` em `apps/storybook/.storybook/styles.css`.
- **Serviço de Fontes e Assets Estáticos**: Configurar `staticDirs` em `apps/storybook/.storybook/main.ts` apontando para `../../shell/public` (fontes) e `../../../design/assets` (`/assets`), garantindo que requisições de fontes e imagens resolvam com sucesso.
- **Atualização de Baselines de Regressão Visual**: Executar a suíte de testes de regressão visual do Playwright (`apps/web-e2e`) com `--update-snapshots` para que as 19 baselines versionadas reflitam os componentes renderizados com o tema dark âmbar, tipografia correta e reset de estilos.

## Capabilities

### Modified Capabilities

- `design-system-ui`: Atualizar o requisito `Catálogo Storybook e Auditoria Automatizada` para garantir que o Storybook carregue integralmente o motor do Tailwind v4 com Preflight e sirva fontes e assets estáticos locais.

## Impact

- **Projetos Nx Afetados**:
  - `storybook` (`apps/storybook` - `scope:tooling`, `type:app`, `flow:tooling`)
  - `web-e2e` (`apps/web-e2e` - `scope:e2e`, `type:app`, `flow:shell`)
- **Dependências**: Nenhuma nova dependência de terceiros é necessária.
- **Fora de Escopo**: Nenhuma alteração de componentes em `libs/shared/ui/src/components/`, nos contratos ou no host shell.
