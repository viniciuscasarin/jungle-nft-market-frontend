import * as React from 'react';
import { cn, IconArrowRight2 } from '@nft/shared-ui';

export interface BlogPostItem {
  id: string;
  title: string;
  excerpt: string;
  date: string;
  readingTime: string;
  imageUrl: string;
  imageAlt?: string;
  onReadMore?: () => void;
}

export interface HomeBlogSectionProps {
  title?: string;
  subtitle?: string;
  posts?: BlogPostItem[];
  className?: string;
}

export const DEFAULT_BLOG_POSTS: BlogPostItem[] = [
  {
    id: 'post-1',
    title: 'Como funciona a propriedade de NFTs',
    excerpt: 'Aprenda a colecionar, negociar e verificar ativos digitais.',
    date: '12 de setembro',
    readingTime: 'Leitura de 6 min',
    imageUrl: '/assets/images/blog-01.png',
  },
  {
    id: 'post-2',
    title: '10 artistas digitais para acompanhar',
    excerpt: 'Conheça criadores que moldam a cultura digital.',
    date: '13 de setembro',
    readingTime: 'Leitura de 2 min',
    imageUrl: '/assets/images/blog-02.png',
  },
  {
    id: 'post-3',
    title: 'Raridade, atributos e procedência',
    excerpt: 'Entenda raridade, procedência, direitos autorais e utilidade.',
    date: '15 de setembro',
    readingTime: 'Leitura de 3 min',
    imageUrl: '/assets/images/blog-03.png',
  },
  {
    id: 'post-4',
    title: 'Como proteger sua carteira',
    excerpt: 'Proteja sua carteira, seus ativos e sua identidade.',
    date: '15 de setembro',
    readingTime: 'Leitura de 2 min',
    imageUrl: '/assets/images/blog-04.png',
  },
];

export const HomeBlogSection: React.FC<HomeBlogSectionProps> = ({
  title = 'Diário da Cunhagem',
  subtitle = 'Histórias, guias e insights para colecionadores sobre o universo da propriedade digital.',
  posts = DEFAULT_BLOG_POSTS,
  className,
}) => {
  return (
    <section
      data-testid="home-blog-section"
      className={cn('w-full font-mono select-none my-16', className)}
      aria-label="Diário da Cunhagem - Artigos e Novidades"
    >
      {/* Cabeçalho da Seção */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <h2 className="text-heading-24 sm:text-heading-28 font-bold text-text-primary tracking-wide">
          {title}
        </h2>
        <p className="text-caption-12 sm:text-body-14 text-text-secondary mt-2.5 leading-relaxed">
          {subtitle}
        </p>
      </div>

      {/* Grid de Artigos (4 Colunas no Desktop) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {posts.map((post) => (
          <article
            key={post.id}
            data-testid={`blog-card-${post.id}`}
            className="flex flex-col rounded-2xl border border-border-default bg-surface-card overflow-hidden shadow-card group hover:border-border-accessible transition-all duration-200"
          >
            {/* Imagem do Post */}
            <div className="relative aspect-4/3 w-full bg-surface-raised overflow-hidden">
              <img
                src={post.imageUrl}
                alt={post.imageAlt ?? post.title}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
              />
            </div>

            {/* Conteúdo do Post */}
            <div className="flex-1 p-5 flex flex-col justify-between">
              <div>
                <span className="text-tiny-10 text-text-muted font-medium">
                  {post.date} &nbsp;|&nbsp; {post.readingTime}
                </span>

                <h3 className="text-body-14 font-bold text-text-primary mt-2 group-hover:text-text-accent transition-colors line-clamp-2">
                  {post.title}
                </h3>

                <p className="text-caption-12 text-text-secondary mt-2 leading-relaxed line-clamp-2">
                  {post.excerpt}
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-border-default/40">
                <button
                  type="button"
                  onClick={post.onReadMore}
                  className="text-caption-12 text-text-accent font-bold inline-flex items-center gap-1 hover:underline cursor-pointer group-hover:translate-x-0.5 transition-transform"
                >
                  <span>Ler mais</span>
                  <IconArrowRight2 className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};
