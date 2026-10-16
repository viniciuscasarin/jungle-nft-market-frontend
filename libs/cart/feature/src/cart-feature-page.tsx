import * as React from 'react';
import { useQuery, queryKeys } from '@nft/shared-query';
import { useShell } from '@nft/shell-kit';
import { getOrCreateGuestId } from '@nft/auth-data-access';
import { cartQueryOptions, useUpdateCartItem, useRemoveCartItem, useCartCoupon } from '@nft/cart-data-access';
import { useCatalogListQuery } from '@nft/catalog-data-access';
import { createCheckoutQuote } from '@nft/checkout-data-access';
import { CartPageContent, CartSkeleton, toCartItemViewModel } from '@nft/cart-ui';
import { Button, ErrorState, Skeleton } from '@nft/shared-ui';
import { formatEth } from '@nft/shared-money';

/** Connected cart page; the UI receives formatted API state and action callbacks only. */
export function CartFeaturePage() {
  const { httpClient, session, feedback, navigate } = useShell();
  const sessionId = getOrCreateGuestId();
  const cart = useQuery(cartQueryOptions(httpClient, session?.userId, sessionId));
  const related = useCatalogListQuery(httpClient, {});
  const dependencies = {
    client: httpClient,
    userId: session?.userId,
    sessionId,
    onFeedback: (message: string, tone: 'success' | 'error') => feedback.notify({ message, tone, duration: 5000 }),
  };
  const update = useUpdateCartItem(dependencies);
  const remove = useRemoveCartItem(dependencies);
  const coupon = useCartCoupon(dependencies);
  const items = React.useMemo(
    () =>
      (cart.data?.items ?? []).map(item => ({
        nftId: item.nftId,
        editionId: item.editionId,
        quantity: item.quantity,
      })),
    [cart.data],
  );
  const quote = useQuery({
    queryKey: queryKeys.quote.payment(session?.userId ?? sessionId, { items, couponCode: cart.data?.couponCode ?? null }),
    queryFn: () => createCheckoutQuote(httpClient, { items, couponCode: cart.data?.couponCode ?? null }),
    enabled: items.length > 0,
    retry: false,
    staleTime: 0,
  });
  const busy = update.isPending || remove.isPending || coupon.isPending;
  if (cart.isPending) return <CartSkeleton />;
  if (cart.isError)
    return (
      <div className="page-container py-8" data-testid="cart-error">
        <ErrorState
          title="Não foi possível carregar o carrinho"
          onRetry={() => void cart.refetch()}
        />
      </div>
    );
  const summary =
    quote.data && !quote.isError && !quote.isFetching
      ? {
          subtotalEth: `${formatEth(quote.data.subtotal)} ETH`,
          discountEth: `${formatEth(quote.data.discount)} ETH`,
          networkFeeEth: `${formatEth(quote.data.networkFee)} ETH`,
          totalEth: `${formatEth(quote.data.total)} ETH`,
          appliedCoupon: quote.data.coupon?.isValid ? quote.data.coupon.code : null,
        }
      : undefined;
  const canCheckout = Boolean(
    summary &&
    !busy &&
    quote.data &&
    !quote.data.isExpired &&
    quote.data.itemsAvailability.every(item => item.isAvailable),
  );
  return (
    <div data-testid="checkout-cart-page">
      <CartPageContent
        initialItems={cart.data.items.map(toCartItemViewModel)}
        summary={summary}
        busy={busy}
        onQuantityChange={(itemId, quantity) => update.mutate({ itemId, quantity })}
        onRemove={itemId =>
          remove.mutate(
            { itemId },
            {
              onSuccess: () => {
                document.getElementById('main-content')?.focus();
              },
            },
          )
        }
        onNavigateHome={() => navigate('/')}
        onApplyCoupon={couponCode => coupon.mutate({ couponCode })}
        onRemoveCoupon={() => coupon.mutate({ couponCode: null })}
        onCheckout={
          canCheckout
            ? () => navigate('/pagamento')
            : undefined
        }
        recommendedItems={(related.data?.items ?? [])
          .filter(nft => !items.some(item => item.nftId === nft.id))
          .slice(0, 10)
          .map(nft => ({
            id: nft.id,
            name: nft.title,
            price: `${formatEth(nft.price)} ETH`,
            imageUrl: nft.imageUrl,
            alt: nft.title,
          }))}
        onSelectRecommended={item => navigate(`/nft/${encodeURIComponent(item.id)}`)}
      />
      {items.length > 0 && quote.isFetching && (
        <div className="page-container pb-8" role="status" aria-busy="true">
          <p>Atualizando cotação...</p>
          <Skeleton className="h-32 w-full" />
        </div>
      )}
      {items.length > 0 && quote.isError && (
        <div className="page-container pb-8">
          <ErrorState
            title="Não foi possível obter a cotação"
            onRetry={() => void quote.refetch()}
          />
        </div>
      )}
      {quote.data?.itemsAvailability.some(item => !item.isAvailable) && (
        <p role="alert" className="page-container text-feedback-error">
          Uma edição está esgotada. Revise ou remova o item.
        </p>
      )}
      {items.length === 0 && (
        <div className="page-container pb-6">
          <Button variant="ghost" onClick={() => navigate('/')}>
            Continuar explorando
          </Button>
        </div>
      )}
    </div>
  );
}
