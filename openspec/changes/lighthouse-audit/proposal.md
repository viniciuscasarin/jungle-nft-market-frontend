# Proposal

## Why

O desafio exige a auditoria oficial de qualidade e performance com o Lighthouse sobre o build de produção integrado, avaliando as rotas **Início** (`/`) e **Detalhe do NFT** (`/nft/:nftId`) nos perfis **mobile** e **desktop**, com 3 execuções por combinação (total de 12 execuções) e cálculo da mediana das categorias (Performance, Acessibilidade, Boas Práticas, SEO) e das Core Web Vitals (LCP, CLS, TBT). Diante do prazo crítico de entrega, esta change estabelece o runner automatizado `pnpm lighthouse`, aplica *quick wins* imediatos sem refatorações estruturais ou remoção de features/assets, e registra formalmente como débito técnico e justificativa técnica em `ARCHITECTURE.md` §14 e §17 qualquer indicador que ficar abaixo das metas devido ao overhead intrínseco do Service Worker MSW e waterfall do Module Federation em emulação mobile.

## What Changes

- **Automação de Auditoria Lighthouse (`scripts/lighthouse.js` e `pnpm lighthouse`)**:
  - Implementação de runner automatizado em Node.js (`scripts/lighthouse.js`) que orquestra a execução contra o build de produção integrado (`dist/integrated`) servido pelo preview (`http://localhost:4200`) com o cenário padrão dos mocks ativo.
  - Execução de 3 rodadas para cada uma das 4 combinações:
    1. Início (`/`) - Desktop
    2. Início (`/`) - Mobile
    3. Detalhe (`/nft/:nftId`) - Desktop
    4. Detalhe (`/nft/:nftId`) - Mobile
  - Coleta e extração dos scores de Performance, Acessibilidade, Boas Práticas e SEO, além das métricas LCP (Largest Contentful Paint), CLS (Cumulative Layout Shift) e TBT (Total Blocking Time).
  - Cálculo determinístico da mediana estatística das 3 execuções para cada métrica e categoria.
  - Exportação e versionamento dos relatórios brutos (HTML e JSON) e do resumo consolidado em Markdown (`docs/lighthouse/summary.md` e `docs/lighthouse/runs/*`).
- **Quick Wins de Performance, SEO e Acessibilidade (P0)**:
  - Adição de metadados canônicos e tags de SEO no shell (`apps/shell/index.html`) e páginas (`meta description`, `theme-color`, Open Graph básicos).
  - Dimensionamento explícito (`aspect-ratio` ou atributos `width`/`height`) em containers de imagens de cards e detalhe para eliminação de layout shift (CLS = 0).
  - Configuração de `fetchpriority="high"` na imagem hero/destaque e no primeiro card do catálogo.
  - Preconnect e preload estratégico de recursos locais críticos (fontes Roboto Mono woff2 já presentes, `remoteEntry.js` do storefront).
- **Documentação e Justificativa Técnica de Débito Técnico (P1)**:
  - Registro minucioso em `ARCHITECTURE.md` (§14 e §17) e `README.md` das condições de execução, versões das ferramentas (Node, Lighthouse CLI/Core, Chrome/Chromium headless) e justificativa técnica para métricas influenciadas pela arquitetura de Module Federation e interceptação do Service Worker MSW no mobile.

## Estratégia de Prazo Crítico: P0 (Obrigatório) vs P1 (Débito Técnico)

- **P0 (Fazer agora — Entrega Obrigatória)**:
  - Script `pnpm lighthouse` operacional, robusto e reprodutível no Windows e Linux/CI.
  - Execução das 12 medições (3 por rota e perfil) contra o build de produção (`pnpm build && pnpm preview`).
  - Geração de relatórios HTML, JSON e tabela de medianas em `docs/lighthouse/`.
  - Quick wins de HTML/CSS (meta tags, aspect-ratio, preload de fontes e prioritização de imagem).
  - Atualização de `ARCHITECTURE.md` §14 com os resultados e justificativas técnicas.
- **P1 (Débito Técnico documentado em `ARCHITECTURE.md` §17)**:
  - Refatorações profundas de code-splitting de Module Federation ou substituição do runtime do MSW para um proxy HTTP dedicado.
  - Pipeline de CI/CD para execução contínua com Lighthouse CI (`@lhci/cli`).
  - Otimização avançada de imagens com pipeline de compressão WebP/AVIF em múltiplos breakpoints além dos assets self-hosted existentes.

## Capabilities

### New Capabilities
- `lighthouse-audit`: Metodologia, automação via `pnpm lighthouse`, extração de métricas (medianas de 3 execuções em desktop e mobile para Início e Detalhe), geração de relatórios versionados em `docs/lighthouse/` e documentação de conformidade e justificativas técnicas em `ARCHITECTURE.md`.

### Modified Capabilities
<!-- Nenhuma capability existente tem seus requisitos funcionais alterados -->

## Impact

### Projetos Nx Afetados e Tags
- `apps/shell` (`scope:shell`, `type:app`, `flow:shell`): metadados no `index.html`, preloads críticos e preview integrado.
- `apps/storefront` (`scope:storefront`, `type:app`, `flow:storefront`): `aspect-ratio` e `fetchpriority` em imagens do catálogo e PDP.
- `apps/storybook` (`flow:tooling`): inalterado funcionalmente.
- `docs/lighthouse/*`: relatórios gerados e resumo consolidado.
- `scripts/lighthouse.js`: runner automatizado da auditoria.

### Fora de Escopo
- Refatorações estruturais de bundling ou troca da biblioteca `@module-federation/vite`.
- Deploy externo e infraestrutura de hospedagem pública (Etapa 19).
- Remoção de fontes, imagens ou funcionalidades da entrega com o intuito artificial de inflar notas (violação da Regra Inviolável #7).

### Premissas (registradas também em `ARCHITECTURE.md`)
- A rota de detalhe auditada utiliza um NFT determinístico da fixture canônica (`/nft/nft-01`).
- As auditorias utilizam o Chrome ou Chromium instalado no sistema (ou disponibilizado pelo runtime do Playwright `chromium.executablePath()`), executado em modo headless com flags consistentes (`--no-sandbox`, `--disable-dev-shm-usage`).
- Os thresholds de aprovação do script não bloqueiam a geração de relatórios caso uma métrica em mobile fique abaixo da meta teórica (90/95), permitindo a documentação da justificativa técnica conforme expressamente previsto no enunciado do desafio (§10).
