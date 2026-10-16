import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  CollectorSchema,
  type Collector,
  type Quote,
  type CreateQuoteInput,
  type WalletType,
  type WalletNetwork,
  ApiError,
} from '@nft/shared-contracts';
import { formatEth } from '@nft/shared-money';
import { useShell, useSession } from '@nft/shell-kit';
import {
  PaymentPageContent,
  type CheckoutNftItem,
  type CollectorProfileData,
  type WalletProviderOption,
} from '@nft/checkout-ui';
import {
  mapProfileAndWalletToCollector,
  hasQuoteChanged,
  parseWalletNetwork,
} from '@nft/checkout-domain';
import {
  profileQueryOptions,
  walletsQueryOptions,
  createCheckoutQuote,
} from '@nft/checkout-data-access';
import {
  createIdempotencyKey,
} from '@nft/orders-domain';
import {
  useCreateOrderMutation,
} from '@nft/orders-data-access';
import { useQuery, queryKeys } from '@nft/shared-query';
import { cartQueryOptions } from '@nft/cart-data-access';
import { Button, EmptyState } from '@nft/shared-ui';

export interface PaymentFeaturePageProps {
  quoteId?: string | undefined;
  onNavigateBack?: (() => void) | undefined;
  onOrderSuccess?: ((orderId: string) => void) | undefined;
}

