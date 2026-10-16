# Spec Delta: design-system-ui

## MODIFIED Requirements

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
