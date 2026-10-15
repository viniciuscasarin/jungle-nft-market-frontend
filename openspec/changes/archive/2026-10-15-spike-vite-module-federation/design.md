# Design: Spike Vite + Module Federation

## Context

O projeto utiliza um monorepo Nx com Vite 6, React 19, TanStack Router (code-based), TanStack Query v5 e Tailwind CSS v4. A arquitetura estabelece que o host (`apps/shell`) gerencia rotas, sessão e providers, enquanto os remotes (`apps/storefront`, `apps/checkout`, `apps/account`) expõem apenas componentes de página. 

Como o ecossistema Nx não possui generator oficial para a combinação Vite + Module Federation, este spike valida o plugin `@module-federation/vite` em um cenário controlado entre `apps/shell` e `apps/storefront` antes de avançar para a lógica de negócio. Veja `proposal.md` para a motivação detalhada e `specs/module-federation-runtime/spec.md` para os requisitos formais.

## Goals / Non-Goals

**Goals:**
- Validar o empacotamento e a execução de `@module-federation/vite` em modo desenvolvimento (`dev`) e produção (`build` / `preview`).
- Provar matematicamente o funcionamento de singletons compartilhados (`react`, `react-dom`, `@tanstack/react-router`, `@tanstack/react-query` e `@nft/shell-kit`).
- Garantir a orquestração de dependências no Nx e o correto fallback SPA na rota do remote sem erro 404 em refresh.
- Blindar o host shell contra falhas de rede do remote por meio de tratamento de erro com acessibilidade.
- Documentar os resultados, métricas e a decisão Go/No-Go formal em `docs/spikes/module-federation.md`.

**Non-Goals:**
- Construir telas de negócio ou catálogo definitivo com dados do MSW.
- Integrar os remotes de checkout ou account neste momento.
- Implementar o componente final `RemoteBoundary` com polling e retry exponencial (será feito na change de fundação de catálogo/remotes).

## Decisions

### 1. Adotar `@module-federation/vite` em vez de `@originjs/vite-plugin-federation`
- **Decisão**: Utilizar o pacote oficial `@module-federation/vite` (v1.23.5+), mantido pela equipe do Module Federation v2.
- **Racional**: O antigo `@originjs/vite-plugin-federation` está estagnado, não suporta o runtime unificado do Module Federation 2.0 e apresenta problemas críticos com Vite 6 e React 19. A versão oficial possui suporte a Vite 5/6, manifestos (`mf-manifest.json`) e interoperabilidade com os runtimes modernos.
- **Alternativas consideradas**:
  - `@originjs/vite-plugin-federation`: Descartado por incompatibilidade com Vite 6.
  - Webpack/Rspack via Nx generators: Descartado por violar o stack estabelecido na proposta de arquitetura.

### 2. Resolução de Endpoints Dinâmicos por Ambiente
- **Decisão**: Configurar o remote entry no host dinamicamente de acordo com o ambiente:
  - Desenvolvimento: `http://localhost:4201/remoteEntry.js` (ou `mf-manifest.json`).
  - Produção/Preview: `/remotes/storefront/remoteEntry.js`.
- **Racional**: Em desenvolvimento, os apps rodam em servidores Vite locais distintos com portas diferentes (`4200` e `4201`). No build consolidado (`dist/integrated`), o servidor de preview unificado entrega os remotes sob o subdiretório `/remotes/<app>/`.
- **Alternativas consideradas**:
  - Hardcode de URLs: Inviabilizaria o preview unificado e o deploy em Vercel/CDN.

### 3. Mecanismo de Prova de Instância Única (`singletonProbe`)
- **Decisão**: Criar a utilidade `singletonProbe` em `@nft/shell-kit` contendo um contador em memória e identificador via `Symbol.for('nft.singleton.probe')`.
- **Racional**: Para comprovar que o Module Federation não está duplicando instâncias de bibliotecas compartilhadas, tanto o host shell quanto o componente exposto do remote invocam `singletonProbe.increment()`. O valor retornado é inspecionado em testes automatizados e em tempo de execução: se for compartilhado, o contador atinge `2`; se houver bundles duplicados, o remote iniciará em 0 e incrementará para 1, falhando a validação.

### 4. Centralização de Estilos Tailwind v4 no Host
- **Decisão**: O host shell injeta `@import "tailwindcss";` em `apps/shell/src/styles.css` e adiciona a diretiva `@source "../../storefront/src"` para que o compilador do host escaneie as classes do remote. O componente exposto pelo remote (`HomePage.tsx`) não importa nenhum CSS global.
- **Racional**: Evita duplicação de regras CSS, resets conflitantes e injeções múltiplas no `<head>` do navegador quando o remote é carregado via Module Federation. Para desenvolvimento local do remote (`dev:storefront`), seu `main.tsx` importa seu próprio `styles.css` isolado.

### 5. Resiliência do Host a Falhas do Remote via Error Boundary
- **Decisão**: A rota `/catalogo` no TanStack Router utilizará `lazyRouteComponent` envolto em `errorComponent` acessível (ou Suspense + ErrorBoundary).
- **Racional**: Falhas na rede ou servidores remotos desligados disparam erros de dynamic import. Capturar o erro no nível de rota garante que o layout do shell (header, navegação e footer) permaneça íntegro e navegável para outras rotas (como a Home `/`).

## Risks / Trade-offs

- **[Risco] Resolução incorreta de chunks secundários do remote em produção**
  - *Mitigação*: Configurar `base: process.env.NODE_ENV === 'production' ? '/remotes/storefront/' : '/'` no `vite.config.ts` do `apps/storefront`.
- **[Risco] Bloqueio de CORS no dev server entre as portas 4200 e 4201**
  - *Mitigação*: Configurar `server.cors: true` e `server.origin: 'http://localhost:4201'` no `vite.config.ts` do remote.
- **[Risco] Incompatibilidade intransponível do `@module-federation/vite` com Vite 6 / React 19 (Cenário No-Go)**
  - *Mitigação*: Plano de contingência pronto e documentado. Se a combinação falhar, adotaremos integração direta via imports de libs de página no Shell (`@nft/catalog-feature`), mantendo as fronteiras arquiteturais e a separação de domínios intactas.
