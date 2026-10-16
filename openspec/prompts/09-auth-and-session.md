Crie a change `auth-and-session`.

## Contexto
Primeira entrega de fluxo do NFT Marketplace, conforme `openspec/project.md`, `ARCHITECTURE.md` (§8 Sessão, §9 Carrinho, §18 UX) e `AGENTS.md`. Usa a infraestrutura da change `mocks-core-and-scenarios` (banco, relógio e PRNG injetáveis, cenários, perfis de rede, `requireSession`, `parseBody`, `mergeGuestCart`, `createTestServer`), os clientes de `shared/http`, `shared/query`, `shared/router` e `shared/realtime`, o `ShellContext` e o `RemoteBoundary` da change `module-federation-contract` e os componentes de `shared/ui` (incluindo o layout de modal). Contratos de sessão, cadastro, login e logout já existem em `shared/contracts` e `docs/contracts.md`; use-os e, se o frame do Figma exigir ajuste, altere o schema e a documentação na mesma change.

Figma (arquivo cópia `dKMJKBVdX6q0Ym4OX5vd3V`): Login desktop `9:115` (modal `70381:239`), Cadastro desktop `9:1022` (modal `70383:239`), Login mobile `16:1022`, Cadastro mobile `16:1228`. Antes de implementar, confirme os campos e rótulos reais de cada frame com `get_design_context` e compare com `design/screenshots`. Não invente campos; se o Figma divergir do contrato, o Figma vence e o contrato é ajustado e documentado. Sem acesso ao Figma, pare e avise.

## Requisitos

### A. Mocks de auth (`mocks/handlers`, `mocks/core`)
1. Handlers de cadastro, login, `GET /session` e logout, usando os paths de `docs/contracts.md`, o wrapper de rede e `ApiError`.
2. **Senha nunca em claro**: hash com salt por usuário via WebCrypto (PBKDF2-SHA-256, iterações configuráveis; valor reduzido em teste), comparação em tempo constante, em `mocks/core`. O estado e a persistência guardam só `passwordHash` e `passwordSalt`. Nenhuma resposta contém `password`, `passwordHash` ou `passwordSalt` (teste serializa todas as respostas de auth e verifica).
3. **Token opaco** gerado pelo PRNG injetável, com `expiresAt = now + ttl` (padrão 30 min, sobrescrevível por cenário e por `expireSession()`), sessão persistida para sobreviver a refresh. Token ausente, desconhecido ou revogado: `UNAUTHENTICATED`. Token vencido: `SESSION_EXPIRED`.
4. **Cadastro**: valida com o schema de `shared/contracts` e devolve `VALIDATION_ERROR` com `fieldErrors` por campo. E-mail e usuário já existentes (comparação normalizada, sem diferenciar caixa nem espaços nas pontas) devolvem `CONFLICT` com `fieldErrors` no campo correspondente. Sucesso cria usuário, perfil básico e sessão (já autenticado).
5. **Login**: credenciais inválidas devolvem `UNAUTHENTICATED` com mensagem genérica, sem revelar se o e-mail existe. Sucesso devolve a sessão e aciona `mergeGuestCart(guestId, userId)` no estado do mock quando o header de visitante vier na requisição; o carrinho anônimo é removido. A resposta informa a mesclagem conforme o contrato de sessão (itens mesclados e ajustados por disponibilidade).
6. **Logout**: revoga o token; idempotente (token já revogado ou vencido também responde sucesso).
7. Regras de senha no schema de `shared/contracts` (reuso por cliente e mock): no mínimo 8 caracteres, com ao menos uma letra e um número.
8. Dois usuários das fixtures com credenciais fictícias documentadas no `README.md`.

### B. Camadas `auth/*` (domínio com `flow:shell`)
9. `auth/domain`: tipos e validadores puros do que não pertence ao contrato (normalização de e-mail e usuário, `sanitizeRedirect`), sem I/O e sem React.
10. `auth/data-access`: `sessionQueryOptions` (chave `['session']`, não privada por `userId`, removida no logout), mutations `useLogin`, `useRegister`, `useLogout` **sem retry**, e leitura/gravação do token em `TokenStore` (localStorage, chave `nft.session.token`) e do `guestId` anônimo (`nft.guest.id`, gerado com `crypto.randomUUID`). Esses valores alimentam `getAuthToken` e `getGuestId` do `HttpClient` do host.
11. `auth/feature`: rotas `/login` e `/cadastro` com o layout de modal sobre fundo decorativo (`aria-hidden`, sem renderizar a Home real), `SessionController` e `SessionProvider`.
12. `auth/ui`: formulários apresentacionais de Login e Cadastro, com stories colocalizadas (default, erro de campo, erro geral, conflito, carregando, desabilitado) sem fetch e sem MSW, link ao nodeId do Figma e axe sem violações.

