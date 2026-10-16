# Spec Delta: workspace-foundation

## MODIFIED Requirements

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

---

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
