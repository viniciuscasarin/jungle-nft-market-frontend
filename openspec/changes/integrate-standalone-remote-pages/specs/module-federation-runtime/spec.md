# Spec Delta

## MODIFIED Requirements

### Requirement: Standalone Remote Execution Bootstrap
`libs/shell-kit` SHALL provide `bootstrapStandalone(page, config)` for independent remote development with the providers, network simulation and session needed by real pages. Initialization failures SHALL display an accessible retry action. Standalone execution SHALL preserve one instance of each client and at most one service worker per origin, without changing host routing or guards.

#### Scenario: Standalone remote mount
- **WHEN** a remote starts on its dedicated development port
- **THEN** its page renders with shared client, query, feedback and page chrome contexts, without requiring a running host

#### Scenario: Network initialization before page requests
- **WHEN** a standalone app starts with mocks enabled
- **THEN** the simulated network is ready before session or page requests, and the page consumes responses through the normal HTTP layer

#### Scenario: Initialization failure and retry
- **WHEN** worker startup or development session acquisition fails
- **THEN** an accessible error and keyboard-operable retry are shown without mounting a private page or claiming successful authentication
- **AND** retry after recovery completes startup without duplicate clients or worker registrations

## ADDED Requirements

### Requirement: Real pages in standalone development
Standalone storefront SHALL render the exposed catalog Home at `/`. Standalone account SHALL render the exposed profile and wallets pages at `/perfil` and `/carteiras`, with `/` leading to `/perfil`. These entries SHALL replace the technical demo landings and retain the pages' data, validation and accessibility behavior.

#### Scenario: Catalog entry
- **WHEN** the developer opens port 4201 after running `dev:storefront`
- **THEN** the catalog Home and API-backed NFT results appear instead of the Storefront Remote demo landing

#### Scenario: Account navigation and refresh
- **WHEN** the developer opens port 4203, navigates from profile to wallets, then reloads and uses browser back
- **THEN** the appropriate real page renders and the URL and history reflect the active local page

#### Scenario: Unsupported destination
- **WHEN** standalone navigation targets a product page outside that remote
- **THEN** a link or navigation targets the canonical path on the configured Shell origin, without fabricating local success or requiring the host for local pages

#### Scenario: Unknown local URL
- **WHEN** the developer directly opens a path unsupported by the standalone harness
- **THEN** an accessible unavailable or not-found state offers a link to the local entry and the integrated app

### Requirement: Network-backed development session
Standalone private pages SHALL use a development session obtained from the simulated authentication API and identified as a development session. Session failure, expiration and logout SHALL prevent private rendering and clear private cache and subscriptions. Automatic development sign-in SHALL be restricted to standalone development with mocks enabled.

#### Scenario: Account startup
- **WHEN** account standalone starts with mocks enabled and authentication succeeds for the deterministic development user
- **THEN** private requests use the returned token and matching user identifier, and profile and wallets render that user's data

#### Scenario: Expiration or logout
- **WHEN** the development session expires or the developer logs out
- **THEN** private content, cached data and subscriptions are cleared, and an explicit sign-in recovery action is offered without silently signing back in

#### Scenario: Integrated and production execution
- **WHEN** a page is loaded by Federation in the Shell or from a production deployment
- **THEN** standalone automatic sign-in does not run and host session and guards retain authority

### Requirement: Honest unavailable pages in standalone development
Standalone pages without connected features SHALL display an explicit unavailable message and a link to the integrated app. They SHALL NOT present a technical demo landing as the implemented flow, submit fake mutations, or declare an order confirmed without the simulated API's confirmed response.

#### Scenario: Checkout entry before feature completion
- **WHEN** the developer opens checkout standalone before its connected features are implemented
- **THEN** an accessible message states that the flow is unavailable in this demonstration and offers access to the Shell, without displaying a successful purchase

#### Scenario: Unsupported order link
- **WHEN** a standalone checkout URL references an order while no connected receipt feature exists
- **THEN** the unavailable state is shown without a purchase confirmation or fabricated order data

### Requirement: Standalone async and accessible states
Real standalone pages SHALL retain loading, empty, retryable error and success states from the simulated API. Startup and navigation SHALL support keyboard focus and live announcements; responsive layouts SHALL preserve content without horizontal overflow at 390, 768 and 1440 pixels and at 200 percent zoom.

#### Scenario: Delayed and empty catalog
- **WHEN** the simulated catalog is delayed and then responds with no items
- **THEN** loading indicates busy state with dimension-preserving skeletons respecting reduced motion, followed by the real empty state

#### Scenario: API failure and recovery
- **WHEN** a page request fails in a deterministic network or server-error scenario and the developer retries after recovery
- **THEN** an accessible error is followed by API-backed content, without fallback fake data

#### Scenario: Accessible account mutation
- **WHEN** the developer uses the keyboard to edit profile or wallets and the API accepts or rejects the mutation
- **THEN** focus remains usable and the outcome is announced, with field errors associated to their inputs when applicable

#### Scenario: Responsive standalone pages
- **WHEN** the developer views each integrated standalone page at the required widths and at 200 percent zoom
- **THEN** all content remains reachable without horizontal overflow or hidden controls
