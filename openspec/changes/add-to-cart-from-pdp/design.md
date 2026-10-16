# Design: Add to Cart from PDP

## Context

See proposal.md for the motivation and specs/cart-add-to-cart/spec.md for observable requirements. The Shell owns the HTTP, Query and Realtime clients. Domain and UI libraries cannot obtain those services themselves. This revision records the architecture correction approved during apply.

## Goals / Non-Goals

Implement the specified guest/authenticated cart, optimistic addition, accessible feedback, shared badge, CRUD and API quote. Preserve the existing presentation assets. No real payment, blockchain, personalized recommendations or coupon application is added. Unsupported controls announce their unavailability.

## Decisions

### Dependency injection and composition

- `cartQueryOptions(client, userId?, sessionId?)` and `cartItemCountQueryOptions(client, userId?, sessionId?)` receive the existing HttpClient, matching catalog data-access.
- Mutation hooks receive client, identity and feedback callbacks; QueryClient comes from the existing Query provider. They never import shell-kit, create clients or embed fixture responses.
- `CartFeaturePage` in cart/feature obtains services through useShell and composes query/mutation hooks. CartPage in the remote exports that page. `CartPageContent` in cart/ui receives items, formatted API summary, status and action callbacks as props; it contains no fetching or duplicate business state.
- The alternative (connected UI, or shell-kit imported by data-access) is rejected because it violates AGENTS.md section 4.

### Queries and optimistic mutations

Use shared/query factories, retaining the existing callable cart.all(). Lists/counts have hierarchical prefixes; private keys include userId, and guest keys may include sessionId. The count is a select over the cart query, so optimistic cache changes are immediately shared with the badge.

GET uses a 30-second staleTime, AbortSignal and at most one retry for ApiError.retryable. Input and response boundaries use shared/contracts schemas. POST uses a 10-second timeout and no automatic retry. Mutations invalidate cart and quote after success. Add performs cancellation, snapshot, optimistic insertion/merge from actual cached catalog metadata and rollback on failure. Temporary optimistic IDs do not represent server confirmation. Missing cart data is first fetched through REST. Responses belonging to an identity which has changed must not repopulate private caches. Controls are disabled while their mutation is pending.

### Cart presentation and money

The feature maps API CartItem to display props. Per-item decimal formatting/calculation uses shared/money through cart/domain. Subtotal, discount, network fee and total are supplied exclusively by the existing checkout quote API. UI never parses ETH with parseFloat or calculates order totals. Quote loading/error states block checkout until an authoritative quote is available. Coupon application is explicitly unavailable in this change. Header, breadcrumb, footer and mobile navigation remain owned by the Shell. Responsive content has a single accessible tree or hides inactive variants from layout and accessibility. Drawer focus is managed by shared/ui.

### Routes and session lifecycle

`/carrinho` remains the canonical Shell route. `/cart` is a compatibility alias and is supported by the checkout standalone harness. Authentication, cancellation, cache removal and realtime disconnect remain in the existing SessionController. Login invalidates guest and authenticated cart data after the server's existing mergeGuestCart; logout/user replacement cancels queries and clears the previous private cart. No second session controller is introduced.

### Mocks

Cart handlers use defineHandler with relative /cart paths and the shared network pipeline. Bearer sessions are opaque tokens validated by requireSession; invalid/expired credentials never fall back to guest ownership. Missing identity returns UNAUTHENTICATED, insufficient stock AVAILABILITY_CONFLICT, and invalid input VALIDATION_ERROR (the canonical contracts take precedence over legacy lowercase example codes). All timestamps use the injected clock. Current stock is checked on update, including zero; repeated addition merges within availability. CRUD and guest merge persist through the mock database.

### Accessibility and tests

PDP add announces success/error in a polite atomic live region cleared after 3 seconds; global dismissible toasts last 5 seconds. The add button displays pending feedback and prevents duplicate submission. Quantity controls, removal, drawer and navigation have visible focus, keyboard operation and descriptive labels. Verify 390/768/1440 px and 200% zoom, loading/empty/error/success, rollback, network failures, expired session, user switch and guest login merge. Tests involving real MSW handlers live in mocks/handlers or web-e2e to preserve import boundaries; data-access tests can use an injected test transport, while handler integration exercises its public API. Do not weaken architectural lint for tests.

## Risks / Trade-offs

- Optimistic state may differ from server stock: use server response/refetch and rollback, never optimistic totals.
- Late mutation during logout: guard identity before cache writes and cancel private queries.
- Story fixtures can drift: keep fixtures confined to stories/tests or mocks and verify the integrated browser flow.
- Existing visual layouts may contain local fake state or floating-point calculations: replace these while connecting the UI, retaining assets and layout.

## Migration Plan

Implement sequentially through tasks.md, validating each affected area. Run Nx affected typecheck/lint/test/build and related Playwright tests before completion. No data migration or external dependency is needed. Rollback is a normal Git revert; do not rewrite history or archive before verification.
