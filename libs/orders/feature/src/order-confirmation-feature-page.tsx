import * as React from 'react';
import { useParams } from '@nft/shared-router';
import { useShell, useSession, useUnavailable } from '@nft/shell-kit';
import { useQuery } from '@nft/shared-query';
import { ErrorState, Skeleton } from '@nft/shared-ui';
import { formatEth } from '@nft/shared-money';
import { orderQueries } from '@nft/orders-data-access';
import { OrderConfirmationModal, type OrderConfirmationData } from '@nft/orders-ui';

export function OrderConfirmationFeaturePage() {
  let orderId: string | undefined;
  try {
    const params = useParams({ strict: false }) as Record<string, string>;
    orderId = params['orderId'];
  } catch {
    // Fallback if not inside router context
  }

  const { httpClient, navigate } = useShell();
  const session = useSession();
  const { notifyUnavailable } = useUnavailable();

  const userId = session?.userId;

  const {
    data: order,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    ...orderQueries.detail(httpClient, orderId ?? '', userId ?? ''),
    enabled: Boolean(orderId && userId),
  });

  React.useEffect(() => {
    document.title = 'Confirmação de Pedido | Jungle NFT';
  }, []);

  const handleClose = React.useCallback(() => {
    if (navigate) {
      navigate('/');
    } else {
      window.location.href = '/';
    }
  }, [navigate]);

  const handleEtherscan = React.useCallback(() => {
    notifyUnavailable('Ver no Etherscan');
  }, [notifyUnavailable]);

  // Loading state
  if (isLoading) {
    return (
      <div
        data-testid="order-confirmation-loading"
        aria-busy="true"
        aria-label="Carregando confirmação de pedido"
        className="max-w-md mx-auto my-12 p-6 flex flex-col items-center gap-4 bg-surface-card border border-border-default/80"
      >
        <Skeleton className="w-16 h-16 rounded-full" />
        <Skeleton className="w-48 h-6" />
        <Skeleton className="w-64 h-4" />
        <div className="w-full space-y-2 mt-4">
          <Skeleton className="w-full h-10" />
          <Skeleton className="w-full h-10" />
        </div>
      </div>
    );
  }

  // Not authenticated or orderId missing
  if (!userId || !orderId) {
    return (
      <div className="max-w-md mx-auto my-12 p-4">
        <ErrorState
          title="Acesso não autorizado"
          message="Você precisa estar autenticado para visualizar os detalhes deste pedido."
          onRetry={handleClose}
          retryLabel="Voltar ao Início"
        />
      </div>
    );
  }

  // Error state (404, network error, or user mismatch)
  if (isError || !order || order.userId !== userId) {
    return (
      <div className="max-w-md mx-auto my-12 p-4">
        <ErrorState
          title="Pedido não encontrado"
          message="Não foi possível carregar os detalhes do pedido ou você não tem permissão para acessá-lo."
          onRetry={() => void refetch()}
          retryLabel="Tentar novamente"
        >
          <div className="mt-4">
            <button
              type="button"
              onClick={handleClose}
              className="text-body-14 text-text-secondary hover:text-text-primary underline cursor-pointer"
            >
              Voltar ao Início
            </button>
          </div>
        </ErrorState>
      </div>
    );
  }

  // Rejected order
  if (order.status === 'rejected') {
    return (
      <div className="max-w-md mx-auto my-12 p-4">
        <ErrorState
          title="Pedido não concluído"
          message={
            order.rejectionReason ??
            'O pagamento foi recusado pela rede simulada ou cancelado. Nenhum valor foi debitado.'
          }
          onRetry={handleClose}
          retryLabel="Voltar ao Início"
        />
      </div>
    );
  }

  // Pending order
  if (order.status === 'pending') {
    return (
      <div className="max-w-md mx-auto my-12 p-6 flex flex-col items-center text-center bg-surface-card border border-feedback-warning/40 font-mono">
        <div className="w-12 h-12 rounded-full bg-feedback-warning/10 text-feedback-warning flex items-center justify-center mb-3">
          ⏳
        </div>
        <h2 className="text-title-18 font-bold text-text-primary">Processando Transação</h2>
        <p className="text-body-14 text-text-secondary mt-2 max-w-sm">
          Seu pedido está sendo processado na rede. A confirmação definitiva aparecerá assim que a transação for concluída.
        </p>
        <button
          type="button"
          onClick={handleClose}
          className="mt-6 px-6 py-2.5 rounded-sm bg-surface-raised hover:bg-surface-elevated text-text-primary font-mono text-body-14 cursor-pointer"
        >
          Voltar ao Início
        </button>
      </div>
    );
  }

  // Confirmed order with receipt
  const receipt = order.receipt;
  const items = (receipt?.items ?? order.items).map((item) => ({
    id: `${item.nftId}-${item.editionId}`,
    name: item.title,
    tokenId: `#000${item.editionNumber ?? 1}`.slice(-4),
    imageUrl: item.imageUrl,
    quantity: item.quantity,
    subtotalEth: `${formatEth(item.subtotal)} ETH`,
  }));

  const confirmationData: OrderConfirmationData = {
    transactionId: receipt?.transactionHash
      ? `${receipt.transactionHash.slice(0, 6)}…${receipt.transactionHash.slice(-4)}`
      : `#${order.id.slice(0, 8)}`,
    date: new Date(receipt?.confirmedAt ?? order.createdAt).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }),
    totalEth: `${formatEth(receipt?.total ?? order.total)} ETH`,
    walletName: order.collector.ensName
      ? `${order.collector.ensName} (${order.collector.walletAddress.slice(0, 6)}…${order.collector.walletAddress.slice(-4)})`
      : `${order.collector.walletAddress.slice(0, 6)}…${order.collector.walletAddress.slice(-4)}`,
    networkFeeEth: `${formatEth(receipt?.networkFee ?? order.networkFee)} ETH`,
    networkName: order.collector.network,
    etherscanUrl: receipt?.transactionHash
      ? `https://etherscan.io/tx/${receipt.transactionHash}`
      : 'https://etherscan.io',
    items,
  };

  return (
    <OrderConfirmationModal
      isOpen
      data={confirmationData}
      onClose={handleClose}
      onEtherscanClick={handleEtherscan}
    />
  );
}