### C. Formulários e acessibilidade
13. react-hook-form + zod (`@hookform/resolvers`), erros de campo vindos da API mapeados para os campos, `aria-invalid` e `aria-describedby` ligados à mensagem, foco movido para o primeiro campo inválido no envio, erro geral em região `role="alert"`, botão de envio bloqueado e com `aria-busy` durante a mutation (sem envio duplicado).
14. Login com credenciais inválidas: mensagem genérica, senha limpa e foco no campo de senha.
15. Abas Entrar/Criar conta como no Figma, implementadas como links entre as rotas `/login` e `/cadastro` com `aria-current="page"`, preservando `redirect`.
16. Botões sociais e "Esqueceu a senha?" visíveis, com aviso "indisponível nesta demonstração" em live region, sem aparentar sucesso.
17. Modal: foco preso, `Esc` e botão de fechar. Fechar volta uma entrada se a anterior for do app, senão vai para `/`. O foco retorna ao gatilho quando ele ainda existe no DOM, senão ao `main` do destino.
18. Anúncio acessível (live region) de sucesso de login e cadastro, e do ajuste de itens ao mesclar o carrinho anônimo.

### D. Redirecionamento
19. `redirect` (path + search) validado em schema de search param e **sanitizado**: só caminhos internos que começam com um único `/`, fora de `/login` e `/cadastro`. Qualquer outro valor é ignorado e leva a `/`. Rotas privadas sem sessão levam a `/login?redirect=<path+search>`; usuário autenticado que abre `/login` ou `/cadastro` é enviado ao `redirect` ou a `/`.

### E. Sessão
20. **Boot**: o host resolve `GET /session` com o token guardado antes de renderizar rotas privadas, com estados `loading | authenticated | anonymous | expired`, sem exibir estado anônimo transitório após refresh. Token rejeitado é descartado.
21. **Revalidação**: a sessão é refeita no foco da janela e ao navegar para rota privada (`staleTime` de 30 s). Registre o valor em `ARCHITECTURE.md` §10 e `docs/cache-policy.md`.
22. **`SessionController`** (não React, testável): máquina de estados da sessão e detecção de transição de `userId` (A→null, A→B, null→B). A cada transição: cancela queries em andamento, chama `clearPrivateCache`, desconecta o `RealtimeClient` e, se houver novo usuário, reconecta com o novo token. A limpeza acontece **antes** de gravar a sessão do novo usuário. A implementação real substitui o stub de sessão do `ShellContext`, mantendo o contrato público de `useSession()`; se for preciso alterá-lo, atualize `shell-kit` e `docs/federation.md`.
23. **Expiração**: `onSessionExpired` roda uma única vez mesmo com requisições concorrentes (o controller também é idempotente). Ao expirar: limpa token e cache privado, grava o **contexto de retomada** e navega para `/login?redirect=<path+search>&reason=expired` com aviso acessível "Sua sessão expirou".
24. **Contexto de retomada** (`ResumeStore`, `sessionStorage`): `{ userId, path, search, drafts: Record<string, unknown>, savedAt }`. Features registram provedores de rascunho (`registerDraftProvider(kind, fn)`); o checkout registra o seu na change de pagamento, e aqui o mecanismo é testado com um provedor falso. Após novo login do **mesmo** usuário, navega ao caminho salvo e restaura os rascunhos. Após login de **outro** usuário, descarta os rascunhos e mantém só o caminho. O contexto é consumido uma vez e limpo no logout explícito.
25. **Logout**: sempre conclui localmente, mesmo se a requisição falhar (`TRANSIENT`): remove o token, limpa cache privado, cancela queries, desconecta o socket, libera subscriptions, **rotaciona o `guestId`** (o visitante seguinte não herda o carrinho anterior) e navega para `/`.
26. **Sincronização entre abas**: mudança da chave do token (evento `storage`) é tratada como transição de sessão. Logout em uma aba deixa as outras anônimas, com cache privado limpo e rotas privadas redirecionadas ao login.
27. **Carrinho de visitante**: o `guestId` vai em header em toda requisição anônima; o login aciona a mesclagem no mock; após a mesclagem as queries privadas de carrinho são invalidadas (pela transição de usuário).

### F. Contrato com o shell (sem o layout final, que é da Etapa 8)
28. O placeholder atual do shell renderiza o Header de `shared/ui` conectado a `useSession()` (botão Entrar para visitante; avatar e nome com menu e "Sair" para usuário), sem Footer, Breadcrumb ou BottomTabBar. O contador do carrinho é só uma prop opcional (`cartCount`), sem consulta nesta change. A Etapa 8 substitui esse wrapper.

