# Design: Auth and Session

## Context

O sistema já possui a fundação do monorepo Nx, Module Federation via `@module-federation/vite`, infraestrutura de testes e mocks com banco reativo e relógio injetável (`mocks-core-and-scenarios`), primitivos de UI (`design-system-shared-ui`) e o contrato básico de shell (`module-federation-contract`).
A motivação desta change está descrita em `proposal.md` e os requisitos funcionais detalhados em `specs/user-auth-and-session/spec.md` e `specs/domain-contracts/spec.md`.

## Goals / Non-Goals

**Goals:**
- Implementar as 4 camadas do domínio `auth` (`domain`, `data-access`, `feature`, `ui`) com a tag `flow:shell`.
- Implementar os handlers REST de MSW (`/api/auth/*`) com WebCrypto PBKDF2-SHA-256, tokens opacos e merge de carrinho de visitante.
- Construir o `SessionController` agnóstico ao React para orquestrar transições de sessão com expurgo obrigatório de cache prévio, desconexão de realtime e bloqueio de expirações concorrentes.
- Prover armazenamento persistente de sessão (`TokenStore`), visitante (`guestId`) e contexto de retomada (`ResumeStore`).
- Implementar formulários acessíveis de Login e Cadastro seguindo o design do Figma (modal no desktop, tela dedicada no mobile).
- Garantir testes automatizados de unidade, integração e ponta a ponta (Playwright para o Fluxo 3 e modal a11y do Fluxo 11).

**Non-Goals:**
- Layout global definitivo do shell (Header final, Footer, Breadcrumbs e BottomTabBar pertencem à Etapa 8).
- Edição de perfil do usuário e troca de senha pelo usuário logado (Etapa 16).
- Implementação dos handlers completos do carrinho além da mesclagem (Etapa 9).
- Subscrição e disparo de eventos de tempo real de pedidos/NFTs (Etapa 12).

## Decisions

### 1. `SessionController` como Máquina de Estados Pura (Não-React)
- **Decisão:** O gerenciamento do ciclo de vida da sessão (boot, login, logout, expiração, troca de usuário, sincronização entre abas) é centralizado em uma classe pura em TypeScript (`SessionController`), consumida pelo `SessionProvider` via React Context e injetada no `ShellContext`.
- **Alternativa Considerada:** Implementar toda a lógica em hooks React (`useSessionManager`).
- **Motivo da Escolha:** Hooks React dificultam testes de corrida assíncrona (como 3 chamadas concorrentes expirando a sessão) e tornam acoplada a limpeza de cache do TanStack Query e manipulação do `RealtimeClient`. A classe pura permite testes de unidade determinísticos com relógio controlado sem necessidade de renderizar componentes.

### 2. Ordem Estrita de Limpeza na Transição de Usuário
- **Decisão:** Quando o usuário muda (`A -> B` ou `A -> null`), a sequência de execução é estritamente:
  1. Cancelar todas as queries ativas do TanStack Query (`queryClient.cancelQueries()`).
  2. Executar `clearPrivateCache(queryClient)` expurgando do cache todas as queries que contenham o `userId` anterior.
  3. Desconectar o `RealtimeClient` e liberar event listeners.
  4. Rotacionar ou remover o token em `TokenStore`.
  5. Se houver novo usuário (`B`), conectar o `RealtimeClient` com o novo token e disparar queries.
- **Motivo:** Evita qualquer vazamento de dados do usuário anterior em componentes ainda montados na tela e cumpre a regra inviolável do projeto.

### 3. Expiração Concorrente e `ResumeStore`
- **Decisão:** O `SessionController` mantém uma flag booleana `isExpiring`. Ao interceptar um erro `SESSION_EXPIRED` (401), se `isExpiring === true`, chamadas paralelas subsequentes são ignoradas. O contexto é salvo no `sessionStorage` sob a chave `nft.resume.context`:
  ```typescript
  interface ResumeContext {
    userId: string;
    path: string;
    search: string;
    drafts: Record<string, unknown>;
    savedAt: string;
  }
  ```
- **Restauração:** Ao logar novamente:
  - Se `loginUserId === context.userId`: redireciona para `path + search` e devolve os rascunhos.
  - Se `loginUserId !== context.userId`: redireciona para `path + search`, mas descarta os rascunhos.
  - No logout explícito: o `ResumeStore` é imediatamente limpo.

### 4. Sanitização Rigorosa de Redirecionamento (`sanitizeRedirect`)
- **Decisão:** A função pura `sanitizeRedirect(target: string | undefined | null): string` valida:
  1. O valor deve ser uma string iniciada por exatamente uma barra `/` (não pode iniciar com `//` para prevenir schemaless open redirect como `//evil.com`).
  2. O valor não pode conter protocolos (`http:`, `https:`, `javascript:`, `data:`).
  3. O valor não pode apontar para `/login` ou `/cadastro` (evita loop infinito de redirecionamento).
  4. Qualquer valor que falhar nessas regras retorna o fallback seguro `/`.

### 5. Apresentação: Modal Desktop vs Tela Cheia Mobile
- **Decisão:**
  - Em desktop (>= 768px): As rotas `/login` e `/cadastro` renderizam o layout de modal centralizado (500x600px) sobre um fundo decorativo (`aria-hidden`), sem renderizar a Home real para evitar complexidade desnecessária e carregamentos de remotes prematuros.
  - Em mobile (< 768px): Renderiza o formulário ocupando a área útil com padding adequado.
  - As abas "Entrar" e "Criar conta" são implementadas como links TanStack Router com `aria-current="page"`, preservando o search param `redirect`.
  - O modal utiliza `DialogPrimitive` do `@nft/shared-ui` garantindo focus trap nativo, fechamento via `Esc` e devolução de foco ao elemento disparador.

### 6. Interceptores de Autenticação no `shared/http`
- **Decisão:** Adicionar callbacks configuráveis `getAuthToken?: () => string | null` e `getGuestId?: () => string | null` no `createHttpClient`.
  - Se `getAuthToken()` retornar token: adiciona header `Authorization: Bearer <token>`.
  - Se não houver token e `getGuestId()` retornar identificador: adiciona header `X-Session-Id: <guestId>`.
  - Se a resposta for 401 com código `SESSION_EXPIRED`: dispara callback `onSessionExpired()`.

## Risks / Trade-offs

- **[Risk] Sincronização entre abas causar loops de redirecionamento** → **Mitigação:** O listener do evento `storage` no `window` só reage se o valor de `localStorage['nft.session.token']` mudou efetivamente em relação ao estado interno do `SessionController`.
- **[Risk] Perda de rascunhos por expiração acidental de sessionStorage** → **Mitigação:** O `ResumeStore` utiliza `sessionStorage` que sobrevive a reloads e navegações na mesma aba. Se o usuário fechar a aba completamente, é o comportamento esperado de expiração de sessão do navegador.
- **[Risk] Lentidão no cálculo de PBKDF2 em testes automatizados** → **Mitigação:** Permitir que `iterations` do `PBKDF2` seja configurável, mantendo o padrão de 100.000 iterações em desenvolvimento e 100 iterações em ambiente de teste rápido (`NODE_ENV === 'test'`).
