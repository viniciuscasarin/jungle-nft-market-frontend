import * as React from 'react';
import { cn, IconArrowRight2 } from '@nft/shared-ui';

export interface PromoBannerItem {
  id: string;
  title: string;
  description: string;
  ctaText?: string;
  imageUrl: string;
  imageAlt?: string;
  onCtaClick?: () => void;
}

export interface HomePromoSectionProps {
  promos?: PromoBannerItem[];
  className?: string;
}

export const DEFAULT_PROMOS: PromoBannerItem[] = [
  {
    id: 'promo-genesis',
    title: 'Lançamentos gênesis\nde edição limitada',
    description: 'Colecione edições escassas diretamente dos criadores antes da revelação pública.',
    ctaText: 'Explorar',
    imageUrl: '/assets/images/promo-genesis-drops.png',
    imageAlt: 'Lançamentos gênesis de edição limitada',
  },
  {
    id: 'promo-curated',
    title: 'Arte digital selecionada\ne muito mais',
    description: 'Explore novos artistas, coleções verificadas e obras digitais que definem a cultura.',
    ctaText: 'Explorar',
    imageUrl: '/assets/images/promo-curated-art.png',
    imageAlt: 'Arte digital selecionada e muito mais',
  },
];

export const HomePromoSection: React.FC<HomePromoSectionProps> = ({
  promos = DEFAULT_PROMOS,
  className,
}) => {
  return (
    <section
      data-testid="home-promo-section"
      className={cn('w-full font-mono select-none my-12', className)}
      aria-label="Destaques promocionais"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {promos.map((promo) => (
          <article
            key={promo.id}
            data-testid={`promo-card-${promo.id}`}
            className="flex flex-col sm:flex-row items-center rounded-2xl border border-border-default bg-surface-card overflow-hidden shadow-card hover:border-border-accessible transition-all duration-200"
          >
            {/* Lado Esquerdo: Imagem da Obra */}
            <div className="w-full sm:w-[220px] lg:w-[240px] shrink-0 aspect-square sm:aspect-auto sm:h-full min-h-[220px] bg-surface-raised relative overflow-hidden">
              <img
                src={promo.imageUrl}
                alt={promo.imageAlt ?? promo.title}
                className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                loading="lazy"
              />
            </div>

            {/* Lado Direito: Conteúdo de Texto e CTA */}
            <div className="flex-1 p-6 flex flex-col justify-center items-start text-left">
              <h3 className="text-body-large-16 sm:text-title-20 font-bold text-text-primary leading-snug whitespace-pre-line mb-3">
                {promo.title}
              </h3>
              <p className="text-caption-12 text-text-secondary leading-relaxed mb-6">
                {promo.description}
              </p>
              <button
                type="button"
                onClick={promo.onCtaClick}
                className="bg-primary hover:bg-primary-hover text-ink text-caption-12 font-bold px-4 py-2 rounded-lg inline-flex items-center gap-1.5 transition-all shadow-xs active:scale-95 cursor-pointer"
              >
                <span>{promo.ctaText ?? 'Explorar'}</span>
                <IconArrowRight2 className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};
