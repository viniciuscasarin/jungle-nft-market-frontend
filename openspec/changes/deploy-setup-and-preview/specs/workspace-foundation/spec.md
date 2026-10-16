# Spec Delta: workspace-foundation

## MODIFIED Requirements

### Requirement: Environment Configuration and Runtime Validation
The workspace SHALL validate all environment variables at runtime, accepting either absolute URLs or valid relative paths for remote module endpoints and API base URLs. The environment configuration module SHALL provide safe production demonstration defaults (`VITE_ENABLE_MOCKS=true`, `VITE_DEFAULT_SCENARIO='default'`, `VITE_API_BASE_URL='/api'`, `VITE_SOCKET_URL=''`, and `/remotes/<remoteName>/remoteEntry.js` for remote URLs) so that the application boots successfully zero-config on any deployment domain.

#### Scenario: Missing required environment variable
- **WHEN** an application boots without required variables and without fallback defaults
- **THEN** the environment validation module SHALL throw an explicit error naming the missing variables and preventing runtime crashes.

#### Scenario: Valid environment startup
- **WHEN** an application boots with valid variables matching `.env.example`
- **THEN** the configuration SHALL be parsed, typed, and accessible to the application.

#### Scenario: Missing optional variables uses safe demonstration defaults
- **WHEN** an application boots in production with an empty or partial environment configuration
- **THEN** `validateEnv` SHALL succeed using safe demonstration defaults and SHALL NOT throw `EnvValidationError`.

#### Scenario: Remote endpoints with relative paths
- **WHEN** environment variables define remote URLs with relative paths (e.g., `/remotes/storefront/remoteEntry.js`)
- **THEN** `validateEnv` SHALL accept the values as valid and return them in the parsed configuration.

#### Scenario: Remote endpoints with malformed values
- **WHEN** a remote URL is defined as an invalid string (neither a valid relative path starting with `/` or `./` nor a valid absolute URL)
- **THEN** `validateEnv` SHALL throw an `EnvValidationError` naming the invalid key.

### Requirement: Consolidated Build and Deployment Readiness
The workspace build system SHALL consolidate application build artifacts into a unified distribution directory `dist/integrated/` suitable for single-project static deployment on Vercel.
The consolidated build script SHALL compile remotes (`storefront`, `checkout`, `account`) before the host (`shell`), placing host artifacts and `mockServiceWorker.js` at the root `/` and remotes at `/remotes/<remoteName>/`.
The hosting configuration (`vercel.json`) and preview server (`scripts/preview.js`) SHALL enforce strict cache policies (`no-cache, no-store, must-revalidate` for `mockServiceWorker.js` and `remoteEntry.js`; `public, max-age=31536000, immutable` for hashed assets).
Routing rules SHALL deliver single-page application fallback to `/index.html` for deep routes while bypassing static files (`/mockServiceWorker.js`, `/storybook/*`, `/remotes/*`, `/assets/*`).
The Vercel configuration SHALL disable `cleanUrls` while rewrite destinations use explicit `.html` extensions.
The standard `pnpm build` SHALL not require Storybook compilation to succeed, while `pnpm build:deploy:full` SHALL compile and integrate the full suite including Storybook.

#### Scenario: Integrated build artifact distribution
- **WHEN** `pnpm build` is executed
- **THEN** `apps/shell` output SHALL be located at the root of `dist/integrated/` and remotes (`storefront`, `checkout`, `account`) SHALL be located under `dist/integrated/remotes/<app-name>/`.

#### Scenario: Vercel routing and cache policies
- **WHEN** deploying using `vercel.json`
- **THEN** SPA rewrite fallback to `/index.html` SHALL be configured, and headers SHALL specify immutable long-term caching for hashed assets while prohibiting long-term caching for `remoteEntry.js`.

#### Scenario: Direct profile navigation on Vercel
- **WHEN** a visitor opens or refreshes `/perfil` on the deployed application
- **THEN** hosting SHALL serve the Shell HTML through the SPA fallback, allowing the authentication guard to redirect to `/login` instead of returning a hosting 404.

#### Scenario: Storybook static assets deployment
- **WHEN** the command `pnpm build` is executed
- **THEN** `dist/integrated/storybook/index.html` is generated and accessible under the `/storybook/` path without rewrite interception.

#### Scenario: Integrated build artifact distribution with Service Worker
- **WHEN** `pnpm build` is executed
- **THEN** `dist/integrated/` SHALL contain `apps/shell` output and `mockServiceWorker.js` at the root `/`, and remotes under `dist/integrated/remotes/<remoteName>/`.

#### Scenario: Vercel routing, cache policies, and Service Worker bypass
- **WHEN** deploying using `vercel.json`
- **THEN** requests to `/mockServiceWorker.js` and `/remotes/:remote/remoteEntry.js` SHALL receive `Cache-Control: no-cache, no-store, must-revalidate`, hashed assets in `/assets/*` and `/remotes/:remote/assets/*` SHALL receive `Cache-Control: public, max-age=31536000, immutable`, and rewrites SHALL bypass `/mockServiceWorker.js`, `/remotes/*`, and `/storybook/*` while routing navigation paths to `/index.html`.

#### Scenario: Deep link access and SPA refresh in preview
- **WHEN** a user or client requests deep routes (e.g. `/`, `/nft/1`, `/login`, `/cadastro`, `/carrinho`, `/checkout/pagamento`, `/pedido/1`, `/conta/perfil`, `/conta/carteiras`, `/rota-inexistente`) on `pnpm preview`
- **THEN** the server SHALL respond with HTTP 200 serving `/index.html`, allowing client-side router and Module Federation remotes to load from `/remotes/*` without 404 or CORS errors.

#### Scenario: Decoupled Storybook compilation in standard build
- **WHEN** `pnpm build` is executed without prior Storybook build
- **THEN** the consolidation script SHALL complete successfully without failing due to a missing Storybook directory.

#### Scenario: Full build with Storybook integration
- **WHEN** `pnpm build:deploy:full` is executed
- **THEN** Storybook SHALL be built and integrated into `dist/integrated/storybook/` without rewrite interception in hosting.
