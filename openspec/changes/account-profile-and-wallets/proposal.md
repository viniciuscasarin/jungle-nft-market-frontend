# Proposal: Account Profile and Wallets (`account-profile-and-wallets`)

## Why

O colecionador autenticado precisa gerenciar seus dados cadastrais, avatar, senha e carteiras conectadas (principal e secundária) no remote `apps/account` (`/perfil` e `/carteiras`), garantindo isolamento estrito por `userId`, persistência após refresh e suporte às carteiras utilizadas no checkout. Como estamos próximos do deadline, esta change prioriza a conexão rápida dos layouts já existentes na branch `feat/layouts` aos endpoints MSW e ao cache privado do TanStack Query (**P0 — Caminho Feliz e Isolamento**), registrando simplificações pragmáticas como **Débitos Técnicos (P1)** em `ARCHITECTURE.md` §17.

## What Changes

- **Extração e adaptação dos layouts de `feat/layouts` para `@nft/profile-ui` e `@nft/wallets-ui`**:
  - Migração e refinamento de `AccountLayout`, `AccountNavigation`, `AccountMobileHeader` e `ProfilePageContent` em `@nft/profile-ui`, e `WalletsPageContent` em `@nft/wallets-ui`, substituindo valores estáticos por props controladas, utilizando tokens do tema (sem hexadecimais literais) e assegurando que os rótulos visíveis do Figma ("E-mail", "Apelido da carteira") prevaleçam sobre os nomes internos de camadas.
- **Contratos e Handlers MSW de Perfil e Carteiras (`@nft/shared-contracts`, `@nft/mocks-handlers`)**:
  - Expansão compatível dos schemas de perfil e carteiras em `@nft/shared-contracts` para suportar atualização cadastral, upload/remoção de avatar, troca de senha e salvamento de carteira principal e secundária (incluindo tipo de carteira `metamask | walletconnect | coinbase`, rede, endereço `0x` + 40 hex, ENS sem `.eth`, apelido e observação/código de indicação).
  - Novos handlers MSW em `@nft/mocks-handlers` (`GET /api/profile`, `PUT /api/profile` e `PATCH /api/profile`, `POST /api/profile/avatar`, `DELETE /api/profile/avatar`, `POST /api/profile/password` e `POST /api/profile/change-password`, `GET /api/wallets`, `POST /api/wallets`, `PUT /api/wallets/:role`) operando sobre `getMockDatabase()` com isolamento por `session.user.id`, validação de hash de senha via `verifyPassword`/`hashPassword` e persistência transacional (`transaction()`).
- **Domínio e Data-Access de Perfil e Carteiras (`@nft/profile-domain`, `@nft/profile-data-access`, `@nft/wallets-domain`, `@nft/wallets-data-access`)**:
  - Funções puras e schemas de formulário Zod para validação de perfil, alteração de senha e endereço hexadecimal (`0x` + 40 hex) / ENS sem `.eth`.
  - Query options e mutations TanStack Query com chaves estritamente privadas `queryKeys.user(userId, 'profile')` e `queryKeys.user(userId, 'wallets')`, invalidação pós-mutation e atualização sincronizada da sessão quando aplicável.
- **Páginas Conectadas e Exposição no Remote (`@nft/profile-feature`, `@nft/wallets-feature`, `apps/account`)**:
  - Conexão dos formulários de perfil, avatar, senha e carteiras com `react-hook-form` + `zod`, mapeamento de erros da API (`CONFLICT`, `VALIDATION_ERROR`, `fieldErrors`) para os campos (`aria-invalid` + `aria-describedby`), estados de loading (`Skeleton` com `aria-busy="true"`), erro (com retry) e sucesso anunciado em live region/toast.
  - Integração da navegação lateral (`AccountNavigation` e `AccountMobileHeader`) entre `/perfil` e `/carteiras`, acionamento de `useUnavailable()` (`"indisponível nesta demonstração"`) para os itens fora de escopo (`Atividade`, `Lista de interesse`, `Ofertas`, `Arquivos baixados`, `Suporte`) e execução de `logout` ao clicar em `Sair`.

### Estratégia P0 (Caminho Feliz) vs. P1 (Débito Técnico)

- **P0 (Obrigatório agora — Caminho Feliz + Isolamento por Usuário)**:
  - Reaproveitar os layouts prontos da branch `feat/layouts` em `ProfilePage` e `WalletsPage` (`apps/account`), corrigindo o mapeamento dos rótulos visíveis ("E-mail", "Apelido da carteira") para os campos reais do contrato.
  - Conectar edição de perfil (`GET/PUT /api/profile`), alteração de senha (`POST /api/profile/password` validando hash no mock) e edição/cadastro de carteira principal e secundária (`wallets/data-access` com validação `0x` + 40 hex), tudo com query keys privadas (`queryKeys.user(userId, ...)`) e persistência após refresh.
  - Ligar itens fora de escopo do menu lateral (`Atividade`, `Lista de interesse`, `Ofertas`, `Arquivos baixados`, `Suporte`) ao aviso explícito `"indisponível nesta demonstração"`.
