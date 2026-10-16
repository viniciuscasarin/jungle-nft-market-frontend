Crie a change `cart-and-wallets-data`.

## Contexto
Camadas de dados de `cart` e `wallets`, conforme `openspec/project.md`, `ARCHITECTURE.md` (§6, §7, §9, §10) e `AGENTS.md`. Usa `mocks-core-and-scenarios` (banco, relógio e PRNG, `defineHandler`, `requireSession`, `parseBody`, `mergeGuestCart`, regras de rede, controles, `createTestServer`), `auth-and-session` (sessão, `guestId`, `SessionController`), `shell-layout-and-providers` (Header com `cartCount`, `feedback`) e os contratos de `shared/contracts` e `docs/contracts.md` (carrinho, cotação, carteiras, `collector`). Esta change **não** entrega telas de carrinho nem de carteiras (Etapas 13, 14 e 16): entrega domínio, acesso a dados, mocks e a ligação do contador no Header.

Se o contrato (Etapa 2) já definir algo diferente dos defaults abaixo, o contrato vence; ajuste só o que faltar e atualize `docs/contracts.md` na mesma change.

Regras que valem aqui: ETH é string decimal e toda aritmética passa por `shared/money`, inclusive no cálculo da cotação dentro dos mocks (permita `mocks/*` importar `shared/contracts` e `shared/money` se a configuração de fronteiras ainda não permitir); a UI nunca recalcula subtotal, desconto, taxa, total nem total de linha; quantidades são inteiras; mutations sem retry automático.

## Requisitos

### A. Carrinho: domain (`cart/domain`)
1. Tipos derivados de `shared/contracts` e funções puras **sem aritmética monetária**: identidade do item (`nftId` + edição), limite de quantidade a partir da disponibilidade, `canIncrement`, `isCartEmpty`, contagem de unidades, descrição de problemas de disponibilidade por item.

### B. Carrinho: contrato e handlers (`mocks/handlers`, `mocks/core`)
2. Handlers (paths de `docs/contracts.md`) para: consultar carrinho, incluir item, alterar quantidade, remover item, aplicar cupom, remover cupom e obter cotação. O dono do carrinho é o usuário (token válido) ou, sem token, o `guestId` do header. Com token, o carrinho anônimo nunca é lido nem alterado (a mesclagem é só no login, já implementada).
3. **Disponibilidade por NFT e edição**: incluir ou alterar acima da disponibilidade devolve `AVAILABILITY_CONFLICT` com `details` (`nftId`, edição, disponível). Incluir um item já presente soma a quantidade, respeitando o limite. Quantidade deve ser inteira e maior que zero (remoção é operação própria). NFT ou edição inexistente: `NOT_FOUND`.
4. **Cupom persistido no carrinho** (sobrevive a refresh e ao login). Código inexistente ou expirado devolve `VALIDATION_ERROR` com `fieldErrors.code` e `details.reason` (`invalid` ou `expired`); a expiração usa o relógio injetado e os offsets das fixtures.
5. **Cotação**: devolve `quoteId` (do PRNG), `expiresAt` (now + 5 min, configurável pelo cenário), `version`, subtotal, desconto, taxa de rede, total, e por item `unitPrice`, `lineTotal` (calculado pela API) e disponibilidade (`requested`, `available`, `ok`). Aceita `network` opcional (padrão `ethereum`). Regras de mock, configuráveis no dataset do cenário: desconto percentual ou valor fixo limitado ao subtotal; taxa de rede = taxa-base por rede mais percentual do subtotal com desconto; arredondamento ROUND_HALF_UP com 18 casas. Todo cálculo via `shared/money`.
6. Toda mutação incrementa `version` do carrinho. O estado persiste e é restaurado após refresh (infraestrutura da Etapa 6). Usuários e visitantes têm carrinhos isolados (teste explícito).
7. **Controle novo** `MockControls.updateNft(nftId, patch)`: altera preço e/ou disponibilidade de um NFT no banco (incrementando `version`) e emite pelo `MockEventBus` (no-op até a Etapa 12). Serve aos testes de cotação e, depois, aos eventos.

