Crie a change `shell-layout-and-providers`.

## Contexto
Consolida `apps/shell` como host, conforme `openspec/project.md`, `ARCHITECTURE.md` (§5, §8, §14, §18, §19) e `AGENTS.md`. Parte do que as changes anteriores entregaram: `module-federation-contract` (`ShellContext`, `RemoteBoundary`, remotes com páginas placeholder), `design-system-shared-ui` (Header, Footer, Breadcrumb, BottomTabBar, SearchBar, Toast, layout de modal, Skeleton, ErrorState, EmptyState já existem em `shared/ui`; **não os recrie**, adapte-os se faltar variante e atualize as stories), `mocks-core-and-scenarios` e `auth-and-session` (rotas `/login` e `/cadastro`, Header conectado à sessão, `SessionController`, `ResumeStore`). Esta change entrega a estrutura final do shell; as páginas dos remotes continuam placeholders (as telas reais vêm nas Etapas 10 a 16).

Figma (arquivo cópia `dKMJKBVdX6q0Ym4OX5vd3V`): Início desktop `2:2` e mobile `14:5226` (Header, Footer, Search bar e Tab bar mobile), e os demais frames para conferir o chrome em cada tela (`docs/design/screens.md`). Antes de implementar, consulte os frames com `get_design_context` e compare com `design/screenshots`. Sem acesso ao Figma, pare e avise; não invente valores.

## Requisitos

1. **Árvore de rotas completa** (TanStack Router code-based, tabela só no host), com duas rotas de layout sem path: `_app` (chrome completo) e `_modal` (sem chrome; layout de modal sobre fundo decorativo `aria-hidden`, reaproveitando o que a change de auth criou). Use as constantes de path de `shared/router`; se a Etapa 3 ou 5 já definiu outros paths, siga-os e registre. Tabela de referência:

   | Path | Página | Layout | Acesso |
   |---|---|---|---|
   | `/` | `HomePage` (storefront) | `_app` | público |
   | `/nft/$nftId` | `PdpPage` | `_app` | público |
   | `/carrinho` | `CartPage` (checkout) | `_app` | público |
   | `/pagamento` | `PaymentPage` | `_app` | privado (`requireAuth`) |
   | `/perfil` | `ProfilePage` (account) | `_app` | privado |
   | `/carteiras` | `WalletsPage` | `_app` | privado |
   | `/login`, `/cadastro` | auth (shell) | `_modal` | só visitante |
   | `/pedido/$orderId` | `ConfirmationPage` | `_modal` | privado |
   | `*` | `NotFound` | `_app` | público |

   O carrinho é público porque o enunciado exige manter e preservar os itens do visitante; o pagamento é o primeiro passo privado. Todas as páginas de remote entram por `lazy` dentro de um `RemoteBoundary`. Cada rota declara `staticData` (`title`, `breadcrumb`, item ativo da navegação).

2. **Search params por rota**, validados com os schemas de `shared/contracts` (catálogo em `/`, carrinho em `/carrinho`, checkout em `/pagamento`) mais `redirect` sanitizado, com parse tolerante a valores inválidos.

3. **Chrome** (`_app`), fiel ao Figma e responsivo:
   - Header desktop: logo Kurio, Início, Mercado, Criadores, Aprenda, busca, carrinho com badge e Entrar ou menu do usuário. Confirme no frame qual item aparece ativo em cada tela. "Mercado" leva a `/` com âncora na seção do catálogo (`#catalogo`); registre a decisão se o Figma indicar outra.
   - Header e busca mobile (SearchBar). O botão de filtros do mobile pertence à Home (Etapa 10); o shell o exibe só quando a página registrar um handler (ver requisito 7).
   - BottomTabBar mobile com botão central destacado. Leia no frame os itens e mapeie cada um para uma rota existente; item sem rota (ex.: favoritos, que não tem página) vira ação fora de escopo (requisito 5).
   - Breadcrumb a partir do `staticData`, com rótulo dinâmico para a PDP (requisito 7).
   - Footer: colunas de benefícios, newsletter, faixa de contato, links e redes sociais.
   - **Busca do Header**: ao enviar, navega para `/` com `q` (schema de catálogo), sem recarregar o shell. Link de navegação é `<a href>` real; nada de `href="#"`.
   - **Contador do carrinho**: o Header recebe `cartCount` opcional e **não** o exibe enquanto for `undefined`. A ligação com os dados é da Etapa 9. O link do carrinho leva a `/carrinho`.
   - **Menu do usuário** (Radix via `shared/ui`: teclado, `Esc`, foco): Perfil e Carteiras como links, mais Atividade, Watchlist, Ofertas, Downloads e Suporte como itens fora de escopo, e Sair (usa o logout da change de auth).
   - **Breakpoints**: siga `docs/design/responsive.md`. Se não houver regra, use chrome desktop a partir de 1024 px e chrome mobile (busca + BottomTabBar) abaixo, de modo que 768 usa o chrome mobile com conteúdo mais largo. Registre em `ARCHITECTURE.md` §19 (não há frame de tablet). Sem overflow horizontal em 390, 768 e 1440.

