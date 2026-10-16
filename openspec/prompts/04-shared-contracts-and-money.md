Crie a change `shared-contracts-and-money`.

## Contexto
Os contratos REST e de eventos são a fonte única de verdade entre mocks, data-access e UI. O pacote `money` garante precisão de ETH. Regras em `openspec/project.md`. Cada pacote exporta ESM + tipos pelo `index.ts`.

## Parte A: `libs/shared/money` (encapsula decimal.js)
- Tipo opaco `EthAmount` (string decimal) com helpers puros: `parse`, `add`, `sub`, `mul(amount, intQty)`, `percent`, `compare`, `isZero`, `sum`, `format` (locale pt-BR, casas configuráveis, sem notação científica) e `toApi`.
- Rejeitar `number`, notação científica e strings inválidas com erro tipado.
- Precisão mínima de 18 casas decimais; arredondamento documentado (ROUND_HALF_UP).
- Testes unitários: `0.1 + 0.2 === "0.3"`, valores com 18 casas, quantidades grandes, comparação, formatação e entradas inválidas.

## Parte B: `libs/shared/contracts`
Defina schemas zod e tipos inferidos (sem lógica de runtime além da validação) para:
- **Erro padrão** `ApiError`: `code` (VALIDATION_ERROR, UNAUTHENTICATED, SESSION_EXPIRED, FORBIDDEN, NOT_FOUND, CONFLICT, AVAILABILITY_CONFLICT, PRICE_CHANGED, IDEMPOTENCY_CONFLICT, TRANSIENT), `message`, `fieldErrors?`, `details?`, `retryable`.
- **Sessão e conta**: cadastro, login, sessão (token opaco), logout, expiração. Senhas nunca retornam em respostas.
- **NFTs**: item, edições com disponibilidade por edição, query de listagem (`q`, filtros combináveis, `sort`, `page`, `pageSize`), resposta paginada com `total` e detalhe por id. Todo recurso carrega `version` (inteiro monotônico). O detalhe inclui `rating` (`average` de 0 a 5 com uma casa e `count` inteiro), calculado pela API.
- **Avaliações** (somente leitura, públicas): `GET /nfts/{nftId}/reviews` paginado (`page`, `pageSize`), com `Review` = `{ id, author: { displayName, avatarUrl? }, rating (inteiro 1 a 5), comment, createdAt }` e resposta `{ items, total, page, pageSize }`. Sem criação, edição ou voto. Sem eventos de tempo real.
- **Favoritos**.
- **Carrinho**: itens por `nftId` + edição, quantidades inteiras; suporte a carrinho de visitante por identificador anônimo enviado em header, com mesclagem no login definida no contrato de sessão.
- **Cotação**: cupom, subtotal, desconto, taxa de rede, total, disponibilidade por item, `quoteId`, `expiresAt`, `version`.
- **Pedidos**: criação com header `Idempotency-Key`; estados `pending|confirmed|rejected` (terminais: confirmed e rejected); snapshot imutável do recibo (itens, preços, taxas, total, txHash simulado, explorerUrl, rede, carteira, dados do colecionador). O pedido recebe o objeto `collector` (dados fictícios, validados só por formato): `displayName`, `username`, `email`, `profileName`, `network` (`ethereum|polygon|solana`), `walletAddress` (`0x` + 40 hex), `walletType` (`metamask|walletconnect|coinbase`), `referralCode`, `ensName` (sem o sufixo `.eth`), `useSecondaryWallet` (boolean), `secondaryWallet?` (obrigatório se `useSecondaryWallet` for true) e `note?` (opcional). Todos os demais campos são obrigatórios.
- **Perfil**, **alteração de senha**, **carteiras** (principal e secundária, rede).
- **Eventos Socket.IO**: envelope `{ id, type, resource: { kind, id }, version, occurredAt, userId?, payload }` para `nft.updated` e `order.updated`, como união discriminada.
- **Search params** de catálogo, carrinho e checkout (consumidos pelo host e pelos remotes), com parse tolerante a valores inválidos.
- Todos os valores ETH validados por regex como string decimal. Nenhum `number` para dinheiro.

## Requisitos
- `docs/contracts.md` descreve endpoints (método, path, headers, request, response, erros) para todos os recursos mínimos do desafio e os eventos.
- Fixtures de exemplo válidas por contrato para uso em testes.
- Helpers puros de eventos: `isDuplicate` (mesmo `id`) e `isStale` (versão menor ou igual à aplicada).
- Testes unitários: payloads válidos passam e inválidos falham com mensagens úteis.

## Cenários de aceitação
- WHEN um schema recebe um preço `number` THEN a validação falha.
- WHEN dois eventos têm o mesmo `id` THEN `isDuplicate` os identifica.
- WHEN a versão do evento é menor ou igual à atual THEN `isStale` retorna true.
- WHEN `0.1` e `0.2` são somados THEN o resultado é `"0.3"`.
- WHEN uma `Review` tem `rating` 0, 6 ou fracionário THEN a validação falha.
- WHEN `collector.useSecondaryWallet` é true e `secondaryWallet` está ausente THEN a validação falha com erro no campo.
- WHEN `collector.walletAddress` não tem o formato `0x` + 40 hex THEN a validação falha com erro no campo.

Gere proposal, specs e tasks (com os testes previstos). Não implemente nesta etapa: a implementação segue depois, uma task por vez, com pausa entre elas. Atualize `ARCHITECTURE.md` onde aplicável.