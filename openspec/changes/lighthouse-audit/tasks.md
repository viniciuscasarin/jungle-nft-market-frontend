# Tasks

## 1. [P0 — Quick Wins] Metadados, Preload e Dimensionamento Anti-CLS

- [x] 1.1 Inserir metadados essenciais de SEO (`<meta name="description">`, `<meta name="theme-color">`, tags Open Graph básicas) e preload/preconnect em `apps/shell/index.html`, verificando conformidade com `pnpm nx test shell` e inspeção do HTML gerado
- [x] 1.2 Assegurar dimensionamento explícito com classes de aspect-ratio (`aspect-square` / `aspect-[4/3]`) e `fetchpriority="high"` na imagem principal (Hero / Detalhe) nos componentes de catálogo e detalhe para eliminação de layout shift (CLS = 0), verificando com `pnpm nx test catalog-ui`

## 2. [P0 — Automação] Runner Automatizado do Lighthouse (`scripts/lighthouse.js`)

- [x] 2.1 Implementar `scripts/lighthouse.js` acionado por `pnpm lighthouse` com detecção automática do preview server na porta 4200 (inicializando se necessário), resolução do binário Chromium/Chrome (via `@playwright/test` ou sistema), e execução parametrizada dos perfis `desktop` e `mobile`
- [x] 2.2 Implementar a metodologia de 3 medições consecutivas por rota (`/` e `/nft/nft-01`) e por perfil (total de 12 execuções), parsing dos relatórios JSON para extração de scores (Performance, Acessibilidade, Boas Práticas, SEO) e Web Vitals (LCP, CLS, TBT), cálculo da mediana estatística e geração de `docs/lighthouse/runs/*` (HTML/JSON) e `docs/lighthouse/summary.md`
- [x] 2.3 Implementar teste unitário para as funções puras de parsing e cálculo de mediana do runner (`scripts/lighthouse.spec.js` ou em `libs/shared/testing`), verificando com `pnpm test`

## 3. [P0 — Execução e Medição] Execução das 12 Auditorias Oficiais

- [ ] 3.1 Executar o build integrado (`pnpm build`) e a suíte completa de auditorias `pnpm lighthouse`, confirmando a geração de todos os relatórios HTML/JSON em `docs/lighthouse/runs/` e da tabela consolidada em `docs/lighthouse/summary.md`

## 4. [P1 — Débito Técnico & Documentação] Justificativas Técnicas e Validação Final

- [ ] 4.1 Documentar em `ARCHITECTURE.md` (§14 e §17) e `README.md` os resultados consolidados, condições de teste (versões de Node, Lighthouse e navegador) e as justificativas técnicas para qualquer métrica influenciada pelo Service Worker MSW e waterfall do Module Federation em mobile, categorizadas formalmente como débito técnico P1
- [ ] 4.2 Executar `typecheck`, `lint`, `test` e `build` nos projetos afetados (`pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm build`) e garantir zero erros
