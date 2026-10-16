# Domain Contracts Specification

## Purpose

Define os schemas Zod de validação em tempo de execução, tipos TypeScript inferidos, modelo padronizado de erros de API, envelopes de eventos em tempo real Socket.IO e especificação de endpoints REST como fonte única da verdade para todo o sistema.

## Requirements

### Requirement: Standardized API Error Representation
The `@nft/shared-contracts` module SHALL provide an `ApiErrorSchema` and an `ApiError` class that captures normalized HTTP/RPC error responses including error code, message, optional field errors, optional details, and a retryable flag.

#### Scenario: Validating a standardized validation error
- **WHEN** an API response returns `{ code: "VALIDATION_ERROR", message: "Invalid payload", retryable: false, fieldErrors: { email: "Invalid email" } }`
- **THEN** `ApiErrorSchema.parse` SHALL accept the payload and return the typed object.

#### Scenario: Instantiating ApiError class
- **WHEN** `new ApiError({ code: "AVAILABILITY_CONFLICT", message: "Edition sold out", retryable: false })` is instantiated
- **THEN** it SHALL be an instance of `Error` with `name === "ApiError"`, `code === "AVAILABILITY_CONFLICT"`, and `retryable === false`.

### Requirement: Session and Authentication Contracts
The `@nft/shared-contracts` module SHALL provide validation schemas for user registration, login, session inspection, and logout, ensuring that user passwords are never exposed in responses or session contracts, enforcing password complexity rules (at least 8 characters with at least one letter and one number), and documenting all endpoints under the `/api/auth/*` path prefix.

#### Scenario: Validating session payload without password
- **WHEN** a session response payload is validated against `SessionSchema`
- **THEN** it SHALL require `token`, `user`, and `expiresAt`, and reject any schema containing sensitive password hashes or credentials.

#### Scenario: Validating registration input
- **WHEN** a valid signup input with `displayName`, `username`, `email`, and `password` is provided
- **THEN** `SignUpInputSchema.parse` SHALL succeed.

#### Scenario: Strong password validation in registration schema
- **WHEN** um payload de cadastro é validado pelo `SignUpInputSchema`
- **THEN** senhas com menos de 8 caracteres, sem nenhuma letra ou sem nenhum número são rejeitadas com erro de validação descritivo.

#### Scenario: Authentication and session contract endpoint consistency
- **WHEN** schemas e contratos de autenticação e sessão são consumidos por clientes ou handlers
- **THEN** as rotas especificadas em contrato utilizam a padronização `/api/auth/signup`, `/api/auth/login`, `/api/auth/session` e `/api/auth/logout`, e nenhuma estrutura de dados pública contém campos de `password`, `passwordHash` ou `passwordSalt`.

### Requirement: Catalog and NFT Contracts
The `@nft/shared-contracts` module SHALL provide schemas for NFT items, editions, catalog queries with combinable filters, pagination, and calculated ratings.

#### Scenario: Reject numeric price in NFT schema
- **WHEN** an NFT item payload provides `price: 1.5` as a `number` instead of a string
- **THEN** `NftItemSchema.parse` SHALL fail validation with a message indicating ETH amounts must be decimal strings.

#### Scenario: Validate edition availability and monotonic version
- **WHEN** an NFT item containing multiple editions with `maxSupply`, `availableSupply`, `price`, and monotonic `version` is validated
- **THEN** `NftItemSchema.parse` SHALL succeed and guarantee `version` is an integer.

#### Scenario: Validate NFT rating constraints
- **WHEN** an NFT detail contains `rating: { average: 4.8, count: 120 }`
- **THEN** `NftRatingSchema.parse` SHALL accept the payload, enforcing average between 0 and 5 and integer count.

### Requirement: Public Read-Only NFT Reviews Contract
The `@nft/shared-contracts` module SHALL provide schemas for public read-only review listings, enforcing that review ratings must strictly be integers between 1 and 5.

#### Scenario: Reject review with rating 0, 6 or fractional
- **WHEN** a review payload provides `rating: 0`, `rating: 6`, or `rating: 4.5`
- **THEN** `ReviewSchema.parse` SHALL fail validation with an error indicating rating must be an integer between 1 and 5.

