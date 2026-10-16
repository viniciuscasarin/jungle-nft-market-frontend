# Proposal: Auth and Session

## Why

O Jungle NFT Marketplace necessita de um sistema completo e resiliente de autenticação e gerenciamento de sessão de usuário para viabilizar os fluxos de cadastro, login, proteção de rotas privadas, persistência de identidade e compras associadas a colecionadores.
Esta entrega estabelece o primeiro fluxo de usuário da aplicação, assegurando a inviolabilidade das regras de isolamento de dados entre usuários no cache do TanStack Query, expiração idempotente com recuperação de rascunhos, transição segura de carrinho de visitante para carrinho autenticado e aderência estrita aos layouts e acessibilidade de modal (desktop) e páginas dedicadas (mobile) do Figma.

## What Changes

- **Mocks de Autenticação (`libs/mocks/handlers`, `libs/mocks/core`)**:
  - Implementação completa dos handlers REST MSW para `/api/auth/signup`, `/api/auth/login`, `/api/auth/session` e `/api/auth/logout`.
  - Criptografia WebCrypto no backend simulado (PBKDF2-SHA-256 com salt individual por usuário e comparação em tempo constante).
  - Emissão de tokens opacos com TTL configurável (padrão 30 minutos), persistidos no banco do mock.
  - Cadastro com validação de formato e detecção de conflitos de e-mail e username (HTTP 409 `CONFLICT` com erros mapeados por campo).
  - Login seguro com mensagem genérica em credenciais inválidas (HTTP 401 `UNAUTHENTICATED`) e gatilho de mesclagem do carrinho de visitante (`mergeGuestCart`) preservando limites de estoque (`availableSupply`).
  - Logout idempotente revogando tokens ativos ou expirados.
- **Camadas do Domínio `auth` (`libs/auth/*` com tag `flow:shell`)**:
  - `auth/domain`: Funções puras de normalização de e-mail/username, sanitização rigorosa de URLs de retorno (`sanitizeRedirect`) e validações de regras de negócio.
  - `auth/data-access`: `sessionQueryOptions` (chave pública `['session']`), mutations `useLogin`, `useRegister`, `useLogout` (sem retry automático), `TokenStore` (`localStorage['nft.session.token']`) e `guestId` anônimo (`localStorage['nft.guest.id']`). Integração direta com `getAuthToken` e `getGuestId` do `HttpClient`.
  - `auth/feature`: `SessionController` (máquina de estados pura para gerenciar transições `A -> null`, `A -> B`, `null -> B`), `SessionProvider`, rotas `/login` e `/cadastro` no host com layout de modal sobre fundo decorativo `aria-hidden`.
  - `auth/ui`: Formulários apresentacionais de Login e Cadastro seguindo os tokens e primitivos de `shared/ui`, suporte a abas Entrar/Criar conta como links preservando `redirect`, tratamento de foco e atalhos (`Esc`), estados visuais (default, loading, field error, alert, disabled) e stories colocalizadas no Storybook.
- **Sessão, Expiração e Retomada de Contexto**:
  - Boot do Shell com resolução antecipada de sessão via `GET /api/auth/session` prevenindo flashes de estado anônimo em refresh.
  - Revalidação automática em foco da janela e navegação em rotas privadas (`staleTime: 30s`).
  - Expiração concorrente idempotente (`onSessionExpired` dispara uma única vez sob requisições paralelas).
  - `ResumeStore` (`sessionStorage`) para preservar `{ userId, path, search, drafts, savedAt }`, restaurando rascunhos para o mesmo usuário e descartando-os para usuários distintos.
  - Sincronização entre abas via evento `storage` (logout em uma aba reflete imediatamente nas demais, limpando o cache privado).
- **Refinamento de Contratos (`libs/shared-contracts`)**:
  - Regra de senha fortalecida no `SignUpInputSchema`: mínimo 8 caracteres, contendo pelo menos uma letra e um número.
- **Shell e Roteamento (`apps/shell`)**:
  - Integração do `Header` de `shared/ui` ao `useSession()`.
  - Inclusão das rotas `/login` e `/cadastro` na árvore de rotas com guarda de rotas privadas (`requireAuth`) e redirecionamento sanitizado.

## Capabilities

### New Capabilities
- `user-auth-and-session`: Gerenciamento completo de cadastro, login, logout, ciclo de vida de sessão, sanitização de redirecionamento, recuperação de contexto de rascunhos pós-expiração e isolamento de cache privado entre usuários.

### Modified Capabilities
- `domain-contracts`: Refinamento da validação de complexidade de senhas (mínimo de 8 caracteres com letras e números) e alinhamento dos contratos dos endpoints de autenticação e sessão.

## Impact

### Projetos Nx Afetados e Tags

| Projeto | Papel / Camada | Tags |
|---|---|---|
| `libs/shared/contracts` | Schemas zod, DTOs e tipos de auth | `scope:shared`, `type:domain`, `flow:shared` |
| `libs/shared/http` | Interceptores de token e session ID | `scope:shared`, `type:util`, `flow:shared` |
| `libs/mocks/core` | Criptografia PBKDF2 e estado de sessões | `scope:mocks`, `type:mocks`, `flow:shared` |
| `libs/mocks/handlers` | Handlers REST de auth e sessão | `scope:mocks`, `type:mocks`, `flow:shared` |
| `libs/auth/domain` | Regras puras e sanitização | `scope:auth`, `type:domain`, `flow:shell` |
| `libs/auth/data-access` | Queries, mutations e TokenStore | `scope:auth`, `type:data-access`, `flow:shell` |
| `libs/auth/ui` | Componentes visuais de formulários | `scope:auth`, `type:ui`, `flow:shell` |
| `libs/auth/feature` | Páginas, SessionController e Providers | `scope:auth`, `type:feature`, `flow:shell` |
| `libs/shell-kit` | Contexto de sessão exposto aos remotes | `scope:shell-kit`, `type:util`, `flow:shared` |
| `apps/shell` | Rotas, guards e Header conectado | `scope:shell`, `type:app`, `flow:shell` |
| `apps/web-e2e` | Testes Playwright do Fluxo 3 e a11y | `scope:e2e`, `type:app`, `flow:shell` |

### Premissas e Decisões
- **Fallback Visual do Figma**: Como a API do Figma atingiu o limite de taxa (erro 429), o desenvolvimento visual e a validação de frames baseiam-se nos screenshots de alta fidelidade e metadados arquivados em `design/screenshots/` e `docs/design/screens.md`.
- **Rotas de API Padronizadas**: Todos os endpoints de autenticação adotam o padrão REST `/api/auth/*` (`/signup`, `/login`, `/session`, `/logout`).
- **Limpeza Antes da Nova Sessão**: Ao alternar usuários, a limpeza do cache e cancelamento de queries ocorrem estritamente antes do registro da nova sessão no cliente.
- **Idempotência de Expiração**: Trava booleana local no `SessionController` para assegurar que múltiplas requisições 401 paralelas gerem um único redirecionamento e anúncio.

### Fora de Escopo
- Layout completo definitivo do shell (Footer, Breadcrumb, BottomTabBar, toasts globais: Etapa 8).
- Edição de perfil e alteração de senha (Etapa 16).
- Endpoints de carrinho além da mesclagem (Etapa 9).
- Provedor de rascunho real do checkout (Etapa 14).
- Eventos de tempo real via Socket.IO (Etapa 12).