### C. Carrinho: data-access (`cart/data-access`)
8. Funções de API e `queryOptions` para carrinho e cotação, e mutations (incluir, alterar, remover, aplicar e remover cupom), todas via `shared/http` e validadas com os schemas. Não importam outras libs de scope.
9. **Dono nas query keys**: as chaves privadas usam o id do dono, `userId` quando autenticado ou `guest:<guestId>` para visitante, via factory de `shared/query` (confirme que `privateKey` aceita esse id; se não, estenda com teste). A cotação inclui `network` na chave. Visitante e usuário nunca compartilham chave, e `clearPrivateCache` remove ambos.
10. **Política de cache** (use os valores de `docs/cache-policy.md` se já existirem; senão estes, e registre): carrinho `staleTime` 10 s; cotação `staleTime` 0, refeita no foco da janela e quando `expiresAt` vence; invalidação do carrinho e da cotação após qualquer mutation e (já preparada) após `nft.updated`. Retry só em GET com erro `retryable`; nenhuma mutation tem retry.
11. **Atualização otimista com rollback** em alterar quantidade e remover item, restrita à **lista de itens**; a cotação nunca é otimista: enquanto ela é refeita, o resumo fica marcado como "atualizando" (`aria-busy`), sem exibir totais recalculados no cliente. Mutations do mesmo item são serializadas (`scope` por item do TanStack Query) para evitar corrida e reordenação. Em falha, restaura o estado anterior e anuncia o erro via `feedback.announce` (consumido pela `feature`, não por `data-access`; exponha o resultado do erro tipado).
12. Erros normalizados: `AVAILABILITY_CONFLICT` e `VALIDATION_ERROR` do cupom chegam tipados ao consumidor, sem tratar por mensagem.

### D. Carteiras: domain (`wallets/domain`)
13. Tipos e funções puras: validação de formato de endereço (`0x` + 40 hex, sem checksum nem verificação on-chain), unicidade de papel (no máximo uma principal e uma secundária), máquina de estado de conexão (`disconnected | connecting | connected | rejected | error`) e função que deriva o estado exibido a partir do dado do servidor e do estado da mutation.

### E. Carteiras: contrato e handlers
14. Handlers para consultar, cadastrar e atualizar carteiras, **sempre privados** (visitante recebe `UNAUTHENTICATED`; carteira de outro usuário, `FORBIDDEN`). Campos: apelido, rede (`ethereum|polygon|solana`), tipo (`metamask|walletconnect|coinbase`), endereço e papel (`primary|secondary`). Regras: o papel é imutável após o cadastro; segundo cadastro do mesmo papel devolve `CONFLICT` com `fieldErrors.role`; endereço repetido entre as carteiras do usuário (sem diferenciar caixa) devolve `CONFLICT` com `fieldErrors.address`; formato inválido devolve `VALIDATION_ERROR` com `fieldErrors`. Sem exclusão (não faz parte dos recursos mínimos).
15. **Conexão simulada no servidor** (nenhuma lógica de conexão fictícia no cliente): `POST` de conexão por carteira com `network` no corpo, e `DELETE` para desconectar, mais o estado de conexão (`status`, `network`, `connectedAt`) incluído na consulta das carteiras. Paths e schemas entram em `shared/contracts` e `docs/contracts.md`. A recusa é `FORBIDDEN` com `details.reason = 'USER_REJECTED'` (permite tentar de novo); conexão em rede diferente da cadastrada devolve `VALIDATION_ERROR` no campo `network`. O estado de conexão persiste no banco do mock e sobrevive a refresh.
16. **Flags e cenários novos** (registre no registry da Etapa 6 e em `docs/mocks.md`): flag `wallet.connect.outcome` (`connected | rejected`) e flag `wallet.dropAfterConnect` (a conexão passa a constar como `disconnected` na leitura seguinte). Cenários `wallet-connect-rejected` e `wallet-drops-connection`. O controle `disconnectWallet(walletId)` simula a desconexão em teste. A exigência de carteira conectada na criação do pedido é da Etapa 14; aqui só existe o estado e as flags.

### F. Carteiras: data-access (`wallets/data-access`)
17. Funções de API, `queryOptions` (`staleTime` 60 s, chave privada por `userId` com todos os parâmetros) e mutations de cadastro, atualização, conectar e desconectar, sem retry, com invalidação restrita ao recurso afetado. Erros `CONFLICT`, `VALIDATION_ERROR` com `fieldErrors` e `FORBIDDEN/USER_REJECTED` chegam tipados.

### G. Shell: dono do carrinho e contador do Header
18. `ShellContext` passa a expor `guestId` (reativo; o valor rotaciona no logout) e `shell-kit` exporta `useOwner()`, que devolve `{ kind: 'user', userId } | { kind: 'guest', guestId }`. As libs `feature` e o shell resolvem o dono por ele e o passam ao `data-access`. Atualize o contrato em `shell-kit` e `docs/federation.md`.
19. `apps/shell` liga `cartCount` do Header à consulta do carrinho (total de **unidades**; confirme no Figma o que o badge representa e registre a decisão), para visitante e usuário, com `aria-label` "Carrinho, N itens". O badge some com carrinho vazio e não aparece enquanto o carrinho carrega. Nenhuma lógica de carrinho no componente de `shared/ui`.

