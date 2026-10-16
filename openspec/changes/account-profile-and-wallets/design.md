# Design: Account Profile and Wallets (`account-profile-and-wallets`)

## Context

Veja `proposal.md` para a motivação e a estratégia de priorização P0 (Caminho Feliz + Isolamento) vs. P1 (Débito Técnico). Atualmente:
- O host (`apps/shell`) já declara as rotas protegidas `/perfil` e `/carteiras` com `beforeLoad: requireAuth`, carregando `account/ProfilePage` e `account/WalletsPage` via Module Federation.
- A branch `feat/layouts` já contém o visual estático de `AccountLayout`, `AccountNavigation`, `AccountMobileHeader`, `ProfilePageContent` e `WalletsPageContent` em `libs/profile/ui/src/`.
- O banco simulado (`@nft/mocks-core`) já inicializa `db.users`, `db.profiles` e `db.wallets` com fixtures para `user_alice` e `user_bob`, além dos utilitários `verifyPassword`, `hashPassword`, `requireSession` e `transaction()`.
- As bibliotecas `@nft/profile-domain`, `@nft/profile-data-access`, `@nft/profile-feature`, `@nft/wallets-domain`, `@nft/wallets-data-access`, `@nft/wallets-feature` e `@nft/wallets-ui` ainda contêm apenas stubs iniciais, e `@nft/mocks-handlers` ainda não expõe handlers para `/api/profile/*` e `/api/wallets/*`.

## Goals / Non-Goals

**Goals:**
- Reaproveitar integralmente a estrutura visual da branch `feat/layouts`, dividindo responsabilidades entre `@nft/profile-ui` e `@nft/wallets-ui` sem violar `@nx/enforce-module-boundaries` nem regras de tokens de cor.
- Implementar os endpoints MSW de perfil, avatar, senha e carteiras em `@nft/mocks-handlers` com persistência em `getMockDatabase()` e isolamento estrito por `session.user.id`.
- Conectar `ProfilePage` e `WalletsPage` usando TanStack Query (`queryKeys.user(userId, 'profile')` e `queryKeys.user(userId, 'wallets')`) e formulários `react-hook-form` + `zod` com acessibilidade completa (`aria-invalid`, `aria-describedby`, live regions).

**Non-Goals:**
- Não implementar crop de imagem, upload multipart binário ou armazenamento externo de arquivos para o avatar (simplificado para Data URL / URL simulada em P1).
- Não criar integração real com provedores Web3 (MetaMask/WalletConnect/Coinbase) ou resolução on-chain de ENS.
- Não implementar telas funcionais para Atividade, Lista de interesse, Ofertas, Arquivos baixados ou Suporte (tratados via `useUnavailable()`).

## Decisions

### 1. Organização de Camadas e Reaproveitamento da Branch `feat/layouts`
- **Decisão**:
  - `@nft/profile-ui` (`scope:profile, type:ui, flow:account`): exporta `AccountLayout`, `AccountNavigation`, `AccountMobileHeader` e `ProfilePageContent` (refatorado para receber valores iniciais, handlers de submit de perfil, submit de senha, upload/remoção de avatar, estado de submissão e erros de campo).
  - `@nft/wallets-ui` (`scope:wallets, type:ui, flow:account`): exporta `WalletsPageContent` (extraído de `feat/layouts` e adaptado para receber carteira principal, carteira secundária opcional, callbacks de salvamento de carteira principal e secundária, opção "Igual à carteira principal" e erros de campo).
  - `@nft/profile-feature` e `@nft/wallets-feature`: orquestram `useSession()`, `useShell()`, hooks de `data-access`, navegação do TanStack Router entre `/perfil` e `/carteiras`, `useUnavailable()` para itens fora de escopo e `logout()` no botão "Sair".
- **Alternativas consideradas**: Manter `WalletsPageContent` dentro de `@nft/profile-ui` como estava na branch `feat/layouts`. Descartado porque o prompt e a arquitetura determinam que os componentes apresentacionais de carteiras vivam em `libs/wallets/ui`.

