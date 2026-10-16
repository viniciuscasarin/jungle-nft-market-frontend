Crie a change `deploy-setup-and-preview`.

## Contexto
Prepara e valida toda a infraestrutura de build consolidado e deploy público (Vercel) do monorepo (`apps/shell` e remotes `storefront`, `checkout`, `account`), conforme `openspec/project.md`, `ARCHITECTURE.md` (§5 e §16) e `AGENTS.md`.

**IMPORTANTE — Etapa paralelizável (pode ser executada antes de concluir as telas 10 a 16):**
Esta change **não depende das telas finais nem da documentação final**. Ela só depende do contrato de Module Federation (Etapa 5) e da tabela de rotas do `apps/shell` (Etapa 8). O objetivo é deixar o pipeline de build unificado e o `vercel.json` 100% prontos e testados **agora**, para que cada merge subsequente já faça deploy automático sem surpresas perto do deadline.

**URGENTE — Prazo crítico (Foco no Caminho Feliz do Deploy e Débito Técnico):**
Estamos muito perto do deadline do projeto. **Foque em fazer o `pnpm build` gerar uma única pasta estática pronta para a Vercel onde o `shell` em `/`, os remotes em `/remotes/<nome>/` e o Service Worker do MSW (`mockServiceWorker.js`) funcionem de primeira com URLs relativas**, sem exigir múltiplos projetos na Vercel. Separe as tasks em **P0 (Obrigatório agora)** e **P1 (Débito Técnico)**.

## Estratégia de Prazo Crítico e Débito Técnico (P0 vs P1)
- **P0 (Fazer funcionar agora — Deploy Único Zero-Config)**:
  - Usar URLs relativas por padrão no build de produção para os remotes (`/remotes/storefront/remoteEntry.js`, `/remotes/checkout/remoteEntry.js`, `/remotes/account/remoteEntry.js`) e `VITE_ENABLE_MOCKS=true` como fallback/default de demonstração, eliminando o risco de quebrar o deploy por variável de ambiente esquecida no painel da Vercel.
  - Script de consolidação (`pnpm build`) que compila `storefront`, `checkout`, `account` e `shell` na ordem correta e monta a estrutura única de saída (ex.: `dist/deploy/`):
    - `dist/deploy/` ← conteúdo do build de `apps/shell` (incluindo `mockServiceWorker.js` na raiz `/`!).
    - `dist/deploy/remotes/storefront/` ← build de `apps/storefront`.
    - `dist/deploy/remotes/checkout/` ← build de `apps/checkout`.
    - `dist/deploy/remotes/account/` ← build de `apps/account`.
  - Configurar `vercel.json` na raiz apontando `outputDirectory` para a pasta consolidada, com rewrites de SPA fallback que **não** capturem `/remotes/*`, `/storybook/*`, `/assets/*` nem `/mockServiceWorker.js`, e headers `Cache-Control` adequados.
- **P1 (Candidatos a Débito Técnico para acelerar o build — documentar em `ARCHITECTURE.md` §16/§17)**:
  - **Build do Storybook acoplado ao `pnpm build` principal**: se rodar `build:storybook` em todo deploy da Vercel deixar o build lento ou estourar tempo/memória, deixe o `build:storybook` em um script separado/opcional (`pnpm build:deploy:full` vs `pnpm build`) e registre como decisão de pipeline em `ARCHITECTURE.md` §16/§17.

## Requisitos
1. **Script de build consolidado e `pnpm preview`**:
   - Garantir que `pnpm build` construa os 3 remotes e o host e consolide tudo em uma única pasta de publicação com shell em `/` e remotes em `/remotes/<nome>/` (e `/storybook/` quando `build:storybook` for executado).
   - Garantir que `mockServiceWorker.js` esteja presente na raiz da pasta de saída (`/mockServiceWorker.js`) e que o MSW + `@mswjs/socket.io-binding` inicializem corretamente no build de produção quando `VITE_ENABLE_MOCKS=true`.
   - `pnpm preview` serve exatamente essa pasta consolidada com comportamento de SPA fallback.
2. **Configuração `vercel.json` pronta para produção**:
   - Definir `buildCommand`, `outputDirectory`, `rewrites` e `headers`:
     - Headers `Cache-Control: no-cache, no-store, must-revalidate` para `/remotes/:remote/remoteEntry.js` e `/mockServiceWorker.js`.
     - Headers `Cache-Control: public, max-age=31536000, immutable` para chunks com hash (`/assets/*`, `/remotes/:remote/assets/*`).
     - Rewrite de SPA fallback enviando rotas de navegação da aplicação para `/index.html`, sem interceptar arquivos estáticos de `/remotes/*`, `/storybook/*` ou `/mockServiceWorker.js`.
3. **Resolução de variáveis de ambiente de produção**:
   - Configurar defaults seguros de produção para `VITE_ENABLE_MOCKS=true` e `VITE_REMOTE_*_URL` usando caminhos relativos do mesmo domínio (`/remotes/<nome>/...`), permitindo que preview deployments da Vercel (URLs dinâmicas `*.vercel.app`) funcionem automaticamente sem CORS e sem reconfigurar domínio.
4. **Validação de rotas profundas e refresh**:
   - Verificar que abrir diretamente ou dar refresh em `/`, `/nft/1`, `/login`, `/cadastro`, `/carrinho`, `/checkout/pagamento`, `/pedido/1`, `/conta/perfil`, `/conta/carteiras` e `/rota-inexistente` (404) no `pnpm preview` responde `200` com o app carregando os remotes em `/remotes/*`.

## Cenários de aceitação
- WHEN rodo `pnpm build && pnpm preview` THEN a pasta consolidada é gerada com shell em `/`, remotes em `/remotes/<nome>/` e `mockServiceWorker.js` em `/mockServiceWorker.js`.
- WHEN acesso qualquer rota profunda diretamente ou dou refresh no `pnpm preview` (ou no preview da Vercel) THEN o SPA fallback entrega o shell e o remote correspondente é carregado pelo caminho relativo `/remotes/<nome>/remoteEntry.js` sem erro 404 ou CORS.
- WHEN inspeciono os headers configurados em `vercel.json` THEN `remoteEntry.js` e `mockServiceWorker.js` não possuem cache longo e os assets com hash são imutáveis.

## Fora de escopo
Escrita final do `README.md`, preenchimento dos resultados do Lighthouse e fechamento dos `[PREENCHER]` de `ARCHITECTURE.md` (ficam para a Etapa 19B).

Gere proposal, specs e tasks (separando claramente P0 Deploy Único vs P1 Débito Técnico). Não implemente nesta etapa: a implementação segue depois, uma task por vez, com pausa entre elas.