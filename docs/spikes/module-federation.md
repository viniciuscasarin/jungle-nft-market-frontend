# Relatório Técnico: Spike Vite + Module Federation

## 1. Sumário Executivo e Decisão Go/No-Go

- **Decisão Arquitetural:** **GO (Aprovado)**
- **Biblioteca Validada:** `@module-federation/vite` (v1.23.5)
- **Stack Tecnológico:** Vite 6.2, React 19.0, TanStack Router 1.114, TanStack Query v5, Tailwind CSS v4, Nx 23.3, pnpm 12.
- **Conclusão:** A integração de microfrontends via `@module-federation/vite` é totalmente viável, estável e performática no monorepo Nx. Todos os cenários críticos — garantia de singleton único, carregamento dinâmico lazy, isolamento de CSS via Tailwind v4, resiliência a falhas de rede de remotes via Error Boundary e SPA fallback em build consolidado — foram comprovados matematicamente e validados por testes unitários e testes end-to-end automatizados com Playwright.

---

## 2. Métricas Técnicas e Medições Empíricas

As medições foram executadas em ambiente Windows 11 com Node.js v22 e pnpm.

### 2.1 Tempos de Build

| Aplicação / Alvo | Tempo (Cold Build / Sem Cache) | Tempo (Com Cache Nx) |
|---|---|---|
| `apps/storefront` (`nx build storefront`) | ~12.0s | < 0.4s |
| `apps/shell` (`nx build shell`) | ~17.8s | < 0.4s |
| Build Consolidado Integrado (`pnpm build`) | ~15.7s (execução paralela de 4 apps) | < 1.0s |

### 2.2 Tamanho dos Bundles e Chunks

| Artefato | Tamanho Bruto (Raw) | Tamanho Estimado (Gzip) | Papel |
|---|---|---|---|
| `dist/apps/storefront/remoteEntry.js` | **23.999 bytes** (~23.4 KB) | ~6.5 KB | Manifesto e orquestrador do remote |
| `dist/apps/storefront/assets/App-*.js` | **2.550 bytes** (~2.5 KB) | ~1.1 KB | Componente da página exposta (`./HomePage`) |
| `_virtual_mf...loadShare__shared-*.js` | **26.144 bytes** (~25.5 KB) | ~6.8 KB | Runtime bridge de módulos compartilhados |
| `dist/apps/shell/remoteEntry-*.js` | **22.560 bytes** (~22.0 KB) | ~6.2 KB | Runtime container do host |
| `dist/apps/shell/assets/index-*.css` | **16.917 bytes** (~16.5 KB) | ~3.8 KB | CSS global consolidado do host (Tailwind v4) |

### 2.3 Perfil de Requisições de Rede (HTTP Requests)

Em execução no servidor de preview consolidado (`scripts/preview.js`):

| Etapa de Navegação | Requisições Totais | Detalhes |
|---|---|---|
| Carga Inicial na Home (`/`) | **20 requisições** | Shell HTML, entry bootstrap, chunks compartilhados eager (`react`, `react-dom`, `@tanstack/react-router`, `@tanstack/react-query`), preloads de manifestos. |
| Navegação para `/catalogo` | **+4 requisições adicionais** (Total: 24) | Componente `App-*.js`, bindings de exportação federada e resolução de runtime. |
| Total de Requisições do Remote Storefront | **9 requisições** | `remoteEntry.js`, helpers de preload e chunks do módulo federado. |

---

## 3. Configuração Funcional Implementada

### 3.1 Host Shell (`apps/shell/vite.config.ts`)

```typescript
federation({
  name: 'shell',
  remotes: {
    storefront: {
      type: 'module',
      name: 'storefront',
      entry: isProduction
        ? '/remotes/storefront/remoteEntry.js'
        : 'http://localhost:4201/remoteEntry.js',
      entryGlobalName: 'storefront',
      shareScope: 'default',
    },
  },
  shared: {
    react: { singleton: true, requiredVersion: '^19.0.0', eager: true },
    'react-dom': { singleton: true, requiredVersion: '^19.0.0', eager: true },
    '@tanstack/react-router': { singleton: true, eager: true },
    '@tanstack/react-query': { singleton: true, eager: true },
    '@nft/shell-kit': { singleton: true, eager: true },
  },
})
```

### 3.2 Remote Storefront (`apps/storefront/vite.config.ts`)

```typescript
federation({
  name: 'storefront',
  filename: 'remoteEntry.js',
  exposes: {
    './HomePage': path.resolve(__dirname, 'src/App.tsx'),
  },
  shared: {
    react: { singleton: true, requiredVersion: '^19.0.0' },
    'react-dom': { singleton: true, requiredVersion: '^19.0.0' },
    '@tanstack/react-router': { singleton: true },
    '@tanstack/react-query': { singleton: true },
    '@nft/shell-kit': { singleton: true },
  },
})
```

- **Base Dinâmica:** `base: isProduction ? '/remotes/storefront/' : '/'` garante que chunks secundários do remote sejam solicitados pelo navegador sob `/remotes/storefront/assets/*`.
- **CORS e Origin:** `server.origin: 'http://localhost:4201'` e `cors: true` garantem que em desenvolvimento as requisições cruzadas entre portas não sejam bloqueadas.

### 3.3 Consumo Dinâmico e Blindagem no Roteamento (`apps/shell/src/routes.tsx`)

O consumo do remote é realizado de forma preguiçosa (`lazyRouteComponent`) e protegido por um `errorComponent` acessível:

```tsx
export const catalogRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/catalogo',
  component: lazyRouteComponent(() => import('storefront/HomePage')),
  errorComponent: RemoteErrorComponent,
});
```