- **P1 (Débito Técnico documentado em `ARCHITECTURE.md` §17 para ganho de velocidade)**:
  - **Upload de Avatar (`POST /api/profile/avatar` e `DELETE /api/profile/avatar`)**: leitura direta do `<input type="file">` convertendo para Data URL simples (ou avatar determinístico de demonstração no mock) e limpeza `avatarUrl = null` no remover, sem cropper de imagem ou upload multipart complexo.
  - **Adaptação mobile**: uso do empilhamento responsivo já presente em `feat/layouts` (`grid-cols-1 md:grid-cols-2`, `AccountMobileHeader`) para evitar overflow horizontal em `390px`, sem criar árvore de componentes mobile separada.
  - **Stories CSF3**: manutenção de apenas 1 story básico para `ProfilePageContent` e `WalletsPageContent`, registrando a cobertura exaustiva de variantes como débito técnico.

## Capabilities

### New Capabilities
- `account-profile-and-wallets`: Gestão de perfil do colecionador, avatar, alteração de senha, cadastro/edição de carteiras principal e secundária, navegação lateral da conta e isolamento de cache privado por usuário no remote `apps/account`.

### Modified Capabilities
<!-- Nenhuma spec existente tem seus requisitos de nível de especificação alterados. -->

## Out of Scope & Assumptions

### Fora de Escopo
- Funcionalidades reais de suporte, atividade on-chain, lista de interesse/watchlist no menu de conta, ofertas recebidas/enviadas ou downloads de arquivos.
- Assinatura real em extensões de navegador (MetaMask, WalletConnect, Coinbase Wallet) ou validação on-chain de endereços e domínios ENS.
- Recorte (crop) interativo ou upload binário multipart de imagens de avatar.

### Premissas (registradas também em `ARCHITECTURE.md`)
1. Os rótulos visíveis nos frames do Figma (`9:1238` e `9:1670`) prevalecem sobre os nomes internos das camadas (`Bio Field` rotulado como `"E-mail"`, `Website Field` rotulado como `"Apelido da carteira"`).
2. O endereço de carteira é validado por formato (`0x` seguido de 40 caracteres hexadecimais) e o campo ENS armazena apenas o identificador sem o sufixo `.eth` (o seletor de domínio `.eth`/`.xyz` é visual/auxiliar na camada de UI).
3. A opção "Igual à carteira principal" / adição de carteira secundária permite cadastrar ou atualizar a carteira secundária do usuário autenticado, respeitando a validação de formato e persistindo no banco simulado do MSW.

## Impact

### Projetos Nx Afetados e Tags

| Projeto Nx | Path | Tags (`scope`, `type`, `flow`) | Papel na Change |
|---|---|---|---|
| `shared-contracts` | `libs/shared/contracts` | `scope:contracts`, `type:util`, `flow:shared` | Schemas Zod de perfil, senha, avatar e carteiras |
| `mocks-fixtures` | `libs/mocks/fixtures` | `scope:mocks`, `type:mocks`, `flow:shared` | Fixtures iniciais de usuários, perfis e carteiras |
| `mocks-handlers` | `libs/mocks/handlers` | `scope:mocks`, `type:mocks`, `flow:shared` | Handlers MSW REST para `/api/profile/*` e `/api/wallets/*` |
| `profile-domain` | `libs/profile/domain` | `scope:profile`, `type:domain`, `flow:shared` | Schemas de formulário e regras puras de perfil e senha |
| `profile-data-access` | `libs/profile/data-access` | `scope:profile`, `type:data-access`, `flow:shared` | Queries e mutations privadas (`queryKeys.user(userId, 'profile')`) |
| `profile-ui` | `libs/profile/ui` | `scope:profile`, `type:ui`, `flow:account` | `AccountLayout`, `AccountNavigation`, `AccountMobileHeader`, `ProfilePageContent` |
| `profile-feature` | `libs/profile/feature` | `scope:profile`, `type:feature`, `flow:account` | `ProfileFeaturePage` conectada ao `data-access`, sessão e feedback |
| `wallets-domain` | `libs/wallets/domain` | `scope:wallets`, `type:domain`, `flow:shared` | Regras puras de validação de carteira (`0x` + 40 hex, ENS) |
| `wallets-data-access` | `libs/wallets/data-access` | `scope:wallets`, `type:data-access`, `flow:shared` | Queries e mutations privadas (`queryKeys.user(userId, 'wallets')`) |
| `wallets-ui` | `libs/wallets/ui` | `scope:wallets`, `type:ui`, `flow:account` | `WalletsPageContent` apresentacional extraído de `feat/layouts` |
| `wallets-feature` | `libs/wallets/feature` | `scope:wallets`, `type:feature`, `flow:account` | `WalletsFeaturePage` conectada ao `data-access`, sessão e feedback |
| `account` | `apps/account` | `scope:account`, `type:app`, `flow:account` | Exposição de `./ProfilePage` e `./WalletsPage` via Module Federation |
| `web-e2e` | `apps/web-e2e` | `scope:e2e`, `type:e2e` | Spec Playwright E2E do Fluxo 8 (perfil, avatar, senha, carteiras e isolamento) |