#### Scenario: Validate legitimate review
- **WHEN** a review with `id`, `author`, `rating: 5`, `comment: "Great piece"`, and `createdAt` is validated
- **THEN** `ReviewSchema.parse` SHALL succeed.

### Requirement: Cart and Quote Calculation Contracts
The `@nft/shared-contracts` module SHALL provide schemas for cart items, guest cart identity headers, and API quote responses.

#### Scenario: Enforce integer quantities in cart items
- **WHEN** a cart item is submitted with `quantity: 2.5`
- **THEN** `CartItemSchema.parse` SHALL fail validation.

#### Scenario: Validate authoritative quote response
- **WHEN** a quote payload containing `quoteId`, `subtotal`, `discount`, `networkFee`, `total`, `itemsAvailability`, and `expiresAt` is received
- **THEN** `QuoteSchema.parse` SHALL validate all monetary fields as valid decimal ETH strings.

### Requirement: Order Creation and Collector Form Validation
The `@nft/shared-contracts` module SHALL provide schemas for order submission with mandatory `Idempotency-Key` header, order receipts, and format validation for the `Collector` data object.

#### Scenario: Missing secondary wallet when flag is true
- **WHEN** a collector object has `useSecondaryWallet: true` but `secondaryWallet` is omitted or null
- **THEN** `CollectorSchema.parse` SHALL fail validation with a field error specifically associated with `secondaryWallet`.

#### Scenario: Secondary wallet provided when flag is false
- **WHEN** a collector object has `useSecondaryWallet: false` and `secondaryWallet` is omitted
- **THEN** `CollectorSchema.parse` SHALL succeed.

#### Scenario: Invalid wallet address format
- **WHEN** `collector.walletAddress` does not match the 42-character hexadecimal pattern `0x` + 40 hex digits
- **THEN** `CollectorSchema.parse` SHALL fail validation with a field error on `walletAddress`.

#### Scenario: ENS name containing dot-eth suffix
- **WHEN** `collector.ensName` is submitted as `"vitalik.eth"` instead of `"vitalik"`
- **THEN** `CollectorSchema.parse` SHALL fail validation with a field error on `ensName`.

### Requirement: Socket.IO Realtime Event Envelopes and Pure Helpers
The `@nft/shared-contracts` module SHALL provide a discriminated union schema for Socket.IO event envelopes (`nft.updated`, `order.updated`) and pure helpers `isDuplicate` and `isStale`.

#### Scenario: Deduplicate events with identical IDs
- **WHEN** two event envelopes share the same `id`
- **THEN** `isDuplicate(incomingEvent, existingEvents)` SHALL return `true`.

#### Scenario: Detect stale event version
- **WHEN** an incoming event envelope has `version: 3` and the currently applied version is `3` or `4`
- **THEN** `isStale(incomingEvent.version, currentVersion)` SHALL return `true`.

#### Scenario: Discriminate valid realtime events
- **WHEN** an envelope with `type: "nft.updated"` and valid resource and payload is parsed
- **THEN** `RealtimeEnvelopeSchema.parse` SHALL validate the envelope as an `NftUpdatedEvent`.

### Requirement: Tolerant Search Parameters Schemas
The `@nft/shared-contracts` module SHALL provide safe, tolerant search parameter schemas and parsing functions for catalog, cart, and checkout URLs that fall back to deterministic defaults without throwing errors.

#### Scenario: Tolerant parsing of invalid catalog URL parameters
- **WHEN** catalog query parameters contain invalid values such as `page="invalid"`, `pageSize="-10"`, or `sort="unknown"`
- **THEN** `parseCatalogSearchParams` SHALL return a valid object with fallback values `page: 1`, `pageSize: 12`, and default sort order.

### Requirement: Contract Documentation and Test Fixtures
The workspace SHALL include a complete markdown specification in `docs/contracts.md` and export typed, reusable test fixtures from `@nft/shared-contracts`.

#### Scenario: Fixture validation against contracts
- **WHEN** exported test fixtures for NFTs, quotes, users, and orders are parsed by their respective Zod schemas
- **THEN** all fixtures SHALL pass schema validation without errors.
