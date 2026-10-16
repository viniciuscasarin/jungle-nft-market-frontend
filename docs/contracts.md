# Especificação de Contratos de API (REST & Socket.IO)

Este documento especifica formalmente todos os contratos REST e envelopes de eventos em tempo real do **Jungle NFT Marketplace**. Todos os tipos, formatos e validações derivam estritamente dos schemas Zod definidos em `@nft/shared-contracts`.

---

## 1. Padrões Globais e Invariantes

### Precisão Monetária (ETH)
- Todo valor em ETH trafega e reside **exclusivamente como string decimal** (`EthAmount`), validado por regex `/^(?:0|[1-9]\d*)(?:\.\d+)?$/`.
- Tipos numéricos (`number`) ou notações científicas (`1e-18`) são estritamente proibidos e rejeitados pelos schemas.
- Quantidades de itens são números inteiros positivos.
- Totais (subtotal, desconto, taxa de rede, total final) são autoritativos e calculados unicamente pela API na cotação (`/api/quote`). A interface do cliente nunca recalcula totais.

### Formato de Erros Padronizado (`ApiError`)
Todas as falhas da API retornam um payload JSON estruturado conforme `ApiErrorSchema`:

```json
{
  "code": "VALIDATION_ERROR",
  "message": "Dados de entrada inválidos",
  "retryable": false,
  "fieldErrors": {
    "email": "Email inválido",
    "password": "Senha deve ter no mínimo 8 caracteres"
  },
  "details": null
}
```

#### Códigos de Erro Padronizados (`ApiErrorCode`)
| Código | HTTP Status | Retryable | Descrição |
|---|---|---|---|
| `VALIDATION_ERROR` | 400 | `false` | Erro de validação de schema ou campos de formulário inválidos |
| `UNAUTHENTICATED` | 401 | `false` | Token ausente, inválido ou credenciais incorretas |
| `SESSION_EXPIRED` | 401 | `false` | Sessão expirada; exige reautenticação preservando contexto |
| `FORBIDDEN` | 403 | `false` | Acesso negado ao recurso de outro usuário |
| `NOT_FOUND` | 404 | `false` | Recurso não encontrado |
| `CONFLICT` | 409 | `false` | Conflito de cadastro (ex: username ou email já em uso) |
| `AVAILABILITY_CONFLICT`| 409 | `false` | Edição de NFT esgotada ou quantidade solicitada indisponível |
| `PRICE_CHANGED` | 409 | `false` | Preço de NFT alterado; exige revalidação de cotação |
| `IDEMPOTENCY_CONFLICT` | 409 | `false` | Reutilização de chave de idempotência com payload diferente |
| `TRANSIENT` | 500 / 503 | `true` | Falha temporária no servidor simulado ou timeout de rede |
| `NETWORK_ERROR` | 0 | `true` | Falha de conexão detectada pelo cliente Axios |

### Cabeçalhos Padrão
- `Authorization: Bearer <token>`: Obrigatório para endpoints protegidos por autenticação.
- `X-Session-Id: <uuid>`: Identificador do carrinho anônimo do visitante (preservado até o login).
- `Idempotency-Key: <uuid>`: Obrigatório em mutations de criação de pedido (`POST /api/orders`).

---

## 2. Autenticação e Sessão

### `POST /api/auth/signup`
Cria uma nova conta de usuário.

- **Headers:** `Content-Type: application/json`
- **Request Body (`SignUpInputSchema`):**
  ```json
  {
    "displayName": "Alex Cyber",
    "username": "alex_cyber",
    "email": "alex@jungle.market",
    "password": "StrongPassword123!"
  }
  ```
- **Response 201 (`SessionSchema`):**
  ```json
  {
    "token": "jwt-token-string",
    "user": {
      "id": "usr-1",
      "displayName": "Alex Cyber",
      "username": "alex_cyber",
      "email": "alex@jungle.market",
      "avatarUrl": null,
      "bio": null,
      "createdAt": "2026-01-10T10:00:00.000Z"
    },
    "expiresAt": "2026-12-31T23:59:59.000Z"
  }
  ```
