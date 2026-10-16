import {
  type CatalogSearchParams,
  parseCatalogSearchParams,
} from '@nft/shared-contracts';
import {
  type EthAmount,
  parse,
  compare,
} from '@nft/shared-money';

export const CATALOG_DOMAIN_MODULE = '@nft/catalog-domain';

export interface ValidatedPriceRange {
  minPrice?: EthAmount | undefined;
  maxPrice?: EthAmount | undefined;
}

/**
 * Valida e normaliza limites de preço em ETH exclusivamente com @nft/shared-money.
 * Se minPrice > maxPrice, os limites são invertidos de forma determinística.
 */
export function validatePriceRangeEth(
  rawMin?: string | null | undefined,
  rawMax?: string | null | undefined,
): ValidatedPriceRange {
  let minAmount: EthAmount | undefined;
  let maxAmount: EthAmount | undefined;

  if (rawMin !== undefined && rawMin !== null && rawMin !== '') {
    try {
      minAmount = parse(rawMin);
    } catch {
      minAmount = undefined;
    }
  }

  if (rawMax !== undefined && rawMax !== null && rawMax !== '') {
    try {
      maxAmount = parse(rawMax);
    } catch {
      maxAmount = undefined;
    }
  }

  if (minAmount && maxAmount) {
    const parsedMin = parse(minAmount);
    const parsedMax = parse(maxAmount);
    if (compare(parsedMin, parsedMax) > 0) {
      return {
        minPrice: maxAmount,
        maxPrice: minAmount,
      };
    }
  }

  return {
    minPrice: minAmount,
    maxPrice: maxAmount,
  };
}

/**
 * Normaliza os parâmetros de busca do catálogo via Zod e regras de precisão monetária.
 */
export function normalizeCatalogSearchParams(raw: unknown): CatalogSearchParams {
  const parsed = parseCatalogSearchParams(raw);
  const validatedPrices = validatePriceRangeEth(parsed.minPrice, parsed.maxPrice);

  return {
    ...parsed,
    minPrice: validatedPrices.minPrice,
    maxPrice: validatedPrices.maxPrice,
  };
}

const FILTER_RESET_KEYS: (keyof CatalogSearchParams)[] = [
  'q',
  'search',
  'category',
  'collections',
  'networks',
  'minPrice',
  'maxPrice',
  'tab',
  'sort',
];

/**
 * Aplica alterações de filtro/busca/aba/ordenação e reinicia deterministicamente page = 1.
 * Se a alteração for exclusivamente de página, preserva a nova página requisitada.
 */
export function applyCatalogFilterChange(
  current: CatalogSearchParams,
  changes: Partial<CatalogSearchParams>,
): CatalogSearchParams {
  const touchesFilter = FILTER_RESET_KEYS.some((key) => key in changes);

  const updated: CatalogSearchParams = {
    ...current,
    ...changes,
    page: touchesFilter ? 1 : (changes.page ?? current.page ?? 1),
  };

  return normalizeCatalogSearchParams(updated);
}
