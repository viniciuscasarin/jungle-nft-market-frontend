# AGENTS.md

Instruções para agentes de IA (OpenSpec, Claude Code, Codex, etc.) que trabalham neste repositório. Leia este arquivo, `openspec/project.md` e `ARCHITECTURE.md` antes de qualquer change. Em caso de conflito, prevalece o enunciado do desafio, depois `openspec/project.md`, depois `ARCHITECTURE.md`.

> Se o OpenSpec gerar um bloco gerenciado (`<!-- OPENSPEC:START -->` … `<!-- OPENSPEC:END -->`) neste arquivo, não o edite nem o remova.

## 1. Projeto

NFT Marketplace em React + TypeScript: descoberta, compra e conta do colecionador, desktop e mobile. Backend 100% simulado com MSW. Sem blockchain, carteiras ou pagamentos reais.

Monorepo Nx (pnpm) com 4 apps integrados por Module Federation:

| App | Papel |
|---|---|
| `apps/shell` | Host: layout, rotas, guards, sessão, MSW, QueryClient, HttpClient, RealtimeClient, login e cadastro |
| `apps/storefront` | Remote: Home (catálogo) e PDP |
| `apps/checkout` | Remote: Carrinho, Pagamento e Confirmação |
| `apps/account` | Remote: Perfil e Carteiras |
| `apps/web-e2e` | Playwright sobre o sistema integrado |

Libs: `libs/shared/*`, `libs/shell-kit`, `libs/mocks/*` e, por domínio (`auth`, `catalog`, `favorites`, `cart`, `checkout`, `orders`, `profile`, `wallets`), as camadas `domain`, `data-access`, `feature`, `ui`.

## 2. Comandos

Use sempre a partir da raiz.

| Comando | Uso |
|---|---|
| `pnpm install` | Instalar (respeite o lockfile) |
| `pnpm dev:mocks` | Subir todos os apps com mocks |
| `pnpm dev:<app>` | Subir um app |
| `pnpm typecheck` | Verificação de tipos |
| `pnpm lint` | ESLint (inclui boundaries e a11y) |
| `pnpm test` | Vitest |
| `pnpm build` | Build de todos os apps |
| `pnpm preview` | Servir o build integrado |
| `pnpm e2e` | Playwright |
| `pnpm lighthouse` | Auditoria Lighthouse |

Antes de concluir qualquer tarefa, rode `typecheck`, `lint` e `test` nos projetos afetados (`nx affected`). Se tocou em fluxo de usuário, rode também o E2E relacionado.

## 3. Regras invioláveis

Violar qualquer item abaixo é falha de entrega, não ajuste de estilo.

1. **Mocks só na camada de rede.** Respostas fictícias vivem em `libs/mocks/*`. Componentes, hooks, `data-access` e o cliente Axios nunca contêm dados falsos, flags de mock ou caminhos alternativos de negócio.
2. **Tempo real passa pelo `socket.io-client`.** Nunca chame setters, callbacks ou o cache para simular um evento. Eventos nascem no servidor simulado.
3. **ETH é string decimal.** Nunca `number`, `parseFloat` ou aritmética nativa em valores monetários. Cálculo e formatação só via `shared/money`. Quantidades são inteiras.
4. **Totais vêm da cotação da API.** A UI não recalcula subtotal, desconto, taxa ou total.
5. **Isolamento por usuário.** Query keys privadas incluem `userId`. Logout e troca de usuário limpam cache privado, cancelam queries e encerram subscriptions.
6. **Compra só confirma com resposta da simulação.** A tela de confirmação só renderiza para pedido `confirmed`. Pedidos são idempotentes e `confirmed`/`rejected` são terminais.
7. **Sem simplificação para pontuação.** Não remova imagens, fontes ou funcionalidades para melhorar Lighthouse.
8. **Ação fora de escopo não aparenta sucesso.** Use aviso explícito ("indisponível nesta demonstração").

## 4. Arquitetura e fronteiras

- Dependências fluem em um sentido: app → feature → ui/data-access → domain → shared.
- `domain`: só `shared/contracts` e `shared/money`. Funções puras, sem I/O e sem React.
- `ui`: só `shared/ui` e `domain`. Apresentacional, sem fetch.
- `data-access`: `shared/http`, `shared/query`, `shared/contracts`, `domain`. Funções de API, query options e mutations.
- `feature`: componentes conectados e páginas. Pode usar as camadas do próprio scope, `shared/*`, `shell-kit` e o `index.ts` público de outros scopes.
- Apps nunca importam outros apps. `feature` e `ui` com `flow:X` só são importáveis por `apps/X`.
- `mocks/*` só é importável por `apps/shell`, `shell-kit` e `apps/web-e2e`.
- Cada lib expõe apenas `index.ts`. Sem deep import e sem import circular.
- Remotes expõem apenas componentes de página. O host é dono de rotas, guards e schemas de search params.
- Nunca crie uma segunda instância de QueryClient, HttpClient, RealtimeClient ou service worker. Consuma por `useShell()`.

