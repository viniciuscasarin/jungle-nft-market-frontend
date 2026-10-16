# Spec Delta: module-federation-runtime

## MODIFIED Requirements

### Requirement: Remote Module Exposure and Host Dynamic Consumption
All three remote applications (`apps/storefront`, `apps/checkout`, `apps/account`) SHALL expose their respective page components (`HomePage`, `PdpPage`, `CartPage`, `PaymentPage`, `ConfirmationPage`, `ProfilePage`, `WalletsPage`), and the host shell application SHALL dynamically import and render these modules via TanStack Router lazy loading with search params validation and authentication guards.

#### Scenario: Dynamic remote page load on navigation
- **WHEN** a user navigates to `/catalogo` in `apps/shell` while `apps/storefront` is running
- **THEN** the host shell SHALL dynamically fetch the remote entry, mount the exposed `HomePage` component inside the shell layout, and preserve shell header and footer.

#### Scenario: Standalone remote execution
- **WHEN** a developer executes `apps/storefront` in standalone mode (`pnpm dev:storefront`)
- **THEN** the remote application SHALL render independently on its dedicated port with its local entry point and root layout.

#### Scenario: Dynamic remote page load across all remotes
- **WHEN** a user navigates to `/catalogo`, `/nft/1`, `/carrinho`, `/checkout`, `/pedidos/1/confirmacao`, `/perfil`, or `/carteiras`
- **THEN** the host shell SHALL dynamically fetch the corresponding remote entry, mount the exposed page component within the shell layout, and preserve shell header, navigation, and footer.

#### Scenario: Remote configuration from environment variables
- **WHEN** the host shell application starts in development or production
- **THEN** it SHALL resolve remote entry URLs from `VITE_REMOTE_STOREFRONT_URL`, `VITE_REMOTE_CHECKOUT_URL`, and `VITE_REMOTE_ACCOUNT_URL`, falling back to local ports (4201, 4202, 4203) in development and relative deployment paths (`/remotes/<app>/remoteEntry.js`) in production.

#### Scenario: Protected remote route navigation
- **WHEN** an unauthenticated user navigates to `/checkout`, `/pedidos/1/confirmacao`, `/perfil`, or `/carteiras`
- **THEN** the host shell router guard (`requireAuth`) SHALL intercept navigation and redirect the user to `/login` with a `redirect` search parameter preserving the target path and query parameters.

### Requirement: Shared Singleton Guarantees
The Module Federation runtime SHALL guarantee that exactly one instance of `react`, `react-dom`, `@tanstack/react-router`, `@tanstack/react-query`, `socket.io-client`, and designated `@nft/*` workspace packages is shared between host and all remotes, preventing duplicate client instances or service workers in both development and production builds.

#### Scenario: Singleton verification via shared probe
- **WHEN** `apps/shell` and `apps/storefront` are running together in either dev or consolidated preview mode
- **THEN** a shared singleton probe in `@nft/shell-kit` SHALL confirm that the module state is shared (incrementing the same counter) without duplicate module initialization.

#### Scenario: React context propagation across federation boundary
- **WHEN** the host shell renders a remote page inside its React component tree
- **THEN** React hooks and context consumers inside the remote component SHALL resolve against the host's React instance without throwing duplicate React runtime errors.

#### Scenario: Singleton assertion for clients and service worker
- **WHEN** the integrated application is running with host and remotes mounted
- **THEN** the singleton registry SHALL verify that exactly one `QueryClient`, one `HttpClient`, one `RealtimeClient`, and at most one MSW service worker registration exist in the runtime, failing automated tests if duplicates are detected.

#### Scenario: Shared context resolution across remote consumers
- **WHEN** multiple consumers across host and different remotes request clients via `useShell()`
- **THEN** each consumer SHALL receive the exact same singleton instance from the host's `ShellProvider`.

### Requirement: Resilient Error Handling for Offline Remotes
The host shell application SHALL isolate federated remote imports within a `RemoteBoundary` providing Suspense with a shimmer skeleton, configurable timeout, and an accessible ErrorBoundary with retry functionality that re-attempts remote import without reloading the host shell.

#### Scenario: Remote offline during navigation
- **WHEN** a user navigates to `/catalogo` and the storefront remote is offline or fails to respond
- **THEN** the host shell SHALL catch the chunk loading error, render an accessible error state notification within the route content area, and keep the shell header, footer, and navigation to other routes fully operational.

#### Scenario: Navigation away from failed remote
- **WHEN** a remote load has failed and displays the error state
- **THEN** the user SHALL be able to click navigation links (such as "Início" or "Login") and navigate to other shell routes without a full page refresh.

#### Scenario: Successful retry without shell reload
- **WHEN** an offline remote becomes available and the user activates the "Tentar Novamente" button in the error state
- **THEN** the `RemoteBoundary` SHALL re-attempt loading the remote component and render the resolved page without triggering a full browser window refresh.

#### Scenario: Accessible shimmer skeleton during remote loading
- **WHEN** a federated remote route is loading
- **THEN** the `RemoteBoundary` SHALL display a skeleton loader with layout dimensions matching the target page, disabling CSS shimmer animations if `prefers-reduced-motion` is active.

## ADDED Requirements

### Requirement: ShellContext and Session Hooks Contract
`libs/shell-kit` SHALL provide a typed `ShellProvider`, `useShell()`, and `useSession()` contract through which the host shell injects `QueryClient`, `HttpClient`, `RealtimeClient`, current session state, and typed navigation, throwing an explicit error if invoked outside of `ShellProvider`.

#### Scenario: Valid ShellContext consumption inside remote
- **WHEN** a component inside a federated remote calls `useShell()` or `useSession()` within the host shell
- **THEN** it SHALL access the injected singletons and session without instantiating duplicate clients.

#### Scenario: Invocation outside ShellProvider error guard
- **WHEN** a component calls `useShell()` outside of a `ShellProvider`
- **THEN** it SHALL throw an explicit runtime error stating that `useShell` must be used within `ShellProvider` and that standalone clients must never be created directly.

### Requirement: Standalone Remote Execution Bootstrap
`libs/shell-kit` SHALL provide a `bootstrapStandalone(page, config)` function enabling developers to run any remote application (`pnpm dev:storefront`, `pnpm dev:checkout`, `pnpm dev:account`) independently on its dedicated port with providers, minimal routing, and an asynchronous extension point for MSW.

#### Scenario: Standalone remote mount
- **WHEN** a remote application is executed in standalone mode on its dedicated port
- **THEN** `bootstrapStandalone` SHALL mount the page wrapped in `ShellProvider` with mock session and client instances, rendering without host dependency.

### Requirement: Predictive Remote Preload
The host shell application SHALL support predictive preloading of remote entries and route chunks on navigation intent, optimizing page transition speed without blocking initial shell rendering.

#### Scenario: Preload on link hover intent
- **WHEN** a user hovers over a navigation link targeting a federated route
- **THEN** the host router SHALL initiate preloading of the corresponding remote entry and component chunk before click activation.