Caso o remote esteja offline ou ocorra falha de rede ao baixar o `remoteEntry.js`, o `RemoteErrorComponent` é acionado dentro da área de conteúdo com:
- `role="alert"` e `aria-live="assertive"`.
- Botão "Tentar Novamente" (`reset`).
- Link de retorno para a rota inicial (`/`).
- O layout do Shell (cabeçalho, navegação e rodapé) permanece 100% funcional sem quebrar a sessão.

### 3.4 Centralização de Estilos Tailwind CSS v4

Para evitar que remotes injetem regras CSS duplicadas no `<head>`:
- O remote não importa CSS global em seu componente exportado (`HomePage.tsx`).
- O host shell escaneia os arquivos fonte do remote através da diretiva `@source` em `apps/shell/src/styles.css`:

```css
@import "tailwindcss";
@source "../../storefront/src";
```

Para desenvolvimento independente (`pnpm dev:storefront`), o `main.tsx` local do remote importa seu próprio `styles.css`.

---

## 4. Problemas Encontrados, Diagnósticos e Soluções

### 4.1 Resolução de Dependências Locais do Monorepo no Shared Scope

- **Sintoma:** O `@module-federation/vite` não reconhecia `@nft/shell-kit` como dependência compartilhada quando resolvido via aliases manuais no `vite.config.ts`, gerando duplicação de bundles.
- **Causa Raiz:** O plugin de federação espera que pacotes compartilhados sejam resolvidos como pacotes npm padrão (`node_modules`), e o plugin `vite-tsconfig-paths` interceptava os imports antes do módulo de federação, tratando-os como arquivos locais.
- **Solução Aplicada:**
  1. Criação de `package.json` formal em `libs/shell-kit` (`name: "@nft/shell-kit"`).
  2. Adição de `"@nft/shell-kit": "workspace:*"` no `package.json` raiz, gerando symlink nativo gerenciado pelo pnpm.
  3. Remoção de aliases manuais de `vite.config.ts`.

### 4.2 Integridade do Singleton Probe em Cenários Multi-Chunk

- **Sintoma:** O contador da sonda de singleton registrava `1` no remote em vez de `2` durante a navegação.
- **Causa Raiz:** A inicialização do módulo `singleton-probe.ts` atribuía uma nova instância incondicionalmente a `globalThis[SINGLETON_PROBE_KEY]`, sobrescrevendo o estado anterior registrado pelo shell quando avaliado em chunks distintos. Além disso, o host incrementava o contador duplamente (`main.tsx` e `RootComponent`).
- **Solução Aplicada:**
  1. A sonda agora verifica se `globalRef[SINGLETON_PROBE_KEY]` já existe no `globalThis`. Se existir, reutiliza a instância única existente em vez de criar novo estado.
  2. A chamada do host foi centralizada no `RootComponent` em `apps/shell/src/routes.tsx`.
  3. Comprovação: Host inicia e incrementa para `1`. Ao navegar para `/catalogo`, o remote reutiliza o mesmo singleton e incrementa para `2`. O badge na tela exibe `2` e o histórico registra ambos os eventos (`apps/shell` e `apps/storefront`).

### 4.3 Roteamento SPA e Políticas de Cache no Servidor de Preview

- **Sintoma:** Recarregar a página diretamente em `/catalogo` (F5) resultava em erro 404 em servidores estáticos convencionais.
- **Causa Raiz:** `/catalogo` é uma rota virtual gerenciada pelo TanStack Router no lado do cliente.
- **Solução Aplicada:**
  1. O servidor `scripts/preview.js` foi configurado com SPA fallback, reescrevendo qualquer requisição não estática para `/index.html` do shell.
  2. Implementação de cabeçalhos estritos de cache:
     - `remoteEntry.js`, `mf-manifest.json` e `index.html`: `Cache-Control: public, max-age=0, must-revalidate`.
     - Chunks com hash sob `/assets/*`: `Cache-Control: public, max-age=31536000, immutable`.

---

## 5. Validação Automatizada

A infraestrutura foi validada com 100% de sucesso através dos seguintes testes:

1. **Unit Tests (Vitest):**
   - `libs/shell-kit/src/singleton-probe.spec.ts`: 4 testes aprovados comprovando contagem sequencial, resets e integridade do símbolo global.
   - `apps/shell/src/routes.spec.tsx`: 5 testes aprovados cobrindo rotas, incremento de probe e renderização do `RemoteErrorComponent`.
   - `apps/storefront/src/App.spec.tsx`: 2 testes aprovados cobrindo montagem independente e incremento de probe.
2. **End-to-End Tests (Playwright - `apps/web-e2e`):**
   - `module-federation.spec.ts`:
     - Dynamic import na rota `/catalogo` e verificação de que `probeBadge` atinge o valor `'2'`.
     - SPA fallback e recarregamento direto via F5 em `/catalogo` sem 404.
     - Resiliência a remote offline: aborto de requisições `**/remotes/storefront/**`, renderização do `RemoteErrorComponent` acessível e navegação de retorno para `/`.
   - `smoke.spec.ts`: Carga íntegra do shell e teste de página 404.

---

## 6. Próximos Passos Recomendados

1. **Adoção Oficial:** Atualizar `ARCHITECTURE.md` confirmando a arquitetura de Module Federation com `@module-federation/vite`.
2. **Reutilização nos Próximos Remotes:** Aplicar o mesmo padrão funcional de `vite.config.ts` e orquestração de build para `apps/checkout` e `apps/account` nas respectivas etapas do backlog.
3. **Evolução do Remote Boundary:** Na change de catálogo (`03-catalog-browsing-pdp`), implementar o componente `RemoteBoundary` definitivo fornecendo feedback visual com skeleton e retry via polling exponencial.