### Terceiros encapsulados

| Biblioteca | Só pode ser importada em |
|---|---|
| `axios` | `shared/http` |
| `socket.io-client` | `shared/realtime` |
| `decimal.js` | `shared/money` |
| `@radix-ui/*`, primitivos shadcn | `shared/ui` |
| `msw`, `@mswjs/socket.io-binding` | `mocks/*`, `shell-kit`, `web-e2e` |
| `@tanstack/react-query` | `shared/query`, `data-access`, `feature` |

Se o lint bloquear um import, corrija a arquitetura. Nunca desative a regra com `eslint-disable`.

## 5. Convenções de código

- TypeScript strict (`noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`). Sem `any`, sem `as` para contornar tipos e sem `@ts-ignore`. Use `unknown` e valide com zod nas bordas.
- Tipos de transporte, estado e UI derivam dos schemas de `shared/contracts`. Não duplique tipos.
- Erros de API chegam normalizados como `ApiError`. Trate por `code` e `retryable`, não por mensagem.
- Query keys criadas só por factories de `shared/query`. Sem strings soltas.
- `retry` automático apenas em GET com erro `retryable`. Nunca em mutations de pedido.
- Atualização otimista sempre com rollback e anúncio acessível do erro.
- Eventos de tempo real: deduplicar por `id`, descartar `version` menor ou igual à aplicada, ignorar `userId` diferente, liberar listeners no cleanup.
- Estado de filtros, busca, ordenação e paginação mora na URL (search params validados com zod). Mudança de filtro reinicia a página.
- Formulários: react-hook-form + zod, erros de campo vindos da API mapeados para os campos.
- Nomes de aliases: `@nft/<scope>-<lib>`. Arquivos em kebab-case, componentes em PascalCase.
- Comentários explicam o porquê, não o quê. Sem código morto e sem `console.log`.

## 6. UI e acessibilidade

- Visual do Figma é referência. Use tokens e componentes de `shared/ui`. Não use cores, espaçamentos ou fontes literais fora dos tokens.
- Estados não desenhados seguem o mesmo padrão visual.
- Todo dado assíncrono tem loading, vazio, erro (com retry) e sucesso.
- Skeleton com shimmer preserva dimensões (sem layout shift) e desliga sob `prefers-reduced-motion`. Região em carregamento usa `aria-busy`.
- Obrigatório em toda tela: navegação por teclado, foco visível, labels, erros associados (`aria-invalid` + `aria-describedby`), live region para mutations e eventos em tempo real, foco controlado em Dialog e Drawer, contraste AA, estados que não dependem só de cor, imagens relevantes com `alt`.
- Valide 390, 768 e 1440 px, sem overflow horizontal e sem perda de conteúdo com zoom.
- Assets e fontes self-hosted. Registre substituições em `ARCHITECTURE.md`.

## 7. Mocks e cenários

- Handlers por domínio em `libs/mocks/handlers`. Estado em `libs/mocks/core`. Fixtures em `libs/mocks/fixtures`.
- Estado consistente entre catálogo, favoritos, carrinho, perfil, carteiras e pedidos, e refletido em REST e em eventos.
- Todo cenário é determinístico e reproduzível (semente fixa, sem `Math.random`/`Date.now` sem injeção).
- Ao criar um fluxo de falha, adicione o cenário correspondente e documente no `README.md`.
- Reset restaura integralmente o cenário conhecido.
- Cenários obrigatórios: sucesso, vazio, latência variável e fora de ordem, falha de conexão, 4xx/5xx, sessão expirada, não autorizado, conflito de cadastro/validação, cupom inválido/expirado, preço alterado, edição esgotada, timeout após criar pedido, pagamento confirmado e recusado.

## 8. Testes

- Toda change inclui testes. Lógica pura em Vitest; fluxos em Playwright.
- E2E partem de estado isolado (reset de cenário), controlam relógio, latência e disparo de eventos, e verificam a interface e o resultado das operações.
- Testes de REST passam pelos handlers MSW. Testes de tempo real passam pelo `socket.io-client`.
- Regressão visual (início, detalhe, carrinho, pagamento) com dados estáveis e baselines versionadas. Atualize baseline só com mudança visual intencional.
- Nunca enfraqueça, pule (`skip`) ou apague um teste para fazê-lo passar.

## 9. Fluxo com OpenSpec

