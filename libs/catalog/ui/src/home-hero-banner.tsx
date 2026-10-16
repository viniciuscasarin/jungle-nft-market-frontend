import * as React from 'react';
import { cn } from '@nft/shared-ui';
import { IconArrowRight2 } from '@nft/shared-ui';

export interface HomeHeroBannerProps {
  badge?: string | undefined;
  titleDesktop?: string | undefined;
  titleMobile?: string | undefined;
  descriptionDesktop?: string | undefined;
  descriptionMobile?: string | undefined;
  ctaLabel?: string | undefined;
  onCtaClick?: (() => void) | undefined;
  mainImageUrl?: string | undefined;
  secondaryImageUrl?: string | undefined;
  activeDotIndex?: number | undefined;
  onDotClick?: ((index: number) => void) | undefined;
  className?: string | undefined;
}

export const HomeHeroBanner: React.FC<HomeHeroBannerProps> = ({
  badge = 'Bem-vindo à Kurio',
  titleDesktop = 'SEJA DONO DO FUTURO\nDA ARTE DIGITAL',
  titleMobile = 'SEJA DONO DA\nCULTURA DIGITAL',
  descriptionDesktop = 'Descubra NFTs selecionados de criadores emergentes e consagrados. Colecione arte digital rara, apoie artistas e tenha uma parte da cultura da internet.',
  descriptionMobile = 'Descubra NFTs selecionados de criadores do mundo todo.',
  ctaLabel = 'EXPLORAR',
  onCtaClick,
  mainImageUrl = '/assets/images/hero-nft.png',
  secondaryImageUrl = '/assets/images/nft-04-sage-nomad.png',
  activeDotIndex = 0,
  onDotClick,
  className,
}) => {
  const [currentDot, setCurrentDot] = React.useState(activeDotIndex);

  const handleDotClick = (index: number) => {
    setCurrentDot(index);
    onDotClick?.(index);
  };

  const handleCta = () => {
    if (onCtaClick) {
      onCtaClick();
    } else {
      const catalogEl = document.getElementById('catalogo');
      catalogEl?.scrollIntoView?.({ behavior: 'smooth' });
    }
  };

  return (
    <section
      data-testid="home-hero-banner"
      className={cn('w-full font-mono select-none', className)}
      aria-label="Apresentação Kurio"
    >
      {/* DESKTOP HERO (Visível em lg:flex) */}
      <div className="hidden lg:grid lg:grid-cols-12 gap-8 items-center py-6">
        {/* Coluna de Texto (7 colunas) */}
        <div className="lg:col-span-7 flex flex-col items-start pr-4">
          <span
            data-testid="hero-badge-desktop"
            className="text-caption-14 text-text-foreground font-mono tracking-wide mb-3 font-medium"
          >
            {badge}
          </span>

          <h2
            data-testid="hero-title-desktop"
            className="text-display-43 font-bold text-text-primary tracking-tight leading-[1.12] mb-6 whitespace-pre-line uppercase"
          >
            {titleDesktop}
          </h2>

          <p
            data-testid="hero-desc-desktop"
            className="text-body-14 text-text-secondary leading-relaxed max-w-xl mb-8"
          >
            {descriptionDesktop}
          </p>

          <button
            type="button"
            data-testid="hero-cta-desktop"
            onClick={handleCta}
            className="bg-primary hover:bg-primary-hover text-ink font-bold px-8 py-3 rounded-md text-body-14 tracking-wider uppercase transition-all duration-150 shadow-md active:scale-95 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface-default"
          >
            {ctaLabel}
          </button>

          {/* Dots de navegação do carrossel */}
          <div
            data-testid="hero-dots-desktop"
            className="flex items-center gap-2.5 mt-10 self-end"
            role="tablist"
            aria-label="Slides do banner"
          >
            {[0, 1, 2].map((idx) => {
              const isActive = idx === currentDot;
              return (
                <button
                  key={idx}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  aria-label={`Ir para slide ${idx + 1}`}
                  onClick={() => handleDotClick(idx)}
                  className={cn(
                    'w-2.5 h-2.5 rounded-full transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                    isActive
                      ? 'bg-text-accent'
                      : 'bg-border-soft hover:bg-text-secondary'
                  )}
                />
              );
            })}
          </div>
        </div>

        {/* Coluna de Arte Principal (5 colunas) */}
        <div className="lg:col-span-5 flex justify-end">
          <div
            data-testid="hero-image-wrapper-desktop"
            className="relative w-full max-w-[490px] aspect-square rounded-[24px] overflow-hidden border border-border-default/60 shadow-2xl bg-surface-card"
          >
            <img
              src={mainImageUrl}
              alt="Obra em destaque no marketplace Kurio"
              className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
            />
          </div>
        </div>
      </div>

      {/* MOBILE HERO (Visível abaixo de lg - Fiel ao frame 14:5226 do Figma) */}
      <div
        data-testid="home-hero-mobile"
        className="block lg:hidden rounded-[24px] border border-border-default/60 bg-gradient-to-br from-[#382215] via-[#241612] to-[#140d0a] p-4 sm:p-6 overflow-hidden relative shadow-lg"
      >
        {/* Glow decorativo de fundo */}
        <div
          className="absolute -left-10 -bottom-10 w-44 h-44 rounded-full bg-primary/15 blur-2xl pointer-events-none"
          aria-hidden="true"
        />

        <div className="grid grid-cols-12 gap-3 sm:gap-5 items-center relative z-10">
          {/* Texto Mobile (Coluna Esquerda ~60%) */}
          <div className="col-span-7 flex flex-col items-start pr-1">
            <span
              data-testid="hero-badge-mobile"
              className="text-[10px] sm:text-tiny-10 text-text-secondary mb-1.5 tracking-wide font-medium"
            >
              {badge}
            </span>

            <h2
              data-testid="hero-title-mobile"
              className="text-[15px] sm:text-heading-24 font-bold text-text-primary leading-[1.18] mb-2 whitespace-pre-line uppercase font-mono"
            >
              {titleMobile}
            </h2>

            <p
              data-testid="hero-desc-mobile"
              className="text-[10px] sm:text-caption-12 text-text-secondary leading-snug sm:leading-relaxed mb-3 max-w-[210px]"
            >
              {descriptionMobile}
            </p>

            <button
              type="button"
              data-testid="hero-cta-mobile"
              onClick={handleCta}
              className="text-text-accent font-bold text-caption-12 uppercase tracking-wider inline-flex items-center gap-1.5 py-0.5 hover:underline active:scale-95 transition-transform"
            >
              <span>{ctaLabel}</span>
              <IconArrowRight2 className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </div>

          {/* Imagem / Cards sobrepostos Mobile (Coluna Direita ~40%) */}
          <div className="col-span-5 flex justify-end items-center relative">
            <div className="relative w-[130px] h-[130px] sm:w-[160px] sm:h-[160px] aspect-square rounded-[16px] overflow-hidden border border-border-default/60 shadow-lg bg-surface-raised shrink-0">
              <img
                src={mainImageUrl}
                alt="Obra em destaque"
                className="w-full h-full object-cover select-none pointer-events-none"
              />
              {/* Mini card sobreposto no canto inferior esquerdo */}
              <div className="absolute -bottom-1 -left-1 w-11 h-11 sm:w-12 sm:h-12 rounded-[10px] overflow-hidden border-2 border-surface-card shadow-md bg-surface-default">
                <img
                  src={secondaryImageUrl}
                  alt="Avatar criador"
                  className="w-full h-full object-cover select-none pointer-events-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Dots Mobile (Centralizados na base como no Figma) */}
        <div
          data-testid="hero-dots-mobile"
          className="flex items-center justify-center gap-2 mt-3 relative z-10"
          role="tablist"
          aria-label="Slides do banner"
        >
          {[0, 1, 2].map((idx) => {
            const isActive = idx === currentDot;
            return (
              <button
                key={idx}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-label={`Slide ${idx + 1}`}
                onClick={() => handleDotClick(idx)}
                className={cn(
                  'w-2 h-2 rounded-full transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary',
                  isActive ? 'bg-text-accent' : 'bg-border-soft hover:bg-text-secondary'
                )}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
};
