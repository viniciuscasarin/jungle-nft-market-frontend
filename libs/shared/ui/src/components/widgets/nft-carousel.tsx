import * as React from 'react';
import { cn } from '../../index';

export interface NftCarouselItem {
  id: string;
  name: string;
  price: string;
  imageUrl: string;
  alt?: string | undefined;
  href?: string | undefined;
}

export interface NftCarouselProps {
  /**
   * Título exibido no cabeçalho do carrossel.
   * Ex: "Mais dessa colecao" (PDP) ou "Colecionadores também viram" (Carrinho).
   */
  title?: string | undefined;
  /**
   * Lista de itens exibidos no carrossel.
   */
  items: NftCarouselItem[];
  /**
   * Callback disparado ao selecionar um item.
   */
  onSelectItem?: ((item: NftCarouselItem) => void) | undefined;
  /**
   * Prefixo utilizado nos data-testid para compatibilidade de testes.
   * Padrão: "pdp-related"
   */
  testIdPrefix?: string | undefined;
  /**
   * Classes CSS adicionais para o container principal.
   */
  className?: string | undefined;
}

/**
 * Componente unificado de Carrossel de NFTs reutilizável entre a Página de Detalhes (PDP)
 * e o Carrinho de Compras, fiel aos frames do Figma (#10:244 e #11:1278).
 *
 * Características:
 * - Cabeçalho customizável com linha inferior sólida em primary
 * - Trilha horizontal com 5 itens visíveis no viewport desktop
 * - Cada card possui container surface card, imagem 212x212 (raio 13px), nome e preço em destaque âmbar
 * - Arraste interativo com mouse (mouse drag) e swipe em touch
 * - Indicadores circulares de paginação (3 dots)
 */
export const NftCarousel: React.FC<NftCarouselProps> = ({
  title = 'Mais dessa colecao',
  items,
  onSelectItem,
  testIdPrefix = 'pdp-related',
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

  const handleItemClick = (item: NftCarouselItem) => {
    // Se o usuário moveu mais de 6px durante o drag, cancela o clique acidental
    if (dragDistanceRef.current > 6) {
      return;
    }
    onSelectItem?.(item);
  };

  return (
    <section
      data-testid={`${testIdPrefix}-carousel`}
      aria-label={title}
      className={cn('w-full flex flex-col select-none', className)}
    >
      {/* Cabeçalho do Carrossel */}
      <div
        data-testid={`${testIdPrefix}-carousel-header`}
        className="w-full border-b border-solid border-primary flex items-end justify-between select-none"
      >
        <h2
          data-testid={`${testIdPrefix}-carousel-title`}
          className="h-[28px] inline-flex items-center text-[17px] font-bold text-accent whitespace-nowrap"
        >
          {title}
        </h2>
      </div>

      {/* Trilha do Carrossel (Arrastável com mouse e touch) */}
      <div
        ref={trackRef}
        data-testid={`${testIdPrefix}-carousel-track`}
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
            data-testid={`${testIdPrefix}-item-${item.id}`}
            data-item-index={index}
            aria-label={`${item.name}, preço ${item.price}`}
            onClick={() => handleItemClick(item)}
            className="w-[220px] shrink-0 flex flex-col group cursor-pointer text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface-default rounded-[16px] transition-transform duration-150 hover:-translate-y-1 border-none bg-transparent p-0"
          >
            {/* Container da cor surface card com py 20px e px 4px */}
            <div
              data-testid={`${testIdPrefix}-image-container-${item.id}`}
              className="w-full bg-surface-card py-[20px] px-[4px] flex items-center justify-center rounded-[16px] border border-border-default/40 group-hover:border-border-accessible/60 transition-colors"
            >
              {/* Imagem 212x212 com bordas 13px */}
              <img
                src={item.imageUrl}
                alt={item.alt ?? item.name}
                data-testid={`${testIdPrefix}-image-${item.id}`}
                className="w-[212px] h-[212px] rounded-[13px] object-cover shrink-0 select-none pointer-events-none"
                loading="lazy"
                draggable={false}
              />
            </div>

            {/* Nome do item */}
            <span
              data-testid={`${testIdPrefix}-name-${item.id}`}
              className="mt-[12px] text-[15px] text-text-primary truncate block font-medium group-hover:text-accent transition-colors"
              title={item.name}
            >
              {item.name}
            </span>

            {/* Preço do item */}
            <span
              data-testid={`${testIdPrefix}-price-${item.id}`}
              className="mt-0.5 text-[16px] font-bold text-accent block"
            >
              {item.price}
            </span>
          </button>
        ))}
      </div>

      {/* Paginação do Carrossel (3 dots) */}
      <div
        data-testid={`${testIdPrefix}-carousel-dots`}
        className="flex items-center justify-center gap-2 mt-6 select-none"
        aria-label="Paginação do carrossel"
      >
        {[0, 1, 2].map((dotIndex) => {
          const isActive = activePageIndex === dotIndex;
          return (
            <button
              key={dotIndex}
              type="button"
              data-testid={`${testIdPrefix}-dot-${dotIndex}`}
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

NftCarousel.displayName = 'NftCarousel';
