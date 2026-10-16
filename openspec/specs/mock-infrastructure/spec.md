# mock-infrastructure Specification

## Purpose
Fornecer um ambiente de backend simulado determinístico, em memória e reativo para desenvolvimento, testes automatizados e demonstração, integrando MSW, controle de cenários, injeção de falhas de rede, relógio/PRNG estáveis, persistência local e fixtures aderentes aos contratos do sistema.

## Requirements

### Requirement: Scenario Model and Registry
The `@nft/mocks-core` module SHALL provide a typed scenario schema `ScenarioSchema` and a closed registry of scenario identifiers (`ScenarioId`), where each scenario bundles an initial dataset, a network profile, runtime feature flags, and a clock configuration. The network profile SHALL be switchable at runtime without replacing the scenario data.

#### Scenario: Registering and applying scenario
- **WHEN** a valid `ScenarioId` (such as `default`, `empty`, or `slow-network`) is selected
- **THEN** the system applies the corresponding initial dataset, behavior flags, and network profile.

#### Scenario: Runtime network profile override
- **WHEN** `setNetworkProfile()` is invoked with a custom network profile while a scenario is active
- **THEN** the active scenario retains its data and flags while network conditions update immediately.

---

### Requirement: In-Memory Database with Atomic Transactions and Versioning
The `@nft/mocks-core` module SHALL provide an in-memory database containing collections strictly typed by `@nft/shared-contracts` schemas (`users`, `sessions`, `nfts`, `reviews`, `favorites`, `carts`, `coupons`, `orders`, `profiles`, `wallets`). The database SHALL support atomic transactions via `transaction(fn)` (rolling back all mutations if an exception occurs) and monotonic integer versioning via `bumpVersion()` on each modified entity.

#### Scenario: Transaction commit on success
- **WHEN** operations within `transaction(fn)` complete without throwing
- **THEN** all changes are committed to the memory database, affected resource versions increment monotonically, and state is persisted.

#### Scenario: Transaction rollback on failure
- **WHEN** an error is thrown within `transaction(fn)`
- **THEN** all uncommitted mutations within the transaction block are discarded and the database state remains unchanged.

#### Scenario: Domain helper mergeGuestCart
- **WHEN** `mergeGuestCart(guestId, userId)` is executed
- **THEN** guest items are merged into the user cart, summing quantities while capping them at the available edition supply.

---

### Requirement: Deterministic Clock and PRNG Injection
The `@nft/mocks-core` module SHALL provide an injectable `Clock` abstraction (supporting `system` and `controlled(start)` modes with `now()`, `advance(ms)`, and `set(date)`) and an injectable PRNG engine based on Mulberry32 initialized with a deterministic seed, providing `next()`, `int(min, max)`, `pick(array)`, `uuid()`, and token/hash generators. Fixtures SHALL NOT use absolute timestamps.

#### Scenario: Reproducible pseudo-random sequence
- **WHEN** the PRNG engine is initialized with the same numeric seed across multiple runs
- **THEN** it generates the exact identical sequence of numbers, UUIDs, and picks.

#### Scenario: Controlled clock progression
- **WHEN** `advanceClock(ms)` is called on a controlled clock instance
- **THEN** `now()` advances by exactly the specified milliseconds without waiting for real time.

---

### Requirement: Resilient Local Persistence and Exact Reset
The `@nft/mocks-core` module SHALL provide a `StorageAdapter` interface with `localStorage` (browser) and `MemoryStorageAdapter` (Node/Vitest) implementations under the versioned key `nft-mocks:v1:state`. In the event of storage quota exhaustion or deserialization errors, the mock system SHALL degrade gracefully to in-memory mode without crashing, flagging `persistenceDegraded: true`. Calling `reset()` SHALL purge local persistence and restore an identical initial snapshot of the scenario.

#### Scenario: Restoring state across page reloads
- **WHEN** the browser refreshes with matching scenario and schema versions in local storage
- **THEN** the persisted state (mutated collections, version counters, clock offset) is restored.

#### Scenario: Exact state restoration on reset
- **WHEN** `reset()` is executed after arbitrary database mutations
- **THEN** the state becomes bitwise or deeply identical to the pristine initial snapshot of that scenario.

---

### Requirement: Universal Network Conditions Pipeline
The `@nft/mocks-core` module SHALL enforce network simulation rules via a `NetworkProfile` applied uniformly to all handlers through `defineHandler`. Rules SHALL support phases (`before` and `after` domain handler execution) and behaviors: `latency` (fixed or PRNG range), deterministic `outOfOrder`, `timeout` (honoring `AbortSignal`), `connectionError` (`HttpResponse.error()`), `httpError` (with `ApiError` payload), `failTimes(n, behavior)`, and `sequence([...])`.

#### Scenario: Timeout after domain execution (phase: 'after')
- **WHEN** a mutation request (such as `POST /api/orders`) matches a rule with `phase: 'after'` and `timeout` behavior
- **THEN** the domain handler persists the order into the database, but the client connection aborts or times out before receiving the response.