### H. Testes (Vitest com `createTestServer`)
20. Handlers: incluir, somar, alterar e remover; `AVAILABILITY_CONFLICT` por NFT e edição; cupom válido, inválido e expirado (relógio controlado); cotação com `0.1 + 0.2 = "0.3"`, 18 casas, desconto percentual com arredondamento, desconto fixo limitado ao subtotal, taxa por rede; `version` monotônico; isolamento entre visitante, usuário A e usuário B; mesclagem no login refletida em `GET` do carrinho; `updateNft` refletido na cotação seguinte; nenhuma resposta usa `number` para ETH.
21. Data-access: chaves com dono e parâmetros; rollback otimista com falha injetada por regra de rede (`failTimes` ou `httpError` em `PATCH`); serialização de mutations do mesmo item; retry só em GET `retryable` (cenário `recovering-5xx`) e nunca em mutation; `clearPrivateCache` remove carrinho, cotação e carteiras; cotação refeita ao vencer `expiresAt` com relógio controlado.
22. Carteiras: CRUD com todas as validações e conflitos; carteira de outro usuário (`FORBIDDEN`); visitante (`UNAUTHENTICATED`); conectar, recusar (`USER_REJECTED`), conectar em rede errada, desconectar; queda de conexão pela flag; persistência após reset de página simulado.
23. Header: componente conectado mostra o badge a partir do carrinho real (visitante e usuário), some com carrinho vazio e atualiza após mutation.
24. Não há fluxo de usuário novo nesta change; os E2E de carrinho entram nas Etapas 11 e 13, e os de carteira nas Etapas 14 e 16.

### I. Documentação
25. `docs/contracts.md` (cupom no carrinho, cotação com `lineTotal`, conexão de carteira), `docs/cache-policy.md`, `docs/mocks.md` (handlers, flags, cenários novos, `updateNft`), `README.md` (cenários novos), `ARCHITECTURE.md` §6, §9, §10 e §13.

## Cenários de aceitação
- WHEN somo `0.1` e `0.2` ETH em itens de uma cotação THEN o subtotal é `"0.3"` e nenhum valor passa por `number`.
- WHEN incluo uma quantidade acima da disponibilidade da edição THEN recebo `AVAILABILITY_CONFLICT` com a disponibilidade e o carrinho não muda.
- WHEN aplico um cupom expirado THEN recebo `VALIDATION_ERROR` em `code` com `reason = expired`; WHEN o código não existe THEN `reason = invalid`.
- WHEN dou refresh THEN carrinho e cupom persistem; WHEN o visitante faz login THEN os itens são mesclados e o carrinho anônimo desaparece.
- WHEN o usuário A e o usuário B consultam o carrinho THEN cada um vê só o seu, e nenhuma query key de um contém o id do outro.
- WHEN altero a quantidade com falha injetada no `PATCH` THEN a lista volta ao estado anterior e o erro tipado é retornado.
- WHEN altero a quantidade THEN a cotação mostra "atualizando" e só exibe os novos totais vindos da API.
- WHEN dois `PATCH` do mesmo item são disparados em sequência THEN são executados em ordem, não em paralelo.
- WHEN `updateNft` muda o preço de um item do carrinho THEN a cotação seguinte reflete o novo preço e `version` do NFT aumenta.
- WHEN a cotação vence (`expiresAt`) THEN ela é refeita.
- WHEN um visitante chama `/wallets` THEN recebo `UNAUTHENTICATED`; WHEN acesso a carteira de outro usuário THEN `FORBIDDEN`.
- WHEN cadastro uma segunda carteira principal THEN `CONFLICT` em `role`; WHEN repito o endereço (outra caixa) THEN `CONFLICT` em `address`.
- WHEN conecto no cenário `wallet-connect-rejected` THEN recebo `FORBIDDEN` com `USER_REJECTED` e posso tentar de novo.
- WHEN no cenário `wallet-drops-connection` leio as carteiras após conectar THEN a conexão consta como desconectada.
- WHEN o carrinho do visitante tem 3 unidades THEN o Header mostra o badge 3 com `aria-label` correspondente; WHEN o carrinho fica vazio THEN o badge some.
- WHEN faço logout THEN o `guestId` rotaciona, o badge zera e nenhuma chave do usuário anterior permanece no cache.

## Fora de escopo
Páginas de carrinho, pagamento e carteiras; formulário do colecionador; criação de pedido e exigência de carteira conectada (Etapa 14); eventos `nft.updated` no cliente (Etapa 12); botão de adicionar ao carrinho na PDP (Etapa 11).

Gere proposal, specs e tasks. Não implemente nesta etapa: a implementação segue depois, uma task por vez, com pausa entre elas.