4. **Rotas `_modal`**: sem Header, Footer nem BottomTabBar; o fundo decorativo segue `ARCHITECTURE.md` §18 e não renderiza a Home real.

5. **Itens fora de escopo**: crie `useUnavailable()` em `shell-kit` (`notifyUnavailable(rótulo?)`), que mostra o aviso "indisponível nesta demonstração" em toast e live region. Regras:
   - são **visíveis** como no layout (links do Footer, redes sociais, newsletter, Criadores, Aprenda, itens do menu de conta, itens sem rota da BottomTabBar; blog e promos entram na Etapa 10 usando o mesmo hook);
   - são `<button type="button" aria-disabled="true">` com aparência de link (focáveis e anunciados; não usam `disabled`, que os tiraria da navegação por teclado);
   - ao acionar, avisam e nunca aparentam sucesso. Enviar a newsletter avisa e não confirma inscrição.

6. **Feedback acessível centralizado** no host: `ToastProvider` e duas live regions globais (`polite` e `assertive`), uma única instância por runtime. Exponha por `ShellContext` o objeto `feedback` (`notify({ message, tone, politeness })` e `announce(message, politeness)`), de modo que remotes e libs `feature` não criem as suas. Migre para ele os anúncios que a change de auth criou localmente. Atualize o contrato em `shell-kit` e `docs/federation.md`; estenda o teste de singleton para falhar se houver mais de uma live region global.

7. **`usePageChrome()`** em `shell-kit` (contexto do host, limpo no unmount): `setBreadcrumbLabel(label)` (a PDP informa o nome do NFT) e `setFiltersHandler(fn | null)` (a Home registra a abertura do Drawer de filtros; o botão só aparece no mobile quando houver handler).

8. **Acessibilidade de rota**: skip link "Pular para o conteúdo" como primeiro foco; landmarks `header`, `nav` (com `aria-label`), `main` e `footer`; a cada navegação o foco vai para o `main` (`tabIndex={-1}`) e o novo título é anunciado na live region `polite`; `document.title` vem do `staticData`; restauração de scroll (topo em navegação nova, posição anterior em voltar). O item ativo usa `aria-current="page"`.

9. **Remotes**: `RemoteBoundary` integrado a cada rota, **dentro** do layout (o chrome continua visível quando o remote falha). Retry recarrega só o remote. Faça preload do `remoteEntry` por intenção (hover e foco nos links do chrome) além do preload da change de federation.

10. **404 e erro raiz**: `NotFound` para qualquer path desconhecido, com o padrão visual existente (sem frame no Figma), `<title>` próprio, `noindex` e link para Início. `RootErrorBoundary` para erro inesperado de render, com ErrorState e ação de recarregar.

11. **Bootstrap e ciclo de vida**: ordem de boot `mocks → QueryClient, HttpClient, RealtimeClient → sessão → router`. Enquanto a sessão carrega, o chrome aparece com a área do usuário em skeleton e `aria-busy`; rotas privadas só renderizam após a resolução da sessão (sem estado anônimo transitório). O `RealtimeClient` é criado e injetado, mas **conecta por contagem de subscriptions**: abre o socket na primeira `subscribe` com sessão ativa e fecha ao zerar as subscriptions ou no logout; sem subscribers nunca abre conexão (evita erros de console e reconexões sem servidor antes da Etapa 12). Se `shared/realtime` ainda não faz isso, implemente lá com testes e ajuste o `SessionController` para só chamar `disconnect()` nas transições de usuário (a reconexão passa a ser consequência das subscriptions ativas).

