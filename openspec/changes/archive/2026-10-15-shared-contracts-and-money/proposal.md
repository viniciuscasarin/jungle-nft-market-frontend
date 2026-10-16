# Proposal: Shared Contracts and Monetary Precision

## Why

O marketplace de NFTs exige precisão monetária absoluta em ETH (rejeitando perda de precisão binária de floats IEEE-754) e contratos fortemente tipados de ponta a ponta que sirvam como fonte única da verdade compartilhada entre o backend simulado (MSW), o canal Socket.IO, os data-access e as telas do catálogo, carrinho, checkout e conta.

Atualmente, `libs/shared/money` vaza a classe `Decimal` de `decimal.js` para fora de sua fronteira e carece de tipagem opaca (`EthAmount`), enquanto `libs/shared/contracts` contém apenas stubs embrionários, impedindo a construção consistente dos domínios, handlers MSW e fluxos das aplicações.

## What Changes

- **@nft/shared-money (Encapsulamento de decimal.js e Tipo Opaco)**:
  - Criação do tipo opaco `EthAmount` (string decimal com brand) e erro tipado `InvalidEthAmountError`.
  - Encapsulamento completo de `decimal.js`, proibindo o vazamento de instâncias `Decimal` na API pública da lib.
  - Funções puras: `parse`, `add`, `sub`, `mul(amount, intQty)`, `percent`, `compare`, `isZero`, `sum`, `format` (locale pt-BR, casas configuráveis, sem notação científica) e `toApi`.
  - Rejeição estrita de `number`, notação exponencial (ex: `1e-18`) e entradas inválidas.
  - Precisão mínima de 18 casas decimais com arredondamento `ROUND_HALF_UP`.
- **@nft/shared-contracts (Fonte Única de Tipos e Validação Zod)**:
  - Modelo padronizado `ApiError` e `ApiErrorSchema` com códigos explícitos (`VALIDATION_ERROR`, `UNAUTHENTICATED`, `SESSION_EXPIRED`, `FORBIDDEN`, `NOT_FOUND`, `CONFLICT`, `AVAILABILITY_CONFLICT`, `PRICE_CHANGED`, `IDEMPOTENCY_CONFLICT`, `TRANSIENT`), `retryable` e `fieldErrors`.
  - Schemas para Autenticação e Sessão (`SignUpInput`, `SignInInput`, `Session`, `User`), garantindo que senhas nunca retornem em respostas.
  - Schemas para Catálogo e NFTs (`NftItem`, `NftEdition`, `NftListQuery`, `PaginatedResponse`, `Rating`), com disponibilidade por edição e versão monotônica.
  - Schemas para Avaliações (`Review`, `ReviewListQuery`, `ReviewListResponse`) públicas e somente leitura (rating inteiro 1 a 5, sem criação ou eventos).
  - Schemas para Favoritos (`FavoriteItem`, `FavoritesResponse`, mutações).
  - Schemas para Carrinho (`CartItem`, `Cart`, `AddToCart`, `UpdateCartItem`, suporte a visitante anônimo e mesclagem no login).
  - Schemas para Cotação (`Quote`, `QuoteCoupon`, `ItemAvailability`), com cálculo centralizado e autoritativo da API.
  - Schemas para Pedidos (`Order`, `Collector`, `OrderReceiptSnapshot`), com criação idempotente via header `Idempotency-Key`, validação de formato do colecionador e estados terminais (`confirmed`, `rejected`).
  - Schemas para Perfil, Troca de Senha e Carteiras (principal e secundária).
  - Schemas para Eventos Socket.IO (`RealtimeEnvelope`, `NftUpdatedEvent`, `OrderUpdatedEvent`) em união discriminada, acompanhados de helpers puros `isDuplicate` e `isStale`.
  - Schemas tolerantes para Search Params de catálogo, carrinho e checkout (fallback para defaults sem quebrar a UI).
  - Regex rigoroso em todos os valores ETH, impedindo `number` para dinheiro.
- **Documentação e Fixtures**:
  - Criação de `docs/contracts.md` com documentação detalhada de todos os endpoints REST simulados, cabeçalhos e eventos Socket.IO.
  - Criação de fixtures canônicas em `@nft/shared-contracts` para reutilização em testes e mocks.

## Capabilities

### New Capabilities
- `monetary-precision`: Operações aritméticas exatas, tipo opaco `EthAmount`, formatação pt-BR e rejeição rigorosa de valores inválidos ou floats para representação de ETH.
- `domain-contracts`: Schemas Zod universais, tipos de transporte, modelo normalizado de `ApiError`, envelopes de eventos Socket.IO, search params tolerantes e documentação `docs/contracts.md`.

### Modified Capabilities
<!-- Nenhuma capability existente tem requisitos alterados; esta change estabelece as fundações de contratos e dinheiro. -->

## Impact

- **Projetos Nx Afetados**:
  - `libs/shared/money` (tags: `scope:shared`, `type:domain`, `flow:shared`)
  - `libs/shared/contracts` (tags: `scope:shared`, `type:domain`, `flow:shared`)
  - `libs/shared/http` e `libs/shared/query`: validação de compatibilidade com a nova classe `ApiError`.
  - `libs/shared/testing`: validação contínua das fronteiras arquiteturais.
- **Dependências Externas**: Nenhuma nova dependência; utiliza `decimal.js` e `zod` já instalados no monorepo.
- **Premissas e Limitações**:
  - Dados do colecionador no checkout são simulados e validados apenas por formato sintático (sem consultas reais on-chain).
  - Avaliações de NFTs são estritamente públicas e somente leitura, sem suporte a submissão de novas avaliações no escopo do MVP.
  - Valores monetários trafegam e residem exclusivamente como string decimal tipada como `EthAmount`.