- **Erros:** `VALIDATION_ERROR` (400), `CONFLICT` (409).

### `POST /api/auth/login`
Autentica um usuário existente.

- **Request Body (`SignInInputSchema`):**
  ```json
  {
    "identifier": "alex@jungle.market",
    "password": "StrongPassword123!"
  }
  ```
- **Response 200 (`SessionSchema`):** Igual ao `signup`. Senhas nunca retornam na resposta.
- **Erros:** `VALIDATION_ERROR` (400), `UNAUTHENTICATED` (401).

### `GET /api/auth/session`
Inspeciona e valida a sessão ativa atual.

- **Headers:** `Authorization: Bearer <token>`
- **Response 200 (`SessionSchema`):** Sessão ativa com dados do usuário.
- **Erros:** `UNAUTHENTICATED` (401), `SESSION_EXPIRED` (401).

### `POST /api/auth/logout`
Encerra a sessão ativa e invalida o token.

- **Headers:** `Authorization: Bearer <token>`
- **Response 200:** `{ "success": true }`

---

## 3. Catálogo e NFTs

### `GET /api/nfts`
Listagem paginada do catálogo com filtros combináveis e ordenação.

- **Query Parameters (`NftListQuerySchema`):**
  - `search` (opcional): Termo de busca textual no título e descrição.
  - `category` (opcional): Categoria do NFT (ex: `"Cyberpunk"`, `"Art"`).
  - `minPrice` (opcional): Preço mínimo em ETH (`EthAmount`).
  - `maxPrice` (opcional): Preço máximo em ETH (`EthAmount`).
  - `sort`: `'popular-desc' | 'price-asc' | 'price-desc' | 'rating-desc' | 'created-desc'` (default: `'popular-desc'`).
  - `page`: Número da página (inteiro >= 1, default: `1`).
  - `pageSize`: Itens por página (inteiro >= 1, default: `12`).
- **Response 200 (`NftListResponseSchema`):**
  ```json
  {
    "items": [
      {
        "id": "nft-101",
        "title": "Apex Predator #01",
        "description": "Cybernetic feline prowling the digital canopy.",
        "imageUrl": "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe",
        "creator": {
          "id": "cr-1",
          "name": "NeoTokyo Studios",
          "avatarUrl": "https://example.com/avatar.jpg",
          "verified": true
        },
        "category": "Cyberpunk",
        "tags": ["3D", "Cyber", "Predator"],
        "price": "1.7500",
        "rating": { "average": 4.9, "count": 88 },
        "editions": [
          {
            "id": "ed-1",
            "editionNumber": 1,
            "name": "First Edition",
            "maxSupply": 50,
            "availableSupply": 12,
            "price": "1.7500",
            "version": 1
          }
        ],
        "featured": true,
        "version": 1,
        "createdAt": "2026-02-01T08:00:00.000Z"
      }
    ],
    "total": 45,
    "page": 1,
    "pageSize": 12,
    "totalPages": 4
  }
  ```

### `GET /api/nfts/:id`
Consulta detalhes de um NFT específico.

- **Response 200 (`NftItemSchema`):** Objeto `NftItem` completo com lista de edições disponíveis e versões monotônicas.
- **Erros:** `NOT_FOUND` (404).

### `GET /api/nfts/:id/reviews`
Listagem pública e somente leitura de avaliações do NFT.

- **Query Parameters (`ReviewListQuerySchema`):** `page` (default: 1), `pageSize` (default: 10).
- **Response 200 (`ReviewListResponseSchema`):**
  ```json
  {
    "items": [
      {
        "id": "rev-1",
        "nftId": "nft-101",
        "author": {
          "id": "usr-2",
          "name": "Elena Vault",
          "avatarUrl": "https://example.com/avatar2.jpg"
        },
        "rating": 5,
        "comment": "Incredible texture and lighting.",
        "createdAt": "2026-02-06T15:30:00.000Z"
      }
    ],
    "total": 1,
    "page": 1,
    "pageSize": 10,
    "totalPages": 1
  }
  ```
