Crie a change `storefront-home-catalog`.

## Contexto
Implementa a jornada de descoberta e catálogo da Home no remote `apps/storefront` e nas libs `libs/catalog/{domain,data-access,feature,ui}` + handlers em `libs/mocks/handlers`, conforme `openspec/project.md`, `ARCHITECTURE.md`, `AGENTS.md` e `challenge.md`.
Referência Figma (arquivo cópia `dKMJKBVdX6q0Ym4OX5vd3V`, página `0:1`): Início desktop `2:2` (1440x3668) e Início mobile `14:5226` (414x896).

**IMPORTANTE — Layout já pronto na branch `feat/layout`:**
Os layouts e componentes da Home/Catálogo (Hero, Sidebar de filtros, Tabs, Sort, grid de `NftCard`, Featured NFT banner, Pagination, Search bar mobile com gatilho de filtros, Promo cards e Blog cards) **já estão prontos na branch `feat/layout`, porém contêm apenas o visual estático**. Nesta change, extraia/reaproveite esse visual organizando os componentes apresentacionais em `libs/catalog/ui` (e `libs/shared/ui` onde compartilhado) e conecte-os em `libs/catalog/feature` e `apps/storefront` ao backend simulado (`libs/mocks/*` + `libs/catalog/data-access`) e às regras de negócio (`libs/catalog/domain`), removendo qualquer dado hardcoded, array estático ou estado fictício local.

**URGENTE — Prazo crítico (Foco no Caminho Feliz e Débito Técnico):**
Estamos muito perto do deadline do projeto. **Foque o máximo possível em fazer o caminho feliz funcionar de ponta a ponta o mais rápido possível** (sem violar fronteiras de lint ou critérios eliminatórios), e identifique na `proposal` e no `tasks.md` tudo o que pode ser simplificado ou registrado como **Débito Técnico** em `ARCHITECTURE.md` §17 para acelerar o desenvolvimento. Separe as tasks em **P0 (Caminho Feliz — Obrigatório agora)** e **P1 (Pode virar Débito Técnico se o tempo apertar)**.

## Estratégia de Prazo Crítico e Débito Técnico (P0 vs P1)
- **P0 (Fazer funcionar agora — Caminho Feliz)**:
  - Reaproveitar o layout de `feat/layout` com o mínimo de refatoração estrutural (apenas o necessário para respeitar as tags `@nx/enforce-module-boundaries` entre `catalog/ui` e `catalog/feature`).
  - Ligar `GET /nfts` no MSW retornando os itens reais filtrados por busca (`q`), coleção, faixa de preço (string decimal via `@nft/shared-money`), rede, aba (`tab`), ordenação (`sort`) e página (`page`), sincronizados nos search params da URL e reiniciando `page = 1` ao filtrar.
  - Garantir clique no `NftCard` navegando para `/nft/:nftId` e estados básicos de loading (skeleton), vazio e erro com retry.
- **P1 (Candidatos a Débito Técnico para acelerar a entrega — documentar em `ARCHITECTURE.md` §17)**:
  - **Stories CSF3**: em vez de criar dezenas de stories para cada micro-variante e pseudo-estado, crie apenas 1 story principal por componente exportado (ou registre a cobertura exaustiva de stories da Home como débito técnico).
  - **Contagens dinâmicas de facetas e filtros secundários**: se calcular contagens dinâmicas cruzadas por filtro tomar tempo, retorne contagens fixas das fixtures da API no `GET /nfts` e registre como débito técnico.
  - **Hero / Featured NFT / Promo / Blog**: manter Hero e Featured apontando para um NFT fixo da fixture e todos os CTAs fora de escopo disparando um único helper padrão de toast `"indisponível nesta demonstração"`.
  - **Testes**: priorizar 1 teste unitário da regra de filtro/paginação e 1 teste E2E enxuto do caminho feliz do catálogo.

## Requisitos
1. **Reaproveitamento do layout (`feat/layout`) e fronteiras de módulo**:
   - Migre/integre o código visual da Home vindo da branch `feat/layout` respeitando as fronteiras (`scope:catalog`, `flow:storefront`): componentes apresentacionais sem fetch em `libs/catalog/ui`, página conectada em `libs/catalog/feature` e exposição de `HomePage` no remote `apps/storefront`.
   - Stories CSF3 em `libs/catalog/ui` podem ser mínimos (apenas o estado padrão para não travar a entrega), registrando a expansão de variantes no Storybook como débito técnico.