export function PaymentFeaturePage({
  onNavigateBack,
  onOrderSuccess,
}: PaymentFeaturePageProps) {
  const { httpClient, queryClient, feedback, navigate } = useShell();
  const session = useSession();

  const userId = session?.userId ?? '';
  const cart = useQuery({ ...cartQueryOptions(httpClient, userId), enabled: Boolean(userId) });
  const quoteInput: CreateQuoteInput = React.useMemo(() => ({
    items: (cart.data?.items ?? []).map(item => ({
      nftId: item.nftId, editionId: item.editionId, quantity: item.quantity,
    })),
    couponCode: cart.data?.couponCode ?? null,
  }), [cart.data]);

  // 1. Fetch Profile and Wallets
  const {
    data: profile,
    isLoading: isLoadingProfile,
    isError: isProfileError,
    refetch: refetchProfile,
  } = useQuery(profileQueryOptions(httpClient, userId));

  const {
    data: wallets,
    isLoading: isLoadingWallets,
    isError: isWalletsError,
    refetch: refetchWallets,
  } = useQuery(walletsQueryOptions(httpClient, userId));

  // Current active quote ID
  const [quoteChangedNotice, setQuoteChangedNotice] = React.useState<string | null>(null);
  const [previousQuote, setPreviousQuote] = React.useState<Quote | null>(null);
  const [orderErrorMessage, setOrderErrorMessage] = React.useState<string | null>(null);
  const [isConfirmedOrder, setIsConfirmedOrder] = React.useState(false);

  // 2. Fetch Active Quote
  const {
    data: quote,
    isLoading: isLoadingQuote,
    isError: isQuoteError,
    refetch: refetchQuote,
    isFetching: isFetchingQuote,
  } = useQuery({
    queryKey: queryKeys.quote.payment(userId, quoteInput),
    queryFn: () => createCheckoutQuote(httpClient, quoteInput),
    enabled: Boolean(userId) && quoteInput.items.length > 0 && !cart.isFetching,
    retry: false,
    staleTime: 0,
    refetchOnWindowFocus: false,
  });

  // Check for quote changes
  React.useEffect(() => {
    if (quote && previousQuote) {
      if (hasQuoteChanged(previousQuote, quote)) {
        setQuoteChangedNotice(
          'A cotação foi atualizada com novos valores. Por favor, revise e confirme novamente.'
        );
        feedback.notify({
          message: 'A cotação foi atualizada com novos valores.',
          tone: 'warning',
          politeness: 'assertive',
        });
      }
    }
    if (quote) {
      setPreviousQuote(quote);
    }
  }, [quote, previousQuote, feedback]);

  // Selected Wallet State
  const [selectedWalletType, setSelectedWalletType] = React.useState<WalletProviderOption>('coinbase');

  // React Hook Form for Collector
  const {
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors },
  } = useForm<Collector>({
    resolver: zodResolver(CollectorSchema),
    defaultValues: {
      fullName: '',
      email: '',
      walletAddress: '',
      walletType: 'coinbase',
      network: 'ethereum-mainnet',
      ensName: undefined,
      useSecondaryWallet: false,
      secondaryWallet: null,
      note: '',
    },
  });

  // Prefill when profile/wallets load without persisting to account
  const hasPrefilledRef = React.useRef(false);
  React.useEffect(() => {
    if (!hasPrefilledRef.current && (profile || wallets)) {
      const primaryWallet = wallets?.primary;
      const initial = mapProfileAndWalletToCollector({
        profile,
        primaryWallet: primaryWallet
          ? {
              ...primaryWallet,
              userId,
              createdAt: '2026-01-01T00:00:00.000Z',
            }
          : null,
      });

      reset({
        fullName: initial.fullName ?? '',
        email: initial.email ?? '',
        walletAddress: initial.walletAddress ?? '',
        walletType: (initial.walletType as WalletType) ?? 'coinbase',
        network: (initial.network as WalletNetwork) ?? 'ethereum-mainnet',
        ensName: initial.ensName ?? null,
        useSecondaryWallet: false,
        secondaryWallet: null,
        note: '',
      });

      if (initial.walletType) {
        setSelectedWalletType(initial.walletType as WalletProviderOption);
      }

      hasPrefilledRef.current = true;
    }
  }, [profile, wallets, reset, userId]);

  const watchedCollector = watch();

  const handleCollectorChange = (data: CollectorProfileData) => {
    setValue('fullName', data.displayName || data.profileName);
    setValue('email', data.email);
    setValue('walletAddress', data.walletAddress);
    if (data.ensName) {
      setValue('ensName', data.ensName);
    }
    if (data.network) {
      const parsedNet = parseWalletNetwork(data.network);
      if (parsedNet) setValue('network', parsedNet);
    }
    setValue('useSecondaryWallet', data.useAnotherWallet);
    if (data.useAnotherWallet && data.secondaryWallet) {
      setValue('secondaryWallet', {
        address: data.secondaryWallet,
        network: (watchedCollector.network as WalletNetwork) || 'ethereum-mainnet',
      });
    } else {
      setValue('secondaryWallet', null);
    }
    if (data.collectorNote) {
      setValue('note', data.collectorNote);
    }
  };

  const handleWalletSelect = (option: WalletProviderOption) => {
    setSelectedWalletType(option);
    const validTypes: WalletType[] = ['metamask', 'coinbase', 'walletconnect'];
    const matched = validTypes.find((t) => option.includes(t));
    if (matched) {
      setValue('walletType', matched);
    }
  };

  // Convert Quote items to CheckoutNftItem format
  const nfts: CheckoutNftItem[] = React.useMemo(() => {
    if (!quote?.itemsAvailability) return [];
    return quote.itemsAvailability.flatMap(item => {
      const selected = cart.data?.items.find(candidate =>
        candidate.nftId === item.nftId && candidate.editionId === item.editionId);
      if (!selected || !item.lineSubtotal) return [];
      return [{
        id: selected.id,
        name: selected.title,
        tokenId: selected.editionNumber ? `#${selected.editionNumber}` : selected.editionId,
        imageUrl: selected.imageUrl,
        quantity: item.requestedQuantity,
        subtotalEth: `${formatEth(item.lineSubtotal)} ETH`,
      }];
    });
  }, [quote, cart.data]);

  // Idempotency key per logical submission attempt
  const idempotencyKeyRef = React.useRef<string>(createIdempotencyKey());

  // Mutation for creating orders
  const createOrderMutation = useCreateOrderMutation(httpClient);

  // Loading and Error states
  const isLoading = isLoadingProfile || isLoadingWallets || cart.isLoading || isLoadingQuote;
  const isError = isProfileError || isWalletsError || isQuoteError || cart.isError;

  if (!session || (cart.isSuccess && cart.data.items.length === 0)) {
    return <div className="page-container py-8"><EmptyState
      title={session ? 'Seu carrinho está vazio' : 'Entre para continuar a compra'}
      action={<Button onClick={() => navigate(session ? '/' : '/login?redirect=%2Fpagamento')}>
        {session ? 'Explorar NFTs' : 'Entrar'}
      </Button>}
    /></div>;
  }

  if (isLoading) {
    return (
      <div
        role="region"
        aria-busy="true"
        aria-label="Carregando dados de pagamento"
        className="page-container min-h-screen bg-surface-default flex items-center justify-center py-8 font-mono text-text-primary"
      >
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-body-14 text-text-secondary">Carregando dados do checkout...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div
        role="alert"
        className="page-container min-h-screen bg-surface-default flex items-center justify-center py-8 font-mono text-text-primary"
      >
        <div className="max-w-md w-full p-6 border border-feedback-error bg-surface-card flex flex-col items-center gap-4 text-center">
          <h2 className="text-title-20 font-bold text-feedback-error">Erro ao carregar checkout</h2>
          <p className="text-body-14 text-text-secondary">
            Não foi possível carregar os dados de perfil, carteira ou cotação.
          </p>
          <button
            type="button"
            onClick={() => {
              refetchProfile();
              refetchWallets();
              refetchQuote();
              void cart.refetch();
            }}
            className="px-6 py-3 bg-primary text-ink font-bold hover:bg-primary-hover transition-colors"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  const initialCollectorData: Partial<CollectorProfileData> = {
    displayName: watchedCollector.fullName,
    username: profile?.username ?? '',
    profileName: watchedCollector.fullName,
    email: watchedCollector.email,
    walletAddress: watchedCollector.walletAddress,
    walletType: watchedCollector.walletType,
    ensName: watchedCollector.ensName ?? '',
    useAnotherWallet: watchedCollector.useSecondaryWallet ?? false,
    secondaryWallet: watchedCollector.secondaryWallet?.address ?? '',
    collectorNote: watchedCollector.note ?? '',
  };

  // Collect any form validation errors for alert display
  const errorEntries = Object.entries(errors);
  const firstErrorMessage =
    orderErrorMessage ??
    quoteChangedNotice ??
    (errorEntries.length > 0 ? (errorEntries[0]?.[1]?.message as string) : null);

  const onSubmitValid = async (collectorData: Collector) => {
    if (!quote || cart.isFetching || isFetchingQuote || cart.isError || isQuoteError ||
        quote.isExpired ||
        nfts.length !== quoteInput.items.length || quoteInput.items.length === 0) {
      setOrderErrorMessage('A cotação não está válida. Atualize e revise os valores antes de confirmar.');
      return;
    }
    // If quote changed notice is active, user must acknowledge/clear
    if (quoteChangedNotice) {
      setQuoteChangedNotice(null);
      idempotencyKeyRef.current = createIdempotencyKey();
      return;
    }

    setOrderErrorMessage(null);

    // Block if availability conflict is present
    if (quote?.itemsAvailability.some((item) => !item.isAvailable)) {
      setOrderErrorMessage('Um ou mais itens no pedido estão esgotados.');
      feedback.notify({
        message: 'Itens esgotados. Revise seu carrinho antes de continuar.',
        tone: 'error',
        politeness: 'assertive',
      });
      return;
    }

    try {
      const order = await createOrderMutation.mutateAsync({
        idempotencyKey: idempotencyKeyRef.current,
        input: {
          quoteId: quote.quoteId,
          collector: collectorData,
        },
      });

      if (order.status === 'confirmed') {
        await queryClient.invalidateQueries({ queryKey: queryKeys.cart.all() });
        await queryClient.invalidateQueries({ queryKey: queryKeys.quote.all() });
        setIsConfirmedOrder(true);
        feedback.notify({
          message: 'Compra confirmada com sucesso!',
          tone: 'success',
          politeness: 'polite',
        });
        if (onOrderSuccess) {
          onOrderSuccess(order.id);
        } else {
          navigate(`/pedido/${order.id}`);
        }
      } else if (order.status === 'rejected') {
        const reason = order.rejectionReason || 'Pagamento recusado na simulação.';
        setOrderErrorMessage(reason);
        feedback.notify({
          message: reason,
          tone: 'error',
          politeness: 'assertive',
        });
      } else {
        // Pending
        setOrderErrorMessage('Seu pedido está em processamento.');
        feedback.notify({
          message: 'Pedido em processamento. Aguarde a confirmação.',
          tone: 'info',
          politeness: 'polite',
        });
      }
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        if (err.code === 'PRICE_CHANGED') {
          setQuoteChangedNotice('O preço de um ou mais itens mudou. Revise a nova cotação.');
          void refetchQuote();
        } else if (err.code === 'AVAILABILITY_CONFLICT') {
          setOrderErrorMessage('A edição selecionada encontra-se esgotada.');
        } else {
          setOrderErrorMessage(err.message || 'Falha ao processar pagamento.');
        }
        feedback.notify({
          message: err.message || 'Erro ao processar o pedido.',
          tone: 'error',
          politeness: 'assertive',
        });
      } else if (err instanceof Error) {
        setOrderErrorMessage(err.message);
      } else {
        setOrderErrorMessage('Erro inesperado ao finalizar a compra.');
      }
    }
  };

  return (
    <PaymentPageContent
      initialCollectorData={initialCollectorData}
      onCollectorChange={handleCollectorChange}
      selectedWallet={selectedWalletType}
      onSelectWallet={handleWalletSelect}
      nfts={nfts}
      subtotalEth={quote ? `${formatEth(quote.subtotal)} ETH` : undefined}
      discountEth={quote ? `(-) ${formatEth(quote.discount)} ETH` : undefined}
      networkFeeEth={quote ? `${formatEth(quote.networkFee)} ETH` : undefined}
      totalEth={quote ? `${formatEth(quote.total)} ETH` : undefined}
      errorMessage={firstErrorMessage}
      isSubmitting={createOrderMutation.isPending}
      isConfirmed={isConfirmedOrder}
      canConfirm={Boolean(quote && !isFetchingQuote && !cart.isFetching &&
        !quote.isExpired && nfts.length === quoteInput.items.length &&
        quote.itemsAvailability.every(item => item.isAvailable))}
      onConfirmPurchase={() => {
        handleSubmit(
          onSubmitValid,
          (formErrors) => {
            const firstErr = Object.values(formErrors)[0]?.message;
            if (firstErr) {
              setOrderErrorMessage(firstErr as string);
            }
          }
        )();
      }}
      onNavigateBack={onNavigateBack}
    />
  );
}

export * from './index';
