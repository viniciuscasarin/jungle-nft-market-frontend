# Domain Contracts Specification Delta

## MODIFIED Requirements

### Requirement: Catalog and NFT Contracts
The `@nft/shared-contracts` module SHALL provide schemas for NFT items (including optional visual metadata `collectionName`, `network`, `rarity`, and `previousPriceEth`), editions, catalog queries with combinable filters (`q`, `search`, `category`, `collections`, `networks`, `minPrice`, `maxPrice`, `tab`, `sort`, `page`, `pageSize`), pagination, facet counts (`facets.collections` and `facets.networks`), and calculated ratings.

#### Scenario: Reject numeric price in NFT schema
- **WHEN** an NFT item payload provides `price: 1.5` as a `number` instead of a string
- **THEN** `NftItemSchema.parse` SHALL fail validation with a message indicating ETH amounts must be decimal strings.

#### Scenario: Validate edition availability and monotonic version
- **WHEN** an NFT item containing multiple editions with `maxSupply`, `availableSupply`, `price`, and monotonic `version` is validated
- **THEN** `NftItemSchema.parse` SHALL succeed and guarantee `version` is an integer.

#### Scenario: Validate NFT rating constraints
- **WHEN** an NFT detail contains `rating: { average: 4.8, count: 120 }`
- **THEN** `NftRatingSchema.parse` SHALL accept the payload, enforcing average between 0 and 5 and integer count.

#### Scenario: Validate catalog response with facet counts
- **WHEN** a `GET /api/nfts` response includes paginated `items` along with `facets: { collections: [...], networks: [...] }`
- **THEN** `NftListResponseSchema.parse` SHALL validate the items, pagination metadata, and facet counters.

### Requirement: Tolerant Search Parameters Schemas
The `@nft/shared-contracts` module SHALL provide safe, tolerant search parameter schemas and parsing functions for catalog (`q`, `collections`, `networks`, `minPrice`, `maxPrice`, `tab`, `sort`, `page`, `pageSize`), cart, and checkout URLs that fall back to deterministic defaults without throwing errors.

#### Scenario: Tolerant parsing of invalid catalog URL parameters
- **WHEN** catalog query parameters contain invalid values such as `page="invalid"`, `pageSize="-10"`, `tab="invalid"`, or `sort="unknown"`
- **THEN** `parseCatalogSearchParams` SHALL return a valid object with fallback values `page: 1`, `pageSize: 9`, `tab: 'all'`, and default sort order `'popular-desc'`.

#### Scenario: Preserving combinable filter arrays and strings in catalog URL parameters
- **WHEN** catalog query parameters provide `collections`, `networks`, `minPrice: "0.50"`, `maxPrice: "5.00"`, and `q: "ape"`
- **THEN** `parseCatalogSearchParams` SHALL preserve the normalized filter values without data loss.
