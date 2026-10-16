import * as React from 'react';
import { IconThankYou, IconClose } from '@nft/shared-ui';
import { OrderConfirmationData } from './types';

export interface OrderConfirmationModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  data?: OrderConfirmationData;
  isInline?: boolean;
  className?: string;
}

export const DEFAULT_ORDER_CONFIRMATION: OrderConfirmationData = {
  transactionId: '0xA91F…E82C',
  date: '29 Jul, 2026',
  totalEth: '26.846 ETH',
  walletName: 'MetaMask',
  networkFeeEth: '0.016 ETH',
  networkName: 'Ethereum',
  etherscanUrl: 'https://etherscan.io',
  items: [
    {
      id: 'emerald-ape-042',
      name: 'Emerald Ape #042',
      tokenId: '#0042',
      imageUrl: '/assets/images/nft-03-emerald-ape.png',
      quantity: 2,
      subtotalEth: '2.38 ETH',
    },
    {
      id: 'violet-nomad-314',
      name: 'Violet Nomad #314',
      tokenId: '#0314',
      imageUrl: '/assets/images/nft-01-cosmic-bloom.png',
      quantity: 6,
      subtotalEth: '8.34 ETH',
    },
    {
      id: 'ivory-baron-088',
      name: 'Ivory Baron #088',
      tokenId: '#0088',
      imageUrl: '/assets/images/nft-02-cyber-samurai.png',
      quantity: 9,
      subtotalEth: '16.11 ETH',
    },
  ],
};

/**
 * Modal de Confirmação de Pedido com fidelidade estrita ao Figma (#11:4385 e #70376:239).
 * Exibe ícone de agradecimento (Thank You), resumo da transação em 4 colunas, lista detalhada
 * dos NFTs com quantidade e subtotais em âmbar, taxa de rede, total e CTA "Ver no Etherscan".
 */
