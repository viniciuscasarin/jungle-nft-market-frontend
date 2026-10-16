import * as React from 'react';
import { cn } from '@nft/shared-ui';

export interface PdpRelatedItem {
  id: string;
  name: string;
  price: string;
  imageUrl: string;
  alt?: string | undefined;
  href?: string | undefined;
}

export interface PdpRelatedCarouselProps {
  /**
   * Título do cabeçalho do carrossel.
   * Padrão: "Mais dessa colecao"
   */
  title?: string | undefined;
  /**
   * Lista de itens da coleção exibidos no carrossel.
   * Padrão: 10 itens da coleção Kurio Apes extraídos do Figma.
   */
  items?: PdpRelatedItem[] | undefined;
  /**
   * Callback disparado ao clicar em um item do carrossel.
   */
  onSelectItem?: ((item: PdpRelatedItem) => void) | undefined;
  /**
   * Classes CSS adicionais.
   */
  className?: string | undefined;
}

export const DEFAULT_RELATED_ITEMS: PdpRelatedItem[] = [
  {
    id: 'related-1',
    name: 'Cosmic Bloom #118',
    price: '1.29 ETH',
    imageUrl: '/assets/images/nft-06-cosmic-bloom.png',
    alt: 'NFT Cosmic Bloom #118',
  },
  {
    id: 'related-2',
    name: 'Violet Nomad #314',
    price: '1.39 ETH',
    imageUrl: '/assets/images/nft-07-violet-nomad.png',
    alt: 'NFT Violet Nomad #314',
  },
  {
    id: 'related-3',
    name: 'Ivory Baron #088',
    price: '1.79 ETH',
    imageUrl: '/assets/images/nft-08-ivory-baron.png',
    alt: 'NFT Ivory Baron #088',
  },
  {
    id: 'related-4',
    name: 'Golden Beat #207',
    price: '0.99 ETH',
    imageUrl: '/assets/images/nft-09-golden-beat.png',
    alt: 'NFT Golden Beat #207',
  },
  {
    id: 'related-5',
    name: 'Golden Signal #160',
    price: '0.39 ETH',
    imageUrl: '/assets/images/nft-11-golden-signal.png',
    alt: 'NFT Golden Signal #160',
  },
  {
    id: 'related-6',
    name: 'Emerald Ape #042',
    price: '1.19 ETH',
    imageUrl: '/assets/images/nft-03-emerald-ape.png',
    alt: 'NFT Emerald Ape #042',
  },
  {
    id: 'related-7',
    name: 'Sage Nomad #095',
    price: '0.85 ETH',
    imageUrl: '/assets/images/nft-04-sage-nomad.png',
    alt: 'NFT Sage Nomad #095',
  },
  {
    id: 'related-8',
    name: 'Neon Vessel #019',
    price: '1.45 ETH',
    imageUrl: '/assets/images/nft-05-neon-vessel.png',
    alt: 'NFT Neon Vessel #019',
  },
  {
    id: 'related-9',
    name: 'Artwork Genesis #003',
    price: '2.10 ETH',
    imageUrl: '/assets/images/nft-10-artwork.png',
    alt: 'NFT Artwork Genesis #003',
  },
  {
    id: 'related-10',
    name: 'Kurio Hero #001',
    price: '3.50 ETH',
    imageUrl: '/assets/images/hero-nft.png',
    alt: 'NFT Kurio Hero #001',
  },
];