### 2. Contratos e Endpoints MSW (`/api/profile/*` e `/api/wallets/*`)
- **Decisão**:
  - Estender `ProfileSchema` / `UpdateProfileInputSchema` em `@nft/shared-contracts` para contemplar os campos visíveis no formulário de `feat/layouts`: `displayName`, `username`, `email`, `bio`, `avatarUrl`, `ensName` (opcional) e `walletNickname` (opcional).
  - Estender `WalletSchema` / `CreateWalletInputSchema` em `@nft/shared-contracts` com `walletType` (`'metamask' | 'coinbase' | 'walletconnect'`, default `'metamask'`), `displayName` opcional, `email` opcional, `referralCode` opcional e `notes` opcional, preservando compatibilidade retroativa com as fixtures existentes (`address`, `network`, `ensName`, `label`, `isPrimary`).
  - Nos handlers MSW (`libs/mocks/handlers/src/profile.ts` e `libs/mocks/handlers/src/wallets.ts`):
    - Aceitar tanto `PUT /api/profile` quanto `PATCH /api/profile` para atualização de perfil (verificando conflito de `email` e `username` contra outros usuários com `409 CONFLICT` e `fieldErrors`, e sincronizando `db.users`, `db.profiles` e `db.sessions`).
    - Implementar `POST /api/profile/avatar` (recebendo `{ avatarUrl: string }` com Data URL ou URL válida) e `DELETE /api/profile/avatar` (limpando `avatarUrl = null`).
    - Aceitar tanto `POST /api/profile/password` quanto `POST /api/profile/change-password`, validando `currentPassword` com `verifyPassword` (retornando `400 VALIDATION_ERROR` com `fieldErrors.currentPassword` quando incorreta) e gravando o novo hash via `hashPassword`.
    - Implementar `GET /api/wallets` (retornando `{ primary, secondary }` do usuário autenticado) e `POST /api/wallets` / `PUT /api/wallets` (criando ou atualizando a carteira principal ou secundária conforme `isPrimary`, validando `0x` + 40 hex e ENS sem `.eth`).

### 3. Isolamento de Cache Privado e Sincronização de Sessão
- **Decisão**:
  - Todas as queries de perfil e carteiras utilizam `queryKeys.user(userId, 'profile')` e `queryKeys.user(userId, 'wallets')` com `staleTime: 5 * 60 * 1000` (5 min, conforme `ARCHITECTURE.md` §10).
  - Ao atualizar perfil ou avatar, a mutation invalida `queryKeys.user(userId, 'profile')` e `queryKeys.session()`, atualizando o cabeçalho da aplicação.
  - No logout ou troca de usuário, o `SessionController` existente já invoca `clearPrivateCache(queryClient, prevUserId)`, removendo todas as entradas `['user', userId, ...]`.

### 4. Simplificações Pragmáticas de Prazo (Débitos Técnicos P1)
- **Decisão**:
  - **Avatar**: O input `<input type="file" accept="image/*" />` converte o arquivo selecionado via `FileReader.readAsDataURL` (ou aceita um fallback determinístico em testes) e envia a string resultante em `POST /api/profile/avatar`. Não há biblioteca externa de recorte de imagem.
  - **Mobile**: Reaproveita o empilhamento responsivo (`grid-cols-1 md:grid-cols-2`) e o `AccountMobileHeader` já construídos em `feat/layouts`, garantindo zero overflow em `390px` sem duplicar formulários.
  - **Storybook**: Apenas 1 story CSF3 essencial por página/componente principal em `profile-ui` e `wallets-ui`.

## Risks / Trade-offs

- **[Risk] Cores hexadecimais literais vindas de `feat/layouts` (ex.: `bg-[#140d0a]`) violarem a diretriz de tokens** → **Mitigation**: Substituir todas as classes hexadecimais literais por tokens semânticos equivalentes (`bg-ink`, `bg-surface-card`, `bg-surface-raised`, `border-border-default`) durante a extração para `profile-ui` e `wallets-ui`.
- **[Risk] Divergência entre verbos/paths REST mencionados no prompt (`PUT /profile`, `POST /profile/password`) e em `docs/contracts.md` (`PATCH /api/profile`, `POST /api/profile/change-password`)** → **Mitigation**: Registrar ambos os handlers como aliases no MSW (`defineHandler` para `PUT` e `PATCH` em `/profile`, e para `/profile/password` e `/profile/change-password`), garantindo funcionamento em qualquer chamada.
- **[Risk] Tamanho de Data URL no `localStorage` ao fazer upload de avatar no mock** → **Mitigation**: O `StorageAdapter` de `@nft/mocks-core` já degrada graciosamente para memória caso a quota de `localStorage` seja excedida, e os testes utilizam payloads enxutos.
