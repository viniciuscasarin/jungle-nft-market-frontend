import { Skeleton } from '@nft/shared-ui';
export function CartSkeleton() {
  return (
    <section
      aria-busy="true"
      aria-label="Carregando carrinho"
      className="page-container py-6 space-y-8"
      data-testid="cart-loading"
    >
      <Skeleton className="h-8 w-64" />
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        <div className="xl:col-span-8 space-y-3">
          {[1, 2, 3].map(index => (
            <Skeleton key={index} className="h-28 w-full" />
          ))}
        </div>
        <Skeleton className="xl:col-span-4 h-80 w-full" />
      </div>
    </section>
  );
}
