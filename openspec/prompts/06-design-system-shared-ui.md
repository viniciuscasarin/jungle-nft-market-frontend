Crie a change `design-system-shared-ui`.

## Contexto
Todo uso de shadcn/ui e Radix fica isolado em `libs/shared/ui`; os domínios só consomem os componentes exportados daqui. Esta change consome os artefatos da change `design-extraction-from-figma`: `design/tokens/tokens.json`, `design/fonts`, `design/assets`, `design/screenshots` e `docs/design/*`. Se um valor visual não estiver nesses artefatos, não o invente: use o token mais próximo e registre o desvio. Estados não desenhados seguem o mesmo padrão visual (ver `docs/design/components.md`).

## Requisitos
1. **Tokens como fonte única**: um script `pnpm design:tokens` gera, a partir de `tokens.json`, o CSS de tema do Tailwind v4 (`@theme` com variáveis de cor, tipografia, spacing, raios, sombras e breakpoints 390, 768 e 1440), versionado em `shared/ui`. Nenhum valor visual literal fora dos tokens (lint ou teste que falhe se houver cor hex em componentes).
2. **Tokens ausentes no Figma**: crie e documente o anel de foco (sugestão: `primary`), uma borda de campo com contraste mínimo de 3:1 (`border-strong`), os estados hover, disabled e erro (erro com `text-coral` e `success` já existentes) e as escalas de spacing, raio e sombra derivadas dos frames. Marque cada um como desvio em `ARCHITECTURE.md` §19.
3. **Tema Tailwind v4 (CSS-first)**: `shared/ui` exporta o CSS de tema e as utilities base. Cada app o importa e declara `@source` apontando para as libs que usa, sem `tailwind.config` em JS nem presets. O CSS é carregado uma vez pelo host; remotes standalone o importam só no bootstrap standalone, sem duplicar estilos no runtime integrado.
4. **Fontes**: Roboto Mono (400, 500 e 700) self-hosted a partir de `design/fonts`, `font-display: swap` e preload da fonte crítica. Substituições registradas em `ARCHITECTURE.md` §19.
5. **Ícones e imagens**: ícones de `design/assets` expostos como componentes (`aria-hidden` por padrão, `title` opcional); imagens com dimensões explícitas para evitar layout shift.
6. **Componentes** (shadcn adaptado, API própria tipada, sem vazar tipos Radix): os listados em `docs/design/components.md`, incluindo os específicos deste layout (Header, Footer, Breadcrumb, BottomTabBar mobile, SearchBar, NftCard e variantes, EditionChip, PriceRangeSlider, Rating, WalletOption, WalletCard, SocialButton desabilitado com aviso, AccountSidebar e layout de modal para as rotas de Login, Cadastro e Confirmação), e no mínimo Button, Input, Label, FormField (label + descrição + erro via aria), Select, Checkbox, Radio, Switch, Badge, Card, Tabs, Dialog, Drawer/Sheet, Toast (live region), Tooltip, Pagination, Avatar, Skeleton, Spinner, EmptyState, ErrorState (com retry), QuantityStepper e Alert. Cada variante e estado desenhado é implementado; os estados ausentes seguem o padrão visual existente.
7. **Skeleton com shimmer**: aceita dimensões ou aspect-ratio (sem layout shift); animação desativada sob `prefers-reduced-motion: reduce`; `aria-busy` na região em carregamento.
8. **Acessibilidade**: foco visível consistente, trap e retorno de foco em Dialog e Drawer, `Esc` fecha, estados não dependentes só de cor. Para os pares de cor que falharam AA em `docs/design/token-audit.md`, aplique o ajuste mínimo e registre antes e depois em `ARCHITECTURE.md` §19.
9. **Storybook como catálogo (substitui qualquer página `/__ui`)**, em um app Nx dedicado `apps/storybook` (porta 6006):
   - Storybook estável atual com builder Vite (`@storybook/react-vite`) e resolução dos aliases `@nft/*` do workspace. Stories em CSF3, **colocalizadas** nas libs (`*.stories.tsx` ao lado do componente em `shared/ui` e, nas próximas etapas, nas libs `ui` de cada domínio). O app apenas agrega por glob (`libs/**/ui/src/**/*.stories.*` e `libs/shared/ui/src/**/*.stories.*`).
   - **Fronteiras**: crie a tag `flow:tooling` para `apps/storybook` e ajuste a regra da Etapa 1 para que ele importe `ui` de qualquer flow e `shared/*`, e nunca `feature`, `data-access`, `mocks` ou outros apps. Stories cobrem apenas componentes apresentacionais, sem fetch e sem MSW.
   - `preview` carrega o tema Tailwind v4 e as fontes self-hosted uma vez, com fundo `ink`, viewports 390, 768 e 1440 e um controle para `prefers-reduced-motion`.
   - Cada componente tem docs automáticas (`autodocs`) e stories para todas as variantes e estados de `docs/design/components.md`: default, hover, focus, disabled, erro, loading (skeleton), vazio e erro com retry. Use um addon de pseudo-estados para hover e focus.
   - Cada story aponta para o frame do Figma por `parameters.design` (addon `@storybook/addon-designs`), usando fileKey e nodeId de `design/figma.json`.
   - Páginas "Foundations" em MDX geradas de `tokens.json`: cores, tipografia, spacing, raios e sombras, com os valores e os nodeIds de origem.
   - Acessibilidade: `@storybook/addon-a11y` ativo com violação como **erro** (não aviso).
   - Interações: `play` functions para foco preso e retorno de foco no Dialog e Drawer, associação label/erro no FormField e `Esc` fechando.
   - Scripts raiz `storybook` e `build:storybook`. O build estático é incluído no build de deploy em `/storybook/`, sem ser capturado pelo SPA fallback do `vercel.json`. Sem serviços privados (nada de Chromatic).
