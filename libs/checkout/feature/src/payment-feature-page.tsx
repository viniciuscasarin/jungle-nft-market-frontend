import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  CollectorSchema,
  type Collector,
  type Quote,
  type WalletType,
  type WalletNetwork,
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
  quoteQueryOptions,
} from '@nft/checkout-data-access';
import { useQuery } from '@nft/shared-query';

export interface PaymentFeaturePageProps {
  quoteId?: string | undefined;
  onNavigateBack?: (() => void) | undefined;
  onOrderSuccess?: ((orderId: string) => void) | undefined;
}

export function PaymentFeaturePage({
  quoteId: initialQuoteId,
  onNavigateBack,
  onOrderSuccess,
}: PaymentFeaturePageProps) {
  const { httpClient, feedback } = useShell();
  const session = useSession();

  const userId = session?.userId ?? 'user_alice';

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
  const activeQuoteId = initialQuoteId ?? 'quote-999';
  const [quoteChangedNotice, setQuoteChangedNotice] = React.useState<string | null>(null);
  const [previousQuote, setPreviousQuote] = React.useState<Quote | null>(null);

  // 2. Fetch Active Quote
  const {
    data: quote,
    isLoading: isLoadingQuote,
    isError: isQuoteError,
    refetch: refetchQuote,
  } = useQuery(quoteQueryOptions(httpClient, activeQuoteId));

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

      if (initial.fullName) setValue('fullName', initial.fullName);
      if (initial.email) setValue('email', initial.email);
      if (initial.walletAddress) setValue('walletAddress', initial.walletAddress);
      if (initial.walletType) {
        setValue('walletType', initial.walletType);
        setSelectedWalletType(initial.walletType as WalletProviderOption);
      }
      if (initial.network) setValue('network', initial.network);
      if (initial.ensName) setValue('ensName', initial.ensName);

      hasPrefilledRef.current = true;
    }
  }, [profile, wallets, setValue, userId]);

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
    return quote.itemsAvailability.map((item, index) => ({
      id: item.nftId,
      name: `NFT Item #${item.nftId}`,
      tokenId: `#00${index + 1}`,
      imageUrl: '/assets/images/nft-03-emerald-ape.png',
      quantity: item.requestedQuantity,
      subtotalEth: `${formatEth(item.currentPrice)} ETH`,
    }));
  }, [quote]);

  // Loading and Error states
  const isLoading = isLoadingProfile || isLoadingWallets || isLoadingQuote;
  const isError = isProfileError || isWalletsError || isQuoteError;

  if (isLoading) {
    return (
      <div
        role="region"
        aria-busy="true"
        aria-label="Carregando dados de pagamento"
        className="w-full min-h-screen bg-surface-default flex items-center justify-center p-8 font-mono text-text-primary"
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
        className="w-full min-h-screen bg-surface-default flex items-center justify-center p-8 font-mono text-text-primary"
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
    quoteChangedNotice ??
    (errorEntries.length > 0 ? (errorEntries[0]?.[1]?.message as string) : null);

  const onSubmitValid = async () => {
    // If quote changed notice is active, user must acknowledge/clear
    if (quoteChangedNotice) {
      setQuoteChangedNotice(null);
      return;
    }

    // Proceed to order creation (handled by subsequent tasks)
    onOrderSuccess?.('order_simulated');
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
      onConfirmPurchase={() => {
        handleSubmit(onSubmitValid)();
      }}
      onNavigateBack={onNavigateBack}
    />
  );
}

export * from './index';
