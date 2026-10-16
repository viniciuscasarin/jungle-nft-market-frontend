# Catalog PDP Detail Specification

## Purpose

Define o comportamento da página de detalhes do item colecionável (PDP em `/nft/:nftId`), cobrindo a recuperação de detalhes via API simulada (`GET /api/nfts/:id`), exibição de galeria com zoom/miniaturas, seção de compra com cálculo de quantidade e preço estritamente em string decimal ETH, abas de detalhes e avaliações acessíveis, carrossel de itens relacionados recomendados, e tratamento completo de estados assíncronos (loading skeleton, 404 de NFT inexistente e erro com retry).

## ADDED Requirements

### Requirement: Deterministic NFT Detail Retrieval and Routing
The storefront remote and catalog feature SHALL fetch the active NFT details using `catalogDetailQueryOptions` from `@nft/catalog-data-access` against `GET /api/nfts/:id` using the `nftId` path parameter from the URL. When mounted, it SHALL notify the shell layout of the active NFT's name via `usePageChrome().setBreadcrumbLabel` and clean it up on unmount.

#### Scenario: Successful detail fetch renders NFT metadata and updates breadcrumb
- **WHEN** the user navigates to `/nft/:nftId` for an existing NFT (e.g. `nft-01`)
- **THEN** the page SHALL request `GET /api/nfts/nft-01` via TanStack Query, render the NFT title, creator, collection name, token ID, tags, price in ETH and images, and update the shell breadcrumb label to the NFT's title.

#### Scenario: NFT not found renders accessible 404 state
- **WHEN** the user accesses `/nft/:nftId` for an identifier that does not exist in the mock database (returning 404)
- **THEN** an accessible `EmptyState` SHALL be rendered indicating that the collectible was not found, with an action to navigate back to the catalog home (`/`).

#### Scenario: Error state and recovery via retry
- **WHEN** `GET /api/nfts/:id` fails with a network or server error (`ApiError`)
- **THEN** an accessible `ErrorState` SHALL be rendered and activating the retry button SHALL re-trigger the query and display the collectible upon successful resolution.

### Requirement: Monetary Precision and Integer Quantity Calculation
The PDP purchase section (`@nft/catalog-ui` and `@nft/catalog-feature`) SHALL display all prices exclusively as decimal ETH strings formatted via `@nft/shared-money`. Quantity adjustments SHALL be strictly integer numbers bounded between `1` and the maximum available editions (`editionsAvailable` or inventory limit). Calculating the total price for multiple editions SHALL use `@nft/shared-money` multiplication and never native floating-point arithmetic (`parseFloat`, `*`, `+`).

#### Scenario: Incrementing edition quantity recalculates total in decimal ETH
- **WHEN** the user increases the edition quantity from 1 to 2 for an NFT priced at `1.25` ETH
- **THEN** the total price SHALL be calculated via `@nft/shared-money` as `2.50` ETH without floating-point inaccuracies.

#### Scenario: Quantity bounds enforcement
- **WHEN** the user attempts to decrement the quantity below `1` or increment above the available supply
- **THEN** the corresponding control buttons SHALL be disabled (`aria-disabled="true"`), preventing invalid quantities.

### Requirement: Interactive Accessible Gallery and Tabs
The PDP layout SHALL provide a multi-image gallery with selectable thumbnails and an accessible tabbed interface (`role="tablist"`) for "Detalhes do NFT" and "Avaliação de colecionadores", conforming to WCAG 2.1 AA accessibility guidelines.

#### Scenario: Selecting gallery thumbnail updates main image
- **WHEN** the user activates a thumbnail in the PDP gallery
- **THEN** the main gallery display SHALL immediately switch to the selected image and preserve accessible `alt` text.

#### Scenario: Keyboard navigation between tabs
- **WHEN** focus is on an active tab in the tab list and the user presses Arrow Right or Arrow Left
- **THEN** focus and tab selection SHALL move to the adjacent tab, activating the corresponding tab panel (`role="tabpanel"`).

### Requirement: Related Collectibles Carousel
The PDP SHALL display a "Colecionáveis Relacionados" carrossel section presenting other NFTs from the catalog, allowing the user to browse and navigate directly to another NFT's detail page.

#### Scenario: Navigating to related collectible
- **WHEN** the user clicks or activates a collectible card within the related items carousel
- **THEN** the router SHALL navigate to `/nft/:newNftId`, loading the selected NFT's details and updating the page content.