/**
 * Terceira linha da Página de Detalhes do Produto (PDP):
 * Componente de carrossel "Mais dessa coleção" com cinco itens visíveis e suporte a arraste/drag.
 *
 * Especificações visuais:
 * - Cabeçalho:
 *   - Texto: "Mais dessa colecao"
 *   - Altura: 28px (`h-[28px]`)
 *   - Borda: Linha sólida inferior de 1px da cor primary (`border-b border-solid border-primary`)
 *   - Fonte: font size 17 (`text-[17px]`), bold (`font-bold`)
 *   - Cor: text accent (`text-accent`)
 * - Itens do Carrossel:
 *   - 5 itens visíveis simultaneamente no viewport desktop (220px cada)
 *   - Espaço entre cada item: 26px (`gap-[26px]`)
 *   - Drag interativo com mouse (arrastável) e swipe touch
 *   - Cada item contém:
 *     - Container de imagem: cor surface card (`bg-surface-card`), py 20px (`py-[20px]`), px 4px (`px-[4px]`)
 *     - Imagem: 212x212 (`w-[212px] h-[212px]`) com bordas 13px (`rounded-[13px]`)
 *     - Espaçamento entre container e nome: 12px (`mt-[12px]`)
 *     - Nome do item: color foreground (`text-text-primary`), font size 15 (`text-[15px]`)
 *     - Preço do item (abaixo do nome): cor text accent (`text-accent`), font size 16px (`text-[16px]`), bold (`font-bold`)
 */
