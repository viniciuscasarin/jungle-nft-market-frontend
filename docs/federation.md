# Contrato e Guia de Module Federation

Este documento descreve a arquitetura, topologia, convenções e o guia prático para desenvolvimento e extensão de microfrontends no Jungle NFT Marketplace utilizando **Module Federation** com Vite.

---

## 1. Topologia de Aplicações e Portas

O monorepo é estruturado em 4 aplicações integradas via Module Federation mais o catálogo de componentes (Storybook):

| Aplicação | Papel | Porta Fixa | Base Path em Prod | Módulos Expostos / Páginas |
|---|---|---|---|---|
| `apps/shell` | **Host Shell** (orquestrador, layout, rotas, sessão, MSW, singletons) | `4200` | `/` | Consome todos os remotes |
| `apps/storefront` | **Remote Catálogo** (Home e PDP) | `4201` | `/remotes/storefront/` | `./HomePage`, `./PdpPage` |
| `apps/checkout` | **Remote Checkout** (Carrinho, Pagamento e Confirmação) | `4202` | `/remotes/checkout/` | `./CartPage`, `./PaymentPage`, `./ConfirmationPage` |
| `apps/account` | **Remote Conta** (Perfil e Carteiras) | `4203` | `/remotes/account/` | `./ProfilePage`, `./WalletsPage` |
| `apps/storybook` | **Design System** (Storybook consolidado) | `6006` | `/storybook/` | Catálogo visual de componentes UI |

---

## 2. Shared Scope e Singletons Estritos

Para garantir integridade de estado e evitar duplicação de instâncias de clientes em tempo de execução, as seguintes dependências são declaradas como **singletons obrigatórios** com estratégia `version-first`:

| Dependência | Versão Requerida | Singleton | Eager no Shell |
|---|---|---|---|
| `react` | `^19.0.0` | `true` | `true` |
| `react-dom` | `^19.0.0` | `true` | `true` |
| `react-dom/client` | `^19.0.0` | `true` | `true` |
| `react/jsx-runtime` | `^19.0.0` | `true` | `true` |
| `@tanstack/react-query` | `^5.67.0` | `true` | `true` |
| `@tanstack/react-router` | `^1.114.0` | `true` | `true` |
| `socket.io-client` | `^4.8.1` | `true` | `true` |
| `@nft/shell-kit` | `workspace:*` | `true` | `true` |

### Verificação de Singletons no Runtime
A biblioteca `@nft/shell-kit` disponibiliza o utilitário `singletonRegistry`, registrado sob o Symbol global `Symbol.for('nft.singleton.registry')`. Em tempo de execução, cada app ou remote registra e valida os singletons:
- `queryClient`: instância única de `QueryClient` gerenciada pelo host.
- `httpClient`: cliente Axios compartilhado com interceptores globais.
- `realtimeClient`: cliente `socket.io-client` compartilhado.
- `serviceWorker`: worker MSW inicializado apenas pelo Shell ou no bootstrap standalone.

---

## 3. Fluxo de Desenvolvimento Local

### Execução de Todos os Apps com Mocks
Para iniciar o host e os 3 remotes simultaneamente em portas dedicadas:
```bash
pnpm dev:mocks
```
Este comando utiliza `nx run-many -t dev` e sobe:
- Host Shell: `http://localhost:4200`
- Storefront: `http://localhost:4201`
- Checkout: `http://localhost:4202`
- Account: `http://localhost:4203`

### Execução Individual de um App
Cada app pode ser iniciado de maneira isolada:
```bash
pnpm dev:shell        # Apenas o Shell
pnpm dev:storefront   # Apenas Storefront (standalone)
pnpm dev:checkout     # Apenas Checkout (standalone)
pnpm dev:account      # Apenas Account (standalone)
```

---

## 4. Build Integrado e Produção

Em produção, o sistema é consolidado em uma distribuição estática unificada:
```bash
pnpm build
```
O script `scripts/build-integrated.js` compila todas as aplicações via Nx e organiza o diretório `dist/integrated`:

```
dist/integrated/
├── index.html                   # HTML do Shell
├── assets/                      # JS/CSS do Shell
├── remotes/
│   ├── storefront/              # remoteEntry.js e assets do Storefront
│   ├── checkout/                # remoteEntry.js e assets do Checkout
│   └── account/                 # remoteEntry.js e assets do Account
└── storybook/                   # Build estático do Storybook
```