#### Scenario: Temporary failure recovery (failTimes)
- **WHEN** a rule `failTimes(2, httpError(503, 'TRANSIENT'))` matches a resource
- **THEN** the first two requests return HTTP 503, and the third request succeeds normally.

#### Scenario: Deterministic out-of-order responses
- **WHEN** two consecutive requests match an `outOfOrder` matcher
- **THEN** the second request resolves before the first request deterministically.

---

### Requirement: MSW Handlers and Common Protocol Helpers
The `@nft/mocks-core` module SHALL expose reusable handler utilities: `defineHandler`, `apiPath(path)`, `apiError(code, options)`, `parseBody(schema)` returning HTTP 422 `VALIDATION_ERROR` with structured `fieldErrors`, `requireSession(request)` validating bearer tokens and expiration, `paginate()`, and a diagnostic endpoint `GET /api/__mocks/ping` active only when mocks are enabled.

#### Scenario: Validation error on malformed payload
- **WHEN** a request body fails Zod schema validation in `parseBody()`
- **THEN** an HTTP 422 response is returned containing an `ApiError` payload with `code: 'VALIDATION_ERROR'` and mapped `fieldErrors`.

#### Scenario: Expired session rejection
- **WHEN** a protected endpoint is called with a bearer token whose expiration date is in the past
- **THEN** an HTTP 401 response is returned with `code: 'SESSION_EXPIRED'` and `retryable: false`.

---

### Requirement: Runtime Scenario Selection and Headless Dev Panel
The application SHALL resolve the active scenario in order of precedence: `?scenario=<id>` query parameter > persisted runtime selection > `VITE_DEFAULT_SCENARIO` > `'default'`. Parameters `?scenario` and `?reset` SHALL be sanitized from the URL using `history.replaceState` before the TanStack Router initializes. The host SHALL include a lazy-loaded `MocksDevPanel` accessible only via keyboard shortcut `Ctrl+Alt+M` or `?mocks-panel=1`, and SHALL expose typed controls on `window.__mocks`.

#### Scenario: Applying scenario from URL parameter
- **WHEN** the user navigates to `/?scenario=slow-network`
- **THEN** the `slow-network` scenario is applied, state is reset to that scenario, and the query parameter is removed from the URL without triggering a route transition.

#### Scenario: Dev panel toggling via keyboard
- **WHEN** `Ctrl+Alt+M` is pressed in an environment with mocks enabled
- **THEN** the `MocksDevPanel` dialog opens with keyboard focus trapped, allowing scenario switching and clock adjustment without adding floating buttons to the DOM.

---

### Requirement: Comprehensive Domain Fixtures and Secure Password Hashes
The `@nft/mocks-fixtures` module SHALL provide deterministic fixtures validated against `@nft/shared-contracts`, containing at least 48 NFTs across 5 collections and 3 networks (`ethereum`, `polygon`, `solana`), public reviews, coupons (valid, percentage, fixed, expired, invalid), and at least two distinct users (`user_alice` and `user_bob`). User passwords SHALL NEVER be stored in plaintext and MUST be represented by precomputed `passwordHash` and `passwordSalt`.

#### Scenario: Fixture validation and minimum constraints
- **WHEN** the fixtures suite is loaded during tests
- **THEN** it validates against all contract schemas, contains >= 48 NFTs, >= 5 collections, and at least one NFT with >= 25 reviews and one with 0 reviews.

#### Scenario: Password authentication verification
- **WHEN** demo credentials for Alice or Bob are verified against their stored `passwordHash` and `passwordSalt`
- **THEN** the computed hash matches the fixture hash, while plaintext passwords remain absent from mock state.

---

### Requirement: Host and Standalone MSW Integration
The `@nft/shell-kit` module SHALL provide an idempotent `startMocks()` function for browser environments and `createMockServer()` for Vitest/Node environments. When `VITE_ENABLE_MOCKS` is `'false'`, all mock code and `msw` dependencies SHALL be excluded from the host production bundle via dynamic import.

#### Scenario: Idempotent initialization
- **WHEN** `startMocks()` is called multiple times consecutively
- **THEN** the exact same service worker instance is reused and no secondary workers are registered.

#### Scenario: Complete tree-shaking when disabled
- **WHEN** the shell application is built with `VITE_ENABLE_MOCKS=false`
- **THEN** the generated output chunks do not contain `msw` or mock database code, and `window.__mocks` remains undefined.

---

### Requirement: Architectural Boundary Alignment for Test Utilities
The workspace linting configuration SHALL permit `@nft/shared-testing` to import `@nft/mocks-*` and `msw` to facilitate isolated unit and integration testing. Production modules, UI components, and domain feature libraries SHALL remain strictly prohibited from importing `@nft/mocks-*` or `@nft/shared-testing`.

#### Scenario: Shared testing imports mocks legally
- **WHEN** `@nft/shared-testing` imports from `@nft/mocks-core` or `msw`
- **THEN** ESLint and `@nx/enforce-module-boundaries` pass without violations.

#### Scenario: Feature library prohibited from importing mocks
- **WHEN** any `feature` or `data-access` library attempts to import `@nft/mocks-core`
- **THEN** ESLint and `@nx/enforce-module-boundaries` reject the import with a lint error.
