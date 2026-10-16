# Tasks: design-system-shared-ui

## 1. Setup, Dependências e Geração de Tokens Tailwind v4

- [x] 1.1 Adicionar dependências do Storybook (`@storybook/react`, `@storybook/react-vite`, addons) e utilitários de acessibilidade no `package.json`, executar `pnpm install` e verificar resolução de pacotes com `pnpm ls @storybook/react-vite`.
- [x] 1.2 Implementar o script `scripts/generate-tokens.js` e o comando `pnpm design:tokens` para compilar `design/tokens/tokens.json` em `libs/shared/ui/src/styles/theme.css` com as variáveis `@theme` do Tailwind v4 (cores, tipografia, espaçamentos, raios, sombras, breakpoints 390, 768 e 1440) e importar `design/fonts/fonts.css`.
- [x] 1.3 Implementar teste automatizado em `libs/shared/ui` que verifica que nenhum componente de UI contém cores hexadecimais literais fora das classes de tokens e verificar aprovação com `nx test shared-ui`.

## 2. Ícones Vetoriais Otimizados e Tipografia Self-Hosted

- [x] 2.1 Criar gerador e exportar os 35 ícones de `design/assets/manifest.json` como componentes React nomeados individuais em `libs/shared/ui/src/icons/` com atributos `aria-hidden="true"`, prop opcional `title` e dimensões intrínsecas fixas, verificando renderização e tree-shaking com testes unitários.
- [x] 2.2 Configurar self-hosting das fontes Roboto Mono (400, 500, 700) em `libs/shared/ui/src/styles/fonts.css` com `font-display: swap` e adicionar tags de preload crítico no `index.html` do host (`apps/shell`), verificando ausência de requisições externas de rede no browser.

## 3. Primitivos Base em libs/shared/ui

- [x] 3.1 Implementar primitivos atômicos de ação e feedback (`Button`, `Badge`, `Spinner`, `Alert`, `EmptyState`, `ErrorState` com botão de retry) encapsulando Radix UI e verificar comportamento com testes unitários no Vitest.
- [x] 3.2 Implementar primitivos de formulário (`Input`, `Label`, `FormField` com amarração `aria-describedby` e `aria-invalid`, `Select`, `Checkbox`, `Radio`, `Switch`, `QuantityStepper`) e verificar associação correta de labels e erros acessíveis com testes unitários.
- [x] 3.3 Implementar primitivos de layout e overlays (`Card`, `Tabs`, `Dialog` com focus trap, Esc e retorno de foco, `Drawer`/`Sheet`, `Toast` com `aria-live="polite"`, `Tooltip`, `Pagination`, `Avatar`, `Skeleton` com shimmer e desativação sob `prefers-reduced-motion: reduce`) e verificar conformidade de acessibilidade com Vitest + axe.

## 4. Componentes Compostos e Específicos do Figma em libs/shared/ui

- [x] 4.1 Implementar estruturas globais de layout (`Header` com rotas ativas e contador de carrinho, `Footer` com newsletter e links, `Breadcrumb`, `MobileTabBar` e `SearchBar`/`MobileSearchBar`) e verificar renderização responsiva nos breakpoints 390px, 768px e 1440px.
- [x] 4.2 Implementar componentes de catálogo e descoberta (`NftCard` com variante de preço riscado `previousPriceEth` e badge de raridade, `EditionChip`, `PriceRangeSlider` com duplo thumb, `StarRating` com tooltip acessível) e verificar formatação e estados com testes unitários.
- [x] 4.3 Implementar componentes de carteira, conta e modais (`WalletOption` em radio card acessível, `WalletCard`, `SocialButton` desabilitado com aviso explicativo de demonstração, `AccountSidebar` e `ModalLayout` para Login, Cadastro e Confirmação) e verificar interações com testes unitários.

## 5. Configuração da Aplicação Storybook (apps/storybook)

- [x] 5.1 Configurar o projeto Nx `apps/storybook` na porta 6006 com tag `flow:tooling` e builder `@storybook/react-vite`, e atualizar `eslint.config.js` para autorizar `apps/storybook` a importar `type:ui` e `flow:shared` e proibir imports de `type:feature`, `type:data-access` ou `scope:mocks`.
- [x] 5.2 Configurar `apps/storybook/.storybook/preview.tsx` com tema Tailwind v4, fontes Roboto Mono, background `ink`, viewports (390, 768, 1440), toggle de `prefers-reduced-motion` e addons: `@storybook/addon-a11y` (violações tratadas como erro), `@storybook/addon-designs` e `storybook-addon-pseudo-states`.
- [x] 5.3 Criar páginas Foundations em MDX geradas a partir de `tokens.json` (`Cores`, `Tipografia`, `Espaçamento`, `Raios`, `Sombras`) exibindo amostras visuais, classes Tailwind correspondentes e nodeIds de origem do Figma.
- [x] 5.4 Criar stories colocalizados (`*.stories.tsx`) com autodocs e play functions para todos os componentes de `shared/ui`, mapeando parâmetros de design do Figma com `fileKey` e `nodeId`, e verificar inicialização com `pnpm storybook`.

## 6. Integração de Build, Deploy e Roteamento Vercel

- [x] 6.1 Adicionar scripts `storybook` e `build:storybook` no `package.json`, atualizar `scripts/build-integrated.js` para compilar o Storybook e copiá-lo para `dist/integrated/storybook/`, e configurar o rewrite em `vercel.json` para proteger `/storybook/:path*` do fallback SPA.
- [x] 6.2 Executar `pnpm build` e testar via `pnpm preview`, verificando que o catálogo Storybook estático abre com sucesso na rota `/storybook/` sem ser redirecionado para a aplicação shell.

## 7. Testes de Regressão Visual e Fidelidade

- [x] 7.1 Configurar suíte de testes de regressão visual com Playwright em `apps/web-e2e` cobrindo stories representativos do Storybook (`iframe.html?id=...`) nas viewports 1440px e 390px e gerar as baselines de imagem versionadas.
- [x] 7.2 Comparar os componentes implementados com os frames do Figma e catalogar eventuais divergências visuais e tolerâncias de layout de 1px em `docs/design/fidelity-notes.md`.

## 8. Documentação e Validação Final

- [x] 8.1 Atualizar `ARCHITECTURE.md` (§14 e §19) com o registro de desvios, ajustes de acessibilidade e documentação da biblioteca de UI, e atualizar o `README.md` com instruções de uso do Storybook e geração de tokens.
- [x] 8.2 Executar a verificação integral da change executando `pnpm typecheck`, `pnpm lint`, `pnpm test` e `pnpm build` nos projetos afetados (`shared-ui`, `storybook`, `shell`, `web-e2e`), garantindo zero erros.
