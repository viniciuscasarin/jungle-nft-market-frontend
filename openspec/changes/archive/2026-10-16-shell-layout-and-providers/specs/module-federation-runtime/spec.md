# Spec Delta

## MODIFIED Requirements

### Requirement: Remote Module Exposure and Host Dynamic Consumption
All three remote applications (`apps/storefront`, `apps/checkout`, `apps/account`) SHALL expose their respective page components (`HomePage`, `PdpPage`, `CartPage`, `PaymentPage`, `ConfirmationPage`, `ProfilePage`, `WalletsPage`), and the host shell application SHALL dynamically import and render these modules via TanStack Router lazy loading with search params validation and authentication guards.

#### Scenario: Dynamic remote page load on navigation
- **WHEN** a user navigates to `/` in `apps/shell` while `apps/storefront` is running
- **THEN** the host shell SHALL dynamically fetch the remote entry, mount the exposed `HomePage` component inside the shell layout, and preserve shell header and footer.

#### Scenario: Standalone remote execution
- **WHEN** a developer executes `apps/storefront` in standalone mode (`pnpm dev:storefront`)
- **THEN** the remote application SHALL render independently on its dedicated port with its local entry point and root layout.

#### Scenario: Dynamic remote page load across all remotes
- **WHEN** a user navigates to `/`, `/nft/1`, `/carrinho`, `/pagamento`, `/pedido/1`, `/perfil`, or `/carteiras`
- **THEN** the host shell SHALL dynamically fetch the corresponding remote entry, mount the exposed page component within the shell layout, and preserve shell header, navigation, and footer.

#### Scenario: Remote configuration from environment variables
- **WHEN** the host shell application starts in development or production
- **THEN** it SHALL resolve remote entry URLs from `VITE_REMOTE_STOREFRONT_URL`, `VITE_REMOTE_CHECKOUT_URL`, and `VITE_REMOTE_ACCOUNT_URL`, falling back to local ports (4201, 4202, 4203) in development and relative deployment paths (`/remotes/<app>/remoteEntry.js`) in production.

#### Scenario: Protected remote route navigation
- **WHEN** an unauthenticated user navigates to `/pagamento`, `/pedido/1`, `/perfil`, or `/carteiras`
- **THEN** the host shell router guard (`requireAuth`) SHALL intercept navigation and redirect the user to `/login` with a `redirect` search parameter preserving the target path and query parameters.

### Requirement: Consolidated Build and SPA Fallback Routing
The integrated build process SHALL output the shell application at `/` and the storefront remote at `/remotes/storefront/`, and the preview server SHALL support single-page application fallback for deep links into remote routes.

#### Scenario: Integrated preview execution
- **WHEN** `pnpm build && pnpm preview` is executed
- **THEN** accessing `http://localhost:4200/` SHALL serve the shell application, and the shell SHALL fetch storefront federated assets from `/remotes/storefront/`.

#### Scenario: Direct page refresh on remote route
- **WHEN** a user triggers a browser refresh (F5) while on `http://localhost:4200/carrinho`
- **THEN** the preview server SHALL rewrite the request to `/index.html` (shell entry), the shell router SHALL resolve `/carrinho`, and the remote component SHALL render without a 404 response.

### Requirement: ShellContext and Session Hooks Contract
`libs/shell-kit` SHALL provide a typed `ShellProvider`, `useShell()`, and `useSession()` contract through which the host shell injects `QueryClient`, `HttpClient`, `RealtimeClient`, `feedback`, current session state, and typed navigation, throwing an explicit error if invoked outside of `ShellProvider`.

#### Scenario: Valid ShellContext consumption inside remote
- **WHEN** a component inside a federated remote calls `useShell()` or `useSession()` within the host shell
- **THEN** it SHALL access the injected singletons, feedback, and session without instantiating duplicate clients.

#### Scenario: Invocation outside ShellProvider error guard
- **WHEN** a component calls `useShell()` outside of a `ShellProvider`
- **THEN** it SHALL throw an explicit runtime error stating that `useShell` must be used within `ShellProvider` and that standalone clients must never be created directly.
