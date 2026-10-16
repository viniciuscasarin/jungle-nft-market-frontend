import * as React from 'react';
import { cn, IconSearch } from '@nft/shared-ui';

export interface PdpImageItem {
  id: string;
  url: string;
  alt: string;
  thumbnailUrl?: string | undefined;
  label?: string | undefined;
}

export interface PdpGalleryProps {
  /**
   * Lista com as fotos do produto (geralmente 4 fotos do NFT em diferentes perspectivas/detalhes).
   */
  images?: PdpImageItem[] | undefined;
  /**
   * Índice da imagem inicialmente selecionada (padrão: 0).
   */
  initialImageIndex?: number | undefined;
  /**
   * Callback disparado quando o usuário seleciona outra foto.
   */
  onSelectImage?: ((index: number) => void) | undefined;
  /**
   * Classes adicionais no container principal da galeria.
   */
  className?: string | undefined;
}

const DEFAULT_GALLERY_IMAGES: PdpImageItem[] = [
  {
    id: 'pdp-img-1',
    url: '/assets/images/nft-03-emerald-ape.png',
    thumbnailUrl: '/assets/images/nft-03-emerald-ape.png',
    alt: 'Emerald Ape #042 - Visão Principal',
    label: 'Principal',
  },
  {
    id: 'pdp-img-2',
    url: '/assets/images/nft-03-emerald-ape.png',
    thumbnailUrl: '/assets/images/nft-03-emerald-ape.png',
    alt: 'Emerald Ape #042 - Detalhe dos Óculos',
    label: 'Óculos',
  },
  {
    id: 'pdp-img-3',
    url: '/assets/images/nft-03-emerald-ape.png',
    thumbnailUrl: '/assets/images/nft-03-emerald-ape.png',
    alt: 'Emerald Ape #042 - Detalhe do Colar de Esmeralda',
    label: 'Esmeralda',
  },
  {
    id: 'pdp-img-4',
    url: '/assets/images/nft-03-emerald-ape.png',
    thumbnailUrl: '/assets/images/nft-03-emerald-ape.png',
    alt: 'Emerald Ape #042 - Jaqueta e Acabamento',
    label: 'Jaqueta',
  },
];

/**
 * Galeria de imagens do produto para a página de detalhes (PDP).
 *
 * Dimensões e regras do design:
 * - Coluna da galeria: 573px de largura no desktop
 * - Coluna 1 (miniaturas): 4 fotos de 100px x 100px com gap de 16px entre si
 *   - Miniatura selecionada: borda de 1px (border border-primary)
 * - Gap entre coluna de miniaturas e coluna principal: 28px
 * - Coluna 2 (imagem principal):
 *   - Div pai com bg-surface-card e padding interno de 20px (p-[20px])
 *   - Indicador de zoom: div redonda 30px x 30px no canto superior direito (top-[12px] right-[12px]),
 *     com bg-surface-raised, borda color border (border-border-default) e ícone de lupa
 */
