import React, {
  Component,
  Suspense,
  useEffect,
  type ReactNode,
  type ErrorInfo,
} from 'react';
import { Skeleton, ErrorState } from '@nft/shared-ui';

export interface RemoteBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  timeoutMs?: number;
  onError?: (error: Error, info: ErrorInfo) => void;
  onRetry?: () => void;
  title?: string;
  message?: string;
}

interface RemoteBoundaryState {
  hasError: boolean;
  error: Error | null;
  retryKey: number;
}

function TimeoutTracker({
  timeoutMs,
  onTimeout,
}: {
  timeoutMs: number;
  onTimeout: () => void;
}) {
  useEffect(() => {
    const timer = setTimeout(onTimeout, timeoutMs);
    return () => clearTimeout(timer);
  }, [timeoutMs, onTimeout]);

  return null;
}

export function DefaultRemoteSkeleton() {
  return (
    <div
      data-testid="remote-skeleton"
      className="w-full min-h-[400px] p-6 space-y-4 animate-pulse motion-reduce:animate-none"
      aria-busy="true"
      aria-label="Carregando conteúdo remoto..."
    >
      <Skeleton height={40} width="40%" rounded="md" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        <Skeleton height={240} rounded="lg" />
        <Skeleton height={240} rounded="lg" />
        <Skeleton height={240} rounded="lg" />
      </div>
      <span className="sr-only">Carregando conteúdo remoto...</span>
    </div>
  );
}

export function withRemoteTimeout<T>(
  promiseFactory: () => Promise<T>,
  timeoutMs = 10000,
): Promise<T> {
  return Promise.race([
    promiseFactory(),
    new Promise<T>((_, reject) =>
      setTimeout(
        () =>
          reject(
            new Error(
              `Tempo limite de ${timeoutMs}ms excedido ao carregar o módulo remoto.`,
            ),
          ),
        timeoutMs,
      ),
    ),
  ]);
}

export class RemoteBoundary extends Component<
  RemoteBoundaryProps,
  RemoteBoundaryState
> {
  public override state: RemoteBoundaryState = {
    hasError: false,
    error: null,
    retryKey: 0,
  };

  public static getDerivedStateFromError(error: Error): Partial<RemoteBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.props.onError?.(error, errorInfo);
  }

  private handleTimeout = (): void => {
    const timeout = this.props.timeoutMs ?? 10000;
    const error = new Error(
      `Tempo limite de ${timeout}ms excedido ao carregar o remote.`,
    );
    this.setState({
      hasError: true,
      error,
    });
  };

  private handleRetry = (): void => {
    this.setState((prevState) => ({
      hasError: false,
      error: null,
      retryKey: prevState.retryKey + 1,
    }));
    this.props.onRetry?.();
  };

  public override render(): ReactNode {
    if (this.state.hasError) {
      return (
        <ErrorState
          title={this.props.title ?? 'Falha ao carregar componente remoto'}
          message={
            this.props.message ??
            (this.state.error?.message ||
              'O serviço remoto está temporariamente indisponível.')
          }
          retryLabel="Tentar novamente"
          onRetry={this.handleRetry}
        />
      );
    }

    const { timeoutMs = 10000, fallback, children } = this.props;

    return (
      <Suspense
        fallback={
          <>
            {fallback ?? <DefaultRemoteSkeleton />}
            {timeoutMs > 0 && (
              <TimeoutTracker
                timeoutMs={timeoutMs}
                onTimeout={this.handleTimeout}
              />
            )}
          </>
        }
      >
        <React.Fragment key={this.state.retryKey}>{children}</React.Fragment>
      </Suspense>
    );
  }
}
