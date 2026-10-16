# Tasks: align-header-footer-figma

## 1. Alinhamento Estrutural do Header e Footer no Design System (`shared-ui`)

- [x] 1.1 Reescrever `libs/shared/ui/src/components/layout/header.tsx` com o logo tipográfico `KURIO`, links autênticos (`Início`, `Mercado`, `Criadores`, `Aprenda`), indicador visual ativo com sublinhado âmbar espesso (`border-b-2 border-primary`), botão de busca compacto com ícone de lupa, botão de carrinho com badge circular âmbar e botão `Entrar` em estilo âmbar preenchido com ícone, verificando a aprovação dos testes em `libs/shared/ui/src/components/layout/layout.spec.tsx`.
- [x] 1.2 Reescrever `libs/shared/ui/src/components/layout/footer.tsx` implementando com fidelidade as 4 seções do Figma (Seção 1: 3 benefícios com badges circulares `(W)`, `(C)`, `(D)` e formulário de newsletter inline `Antecipe-se ao próximo lançamento`; Seção 2: faixa de contato contrastante `bg-surface-dark` com logo, slogan, e-mail e telefone; Seção 3: 4 colunas de navegação com bloco de carteiras compatíveis; Seção 4: copyright `© 2026 Kurio. Propriedade digital para todos.`), verificando os testes em `libs/shared/ui/src/components/layout/layout.spec.tsx`.

## 2. Documentação, Stories e Baselines de Regressão Visual

- [x] 2.1 Atualizar os stories colocalizados de `Header` (`libs/shared/ui/src/components/layout/header.stories.tsx`) e `Footer` (`libs/shared/ui/src/components/layout/footer.stories.tsx`) com as variantes autênticas e estados do Figma, e atualizar o relatório de fidelidade em `docs/design/fidelity-notes.md` e `ARCHITECTURE.md`.
- [x] 2.2 Atualizar as baselines de regressão visual com Playwright (`pnpm exec playwright test -c apps/web-e2e/playwright.config.ts visual-regression.spec.ts --update-snapshots`) e validar que os 19 testes visuais em 1440px e 390px passam com aprovação total contra o Storybook integrado.

## 3. Verificação Integral de Qualidade

- [x] 3.1 Executar a validação completa da aplicação através de `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm build` e `pnpm e2e`, garantindo integridade e conformidade de todos os projetos afetados (`shared-ui`, `shell`, `storybook`, `web-e2e`).
