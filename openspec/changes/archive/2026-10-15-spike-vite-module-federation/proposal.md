# Proposal: Spike Vite + Module Federation

## Why

A arquitetura do Jungle NFT Marketplace adota uma estratégia de microfrontends com 4 aplicações React (shell, storefront, checkout, account) integradas por Module Federation. No entanto, o ecossistema Nx não possui gerador ou suporte nativo para a combinação Vite + `@module-federation/vite` (seu suporte oficial é restrito a Webpack e Rspack). Esta combinação representa a maior incerteza técnica do projeto, exigindo uma validação prática e isolada (spike) sobre os placeholders já existentes antes da implementação das regras de negócio.

A realização deste spike agora evita retrabalho massivo nas etapas de catálogo e checkout, estabelece o padrão de empacotamento, garante o funcionamento estrito de singletons (`react`, `react-dom`, `@tanstack/react-router`, `@tanstack/react-query`) e define a decisão de Go/No-Go arquitetural.

## What Changes

- **Integração de `@module-federation/vite`**:
  - Instalação e configuração do plugin oficial `@module-federation/vite` em `apps/shell` (host) e `apps/storefront` (remote).
  - Exposição de componente de página placeholder em `apps/storefront` (`./HomePage`).
  - Consumo lazy do remote via TanStack Router no host através de rota `/catalogo`.
- **Garantia e Validação de Singletons**:
  - Configuração de dependências compartilhadas com flag `singleton: true` e `requiredVersion`: `react`, `react-dom`, `@tanstack/react-router`, `@tanstack/react-query` e `@nft/shell-kit`.
  - Criação de mecanismo de sonda de instância (`singletonProbe`) em lib compartilhada (`@nft/shell-kit` ou `@nft/shared-testing`) para comprovar execução sob o mesmo closure/módulo em dev e build.
- **Orquestração de Targets Nx e Dependências de Build**:
  - Configuração de `dependsOn` no target `preview` do shell para exigir a compilação prévia de `storefront:build`.
  - Atualização do script de build consolidado para suportar subcaminho do remote (`base: '/remotes/storefront/'`).
- **Resiliência a Falhas do Remote**:
  - Implementação de tratamento com Suspense e captura de falha de carregamento dinâmico no host, garantindo que o shell permaneça funcional e navegável quando o remote estiver offline ou inacessível.
- **Isolamento de Estilos Tailwind v4**:
  - Centralização da injeção de CSS global no host shell via diretiva `@source` para escanear componentes do remote, sem duplicação de folhas de estilo no bundle federado.
  - Preservação da execução independente de `apps/storefront` via seu `main.tsx` local.
- **Políticas de Cache e Servidor de Preview**:
  - Garantia de headers `Cache-Control: public, max-age=0, must-revalidate` para `remoteEntry.js` e `mf-manifest.json`.
  - Garantia de cache imutável com hash para chunks secundários.
  - Suporte a SPA fallback e reload (F5) na rota federada sem 404 em `scripts/preview.js`.
- **Relatório Técnico e Decisão Go/No-Go**:
  - Elaboração de `docs/spikes/module-federation.md` com comandos, métricas (tempo de build, peso de chunks, número de requests), problemas encontrados e plano de contingência documentado.

## Capabilities

### New Capabilities
- `module-federation-runtime`: Estabelece a infraestrutura de federação de módulos em runtime via Vite, garantindo consumo dinâmico e seguro de páginas remotas pelo shell, integridade de singletons, tolerância a falhas de rede e conformidade com o build consolidado.

### Modified Capabilities
<!-- Nenhuma capability existente está tendo seus requisitos modificados -->

## Impact

- **Aplicações e Projetos Afetados**:
  - `apps/shell` (`scope:shell`, `type:app`, `flow:shell`): Adiciona plugin de federação como host, rota `/catalogo` com lazy loading e boundary de erro.
  - `apps/storefront` (`scope:storefront`, `type:app`, `flow:storefront`): Adiciona plugin de federação como remote expondo `./HomePage`, configura `base` condicional para build consolidado.
  - `libs/shell-kit` (`scope:shell-kit`, `type:util`, `flow:shared`): Exporta mecanismo de verificação de singleton `singletonProbe`.
- **Dependências Externas**:
  - Adição de `@module-federation/vite` em `devDependencies`.
- **Documentação e Scripts**:
  - Criação de `docs/spikes/module-federation.md`.
  - Ajuste em `scripts/preview.js` para refinamento de cabeçalhos de cache de `remoteEntry.js`.
  - Atualização de `ARCHITECTURE.md` para registrar os achados do spike.
- **Fora de Escopo**:
  - Telas e componentes reais de catálogo/PDP, ShellContext final com MSW completo, RemoteBoundary definitivo com retry automático por polling, integração dos remotes de checkout e account.