- **Nota de Escopo:** Avaliações são estritamente para consulta pública (rating inteiro 1 a 5). Não há suporte a criação ou edição no escopo do MVP.

---

## 4. Favoritos

### `GET /api/favorites`
Consulta os IDs dos NFTs favoritados pelo usuário autenticado.

- **Headers:** `Authorization: Bearer <token>`
- **Response 200:** `{ "items": ["nft-101", "nft-102"] }`
- **Erros:** `UNAUTHENTICATED` (401).

### `POST /api/favorites/:id`
Adiciona um NFT aos favoritos (suporta atualização otimista com rollback).

- **Headers:** `Authorization: Bearer <token>`
- **Response 200:** `{ "success": true }`

### `DELETE /api/favorites/:id`
Remove um NFT dos favoritos.

- **Headers:** `Authorization: Bearer <token>`
- **Response 200:** `{ "success": true }`

---

## 5. Carrinho e Cotação

### `GET /api/cart`
Consulta os itens do carrinho ativo (usuário autenticado ou visitante).

- **Headers:** `Authorization: Bearer <token>` (ou `X-Session-Id: <uuid>`)
- **Response 200 (`CartSchema`):**
  ```json
  {
    "id": "cart-100",
    "userId": "usr-1",
    "sessionId": null,
    "items": [
      {
        "id": "cart-item-1",
        "nftId": "nft-101",
        "editionId": "ed-1",
        "title": "Apex Predator #01",
        "editionNumber": 1,
        "imageUrl": "https://example.com/nft.png",
        "unitPrice": "1.7500",
        "quantity": 2,
        "maxAvailable": 12
      }
    ],
    "couponCode": "JUNGLE10",
    "updatedAt": "2026-02-10T14:00:00.000Z"
  }
  ```

### `POST /api/cart/items`
Adiciona um item ao carrinho.

- **Request Body (`AddToCartInputSchema`):**
  ```json
  {
    "nftId": "nft-101",
    "editionId": "ed-1",
    "quantity": 1
  }
  ```
- **Response 200 (`CartSchema`):** Carrinho atualizado.
- **Erros:** `AVAILABILITY_CONFLICT` (409) se a edição estiver esgotada.

### `PATCH /api/cart/items/:id`
Altera a quantidade de um item no carrinho.

- **Request Body (`UpdateCartItemInputSchema`):** `{ "quantity": 3 }` (número inteiro positivo).
- **Response 200 (`CartSchema`):** Carrinho atualizado.

### `DELETE /api/cart/items/:id`
Remove um item do carrinho.

- **Response 200 (`CartSchema`):** Carrinho atualizado.

### `POST /api/cart/coupon`
Aplica um cupom de desconto ao carrinho.

- **Request Body:** `{ "code": "JUNGLE10" }`
- **Response 200 (`CartSchema`):** Carrinho com cupom aplicado.
- **Erros:** `VALIDATION_ERROR` (400) para cupom inválido ou expirado.

### `DELETE /api/cart/coupon`
Remove o cupom aplicado do carrinho.

- **Response 200 (`CartSchema`):** Carrinho sem cupom.

### `POST /api/quote`
Gera a cotação autoritativa para o checkout.

- **Request Body (`CreateQuoteInputSchema`):**
  ```json
  {
    "items": [
      { "nftId": "nft-101", "editionId": "ed-1", "quantity": 2 }
    ],
    "couponCode": "JUNGLE10",
    "walletAddress": "0x1111111111111111111111111111111111111111"
  }
  ```