### Visualização Integrada (Preview)
Para servir a distribuição consolidada exatamente como no ambiente de produção:
```bash
pnpm preview
```
O servidor de preview (`scripts/preview.js`) escuta em `http://localhost:4200`, fornece roteamento com fallback SPA (para que refresh direto e deep links funcionem em qualquer subrota) e serve os arquivos dos remotes sob seus respectivos caminhos `/remotes/<remoteName>/`.

---

## 5. Resiliência e Tratamento de Falhas (`RemoteBoundary`)

Quando um remote está offline ou sofre falha de rede temporária durante o carregamento dinâmico:
1. **Fallback Visual com Shimmer Skeleton**: Enquanto o módulo remoto é baixado, `DefaultRemoteSkeleton` é exibido. Sob `prefers-reduced-motion: reduce`, as animações de shimmer são desativadas automaticamente.
2. **Timeout Configurável**: `withRemoteTimeout` aborta tentativas que excedam o timeout (padrão de 10s).
3. **ErrorBoundary com Recuperação Sem Reload**: O componente `RemoteBoundary` exibe uma mensagem acessível (`role="alert"`) com o botão "Tentar Novamente". Ao clicar em retry, o componente tenta recarregar o módulo remoto dinâmico sem necessidade de recarregar a janela inteira da aplicação (preservando o estado do Shell e a sessão do usuário).

---

## 6. Guia para Criação de Novos Remotes

Para adicionar um novo microfrontend ao monorepo:

### Passo 1: Definir Portas e Manifestos
1. Defina uma porta fixa e adicione o manifesto em `libs/shell-kit/src/contracts.ts` na constante `REMOTE_MANIFESTS`.
2. Adicione as declarações de módulo em `libs/shell-kit/src/remote-modules.d.ts`:
   ```ts
   declare module 'novo-remote/MinhaPagina' {
     import type { ComponentType } from 'react';
     const MinhaPagina: ComponentType<any>;
     export default MinhaPagina;
   }
   ```

### Passo 2: Configurar `@module-federation/vite` no Remote
Em `apps/novo-remote/vite.config.ts`:
```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { federation } from '@module-federation/vite';

export default defineConfig({
  server: {
    port: 4204,
    cors: true,
  },
  plugins: [
    react(),
    federation({
      name: 'novo-remote',
      filename: 'remoteEntry.js',
      exposes: {
        './MinhaPagina': './src/pages/MinhaPagina.tsx',
      },
      shared: {
        react: { singleton: true, requiredVersion: '^19.0.0' },
        'react-dom': { singleton: true, requiredVersion: '^19.0.0' },
        '@tanstack/react-query': { singleton: true, requiredVersion: '^5.67.0' },
        '@tanstack/react-router': { singleton: true, requiredVersion: '^1.114.0' },
        'socket.io-client': { singleton: true, requiredVersion: '^4.8.1' },
        '@nft/shell-kit': { singleton: true },
      },
    }),
  ],
});
```

### Passo 3: Configurar Execução Standalone
No arquivo `src/main.tsx` do remote, utilize `bootstrapStandalone`:
```tsx
import { bootstrapStandalone } from '@nft/shell-kit';
import MinhaPagina from './pages/MinhaPagina';

bootstrapStandalone(MinhaPagina, {
  mountPoint: '#root',
  initialRoute: '/',
});
```

### Passo 4: Registrar no Host Shell
1. Adicione a rota em `apps/shell/src/routes.tsx`:
   ```tsx
   export const minhaRota = createRoute({
     getParentRoute: () => rootRoute,
     path: '/minha-rota',
     component: createRemoteRouteComponent(() => import('novo-remote/MinhaPagina')),
     errorComponent: RemoteErrorComponent,
     pendingComponent: DefaultRemoteSkeleton,
   });
   ```
2. Adicione a URL remota em `apps/shell/vite.config.ts`:
   ```ts
   'novo-remote': {
     name: 'novo-remote',
     type: 'module',
     entry: resolveRemoteEntry('novo-remote', 'VITE_REMOTE_NOVO_URL', 4204),
   }
   ```
3. Atualize o script `scripts/build-integrated.js` para copiar o diretório compilado para `dist/integrated/remotes/novo-remote`.
