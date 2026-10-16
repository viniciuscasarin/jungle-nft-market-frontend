# Tasks: Account Profile and Wallets (`account-profile-and-wallets`)

## 1. [P0 — Caminho Feliz] Contratos e Handlers MSW de Perfil e Carteiras

- [x] 1.1 Estender `libs/shared/contracts/src/profile.ts` e `libs/shared/contracts/src/wallets.ts` para suportar campos do formulário de conta (`username`, `email`, `ensName`, `walletNickname` no perfil; `walletType`, `displayName`, `email`, `referralCode`, `notes` nas carteiras; schema de upload de avatar), atualizar `docs/contracts.md` e validar com `pnpm --filter @nft/shared-contracts test`
- [x] 1.2 Implementar os handlers MSW `libs/mocks/handlers/src/profile.ts` e `libs/mocks/handlers/src/wallets.ts` (`GET/PUT/PATCH /api/profile`, `POST/DELETE /api/profile/avatar`, `POST /api/profile/password` e `/change-password`, `GET/POST/PUT /api/wallets`), registrá-los em `libs/mocks/handlers/src/index.ts` com isolamento por `session.user.id`, validação de hash PBKDF2 (`verifyPassword`/`hashPassword`), erros `CONFLICT`/`VALIDATION_ERROR` com `fieldErrors` e testes unitários em `libs/mocks/handlers/src/profile-wallets.spec.ts`

## 2. [P0 — Caminho Feliz] Domínio e Data-Access (`profile` e `wallets`)

- [x] 2.1 Implementar `@nft/profile-domain` (`libs/profile/domain/src/index.ts`) e `@nft/wallets-domain` (`libs/wallets/domain/src/index.ts`) com schemas de formulário (`react-hook-form` + `zod`), validação de endereço `0x` + 40 hex, ENS sem `.eth`, confirmação de nova senha e testes unitários Vitest
- [x] 2.2 Implementar `@nft/profile-data-access` (`libs/profile/data-access/src/index.ts`) e `@nft/wallets-data-access` (`libs/wallets/data-access/src/index.ts`) com query options e mutations privadas (`queryKeys.user(userId, 'profile')` e `queryKeys.user(userId, 'wallets')`), invalidação de cache pós-mutation e testes Vitest cobrindo isolamento por `userId` e limpeza via `clearPrivateCache`

## 3. [P0 — Caminho Feliz] Reaproveitamento de UI (`feat/layouts`) e Páginas Conectadas (`apps/account`)

- [ ] 3.1 Extrair e adaptar os componentes apresentacionais de `feat/layouts` para `@nft/profile-ui` (`AccountLayout`, `AccountNavigation`, `AccountMobileHeader`, `ProfilePageContent`) e `@nft/wallets-ui` (`WalletsPageContent`), substituindo cores hexadecimais literais por tokens do tema, aplicando os rótulos visíveis do Figma ("E-mail", "Apelido da carteira"), adicionando suporte a `aria-invalid`/`aria-describedby` e verificando com testes unitários em `profile-ui` e `wallets-ui`
- [ ] 3.2 Implementar as páginas conectadas em `@nft/profile-feature` (`ProfileFeaturePage`) e `@nft/wallets-feature` (`WalletsFeaturePage`), expondo-as em `apps/account/src/ProfilePage.tsx` e `apps/account/src/WalletsPage.tsx` com estados de loading (`Skeleton` com `aria-busy="true"`), erro (com `retry`), mapeamento de `fieldErrors` da API, navegação entre `/perfil` e `/carteiras`, acionamento de `useUnavailable()` (`"indisponível nesta demonstração"`) para itens fora de escopo (`Atividade`, `Lista de interesse`, `Ofertas`, `Arquivos baixados`, `Suporte`) e `logout` no item `Sair`, validando com testes em `profile-feature`, `wallets-feature` e `apps/account`

## 4. [P1 — Débito Técnico Pragmático] Avatar Simplificado, Responsividade Mobile, Stories e Documentação

- [ ] 4.1 Conectar o controle de Avatar (`Alterar` convertendo `<input type="file">` para Data URL simples em `POST /api/profile/avatar` e `Remover` chamando `DELETE /api/profile/avatar`), adicionar 1 story CSF3 básico para `ProfilePageContent` e `WalletsPageContent`, validar empilhamento responsivo sem overflow em `390px` e registrar os débitos técnicos e premissas em `ARCHITECTURE.md` (§17 e §19) e `README.md`

## 5. [P0 — Verificação Final] Teste E2E Playwright (Fluxo 8) e Quality Gates

- [ ] 5.1 Criar a spec E2E `apps/web-e2e/src/account-profile-wallets.spec.ts` cobrindo o Fluxo 8 completo: editar perfil, alterar/remover avatar, alterar senha (incluindo erro de senha atual incorreta e novo login com a nova senha), cadastrar/editar carteira principal e secundária (`0x` + 40 hex), persistência após refresh, clique nos itens fora de escopo (`"indisponível nesta demonstração"`) e isolamento de dados após logout e login com outro usuário
- [ ] 5.2 Executar `typecheck`, `lint`, `test` e `build` nos projetos afetados (e a spec E2E criada) garantindo 100% de aprovação sem violações de fronteira