export const OrderConfirmationModal: React.FC<OrderConfirmationModalProps> = ({
  isOpen = true,
  onClose,
  data = DEFAULT_ORDER_CONFIRMATION,
  isInline = false,
  className = '',
}) => {
  // Fechamento ao pressionar a tecla ESC
  React.useEffect(() => {
    if (isInline || !isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose?.();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isInline, onClose]);

  if (!isOpen && !isInline) return null;

  const content = (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="order-confirmation-title"
      data-testid="order-confirmation-modal"
      className={`relative w-full max-w-[578px] bg-surface-card border border-border-default/80 rounded-none shadow-2xl font-mono text-text-primary overflow-hidden select-none pb-4 ${className}`}
    >
      {/* Botão de Fechar no topo direito */}
      <button
        type="button"
        onClick={onClose}
        aria-label="Fechar modal de confirmação"
        className="absolute top-4 right-4 z-10 p-1.5 text-text-muted hover:text-text-primary rounded-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary cursor-pointer"
      >
        <IconClose className="w-4 h-4" aria-hidden="true" />
      </button>

      {/* Conteúdo Interno com Padding */}
      <div className="p-6 sm:p-10 flex flex-col">
        {/* Gráfico do Envelope "THANK YOU" */}
        <div className="flex justify-center pt-2">
          <IconThankYou
            className="w-16 h-16 text-accent"
            title="Agradecimento da compra"
          />
        </div>

        {/* Título Principal */}
        <h2
          id="order-confirmation-title"
          className="font-mono text-body-large-16 sm:text-title-18 font-medium text-text-primary text-center mt-4 tracking-wide"
        >
          Seus NFTs agora estão na sua carteira
        </h2>

        {/* Barra de Resumo da Transação em 4 Colunas com Divisores Verticais */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-0 divide-y sm:divide-y-0 sm:divide-x divide-border-default/60 border-y border-border-default/80 py-3.5 my-6">
          {/* Coluna 1: ID da transação */}
          <div className="flex flex-col gap-1 sm:px-3">
            <span className="text-caption-12 text-text-secondary font-medium">ID da transação</span>
            <span className="text-body-14 font-mono font-bold text-text-primary truncate">
              {data.transactionId}
            </span>
          </div>

          {/* Coluna 2: Data */}
          <div className="flex flex-col gap-1 sm:px-3 pt-2 sm:pt-0">
            <span className="text-caption-12 text-text-secondary font-medium">Data</span>
            <span className="text-body-14 font-mono font-bold text-text-primary">
              {data.date}
            </span>
          </div>

          {/* Coluna 3: Total */}
          <div className="flex flex-col gap-1 sm:px-3 pt-2 sm:pt-0">
            <span className="text-caption-12 text-text-secondary font-medium">Total</span>
            <span className="text-body-14 font-mono font-bold text-text-primary">
              {data.totalEth}
            </span>
          </div>

          {/* Coluna 4: Carteira */}
          <div className="flex flex-col gap-1 sm:px-3 pt-2 sm:pt-0">
            <span className="text-caption-12 text-text-secondary font-medium">Carteira</span>
            <span className="text-body-14 font-mono font-bold text-text-primary truncate">
              {data.walletName}
            </span>
          </div>
        </div>

        {/* Seção "Detalhes da transação" */}
        <div className="flex flex-col">
          <h3 className="font-mono font-bold text-body-14 text-text-primary mb-3">
            Detalhes da transação
          </h3>

          {/* Cabeçalho da Tabela */}
          <div className="grid grid-cols-12 text-caption-12 text-text-secondary font-mono pb-2 border-b border-border-default/40">
            <span className="col-span-7 font-medium">NFTs</span>
            <span className="col-span-2 text-center font-medium">Edições</span>
            <span className="col-span-3 text-right font-medium">Subtotal</span>
          </div>

          {/* Linhas de Itens Adquiridos */}
          <div className="flex flex-col divide-y divide-border-default/20">
            {data.items.map((item) => (
              <div key={item.id} className="grid grid-cols-12 items-center py-3">
                {/* Miniatura + Nome + ID do Token */}
                <div className="col-span-7 flex items-center gap-3 min-w-0 pr-2">
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-11 h-11 sm:w-12 sm:h-12 rounded-sm object-cover bg-surface-raised shrink-0 border border-border-default/40"
                  />
                  <div className="flex flex-col min-w-0">
                    <span className="font-mono font-bold text-body-14 text-text-primary truncate">
                      {item.name}
                    </span>
                    <span className="font-mono text-caption-12 text-text-secondary truncate">
                      ID do token: {item.tokenId}
                    </span>
                  </div>
                </div>

                {/* Edições / Quantidade */}
                <span className="col-span-2 text-center font-mono text-body-14 text-text-secondary">
                  (x {item.quantity})
                </span>

                {/* Subtotal em Âmbar */}
                <span className="col-span-3 text-right font-mono font-bold text-body-14 text-accent">
                  {item.subtotalEth}
                </span>
              </div>
            ))}
          </div>

          {/* Discriminação de Taxa e Total */}
          <div className="flex flex-col gap-1.5 items-end pt-3 border-t border-border-default/40 text-body-14 font-mono">
            <div className="flex items-center gap-8">
              <span className="text-text-secondary">Taxa de rede</span>
              <span className="text-text-primary font-medium min-w-[90px] text-right">
                {data.networkFeeEth}
              </span>
            </div>
            <div className="flex items-center gap-8">
              <span className="text-text-primary font-bold">Total</span>
              <span className="text-accent font-bold text-body-large-16 min-w-[90px] text-right">
                {data.totalEth}
              </span>
            </div>
          </div>
        </div>

        {/* Nota explicativa de confirmação na rede */}
        <p className="text-center text-caption-12 text-text-secondary max-w-sm mx-auto my-6 leading-relaxed font-mono">
          Transação confirmada na Ethereum. A propriedade foi transferida para sua carteira conectada e registrada na rede.
        </p>

        {/* Botão de Ação Primária: Ver no Etherscan */}
        <div className="flex justify-center pb-2">
          <a
            href={data.etherscanUrl ?? 'https://etherscan.io'}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center h-11 px-8 rounded-md bg-primary hover:bg-primary-hover text-ink font-mono font-bold text-body-14 tracking-wide transition-all shadow-md active:scale-98 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface-default"
          >
            Ver no Etherscan
          </a>
        </div>
      </div>

      {/* Faixa decorativa inferior em cor de destaque âmbar (#d28a4c) */}
      <div className="h-2 w-full bg-accent absolute bottom-0 left-0 right-0" aria-hidden="true" />
    </div>
  );

  if (isInline) {
    return content;
  }

  return (
    <div
      data-testid="order-confirmation-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/85 backdrop-blur-xs animate-in fade-in duration-200"
    >
      {/* Backdrop clicável acessível */}
      <button
        type="button"
        tabIndex={-1}
        aria-hidden="true"
        onClick={onClose}
        className="fixed inset-0 w-full h-full cursor-default bg-transparent -z-10 focus:outline-none border-none"
      />
      {content}
    </div>
  );
};