1. Uma change por etapa do backlog. Nome em kebab-case, descritivo.
2. Gere `proposal`, specs e `tasks.md` antes de implementar.
3. Specs usam requisitos com SHALL e cenários `WHEN/THEN` testáveis.
4. Implemente marcando as tasks. Não amplie escopo além da change.
5. Ao concluir, atualize a documentação afetada (`ARCHITECTURE.md`, `README.md`, `docs/*`) e valide a change.
6. Mudou convenção (alias, estrutura, decisão de rota)? Atualize `openspec/project.md` e `ARCHITECTURE.md` na mesma change.
7. Arquive a change somente com `typecheck`, `lint`, `test` e `build` passando.

### Orquestração de Execução (Apply)
Quando estiver executando a skill `opsx-apply-change` (via `/opsx-apply`):
- NÃO execute todas as tarefas em um loop contínuo único por padrão.
- Execute as tarefas incrementalmente (uma a uma, ou até a task limite indicada).
- Após implementar a tarefa e marcá-la como concluída (`[x]`), a menos que o usuário tenha escolhido executar todas as tarefas restantes ou uma tarefa limite ainda não tenha sido atingida, PAUSE a execução imediatamente.
- Use obrigatoriamente a tool interativa `ask_question` para perguntar se o usuário deseja prosseguir:
  - Pergunta: "Deseja continuar com a próxima task nesta mesma sessão?"
  - Opções:
    - "(Recommended) Sim, continuar com a próxima task nesta mesma sessão"
    - "Sim, executar todas as próximas tasks nesta mesma sessão"
    - "Sim, executar até uma task/subtask específica (informe o número no campo de resposta, ex: 'até 2.2')"
    - "Não, prefiro abrir um novo chat para manter o contexto limpo"
- Comportamento das opções:
  - "Sim, continuar com a próxima task...": implementa a próxima task, marca `[x]` e chama o gate novamente.
  - "Sim, executar todas as próximas tasks...": continua executando sequencialmente até concluir todas as tasks da change sem perguntar entre tarefas (a menos que ocorra erro ou bloqueador).
  - Executar até task/subtask específica (ex: "até 2.2" ou digitado no write-in): continua executando sequencialmente até concluir a task indicada. Ao concluir a task indicada, PAUSE a execução e reabra exatamente o mesmo gate (`ask_question`) com as mesmas opções.
  - "Não...": encerra a execução no estado atual e exibe o resumo de progresso.
- Aguarde a resposta do usuário antes de prosseguir. Em qualquer modo contínuo, pause imediatamente se houver erro ou bloqueador.

### Finalização de Arquivamento (Archive)
Quando estiver executando a skill `openspec-archive-change` (via `/opsx-archive`):
- Ao finalizar o arquivamento e exibir o resumo, use a tool interativa `ask_question` para perguntar se o usuário deseja commitar as alterações no Git:
  - Pergunta: "Deseja commitar as alterações do arquivamento no Git?"
  - Opções:
    - "(Recommended) Sim, commitar alterações do arquivamento"
    - "Não, não commitar agora"
- Se o usuário responder afirmativamente ("Sim"), crie o commit seguindo a convenção do projeto (`docs(openspec): archive <change-name>`).


## 10. Git

- Commits pequenos e convencionais (`feat:`, `fix:`, `test:`, `docs:`, `chore:`, `refactor:`), escopo pelo projeto Nx (`feat(catalog-feature): ...`).
- Não commite `.env`, segredos, `dist`, relatórios temporários ou traces locais. Baselines visuais e lockfile são versionados.
- Não reescreva histórico compartilhado.

## 11. Definição de pronto

Uma tarefa só está pronta quando:

- [ ] `typecheck`, `lint`, `test` e `build` passam nos projetos afetados.
- [ ] Nenhuma regra de fronteira ou de terceiros foi contornada.
- [ ] Estados de loading, vazio, erro e sucesso existem e foram verificados.
- [ ] Acessibilidade conferida (teclado, foco, labels, live regions).
- [ ] Testes novos cobrem o comportamento e os cenários de falha.
- [ ] Valores ETH passam por `shared/money` e nenhum `number` toca dinheiro.
- [ ] Documentação atualizada.
- [ ] Nada do que consta como eliminatório em `openspec/project.md` foi violado.

## 12. Em caso de dúvida

- Requisito ambíguo: siga o enunciado do desafio, registre a premissa na `proposal` e em `ARCHITECTURE.md`. Não invente comportamento silenciosamente.
- Falta de asset ou token do Figma: use o mais próximo dos tokens existentes, marque como desvio em `ARCHITECTURE.md` e não improvise estilos locais.
- Conflito entre atalho e regra de arquitetura: a regra vence.