10. **Verificação de fidelidade**: para cada componente, compare com o frame do Figma (via MCP, se disponível, ou com `design/screenshots`) e registre divergências conhecidas em `docs/design/fidelity-notes.md`. Tolerância: valores de token exatos; diferenças de layout de até 1 px.
11. **Testes**: Vitest + Testing Library para comportamento (foco em diálogo, associação label/erro, reduced-motion), axe sem violações, e regressão visual com Playwright (Chromium) sobre os stories servidos pelo build estático do Storybook (`iframe.html?id=...`), em 1440 e 390, com baselines versionadas. As interações do Storybook rodam no CI (Vitest addon ou test-runner).

## Cenários de aceitação
- WHEN altero um valor em `tokens.json` e rodo `pnpm design:tokens` THEN o CSS de tema muda e nenhum componente precisa ser editado.
- WHEN um FormField tem erro THEN o input possui `aria-invalid` e `aria-describedby` apontando para a mensagem.
- WHEN abro um Dialog THEN o foco entra nele, fica preso e volta ao gatilho ao fechar.
- WHEN `prefers-reduced-motion` está ativo THEN o shimmer não anima.
- WHEN um app importa o tema compartilhado THEN as classes de tokens funcionam sem configuração duplicada.
- WHEN um componente usa uma cor hex literal THEN o lint ou teste falha.
- WHEN importo `@radix-ui/*` fora de `shared/ui` THEN o lint falha.
- WHEN rodo `pnpm storybook` THEN todos os componentes de `shared/ui` aparecem com docs e com todos os estados.
- WHEN um story tem violação de acessibilidade (axe) THEN o teste do Storybook falha.
- WHEN `apps/storybook` importa uma `feature`, um `data-access` ou `mocks` THEN o lint falha.
- WHEN rodo `pnpm build:storybook` THEN é gerado um build estático que abre em `/storybook/` do build de deploy.
- WHEN altero um token em `tokens.json` e rodo `pnpm design:tokens` THEN as páginas Foundations do Storybook refletem a mudança.

Gere proposal, specs e tasks. Não implemente nesta etapa: a implementação segue depois, uma task por vez, com pausa entre elas.