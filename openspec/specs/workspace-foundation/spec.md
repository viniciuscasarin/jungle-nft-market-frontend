# Workspace Foundation Specification

## Purpose

Define a infraestrutura, integridade estrutural, regras de fronteiras arquiteturais e automação de build do monorepo Nx para o NFT Marketplace, garantindo isolamento entre aplicações, conformidade estrita de tipos e restrições de importação de terceiros.

## Requirements

### Requirement: Clean Checkout and Baseline Tooling
The monorepo SHALL provide automated scripts and configurations ensuring that a clean checkout executes typecheck, lint, unit tests, and production build without errors.

#### Scenario: Clean checkout full verification
- **WHEN** `pnpm typecheck && pnpm lint && pnpm test && pnpm build` is executed on a clean checkout
- **THEN** all Nx targets SHALL succeed with zero errors and zero warnings.

#### Scenario: Unit testing baseline across libraries
- **WHEN** `pnpm test` is executed
- **THEN** Vitest SHALL execute across all configured library projects and report passing status.

### Requirement: Module Boundaries Enforcement
The workspace linter SHALL enforce strict architectural boundaries using `@nx/enforce-module-boundaries` based on project tags `scope`, `type`, and `flow`. Tooling applications tagged with `flow:tooling` (such as `apps/storybook`) SHALL be permitted to import libraries tagged with `type:ui` and `flow:shared` across any domain, while remaining strictly forbidden from importing `type:feature`, `type:data-access`, `scope:mocks`, or other applications.

#### Scenario: Cross-app imports prohibited
- **WHEN** any code in `apps/storefront` attempts to import from `apps/checkout` or any other app
- **THEN** ESLint SHALL report a module boundary violation and fail the lint target.

#### Scenario: Cross-flow imports prohibited
- **WHEN** `apps/account` (tagged with `flow:account`) attempts to import a feature or ui library tagged with `flow:checkout` (e.g., `@nft/cart-feature`)
- **THEN** ESLint SHALL report a module boundary violation and fail the lint target.

#### Scenario: Layer hierarchy enforcement
- **WHEN** a presentational library tagged with `type:ui` attempts to import from a data-access library tagged with `type:data-access`
- **THEN** ESLint SHALL report a module boundary violation and fail the lint target.

#### Scenario: Domain isolation
- **WHEN** a library tagged with `type:domain` attempts to import from any module other than `@nft/shared-contracts` or `@nft/shared-money`
- **THEN** ESLint SHALL report a module boundary violation and fail the lint target.

#### Scenario: Mock isolation
- **WHEN** any library outside `apps/shell`, `@nft/shell-kit`, or `apps/web-e2e` attempts to import from `@nft/mocks-*`
- **THEN** ESLint SHALL report a module boundary violation and fail the lint target.

#### Scenario: Circular dependency prevention
- **WHEN** any cyclic dependency is introduced between libraries or projects
- **THEN** ESLint SHALL report a circular dependency violation and fail the lint target.

#### Scenario: Tooling app importing UI presentation components
- **WHEN** `apps/storybook` imports a presentational component from `@nft/shared-ui` or a domain UI library
- **THEN** the linter permits the dependency without boundary violations.

#### Scenario: Tooling app forbidden from importing domain logic or mocks
- **WHEN** `apps/storybook` attempts to import a module tagged with `type:feature`, `type:data-access`, or `scope:mocks`
- **THEN** `@nx/enforce-module-boundaries` fails the build with a lint error.

### Requirement: Third-Party Package Encapsulation
The workspace linter SHALL enforce strict third-party encapsulation using `no-restricted-imports` on each project to restrict designated external packages to designated shared wrappers.

#### Scenario: Axios restricted to shared-http
- **WHEN** any module outside `@nft/shared-http` attempts to import `axios` directly
- **THEN** ESLint SHALL report a restricted import violation and fail the lint target.

#### Scenario: Socket.IO client restricted to shared-realtime
- **WHEN** any module outside `@nft/shared-realtime` attempts to import `socket.io-client` directly
- **THEN** ESLint SHALL report a restricted import violation and fail the lint target.

#### Scenario: Decimal.js restricted to shared-money
- **WHEN** any module outside `@nft/shared-money` attempts to import `decimal.js` directly
- **THEN** ESLint SHALL report a restricted import violation and fail the lint target.

#### Scenario: Radix UI primitives restricted to shared-ui
- **WHEN** any module outside `@nft/shared-ui` attempts to import `@radix-ui/*` directly
- **THEN** ESLint SHALL report a restricted import violation and fail the lint target.

#### Scenario: TanStack React Query restricted to designated layers
- **WHEN** any module outside `@nft/shared-query`, data-access, or feature libraries attempts to import `@tanstack/react-query`
- **THEN** ESLint SHALL report a restricted import violation and fail the lint target.

### Requirement: Environment Configuration and Runtime Validation
The workspace SHALL validate all required environment variables at runtime and fail fast with human-readable errors if required values are missing or malformed.

#### Scenario: Missing required environment variable
- **WHEN** an application boots without required variables (such as `VITE_API_BASE_URL` or `VITE_SOCKET_URL`)
- **THEN** the environment validation module SHALL throw an explicit error naming the missing variables and preventing runtime crashes.

#### Scenario: Valid environment startup
- **WHEN** an application boots with valid variables matching `.env.example`
- **THEN** the configuration SHALL be parsed, typed, and accessible to the application.

### Requirement: Shell Routing and 404 Fallback
The shell application SHALL configure TanStack Router in code-based mode with a root route `/` and a catch-all 404 route displaying an accessible error page.

#### Scenario: Unknown route access
- **WHEN** a user navigates to `/rota-inexistente` in preview or standalone mode
- **THEN** the shell router SHALL render the 404 placeholder view containing an accessible heading, description, and link to return to `/`.

### Requirement: Consolidated Build and Deployment Readiness
The workspace build system SHALL consolidate application build artifacts into a unified distribution directory suitable for deployment. The consolidated build script SHALL compile the Storybook application and place its static production output into `dist/integrated/storybook/`, and the hosting configuration (`vercel.json`) SHALL include routing rules that serve `/storybook/*` directly without triggering single-page application fallback to `/index.html`.

#### Scenario: Integrated build artifact distribution
- **WHEN** `pnpm build` is executed
- **THEN** `apps/shell` output SHALL be located at the root of `dist/integrated/` and remotes (`storefront`, `checkout`, `account`) SHALL be located under `dist/integrated/remotes/<app-name>/`.

#### Scenario: Vercel routing and cache policies
- **WHEN** deploying using `vercel.json`
- **THEN** SPA rewrite fallback to `/index.html` SHALL be configured, and headers SHALL specify immutable long-term caching for hashed assets while prohibiting long-term caching for `remoteEntry.js`.

#### Scenario: Storybook static assets deployment
- **WHEN** the command `pnpm build` is executed
- **THEN** `dist/integrated/storybook/index.html` is generated and accessible under the `/storybook/` path without rewrite interception.

### Requirement: Local Workspace Domain Generator
The workspace SHALL provide a local generator or automation tool to scaffold standard 4-layer domain libraries with appropriate tags and configs.

#### Scenario: Generate domain library set
- **WHEN** the domain generator is executed with a domain name and flow identifier
- **THEN** four libraries (`domain`, `data-access`, `feature`, `ui`) SHALL be scaffolded with valid `project.json`, `index.ts`, `tsconfig.json`, and proper `scope:*`, `type:*`, and `flow:*` tags.