2. **Mocks de catálogo (`libs/mocks/handlers` e `libs/mocks/core`)**:
   - Handler `GET /nfts` integrado ao banco em memória de `mocks/core`, suportando busca textual (`q`), filtros combináveis (`collections`, `minPrice`, `maxPrice`, `networks`, `tab`: todos, novos lançamentos, em alta), ordenação (`sort`) e paginação (`page`, `pageSize`).
   - Retornar `{ items, total, page, pageSize }` e contagens por coleção e por rede conforme o schema de `@nft/shared-contracts`.
   - Respeitar os cenários de `mocks/core`: sucesso, vazio, respostas fora de ordem e falha retornando `ApiError`.
3. **Regras de domínio e camada de dados (`catalog/domain` e `catalog/data-access`)**:
   - `catalog/domain`: funções puras para normalização de parâmetros de busca/filtros, validação de faixa de preço em ETH via `@nft/shared-money` (proibido `number` ou `parseFloat` para valores ETH) e regra que reinicia `page = 1` sempre que qualquer filtro, busca, aba ou ordenação mudar.
   - `catalog/data-access`: query options tipadas usando as factories de `@nft/shared-query` (incluindo todos os parâmetros na query key), repassando `AbortSignal` do TanStack Query para descartar respostas obsoletas/fora de ordem.
4. **Estado sincronizado na URL (Search Params)**:
   - Busca (`q`), coleções selecionadas, faixa de preço (`minPrice`, `maxPrice` como string decimal ETH), rede (`networks`), aba ativa (`tab`), ordenação (`sort`) e página (`page`) residem nos search params da URL, validados pelo schema tolerante de `@nft/shared-contracts` / `@nft/shared-router`.
   - O estado sobrevive a refresh da página e à navegação pelo histórico do navegador (voltar/avançar).
5. **Ligação dos blocos visuais às regras de negócio**:
   - **Hero e Featured NFT banner**: navegando para a PDP (`/nft/:nftId`).
   - **Sidebar de filtros (desktop) e Drawer de filtros (mobile)**: filtros ligados à URL e ações Aplicar/Limpar. Em mobile (`390px`), os filtros abrem em `Drawer`/`Sheet` acessível.
   - **Tabs, Sort, Grid de `NftCard` e Pagination**: alimentados pela resposta de `GET /nfts`, preços formatados via `@nft/shared-money`, clique no card navegando para `/nft/:nftId`.
   - **Elementos fora de escopo presentes no layout da Home** (Promo cards, Blog cards, links editoriais): manter o visual da branch `feat/layout` e exibir aviso explícito ("indisponível nesta demonstração") ao clicar.
6. **Estados assíncronos e testes enxutos**:
   - Loading (`Skeleton` com `aria-busy="true"`), `EmptyState` (limpar filtros) e `ErrorState` (com retry).
   - Testes enxutos focados no caminho feliz (Vitest em `catalog/domain` e E2E do Fluxo 1 cobrindo busca + filtro + paginação + refresh). Documentar em `ARCHITECTURE.md` §17 os débitos técnicos assumidos para ganho de velocidade.

## Cenários de aceitação
- WHEN aplico busca, filtro de coleção, faixa de preço em ETH, rede e ordenação THEN a URL reflete todos os parâmetros e a listagem exibe apenas os NFTs correspondentes vindos do MSW.
- WHEN estou na página 3 e altero qualquer filtro, busca, aba ou ordenação THEN a paginação volta automaticamente para a página 1.
- WHEN dou refresh na página ou uso voltar/avançar do navegador THEN os filtros, a ordenação, a página e os resultados são restaurados a partir da URL.
- WHEN a combinação de filtros não encontra resultados THEN o `EmptyState` é exibido e permite limpar os filtros.
- WHEN a API retorna erro THEN o `ErrorState` é exibido e clicar em retry refaz a requisição com sucesso.
- WHEN clico em um Promo card ou Blog card fora de escopo THEN vejo o aviso "indisponível nesta demonstração".

## Fora de escopo
Página de detalhes do NFT (PDP) e favoritos (Etapa 11); eventos Socket.IO em tempo real (Etapa 12).

Gere proposal, specs e tasks (separando claramente P0 Caminho Feliz vs P1 Débito Técnico). Não implemente nesta etapa: a implementação segue depois, uma task por vez, com pausa entre elas.