12. **Metadados e SEO** (base para o Lighthouse, sem simplificações): `lang="pt-BR"`, `meta description`, `viewport`, `theme-color`, favicon, `robots.txt`, `<title>` por rota, fonte crítica com preload (da change de design system). Console limpo no carregamento com o cenário `default`.

13. **Fidelidade**: compare Header, Footer, Search bar e Tab bar com os frames em 1440 e 414 e registre divergências em `docs/design/fidelity-notes.md`. Tolerância: valores de token exatos; layout até 1 px. Itens do chrome só com tokens; sem cores, espaçamentos ou fontes literais.

14. **Storybook**: atualize ou crie stories dos componentes de chrome nas variantes e estados novos (visitante, usuário, `cartCount`, item fora de escopo, menu aberto, tab bar), com axe sem violações.

15. **Testes**:
    - **Vitest**: a tabela de rotas contém todas as páginas previstas com o acesso correto (privadas com `requireAuth`, `/login` e `/cadastro` só visitante); `staticData` e `document.title`; foco no `main` e anúncio na troca de rota; `useUnavailable` (aviso, nunca sucesso); `usePageChrome` (limpeza no unmount, botão de filtros condicionado ao handler); busca do Header navega com `q` válido; menu do usuário por teclado; singleton de live region; realtime só conecta com subscribers e fecha ao zerar e no logout.
    - **Playwright** (Chromium, 390, 768 e 1440): acesso direto e refresh em **todas** as rotas do build integrado com mocks (privadas redirecionam ao login com `redirect` e retornam); 404; remote indisponível (bloqueio de rede no teste) com ErrorState dentro do chrome e retry sem recarregar o shell; navegação por teclado no Header, menu, BottomTabBar e skip link; itens fora de escopo avisam; busca do Header leva a `/?q=`. Cada teste parte de reset do cenário.

16. **Documentação**: `docs/federation.md` (`feedback`, `usePageChrome`, `useUnavailable`, ciclo de vida do realtime), `ARCHITECTURE.md` §5, §14, §18 e §19, e a tabela de rotas em `docs/` (ou no próprio `ARCHITECTURE.md`).

## Cenários de aceitação
- WHEN acesso direto ou dou refresh em qualquer rota prevista no build integrado THEN a página carrega com o chrome correto.
- WHEN abro `/rota-inexistente` THEN vejo a 404 dentro do chrome, com título próprio e link para Início.
- WHEN acesso `/perfil` sem sessão THEN vou a `/login?redirect=%2Fperfil` e, após o login, volto a `/perfil`.
- WHEN o remote do storefront está fora do ar THEN Header e Footer continuam visíveis e a área da página mostra ErrorState com retry.
- WHEN clico em retry com o remote de volta THEN a página carrega sem recarregar o shell.
- WHEN aciono Atividade, um link do Footer ou "Criadores" THEN vejo "indisponível nesta demonstração" (toast e live region) e nada aparenta sucesso.
- WHEN envio o campo de newsletter THEN recebo o aviso de indisponibilidade e nenhuma confirmação de inscrição.
- WHEN envio uma busca no Header THEN navego para `/` com `q` na URL e sem recarregar o shell.
- WHEN navego para outra rota THEN o foco vai para o `main` e o título novo é anunciado.
- WHEN a aplicação carrega sem nenhuma subscription THEN nenhum socket é aberto e o console não tem erros.
- WHEN o primeiro componente assina um evento com sessão ativa THEN o socket conecta; WHEN a última subscription é liberada ou o usuário sai THEN ele desconecta.
- WHEN abro `/login` THEN não há Header, Footer nem BottomTabBar, e o fundo é decorativo e `aria-hidden`.
- WHEN a sessão ainda carrega THEN a área do usuário mostra skeleton com `aria-busy` e nenhuma rota privada renderiza.
- WHEN um remote ou uma lib cria outra live region global THEN o teste de singleton falha.

## Fora de escopo
Telas reais dos remotes (Etapas 10 a 16), ligação do contador do carrinho aos dados (Etapa 9), eventos de tempo real (Etapa 12), blog e promos da Home (Etapa 10).

Gere proposal, specs e tasks. Não implemente nesta etapa: a implementação segue depois, uma task por vez, com pausa entre elas.