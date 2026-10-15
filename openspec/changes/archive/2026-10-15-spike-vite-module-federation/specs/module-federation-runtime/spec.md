# Module Federation Runtime Specification

## Purpose

Define os requisitos arquiteturais e de execução para a integração de microfrontends via `@module-federation/vite`, garantindo o carregamento dinâmico de remotes pelo host, a manutenção estrita de instâncias únicas (singletons), a tolerância a falhas de rede de remotes, a integridade do roteamento com SPA fallback no build consolidado e a correta aplicação de políticas de cache e estilização.

## ADDED Requirements

### Requirement: Remote Module Exposure and Host Dynamic Consumption
The storefront remote application SHALL expose a page module (`./HomePage`), and the host shell application SHALL dynamically import and render this module via TanStack Router lazy loading.

#### Scenario: Dynamic remote page load on navigation
- **WHEN** a user navigates to `/catalogo` in `apps/shell` while `apps/storefront` is running
- **THEN** the host shell SHALL dynamically fetch the remote entry, mount the exposed `HomePage` component inside the shell layout, and preserve shell header and footer.

#### Scenario: Standalone remote execution
- **WHEN** a developer executes `apps/storefront` in standalone mode (`pnpm dev:storefront`)
- **THEN** the remote application SHALL render independently on its dedicated port with its local entry point and root layout.

### Requirement: Shared Singleton Guarantees
The Module Federation runtime SHALL guarantee that exactly one instance of `react`, `react-dom`, `@tanstack/react-router`, `@tanstack/react-query`, and designated workspace libraries is shared between host and remote in both development and production builds.

#### Scenario: Singleton verification via shared probe
- **WHEN** `apps/shell` and `apps/storefront` are running together in either dev or consolidated preview mode
- **THEN** a shared singleton probe in `@nft/shell-kit` SHALL confirm that the module state is shared (incrementing the same counter) without duplicate module initialization.

#### Scenario: React context propagation across federation boundary
- **WHEN** the host shell renders a remote page inside its React component tree
- **THEN** React hooks and context consumers inside the remote component SHALL resolve against the host's React instance without throwing duplicate React runtime errors.

### Requirement: Resilient Error Handling for Offline Remotes
The host shell application SHALL isolate federated remote imports within an error boundary such that remote network or execution failures do not crash the host shell or disrupt other routes.

#### Scenario: Remote offline during navigation
- **WHEN** a user navigates to `/catalogo` and the storefront remote is offline or fails to respond
- **THEN** the host shell SHALL catch the chunk loading error, render an accessible error state notification within the route content area, and keep the shell header, footer, and navigation to other routes fully operational.

#### Scenario: Navigation away from failed remote
- **WHEN** a remote load has failed and displays the error state
- **THEN** the user SHALL be able to click navigation links (such as "Início" or "Login") and navigate to other shell routes without a full page refresh.

### Requirement: Consolidated Build and SPA Fallback Routing
The integrated build process SHALL output the shell application at `/` and the storefront remote at `/remotes/storefront/`, and the preview server SHALL support single-page application fallback for deep links into remote routes.

#### Scenario: Integrated preview execution
- **WHEN** `pnpm build && pnpm preview` is executed
- **THEN** accessing `http://localhost:4200/` SHALL serve the shell application, and the shell SHALL fetch storefront federated assets from `/remotes/storefront/`.

#### Scenario: Direct page refresh on remote route
- **WHEN** a user triggers a browser refresh (F5) while on `http://localhost:4200/catalogo`
- **THEN** the preview server SHALL rewrite the request to `/index.html` (shell entry), the shell router SHALL resolve `/catalogo`, and the remote component SHALL render without a 404 response.

### Requirement: Cache Policy Enforcement for Federated Artifacts
The HTTP delivery layer SHALL serve Module Federation entry points with revalidation directives while serving content-hashed asset chunks with immutable long-term caching.

#### Scenario: Remote entry cache headers
- **WHEN** `remoteEntry.js` or `mf-manifest.json` is requested from the preview server or deployment output
- **THEN** the response headers SHALL include `Cache-Control: public, max-age=0, must-revalidate` (or equivalent revalidation directive).

#### Scenario: Immutable asset chunks cache headers
- **WHEN** any content-hashed JavaScript or CSS chunk in an `/assets/` directory is requested
- **THEN** the response headers SHALL include `Cache-Control: public, max-age=31536000, immutable`.

### Requirement: Centralized Tailwind v4 Styling
Tailwind CSS v4 utility classes used by federated components SHALL be compiled by the host shell's build pipeline, preventing duplicate global CSS injection in the integrated runtime.

#### Scenario: Remote styling under host shell
- **WHEN** the storefront remote component is rendered within the host shell
- **THEN** its Tailwind CSS classes SHALL take effect using the host's compiled stylesheet without the remote injecting a duplicate `@import "tailwindcss"` stylesheet into the document head.

#### Scenario: Standalone remote styling
- **WHEN** `apps/storefront` is executed standalone in development mode
- **THEN** its local `styles.css` SHALL provide Tailwind CSS utility classes for local development.
