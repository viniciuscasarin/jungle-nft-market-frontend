# Tasks: Auth and Session

## 1. Contratos e Camada de Domínio

- [x] 1.1 Atualizar `SignUpInputSchema` em `@nft/shared-contracts` para validar senhas com no mínimo 8 caracteres contendo ao menos uma letra e um número, e verificar com testes de unidade em `libs/shared/contracts/src/auth.spec.ts`.
- [x] 1.2 Atualizar `createHttpClient` em `@nft/shared-http` para suportar callbacks `getAuthToken`, `getGuestId` e tratamento unificado de `SESSION_EXPIRED` (401) com callback `onSessionExpired`, e verificar com testes em `libs/shared/http/src/index.spec.ts`.
- [x] 1.3 Implementar funções puras em `@nft/auth-domain` (`sanitizeRedirect`, normalização de e-mail e username) e verificar com testes de unidade em `libs/auth/domain/src/index.spec.ts` cobrindo redirecionamentos inválidos (`//host`, `https://`, `javascript:`, `/login`, `/cadastro`).

## 2. Mocks e Handlers de Autenticação

- [x] 2.1 Implementar handlers MSW para `/api/auth/signup`, `/api/auth/login`, `/api/auth/session` e `/api/auth/logout` em `@nft/mocks-handlers`, integrando `auth-crypto` (PBKDF2-SHA-256), `mergeGuestCart` e geração de tokens opacos.
- [x] 2.2 Implementar testes de integração dos handlers em `@nft/mocks-handlers` via Vitest, verificando hash com salt, expiração com relógio injetável, mesclagem de carrinho e assegurando que nenhuma resposta serializada contém campos `password`, `passwordHash` ou `passwordSalt`.

## 3. Data Access e Persistência de Tokens

- [x] 3.1 Implementar `TokenStore` (`localStorage['nft.session.token']`) e `guestId` anônimo (`localStorage['nft.guest.id']` via `crypto.randomUUID`) em `@nft/auth-data-access`, e verificar com testes de unidade.
- [x] 3.2 Implementar `sessionQueryOptions` (chave pública `['session']`), mutations `useLogin`, `useRegister` e `useLogout` sem retry automático em `@nft/auth-data-access`, e verificar com testes de integração.

## 4. Orquestrador de Sessão e Contexto de Retomada

- [x] 4.1 Implementar `ResumeStore` (`sessionStorage['nft.resume.context']`) para preservar `{ userId, path, search, drafts, savedAt }`, restaurar rascunhos para o mesmo usuário e descartar para outro usuário, com testes em `libs/auth/data-access/src/resume-store.spec.ts`.
- [x] 4.2 Implementar `SessionController` (máquina de estados da sessão, cancelamento de queries, `clearPrivateCache`, reconexão de socket, expiração concorrente idempotente e sincronização entre abas via evento `storage`), e verificar com testes de unidade em `libs/auth/feature/src/session-controller.spec.ts`.
- [x] 4.3 Implementar `SessionProvider` e atualizar `ShellContext` em `@nft/shell-kit` para manter o contrato público de `useSession()`.

## 5. Componentes Apresentacionais de Formulários

- [x] 5.1 Implementar formulário apresentacional de Login em `@nft/auth-ui` com react-hook-form + zod, `aria-invalid`, `aria-describedby`, alerta com `role="alert"`, abas como links com `aria-current="page"`, botão com `aria-busy`, aviso em botões sociais/recuperação, e verificar com testes RTL e stories colocalizadas.
- [x] 5.2 Implementar formulário apresentacional de Cadastro em `@nft/auth-ui` com mapeamento de erros de campo da API (conflito 409), acessibilidade completa, e verificar com testes RTL e stories colocalizadas.

## 6. Rotas, Layout do Modal e Shell Integration

- [x] 6.1 Implementar páginas `/login` e `/cadastro` em `@nft/auth-feature` com layout de modal desktop sobre fundo decorativo `aria-hidden` e tela cheia mobile, focus trap, atalho `Esc` e devolução de foco ao elemento disparador.
- [x] 6.2 Integrar rotas `/login` e `/cadastro` na árvore de rotas de `apps/shell`, conectar o `Header` de `shared/ui` ao `useSession()` (botão Entrar vs avatar e nome com menu Sair) e proteger rotas privadas com `requireAuth`.

## 7. Testes End-to-End (E2E)

- [x] 7.1 Implementar testes Playwright para o Fluxo 3 em `apps/web-e2e` (cadastro, login, acesso direto a rota privada com retorno via redirect, refresh mantendo sessão, expiração com retomada de contexto, logout, troca de usuário A->B sem vazamento de dados, logout em outra aba).
- [x] 7.2 Implementar testes Playwright para o Fluxo 11 (acessibilidade do modal de autenticação: focus trap, tecla `Esc`, retorno de foco, navegação por teclado e atributos `aria-invalid`/`aria-describedby`).

## 8. Documentação e Verificação Final

- [x] 8.1 Atualizar documentação: `README.md` (credenciais fictícias dos usuários, como testar expiração e troca de conta), `docs/contracts.md`, `docs/mocks.md`, `docs/cache-policy.md` e `ARCHITECTURE.md` (§8, §10, §17, §18).
- [x] 8.2 Executar `pnpm typecheck`, `pnpm lint`, `pnpm test` e `pnpm build` nos projetos afetados pelo Nx, garantindo 100% de sucesso sem violações de fronteiras ou regras de terceiros.
