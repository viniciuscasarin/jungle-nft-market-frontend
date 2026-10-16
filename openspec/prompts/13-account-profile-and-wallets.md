Crie a change `account-profile-and-wallets`.

## Contexto
Implementa a área de Conta do colecionador no remote `apps/account` (`libs/profile/{domain,data-access,feature,ui}`, `libs/wallets/{feature,ui}` consumindo `libs/wallets/{domain,data-access}` da Etapa 9 e handlers em `libs/mocks/handlers`), conforme `openspec/project.md`, `ARCHITECTURE.md` (§6, §8, §18 e §19), `AGENTS.md` e `challenge.md`.
Referência Figma (arquivo cópia `dKMJKBVdX6q0Ym4OX5vd3V`, página `0:1`): Perfil do colecionador `9:1238` e Carteiras `9:1670`; **sem frames mobile** (adaptar dos frames desktop seguindo `docs/design/responsive.md`).

**IMPORTANTE — Layout já pronto na branch `feat/layout`:**
Os layouts das páginas de Perfil e Carteiras (`AccountSidebar` com links de Perfil, Carteiras e itens fora de escopo; formulário de perfil com controles de Avatar Alterar/Remover e seção de alteração de senha; formulário e cards de carteiras principal e secundária com seletor de rede, tipo de carteira, campo ENS com `.eth`, código de indicação e observação) **já estão prontos na branch `feat/layout` apenas com o visual estático**. Extraia/reaproveite esse visual em `libs/profile/ui` e `libs/wallets/ui` e conecte-o em `libs/profile/feature`, `libs/wallets/feature` e `apps/account` ao backend simulado e às regras de negócio.

**URGENTE — Prazo crítico (Foco no Caminho Feliz e Débito Técnico):**
Estamos muito perto do deadline do projeto. **Foque o máximo possível em ligar rapidamente os formulários prontos de Perfil e Carteiras da branch `feat/layout` aos endpoints MSW e garantir o isolamento por `userId`**, propondo na `proposal` e no `tasks.md` simplificações pragmáticas e **Débitos Técnicos** documentados em `ARCHITECTURE.md` §17 para ganhar velocidade. Separe as tasks em **P0 (Caminho Feliz — Obrigatório agora)** e **P1 (Débito Técnico)**.

## Estratégia de Prazo Crítico e Débito Técnico (P0 vs P1)
- **P0 (Fazer funcionar agora — Caminho Feliz + Isolamento de Usuário)**:
  - Reaproveitar os layouts prontos de Perfil e Carteiras de `feat/layout` em `ProfilePage` e `WalletsPage` (`apps/account`), corrigindo apenas o mapeamento dos rótulos visíveis ("E-mail", "Apelido da carteira") para os campos reais do contrato (`figma-findings.md` §5.3).
  - Conectar edição de perfil (`GET/PUT /profile`), alteração de senha (`POST /profile/password` validando hash no mock) e edição/cadastro de carteira principal e secundária (`wallets/data-access` com validação `0x` + 40 hex), tudo com query keys privadas (`privateKey(userId, ...)`) e persistência no refresh.
  - Ligar itens fora de escopo do `AccountSidebar` (Atividade, Watchlist, Ofertas, Downloads, Suporte) ao aviso `"indisponível nesta demonstração"`.
- **P1 (Candidatos a Débito Técnico para acelerar a entrega — documentar em `ARCHITECTURE.md` §17)**:
  - **Upload de Avatar (`POST /profile/avatar` e `DELETE /profile/avatar`)**: em vez de implementar crop/leitura complexa de `FileReader`/multipart, o botão "Alterar" pode ler um `<input type="file">` convertendo direto para Data URL simples (ou alternar entre avatares pré-definidos de demonstração no mock) e "Remover" limpa `avatarUrl = null`.
  - **Adaptação mobile**: usar empilhamento responsivo simples (`flex-col lg:flex-row` e `grid-cols-1 lg:grid-cols-2`) sobre o layout existente de `feat/layout` para evitar overflow em `390px`, sem criar componentes mobile separados.
  - **Stories CSF3**: manter apenas 1 story básico para `ProfilePage` e `WalletsPage` ou registrar a cobertura completa de stories como débito técnico.

## Requisitos
1. **Reaproveitamento do layout (`feat/layout`) e fronteiras de módulo**:
   - Extraia os componentes apresentacionais vindos de `feat/layout` em `libs/profile/ui` e `libs/wallets/ui` (`flow:account`), sem fetch, garantindo que os rótulos visíveis prevaleçam sobre os nomes de camadas do Figma.
   - Conecte as páginas em `libs/profile/feature` e `libs/wallets/feature` e exponha `ProfilePage` e `WalletsPage` em `apps/account` (`requireAuth`).
2. **Perfil, Avatar e Alteração de Senha (`profile/*`, `mocks/handlers`)**:
   - Handlers MSW (`GET /profile`, `PUT /profile`, `POST /profile/avatar`, `DELETE /profile/avatar`, `POST /profile/password`) isolados por `userId`, consumidos com `privateKey(userId, 'profile')`.
   - Edição de perfil e alteração de senha com `react-hook-form` + `zod`, mapeando erros da API (`CONFLICT`, senha atual incorreta, `fieldErrors`) para os campos (`aria-invalid` + `aria-describedby`), persistindo após refresh.
   - Upload simulado e remoção de avatar persistidos no mock.
3. **Carteiras principal e secundária (`wallets/*`)**:
   - Exibir, cadastrar e editar as carteiras principal e secundária do usuário autenticado (`privateKey(userId, 'wallets')`), validando endereço `0x` + 40 hex, rede e tipo de carteira, com persistência após refresh.
4. **Menu lateral (`AccountSidebar`), mobile e isolamento**:
   - Navegação entre Perfil e Carteiras; itens fora de escopo exibem `"indisponível nesta demonstração"`.
   - Layout responsivo sem overflow em `390px` e limpeza total do cache privado no logout/troca de usuário (`clearPrivateCache`).
5. **Testes e documentação**:
   - Testes focados no caminho feliz do Fluxo 8 (Vitest + 1 spec E2E cobrindo editar perfil, avatar, senha, carteira e refresh). Registrar em `ARCHITECTURE.md` §17/§19 as simplificações e débitos técnicos.

## Cenários de aceitação
- WHEN edito os dados do perfil, altero/removo o avatar ou atualizo as carteiras (com endereço `0x` + 40 hex válido) e dou refresh THEN todas as alterações persistem no mock para o meu usuário.
- WHEN altero a senha informando a senha atual correta THEN consigo fazer logout e autenticar com a nova senha; se a senha atual estiver errada THEN vejo o erro associado ao campo.
- WHEN clico em Atividade, Watchlist, Ofertas, Downloads ou Suporte no menu da conta THEN vejo o aviso "indisponível nesta demonstração".
- WHEN faço logout e entro com outro usuário THEN nenhum dado de perfil ou carteira do usuário anterior é exibido.

## Fora de escopo
Funcionalidades reais de suporte, atividade on-chain, ofertas ou downloads.

Gere proposal, specs e tasks (separando claramente P0 Caminho Feliz vs P1 Débito Técnico). Não implemente nesta etapa: a implementação segue depois, uma task por vez, com pausa entre elas.