- **Response 200 (`QuoteSchema`):**
  ```json
  {
    "quoteId": "quote-999",
    "subtotal": "3.5000",
    "discount": "0.3500",
    "networkFee": "0.0050",
    "total": "3.1550",
    "coupon": {
      "code": "JUNGLE10",
      "discountPercent": 10,
      "discountAmount": "0.3500",
      "isValid": true,
      "message": "10% de desconto aplicado."
    },
    "itemsAvailability": [
      {
        "nftId": "nft-101",
        "editionId": "ed-1",
        "requestedQuantity": 2,
        "availableQuantity": 12,
        "isAvailable": true,
        "currentPrice": "1.7500",
        "priceChanged": false
      }
    ],
    "isExpired": false,
    "expiresAt": "2026-12-31T23:59:59.000Z"
  }
  ```
- **Erros:** `PRICE_CHANGED` (409), `AVAILABILITY_CONFLICT` (409).

---

## 6. Pedidos e Pagamento

### `POST /api/orders`
Cria um pedido com garantia estrita de **Idempotência**.

- **Headers:**
  - `Authorization: Bearer <token>`
  - `Idempotency-Key: <uuid>` (Obrigatório)
- **Request Body (`CreateOrderInputSchema`):**
  ```json
  {
    "quoteId": "quote-999",
    "collector": {
      "fullName": "Alex Cyber",
      "email": "alex@jungle.market",
      "walletAddress": "0x1111111111111111111111111111111111111111",
      "network": "ethereum-mainnet",
      "ensName": "alexcyber",
      "useSecondaryWallet": false
    }
  }
  ```
- **Comportamento de Idempotência:**
  - Chamadas subsequentes com a **mesma** `Idempotency-Key` e o **mesmo** corpo retornam o pedido já criado com HTTP 200.
  - Reutilização da mesma chave com corpo diferente retorna `IDEMPOTENCY_CONFLICT` (409).
- **Response 201 / 200 (`OrderSchema`):**
  ```json
  {
    "id": "ord-888",
    "userId": "usr-1",
    "quoteId": "quote-999",
    "idempotencyKey": "idemp-55555",
    "status": "confirmed",
    "collector": { ... },
    "items": [ ... ],
    "subtotal": "3.5000",
    "discount": "0.3500",
    "networkFee": "0.0050",
    "total": "3.1550",
    "receipt": {
      "orderId": "ord-888",
      "transactionHash": "0xabcdef...",
      "collector": { ... },
      "items": [ ... ],
      "quoteId": "quote-999",
      "subtotal": "3.5000",
      "discount": "0.3500",
      "networkFee": "0.0050",
      "total": "3.1550",
      "confirmedAt": "2026-02-10T14:05:00.000Z",
      "blockNumber": 19283746
    },
    "rejectionReason": null,
    "createdAt": "2026-02-10T14:02:00.000Z",
    "updatedAt": "2026-02-10T14:05:00.000Z"
  }
  ```
- **Erros:** `IDEMPOTENCY_CONFLICT` (409), `PRICE_CHANGED` (409), `AVAILABILITY_CONFLICT` (409), `VALIDATION_ERROR` (400).

### `GET /api/orders/:id`
Consulta o estado de um pedido e seu recibo imutável.

- **Headers:** `Authorization: Bearer <token>`
- **Response 200 (`OrderSchema`):** Objeto do pedido. O recibo imutável reflete os preços originais do momento da compra.
- **Erros:** `NOT_FOUND` (404), `FORBIDDEN` (403).

---

## 7. Perfil e Carteiras

### `GET /api/profile`
Consulta os dados do perfil do usuário autenticado.

- **Headers:** `Authorization: Bearer <token>`
- **Response 200 (`ProfileSchema`):** Objeto `User` sem dados confidenciais de credenciais.

### `PATCH /api/profile`
Atualiza dados cadastrais e avatar.

- **Request Body (`UpdateProfileInputSchema`):**
  ```json
  {
    "displayName": "Alex Cyber Updated",
    "bio": "New bio description",
    "avatarUrl": "https://example.com/new-avatar.jpg"
  }
  ```
