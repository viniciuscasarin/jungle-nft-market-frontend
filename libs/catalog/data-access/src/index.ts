import type { HttpClient } from '@nft/shared-http';
import {
  queryOptions,
  queryKeys,
  useQuery,
  type UseQueryResult,
} from '@nft/shared-query';
import {
  type NftListResponse,
  type NftItem,
  type CatalogSearchParams,
  NftListResponseSchema,
  NftItemSchema,
} from '@nft/shared-contracts';
import { normalizeCatalogSearchParams } from '@nft/catalog-domain';

export const CATALOG_DATA_ACCESS_MODULE = '@nft/catalog-data-access';

export interface FetchCatalogNftsOptions {
  params?: CatalogSearchParams | Record<string, unknown> | undefined;
  signal?: AbortSignal | undefined;
}

/**
 * Chamada de API pura para listagem de NFTs com filtros combináveis e suporte a cancelamento.
 */
export async function fetchCatalogNfts(
  client: HttpClient,
  options: FetchCatalogNftsOptions = {},
): Promise<NftListResponse> {
  const normalizedParams = options.params
    ? normalizeCatalogSearchParams(options.params)
    : undefined;

  const response = await client.get<NftListResponse>('/api/nfts', {
    ...(normalizedParams ? { params: normalizedParams } : {}),
    ...(options.signal ? { signal: options.signal } : {}),
  });

  return NftListResponseSchema.parse(response.data);
}

/**
 * Query options factory para a listagem do catálogo com cache de 60 segundos e queryKey determinística.
 */
export function catalogListQueryOptions(
  client: HttpClient,
  params?: CatalogSearchParams | Record<string, unknown>,
) {
  const normalizedParams = params ? normalizeCatalogSearchParams(params) : undefined;

  return queryOptions({
    queryKey: queryKeys.catalog.list(normalizedParams),
    queryFn: ({ signal }) => fetchCatalogNfts(client, { params: normalizedParams, signal }),
    staleTime: 60_000,
  });
}

/**
 * Hook para consulta reativa do catálogo.
 */
export function useCatalogListQuery(
  client: HttpClient,
  params?: CatalogSearchParams | Record<string, unknown>,
): UseQueryResult<NftListResponse> {
  return useQuery(catalogListQueryOptions(client, params));
}

/**
 * Chamada pura para consulta de detalhes de um NFT por ID.
 */
export async function fetchNftDetail(
  client: HttpClient,
  nftId: string,
  signal?: AbortSignal,
): Promise<NftItem> {
  const response = await client.get<NftItem>(`/api/nfts/${nftId}`, {
    ...(signal ? { signal } : {}),
  });
  return NftItemSchema.parse(response.data);
}

/**
 * Query options factory para detalhe de NFT.
 */
export function catalogDetailQueryOptions(client: HttpClient, nftId: string) {
  return queryOptions({
    queryKey: queryKeys.catalog.detail(nftId),
    queryFn: ({ signal }) => fetchNftDetail(client, nftId, signal),
    staleTime: 60_000,
  });
}
