# Design

## Context

O desafio estipula metas de qualidade rigorosas (Performance ≥ 90, Acessibilidade ≥ 95, Boas Práticas ≥ 95, SEO ≥ 90) em Início (`/`) e Detalhe (`/nft/:nftId`) nos perfis Desktop e Mobile, com 3 medições e cálculo de medianas. A aplicação opera como um monorepo Nx com Module Federation e interceptação de rede 100% no Service Worker MSW (`VITE_ENABLE_MOCKS=true`).

Ver `proposal.md` para a motivação e a separação em P0 (Medição + Quick Wins) vs P1 (Débito Técnico).

## Goals / Non-Goals

**Goals:**
- Implementar um runner de auditoria em `scripts/lighthouse.js` acionado por `pnpm lighthouse` que seja 100% autônomo, multiplataforma (Windows e Linux/CI) e determinístico.
- Auditar Início (`/`) e Detalhe (`/nft/nft-01`) em desktop e mobile, com 3 execuções consecutivas para cada combinação (12 execuções no total).
- Coletar scores de Performance, Acessibilidade, Boas Práticas e SEO, além de LCP, CLS e TBT, calculando as medianas estatísticas.
- Exportar relatórios HTML/JSON em `docs/lighthouse/runs/` e gerar sumário consolidado em `docs/lighthouse/summary.md`.
- Aplicar quick wins imediatos (metadados HTML, aspect-ratio anti-CLS, fetchpriority em imagem de destaque, preloads) sem refatorações estruturais.
- Documentar em `ARCHITECTURE.md` (§14 e §17) os resultados e as justificativas técnicas para eventuais desvios em mobile.

**Non-Goals:**
- Não remover imagens, fontes ou componentes para inflar scores (proibido pela Regra Inviolável #7).
- Não refatorar o bundler Vite ou a biblioteca de Module Federation.
- Não reescrever a arquitetura de simulação do MSW para o Lighthouse.

## Decisions

### 1. Mecanismo de Execução do Lighthouse Runner (`scripts/lighthouse.js`)
- **Decisão**: Utilizar `npx --yes lighthouse` via `node:child_process.spawn/execSync` (ou invocação de CLI com saída estruturada `--output=json --output=html --output-path=...`), detectando automaticamente o executável do Chromium disponibilizado pelo Playwright (`@playwright/test`) ou Chrome do sistema através da variável de ambiente `CHROME_PATH`.
- **Racional**: Dispensa dependências globais ou instalações pesadas adicionais no `package.json`, garantindo compatibilidade imediata com o ambiente em que o Playwright já roda os testes E2E (`apps/web-e2e`).
- **Alternativas consideradas**: Usar pacote programático `lighthouse` importado como biblioteca JS. Descartado para evitar problemas de compatibilidade ESM/CJS em Node e lockfiles no Windows, além de economizar tempo de download.

### 2. Configuração de Perfis (Desktop vs Mobile)
- **Decisão**:
  - **Desktop**: `--preset=desktop --chrome-flags="--headless --no-sandbox --disable-gpu --disable-dev-shm-usage"`
  - **Mobile**: Configuração padrão emulada do Lighthouse (Nexus 5X / Moto G4, throttling de CPU 4x e rede 4G simulada, `--chrome-flags="--headless --no-sandbox --disable-gpu --disable-dev-shm-usage"`).
- **Racional**: Segue exatamente a convenção padrão oficial do Google Lighthouse para testes comparativos de Core Web Vitals.

### 3. Orquestração do Servidor de Preview Integrado
- **Decisão**: O script `scripts/lighthouse.js` verifica se a porta 4200 já responde a requisições HTTP (`http://localhost:4200`). Se não responder, inicia em subprocesso o preview integrado (`node scripts/preview.js`), aguarda a prontidão da porta (healthcheck) e encerra o processo graciosamente no encerramento (bloco `finally` / handlers de `SIGINT`/`exit`).
- **Racional**: Permite tanto rodar `pnpm lighthouse` de forma isolada quanto rodar após `pnpm build && pnpm preview` já ativo sem conflito de portas.

### 4. Cálculo Estatístico de Medianas
- **Decisão**: Para cada uma das 4 combinações (2 rotas × 2 perfis), as 3 execuções geram 3 relatórios JSON. O script extrai os valores numéricos de:
  - Categorias: `categories[id].score * 100` (arredondado para inteiro)
  - Métricas: `audits['largest-contentful-paint'].numericValue`, `audits['cumulative-layout-shift'].numericValue`, `audits['total-blocking-time'].numericValue`
  Para cada métrica/categoria, ordena as 3 leituras e seleciona o elemento do meio (`sorted[1]`).
- **Racional**: Elimina variações espúrias de primeira execução (JIT compilation do V8 e inicialização do Service Worker) em conformidade com o enunciado do desafio (§10).

### 5. Quick Wins de Alto Retorno (P0)
- **Decisão**:
  - `apps/shell/index.html`: assegurar `<meta name="description">` descritivo, `<meta name="theme-color">`, `<link rel="canonical">` ou tags de base.
  - Imagens dos cards e banners da Home (`libs/catalog/ui`) e PDP: adicionar classes Tailwind de `aspect-square` ou `aspect-[4/3]` nos containers de imagem com tamanhos fixos para garantir que o navegador reserve o espaço visual antes do download da imagem (CLS = 0).
  - Adicionar `fetchpriority="high"` no Hero Banner / imagem principal da PDP para adiantar a descoberta do LCP pelo scanner de preload do navegador.
- **Racional**: Maximiza scores de Best Practices, SEO e Acessibilidade (chegando a 95-100) e minimiza CLS a quase zero sem alterar a estética visual do Figma.

### 6. Registro de Débito Técnico e Justificativa em `ARCHITECTURE.md` (P1)
- **Decisão**: Como o desafio estipula explicitamente que resultados abaixo da meta em mobile podem ser justificados tecnicamente, registramos detalhadamente no §14 e §17 de `ARCHITECTURE.md`:
  - Overhead de inicialização do Service Worker MSW na primeira carga.
  - Cascata de Module Federation em rede móvel emulada (download do host `shell` -> `remoteEntry.js` do storefront -> chunks federados).
- **Racional**: Atende 100% aos critérios do desafio (§10 e §11) sem violar as regras de integridade nem introduzir hacks que removam código real.

## Risks / Trade-offs

- **[Risk] Ausência de binário do Chrome no ambiente de CI ou em máquinas sem Google Chrome instalado**
  → **Mitigation**: No script `scripts/lighthouse.js`, verificar `process.env.CHROME_PATH`, `CHROME_BIN` ou buscar o executável do Chromium baixado pelo Playwright em `%LOCALAPPDATA%\ms-playwright` / `~/.cache/ms-playwright` antes de disparar o Lighthouse.
- **[Risk] Flutuação de performance em máquinas locais lentas**
  → **Mitigation**: A metodologia de 3 medições com seleção da mediana absorve picos momentâneos de I/O ou CPU.
- **[Risk] Rota de detalhe inexistente caso o banco de mocks não tenha o item**
  → **Mitigation**: Utilizar o identificador determinístico canônico `/nft/nft-01` presente nas fixtures e testado nos testes E2E.