export const PdpGallery: React.FC<PdpGalleryProps> = ({
  images = DEFAULT_GALLERY_IMAGES,
  initialImageIndex = 0,
  onSelectImage,
  className,
}) => {
  const [selectedIndex, setSelectedIndex] = React.useState(initialImageIndex);
  const [isZoomed, setIsZoomed] = React.useState(false);
  const [mousePosition, setMousePosition] = React.useState<{ x: number; y: number }>({ x: 50, y: 50 });
  const imageContainerRef = React.useRef<HTMLDivElement>(null);

  const activeImage = images[selectedIndex] ?? images[0] ?? DEFAULT_GALLERY_IMAGES[0]!;

  const handleSelect = (index: number) => {
    setSelectedIndex(index);
    onSelectImage?.(index);
  };

  const isDesktopScreen = () => {
    if (typeof window === 'undefined') return true;
    return window.innerWidth >= 1024;
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDesktopScreen() || !imageContainerRef.current) return;
    const { left, top, width, height } = imageContainerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - left) / width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - top) / height) * 100));
    setMousePosition({ x, y });
  };

  const handleMouseEnter = () => {
    if (!isDesktopScreen()) return;
    setIsZoomed(true);
  };

  const handleMouseLeave = () => {
    setIsZoomed(false);
    setMousePosition({ x: 50, y: 50 });
  };

  return (
    <div
      data-testid="pdp-gallery"
      className={cn(
        'flex flex-col-reverse lg:flex-row gap-[28px] items-start w-full lg:w-[573px] lg:min-w-[573px] lg:max-w-[573px]',
        className
      )}
    >
      {/* Primeira coluna da galeria: 4 fotos do produto (visíveis somente no desktop a partir de 1024px) */}
      <div
        data-testid="pdp-gallery-thumbnails-col"
        className="hidden lg:flex flex-col gap-[16px] w-[100px] md:w-[100px] shrink-0 justify-start pb-0"
        role="tablist"
        aria-label="Miniaturas da galeria de imagens do NFT"
      >
        {images.slice(0, 4).map((img, idx) => {
          const isCurrent = idx === selectedIndex;
          return (
            <button
              key={img.id}
              type="button"
              role="tab"
              aria-selected={isCurrent}
              aria-label={`Ver imagem ${idx + 1}: ${img.label ?? img.alt}`}
              data-testid={`pdp-thumbnail-${idx}`}
              onClick={() => handleSelect(idx)}
              className={cn(
                'group relative w-[100px] h-[100px] rounded-lg overflow-hidden transition-all duration-150 cursor-pointer shrink-0 select-none',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface-default',
                isCurrent
                  ? 'border border-primary shadow-sm opacity-100 ring-1 ring-primary/40'
                  : 'border border-border-soft hover:border-border-default opacity-70 hover:opacity-100'
              )}
            >
              <img
                src={img.thumbnailUrl ?? img.url}
                alt={img.alt}
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <span className="sr-only">
                {img.label ? `${img.label} (Foto ${idx + 1})` : `Foto ${idx + 1}`}
              </span>
            </button>
          );
        })}
      </div>

      {/* Segunda coluna da galeria: div pai com bg-surface-card e padding interno de 20px */}
      <div
        data-testid="pdp-gallery-main-col"
        className="flex-1 w-full min-w-0"
      >
        <div
          data-testid="pdp-main-image-wrapper"
          className="relative w-full rounded-[32px] md:rounded-[40px] lg:rounded-2xl bg-transparent lg:bg-surface-card border-none lg:border lg:border-border-default p-0 lg:p-[20px] shadow-none lg:shadow-card overflow-hidden"
        >
          {/* Indicador de zoom: visível apenas no desktop a partir de 1024px */}
          <div
            data-testid="pdp-zoom-indicator"
            title="Passe o cursor sobre a imagem para zoom"
            aria-label="Zoom disponível"
            className={cn(
              'absolute top-[12px] right-[12px] z-10 w-[30px] h-[30px] rounded-full',
              'bg-surface-raised border border-border-default',
              'hidden lg:flex items-center justify-center text-text-secondary select-none pointer-events-none shadow-sm transition-colors'
            )}
          >
            <IconSearch className="h-3.5 w-3.5" aria-hidden="true" />
          </div>

          {/* Container interno da imagem principal com captura de movimento para zoom no desktop */}
          <div
            ref={imageContainerRef}
            data-testid="pdp-main-image-container"
            onMouseEnter={handleMouseEnter}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className="relative w-full aspect-square rounded-[32px] md:rounded-[40px] lg:rounded-xl overflow-hidden cursor-default lg:cursor-crosshair select-none bg-surface-dark/40 lg:bg-surface-dark"
          >
            <img
              data-testid="pdp-main-image"
              src={activeImage.url}
              alt={activeImage.alt}
              style={{
                transformOrigin: `${mousePosition.x}% ${mousePosition.y}%`,
                transform: isZoomed ? 'scale(1.9)' : 'scale(1)',
              }}
              className="w-full h-full object-cover transition-transform duration-150 ease-out will-change-transform pointer-events-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

PdpGallery.displayName = 'PdpGallery';
