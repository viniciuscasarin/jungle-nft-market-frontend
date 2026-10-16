# Catalog Discovery Specification

## Purpose

Define o comportamento da jornada de descoberta e listagem de NFTs na página inicial (`/`), abrangendo a sincronização bidirecional de busca, filtros combináveis, abas, ordenação e paginação com a URL, regras puras de domínio com precisão monetária em ETH, estados assíncronos (loading skeleton, vazio, erro com retry e sucesso), responsividade (Sidebar desktop e Drawer mobile) e feedback acessível para ações fora de escopo.

## ADDED Requirements

### Requirement: URL-Synchronized Catalog Discovery and Filter Reset
The storefront home page (`@nft/catalog-feature` exposed by `apps/storefront`) SHALL maintain search query (`q`), selected collections (`collections`), selected networks (`networks`), ETH price range (`minPrice`, `maxPrice`), active tab (`tab`), sort order (`sort`), and pagination (`page`, `pageSize`) in the URL search parameters validated by `CatalogSearchParamsSchema`. Changing any filter, search query, tab, or sort option SHALL automatically reset `page` to `1`.

#### Scenario: Applying combinable filters updates URL and results
- **WHEN** the user applies a search query, selects one or more collections, sets an ETH price range, selects a network, and changes the sort order
- **THEN** the URL search parameters SHALL reflect all active filters and the catalog grid SHALL render only the matching NFTs returned by `GET /api/nfts`.

#### Scenario: Changing filter on page 3 resets pagination to page 1
- **WHEN** the user is viewing page 3 of the catalog and changes any filter, search term, tab (`all`, `new`, `trending`), or sort option
- **THEN** the `page` search parameter SHALL automatically reset to `1` and the first page of matching results SHALL be requested.

#### Scenario: Browser refresh and history navigation restore catalog state
- **WHEN** the user reloads the page or uses browser back/forward navigation on `/` with active query parameters
- **THEN** the active filters, tab, sort order, current page, and catalog listing SHALL be restored deterministically from the URL.

### Requirement: Monetary Precision in Price Range Filtering
The `@nft/catalog-domain`, `@nft/catalog-feature`, and `@nft/catalog-ui` modules SHALL represent and manipulate `minPrice` and `maxPrice` exclusively as decimal ETH strings (`EthAmount`) via `@nft/shared-money`, prohibiting floating-point arithmetic (`number`, `parseFloat`) on monetary values.

#### Scenario: Price range validation and normalization in domain
- **WHEN** `minPrice` and `maxPrice` strings are provided to the catalog domain normalization helper with `minPrice > maxPrice` (compared via `@nft/shared-money`)
- **THEN** the domain function SHALL normalize or swap the bounds using `@nft/shared-money` without using native floating-point comparisons.

#### Scenario: Formatting NFT card and filter prices
- **WHEN** NFT prices, promotional previous prices (`previousPriceEth`), and price range bounds are displayed in the catalog UI
- **THEN** they SHALL be formatted using `@nft/shared-money` and rendered with the `ETH` unit.

### Requirement: Asynchronous States and Out-of-Order Request Cancellation
The catalog listing SHALL implement explicit loading (`Skeleton` with shimmer and `aria-busy="true"`), empty (`EmptyState` with action to clear filters), error (`ErrorState` with retry button), and success states, passing the TanStack Query `AbortSignal` to `GET /api/nfts` so obsolete or out-of-order responses never overwrite newer results.

#### Scenario: Loading state preserves layout dimensions
- **WHEN** the catalog query is in flight (`isLoading` is true)
- **THEN** the catalog grid container SHALL set `aria-busy="true"` and render skeleton cards preserving grid dimensions without layout shift.

#### Scenario: Empty state when filters match no NFTs
- **WHEN** `GET /api/nfts` returns an empty `items` array for the active filters
- **THEN** an accessible `EmptyState` SHALL be rendered with a button that clears all active filters and restores the default catalog listing.

#### Scenario: Error state and recovery via retry
- **WHEN** `GET /api/nfts` fails with an `ApiError`
- **THEN** an accessible `ErrorState` SHALL be rendered and clicking the retry button SHALL re-execute the query and display the catalog items upon recovery.

### Requirement: Responsive Filter Drawer and Keyboard Accessibility
On desktop viewports (`>= 1024px`), filters SHALL be rendered in the sticky `CatalogFilterSidebar`. On mobile and tablet viewports (`< 1024px`), filters SHALL be rendered inside an accessible `Drawer` (`@nft/shared-ui`) triggered either by the mobile filter button or by the shell header's `SearchBar` filter slot registered via `usePageChrome({ onOpenFilters })`.

#### Scenario: Opening and applying filters in mobile viewport
- **WHEN** the user activates the filter trigger button on a `390px` viewport
- **THEN** the filter `Drawer` SHALL open with trapped keyboard focus, allow selecting filters, and return focus cleanly when closed.

#### Scenario: Navigating to NFT detail page from catalog
- **WHEN** the user clicks or presses Enter/Space on an NFT card in the grid, the Hero CTA, or the Featured NFT banner
- **THEN** the router SHALL navigate to `/nft/$nftId` for the selected NFT.

### Requirement: Explicit Feedback for Out-of-Scope Home Elements
Visual sections on the Home page that are outside the challenge backend scope (Promo cards, Blog cards in "Diário da Cunhagem", and favorite toggle buttons prior to the favorites stage) SHALL remain visually faithful to the Figma reference and trigger `useUnavailable()` (`"indisponível nesta demonstração"`) via toast and polite live region when activated.

#### Scenario: Clicking a Promo card or Blog card CTA
- **WHEN** the user clicks a CTA button on `HomePromoSection` or `HomeBlogSection`
- **THEN** the application SHALL display and announce the message containing `"indisponível nesta demonstração"` without performing broken navigation or silent no-ops.
