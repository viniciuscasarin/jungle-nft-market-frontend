# Mock Infrastructure Specification Delta

## MODIFIED Requirements

### Requirement: MSW Handlers and Common Protocol Helpers
The `@nft/mocks-core` and `@nft/mocks-handlers` modules SHALL expose reusable handler utilities (`defineHandler`, `apiPath(path)`, `apiError(code, options)`, `parseBody(schema)`, `requireSession(request)`, `paginate()`, `GET /api/__mocks/ping`) and a `GET /api/nfts` catalog handler integrated with the in-memory database (`getMockDatabase().nfts`) that filters by `q`/`search`, `collections`/`category`, `networks`, `minPrice`/`maxPrice` (using `@nft/shared-money` decimal comparison), and `tab` (`all`, `new`, `trending`), sorts by `sort`, paginates via `paginate()`, and returns facet counts while honoring all `NetworkProfile` rules.

#### Scenario: Validation error on malformed payload
- **WHEN** a request body fails Zod schema validation in `parseBody()`
- **THEN** an HTTP 422 response is returned containing an `ApiError` payload with `code: 'VALIDATION_ERROR'` and mapped `fieldErrors`.

#### Scenario: Expired session rejection
- **WHEN** a protected endpoint is called with a bearer token whose expiration date is in the past
- **THEN** an HTTP 401 response is returned with `code: 'SESSION_EXPIRED'` and `retryable: false`.

#### Scenario: Filtering, sorting, and paginating NFTs in GET /api/nfts
- **WHEN** `GET /api/nfts` is called with `q`, `collections`, `networks`, `minPrice`, `maxPrice`, `tab`, `sort`, `page`, and `pageSize`
- **THEN** the handler filters `getMockDatabase().nfts` deterministically using `@nft/shared-money` for price comparisons, sorts the matching items, applies `paginate()`, and returns `{ items, total, page, pageSize, totalPages, facets }`.

### Requirement: Comprehensive Domain Fixtures and Secure Password Hashes
The `@nft/mocks-fixtures` module SHALL provide deterministic fixtures validated against `@nft/shared-contracts`, containing at least 48 NFTs across 5 collections and 3 networks (`ethereum`, `polygon`, `solana`) using self-hosted local artwork paths (`/assets/images/nft-*.png`), public reviews, coupons (valid, percentage, fixed, expired, invalid), and at least two distinct users (`user_alice` and `user_bob`). User passwords SHALL NEVER be stored in plaintext and MUST be represented by precomputed `passwordHash` and `passwordSalt`.

#### Scenario: Fixture validation and minimum constraints
- **WHEN** the fixtures suite is loaded during tests
- **THEN** it validates against all contract schemas, contains >= 48 NFTs referencing local self-hosted images, >= 5 collections, and at least one NFT with >= 25 reviews and one with 0 reviews.

#### Scenario: Password authentication verification
- **WHEN** demo credentials for Alice or Bob are verified against their stored `passwordHash` and `passwordSalt`
- **THEN** the computed hash matches the fixture hash, while plaintext passwords remain absent from mock state.