export const PdpRelatedCarousel: React.FC<PdpRelatedCarouselProps> = ({
  title = 'Mais dessa colecao',
  items = DEFAULT_RELATED_ITEMS,
  onSelectItem,
  className,
}) => {
  const trackRef = React.useRef<HTMLDivElement>(null);
  const [activePageIndex, setActivePageIndex] = React.useState(0);
  const [isMouseDown, setIsMouseDown] = React.useState(false);

  // Ref para verificar se houve deslocamento durante o clique/drag
  const dragDistanceRef = React.useRef(0);

  // Atualiza os dots conforme o usuário rola/arrasta o carrossel
  const handleScroll = React.useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const maxScroll = track.scrollWidth - track.clientWidth;
    if (maxScroll <= 0) {
      setActivePageIndex(0);
      return;
    }
    const ratio = track.scrollLeft / maxScroll;
    const page = Math.min(2, Math.max(0, Math.round(ratio * 2)));
    setActivePageIndex(page);
  }, []);

  const scrollToPage = (pageIndex: number) => {
    setActivePageIndex(pageIndex);
    const track = trackRef.current;
    if (!track) return;
    const maxScroll = track.scrollWidth - track.clientWidth;
    if (maxScroll <= 0) return;
    const targetScroll = (maxScroll / 2) * pageIndex;
    track.scrollTo({ left: targetScroll, behavior: 'smooth' });
  };

  // Handlers para Mouse Drag (arraste)
  React.useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    let isDown = false;
    let startX = 0;
    let scrollLeft = 0;

    const onMouseDown = (e: MouseEvent) => {
      isDown = true;
      setIsMouseDown(true);
      startX = e.pageX - track.offsetLeft;
      scrollLeft = track.scrollLeft;
      dragDistanceRef.current = 0;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - track.offsetLeft;
      const walk = x - startX;
      dragDistanceRef.current = Math.abs(walk);
      track.scrollLeft = scrollLeft - walk;
    };

    const onMouseUp = () => {
      if (isDown) {
        isDown = false;
        setIsMouseDown(false);
      }
    };

    track.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    return () => {
      track.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, []);

  const handleItemClick = (item: PdpRelatedItem) => {
    // Se o usuário moveu mais de 6px durante o drag, cancela o clique acidental
    if (dragDistanceRef.current > 6) {
      return;
    }
    onSelectItem?.(item);
  };

  return (
    <section
      data-testid="pdp-related-carousel"
      aria-labelledby="pdp-related-carousel-title"
      className={cn('w-full flex flex-col select-none', className)}
    >
      {/* =========================================================================
          CABEÇALHO DO CARROSSEL:
          - Texto "Mais dessa colecao"
          - Altura 28px (`h-[28px]`)
          - Borda sólida bottom de 1px da color primary (`border-b border-solid border-primary`)
          - Font size 17 (`text-[17px]`), bold (`font-bold`)
          - Cor text accent (`text-accent`)
          ========================================================================= */}
      <div
        data-testid="pdp-related-carousel-header"
        className="w-full border-b border-solid border-primary flex items-end justify-between select-none"
      >
        <h2
          id="pdp-related-carousel-title"
          data-testid="pdp-related-carousel-title"
          className="h-[28px] inline-flex items-center text-[17px] font-bold text-accent whitespace-nowrap"
        >
          {title}
        </h2>
      </div>

      {/* =========================================================================
          TRILHA / ITENS DO CARROSSEL (ARRASTÁVEL COM O MOUSE E TOUCH):
          - Cinco itens visíveis no viewport desktop
          - Espaçamento entre cada item: 26px (`gap-[26px]`)
          - Suporte completo a mouse drag (arraste suave)
          ========================================================================= */}
      <div
        ref={trackRef}
        data-testid="pdp-related-carousel-track"
        onScroll={handleScroll}
        className={cn(
          'w-full flex items-start gap-[26px] overflow-x-auto scrollbar-none pt-6 pb-2 select-none',
          isMouseDown ? 'cursor-grabbing' : 'cursor-grab'
        )}
      >
        {items.map((item, index) => (
          <button
            key={item.id}
            type="button"
            data-testid={`pdp-related-item-${item.id}`}
            data-item-index={index}
            aria-label={`${item.name}, preço ${item.price}`}
            onClick={() => handleItemClick(item)}
            className="w-[220px] shrink-0 flex flex-col group cursor-pointer text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface-default rounded-[16px] transition-transform duration-150 hover:-translate-y-1 border-none bg-transparent p-0"
          >
            {/* Container da cor surface card com py 20px e px 4px */}
            <div
              data-testid={`pdp-related-image-container-${item.id}`}
              className="w-full bg-surface-card py-[20px] px-[4px] flex items-center justify-center rounded-[16px] border border-border-default/40 group-hover:border-border-accessible/60 transition-colors"
            >
              {/* Imagem 212x212 com bordas 13px */}
              <img
                src={item.imageUrl}
                alt={item.alt ?? item.name}
                data-testid={`pdp-related-image-${item.id}`}
                className="w-[212px] h-[212px] rounded-[13px] object-cover shrink-0 select-none pointer-events-none"
                loading="lazy"
                draggable={false}
              />
            </div>

            {/* Nome do item: Entre container e nome tem 12px; color foreground, font size 15 */}
            <span
              data-testid={`pdp-related-name-${item.id}`}
              className="mt-[12px] text-[15px] text-text-primary truncate block font-medium group-hover:text-accent transition-colors"
              title={item.name}
            >
              {item.name}
            </span>

            {/* Preço do item: abaixo do nome, cor text accent, font size 16px e bold */}
            <span
              data-testid={`pdp-related-price-${item.id}`}
              className="mt-0.5 text-[16px] font-bold text-accent block"
            >
              {item.price}
            </span>
          </button>
        ))}
      </div>

      {/* =========================================================================
          INDICADORES / PAGINAÇÃO (3 DOTS CONFORME FIGMA):
          ========================================================================= */}
      <div
        data-testid="pdp-related-carousel-dots"
        className="flex items-center justify-center gap-2 mt-6 select-none"
        aria-label="Paginação do carrossel"
      >
        {[0, 1, 2].map((dotIndex) => {
          const isActive = activePageIndex === dotIndex;
          return (
            <button
              key={dotIndex}
              type="button"
              data-testid={`pdp-related-dot-${dotIndex}`}
              aria-label={`Ir para página ${dotIndex + 1} do carrossel`}
              aria-current={isActive ? 'true' : undefined}
              onClick={() => scrollToPage(dotIndex)}
              className={cn(
                'w-2 h-2 rounded-full transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
                isActive
                  ? 'bg-accent scale-125'
                  : 'bg-surface-raised hover:bg-border-soft'
              )}
            />
          );
        })}
      </div>
    </section>
  );
};

PdpRelatedCarousel.displayName = 'PdpRelatedCarousel';