### G. Testes
29. **Vitest** (via `@nft/shared-testing` quando precisar dos handlers): validadores; hash (mesma senha com salts diferentes gera hashes diferentes, comparação correta); TTL e expiração com relógio controlado; `sanitizeRedirect` (incluindo `//host`, `https://`, `javascript:` e `/login`); `SessionController` com `RealtimeClient` falso e QueryClient real (transições, limpeza antes do novo usuário, expiração única com requisições concorrentes); `ResumeStore` (mesmo usuário restaura, outro descarta); `TokenStore` e sincronização entre abas; mesclagem do carrinho anônimo; nenhuma resposta de auth com campos secretos; formulários com Testing Library (ligações aria, erros da API mapeados aos campos, envio duplicado bloqueado).
30. **Playwright** (`apps/web-e2e`, Chromium, desktop e mobile) para o **fluxo 3** do enunciado: cadastro (sucesso, conflito, validação), login (sucesso, credencial inválida), acesso direto a rota privada com retorno via `redirect`, refresh mantendo a sessão, expiração de sessão (via `window.__mocks.expireSession()` com requisições concorrentes, cenário `session-expired` e retomada), logout, troca de usuário A→B **sem dados do usuário anterior** (nome e avatar no header, e inspeção do cache no nível de teste de integração do item 29), logout em outra aba. Parte do **fluxo 11**: foco preso e retorno de foco do modal, `Esc`, preenchimento e envio só por teclado, validação com `aria-invalid` e `aria-describedby`. Cada teste parte de reset do cenário e controla o relógio.
31. Nota de escopo: a verificação de ausência de dados privados do usuário anterior nas telas de favoritos, carrinho e perfil é estendida nas changes que criam essas telas.

### H. Documentação
32. Atualize `README.md` (credenciais fictícias dos dois usuários, como testar expiração e troca de usuário), `docs/mocks.md` (handlers de auth), `docs/contracts.md` e `docs/cache-policy.md` se mudarem, e `ARCHITECTURE.md` §8, §10, §17 e §18 com as decisões acima.

## Cenários de aceitação
- WHEN faço cadastro válido THEN a conta é criada, a sessão fica ativa, vou para o `redirect` (ou `/`) e um aviso acessível é anunciado.
- WHEN cadastro usa um e-mail já existente (qualquer caixa) THEN o campo recebe o erro da API, `aria-invalid` e `aria-describedby`, e o foco vai para ele.
- WHEN faço login com senha errada THEN vejo mensagem genérica em `role="alert"`, a senha é limpa e o foco vai para ela.
- WHEN acesso direto uma rota privada sem sessão THEN vou a `/login?redirect=<path+search>` e, após o login, volto a ela.
- WHEN `redirect` é `https://evil.com`, `//evil.com` ou `/login` THEN é ignorado e vou para `/`.
- WHEN dou refresh logado THEN a sessão é recuperada sem exibir estado anônimo transitório.
- WHEN a sessão expira com três requisições concorrentes THEN `onSessionExpired` roda uma vez, vou ao login com `reason=expired` e vejo o aviso.
- WHEN refaço login com o mesmo usuário após expirar THEN volto ao caminho salvo e os rascunhos são restaurados; WHEN entro com outro usuário THEN os rascunhos são descartados.
- WHEN faço logout, mesmo com a API falhando, THEN token, cache privado e queries somem, o socket desconecta, o `guestId` muda e vou a `/`.
- WHEN troco do usuário A para o B THEN nenhuma query key contém o `userId` de A e a interface não mostra dados de A.
- WHEN um visitante com itens no carrinho anônimo faz login THEN os itens são mesclados (limitados à disponibilidade) no carrinho do usuário, no estado do mock, e o carrinho anônimo desaparece.
- WHEN faço logout em uma aba THEN as outras abas ficam anônimas e perdem o cache privado.
- WHEN clico em login social ou "Esqueceu a senha?" THEN vejo "indisponível nesta demonstração" e nada aparenta sucesso.
- WHEN abro o modal THEN o foco entra e fica preso; `Esc` fecha e o foco retorna ao gatilho ou ao `main`.
- WHEN inspeciono qualquer resposta de auth THEN não há senha nem hash nem salt.

## Fora de escopo
Layout completo do shell (Header final, Footer, Breadcrumb, BottomTabBar, 404, toasts globais: Etapa 8), alteração de senha e perfil (Etapa 16), handlers de carrinho além da mesclagem (Etapa 9), provedor de rascunho do checkout (Etapa 14), eventos de tempo real (Etapa 12).

Gere proposal, specs e tasks. Não implemente nesta etapa: a implementação segue depois, uma task por vez, com pausa entre elas.