- **Response 200 (`ProfileSchema`):** Perfil atualizado.

### `POST /api/profile/change-password`
Altera a senha do usuário autenticado.

- **Request Body (`ChangePasswordInputSchema`):**
  ```json
  {
    "currentPassword": "OldPassword123!",
    "newPassword": "NewStrongPassword123!"
  }
  ```
- **Response 200:** `{ "success": true }`
- **Erros:** `VALIDATION_ERROR` (400) se a nova senha for igual à atual.

### `GET /api/wallets`
Consulta a carteira principal e a carteira secundária do usuário.

- **Headers:** `Authorization: Bearer <token>`
- **Response 200 (`UserWalletsSchema`):**
  ```json
  {
    "primary": {
      "id": "wal-1",
      "address": "0x1111111111111111111111111111111111111111",
      "network": "ethereum-mainnet",
      "ensName": "alexcyber",
      "label": "Cold Storage",
      "isPrimary": true
    },
    "secondary": {
      "id": "wal-2",
      "address": "0x2222222222222222222222222222222222222222",
      "network": "polygon",
      "ensName": null,
      "label": "Daily Wallet",
      "isPrimary": false
    }
  }
  ```

### `POST /api/wallets`
Cadastra ou atualiza uma carteira.

- **Request Body (`CreateWalletInputSchema`):**
  ```json
  {
    "address": "0x1111111111111111111111111111111111111111",
    "network": "ethereum-mainnet",
    "ensName": "alexcyber",
    "label": "Primary Vault",
    "isPrimary": true
  }
  ```
- **Validações Estritas:**
  - `address`: Deve ter exatamente 42 caracteres hexadecimais começando com `0x`.
  - `ensName`: Não deve conter o sufixo `.eth`.
- **Response 201 (`WalletSchema`):** Carteira cadastrada.

---

## 8. Eventos em Tempo Real (Socket.IO)

Os eventos em tempo real são simulados via interceptação WebSocket (`@mswjs/socket.io-binding`) e consumidos pelo `socket.io-client` oficial.

### Envelope Unificado (`RealtimeEnvelopeSchema`)

```typescript
type RealtimeEnvelope = NftUpdatedEvent | OrderUpdatedEvent;
```

### Evento `nft.updated` (`NftUpdatedEnvelopeSchema`)
Emitido quando o preço ou a disponibilidade de um NFT ou edição sofrem alteração.

```json
{
  "id": "evt-nft-12345",
  "type": "nft.updated",
  "resource": "nft",
  "resourceId": "nft-101",
  "version": 2,
  "timestamp": "2026-02-10T14:10:00.000Z",
  "payload": {
    "nftId": "nft-101",
    "editionId": "ed-1",
    "price": "1.8000",
    "availableSupply": 10,
    "maxSupply": 50
  }
}
```

### Evento `order.updated` (`OrderUpdatedEnvelopeSchema`)
Emitido quando o status de um pedido é atualizado pelo backend simulado.

```json
{
  "id": "evt-ord-98765",
  "type": "order.updated",
  "resource": "order",
  "resourceId": "ord-888",
  "version": 2,
  "timestamp": "2026-02-10T14:05:00.000Z",
  "userId": "usr-1",
  "payload": {
    "orderId": "ord-888",
    "userId": "usr-1",
    "status": "confirmed",
    "transactionHash": "0xabcdef...",
    "confirmedAt": "2026-02-10T14:05:00.000Z"
  }
}
```

### Regras de Processamento no Cliente
1. **Deduplicação por ID (`isDuplicate`):** Eventos com `id` já processado são descartados imediatamente.
2. **Descarte de Eventos Obsoletos (`isStale`):** Eventos com `version <= currentVersion` do recurso são descartados para evitar regressão de estado.
3. **Isolamento de Usuário:** Eventos com `userId` diferente do usuário logado na sessão ativa são ignorados.
4. **Ciclo de Vida:** Todos os listeners são removidos no desmonte dos componentes e no logout.
