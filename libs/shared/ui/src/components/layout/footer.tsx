import * as React from 'react';
import { cn } from '../../index';
import { IconFacebook } from '../../icons/IconFacebook';
import { IconInstagram } from '../../icons/IconInstagram';
import { IconTwitter } from '../../icons/IconTwitter';
import { IconLinkedin } from '../../icons/IconLinkedin';
import { IconYoutube } from '../../icons/IconYoutube';
import { Button } from '../primitives/button';

export interface FooterProps {
  onNewsletterSubmit?: (email: string) => void;
  onUnavailable?: (feature?: string) => void;
  className?: string;
}

export const Footer: React.FC<FooterProps> = ({
  onNewsletterSubmit,
  onUnavailable,
  className,
}) => {
  const [email, setEmail] = React.useState('');

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onNewsletterSubmit) {
      onNewsletterSubmit(email);
    } else {
      onUnavailable?.('Newsletter');
    }
  };

  const handleSocialClick = (network: string) => {
    onUnavailable?.(`Rede social (${network})`);
  };

  const handleUnavailableLink = (label: string) => (e: React.MouseEvent) => {
    if (onUnavailable) {
      e.preventDefault();
      onUnavailable(label);
    }
  };

  return (
    <footer
      className={cn(
        'w-full bg-surface-card font-mono text-text-secondary select-none overflow-x-hidden',
        className
      )}
    >
      <div className="page-container">
        {/* Seção 1: Benefícios e Newsletter (grid no tablet/mobile, flex-row no desktop) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:flex-row items-stretch pt-[32px] pb-[16px] border-b border-border-default gap-6 lg:gap-0">
          {/* Card 1: Segurança da carteira */}
          <div className="flex-1 flex flex-col px-0 lg:px-[16px] gap-[12px]">
            <span
              className="flex h-[74px] w-[74px] shrink-0 items-center justify-center rounded-full bg-primary text-ink text-[24px] font-bold"
              aria-hidden="true"
            >
              W
            </span>
            <h4 className="text-[17px] font-bold text-text-primary">
              Segurança da carteira
            </h4>
            <p className="text-[14px] leading-[22px] text-text-secondary">
              Proteja sua carteira e colecione arte digital verificada com confiança.
            </p>
          </div>

          <div className="hidden lg:block w-[1px] bg-border-default shrink-0 self-stretch" aria-hidden="true" />

          {/* Card 2: Criadores em destaque */}
          <div className="flex-1 flex flex-col px-0 lg:px-[16px] gap-[12px]">
            <span
              className="flex h-[74px] w-[74px] shrink-0 items-center justify-center rounded-full bg-primary text-ink text-[24px] font-bold"
              aria-hidden="true"
            >
              C
            </span>
            <h4 className="text-[17px] font-bold text-text-primary">
              Criadores em destaque
            </h4>
            <p className="text-[14px] leading-[22px] text-text-secondary">
              Conheça artistas, estúdios e comunidades que moldam a cultura digital na rede.
            </p>
          </div>

          <div className="hidden lg:block w-[1px] bg-border-default shrink-0 self-stretch" aria-hidden="true" />

          {/* Card 3: Alertas de lançamentos */}
          <div className="flex-1 flex flex-col px-0 lg:px-[16px] gap-[12px]">
            <span
              className="flex h-[74px] w-[74px] shrink-0 items-center justify-center rounded-full bg-primary text-ink text-[24px] font-bold"
              aria-hidden="true"
            >
              D
            </span>
            <h4 className="text-[17px] font-bold text-text-primary">
              Alertas de lançamentos
            </h4>
            <p className="text-[14px] leading-[22px] text-text-secondary">
              Receba calendários de cunhagem, novidades de listas de acesso e análises do mercado.
            </p>
          </div>

          <div className="hidden lg:block w-[1px] bg-border-default shrink-0 self-stretch" aria-hidden="true" />

          {/* Card 4: Newsletter */}
          <div className="flex-1 flex flex-col px-0 lg:px-[16px] gap-[12px]">
            <h4 className="text-[18px] font-bold text-text-primary">
              Antecipe-se ao próximo lançamento
            </h4>
            <p className="text-[14px] leading-[22px] text-text-secondary">
              Receba novidades semanais sobre drops, eventos e novidades exclusivas.
            </p>
            <form onSubmit={handleNewsletterSubmit} className="flex flex-col gap-2 pt-1 w-full">
              <div className="flex items-center w-full">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="digite seu e-mail..."
                  aria-label="E-mail para newsletter"
                  className="h-10 flex-1 min-w-0 px-3 rounded-l-md rounded-r-none bg-surface-raised border border-r-0 border-border-default text-text-primary placeholder:text-text-muted text-[14px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-ink"
                />
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  className="h-10 rounded-l-none rounded-r-md bg-primary text-ink font-bold hover:bg-primary-hover px-4 shrink-0"
                >
                  Enviar
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Seção 2: Faixa Intermediária de Contato */}
      <div className="w-full bg-surface-dark border-b border-border-default">
        <div className="page-container py-[32px] flex flex-col lg:flex-row items-start lg:items-center gap-6 lg:gap-[92px] text-text-primary">
          <div className="flex-1">
            <span className="font-mono font-bold text-[14px] tracking-widest text-text-primary">
              KURIO
            </span>
          </div>

          <div className="flex-1">
            <span className="text-[14px] font-normal leading-snug text-text-primary">
              Feito para colecionadores, criadores e cultura
            </span>
          </div>

          <div className="flex-1">
            <a
              href="mailto:contato@email.com"
              className="text-[14px] font-normal text-text-primary hover:text-text-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-ink rounded-xs"
            >
              contato@email.com
            </a>
          </div>

          <div className="w-full lg:w-[228px] shrink-0">
            <a
              href="tel:+551140028922"
              className="text-[14px] font-normal text-text-primary hover:text-text-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-ink rounded-xs"
            >
              +55 11 4002 8922
            </a>
          </div>
        </div>
      </div>

      <div className="page-container py-[32px]">
        {/* Seção 3: Navegação Inferior e Carteiras (grid no tablet, flex-row no desktop) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:flex-row items-start gap-8 lg:gap-[92px] text-text-primary">
          {/* Coluna 1: Meu perfil */}
          <div className="flex-1">
            <h4 className="text-[18px] font-bold text-text-primary mb-4">Meu perfil</h4>
            <ul className="space-y-2 text-[14px]">
              <li>
                <a href="/perfil" className="text-[14px] font-normal text-text-primary hover:text-text-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-ink rounded-xs">
                  Meu perfil
                </a>
              </li>
              <li>
                <a href="/perfil/colecao" onClick={handleUnavailableLink('Minha coleção')} className="text-[14px] font-normal text-text-primary hover:text-text-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-ink rounded-xs">
                  Minha coleção
                </a>
              </li>
              <li>
                <a href="/perfil/atividade" onClick={handleUnavailableLink('Atividade')} className="text-[14px] font-normal text-text-primary hover:text-text-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-ink rounded-xs">
                  Atividade
                </a>
              </li>
              <li>
                <a href="/criadores" onClick={handleUnavailableLink('Estúdio do criador')} className="text-[14px] font-normal text-text-primary hover:text-text-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-ink rounded-xs">
                  Estúdio do criador
                </a>
              </li>
              <li>
                <a href="/favoritos" onClick={handleUnavailableLink('Lista de interesse')} className="text-[14px] font-normal text-text-primary hover:text-text-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-ink rounded-xs">
                  Lista de interesse
                </a>
              </li>
            </ul>
          </div>

          {/* Coluna 2: Central de ajuda */}
          <div className="flex-1">
            <h4 className="text-[18px] font-bold text-text-primary mb-4">Central de ajuda</h4>
            <ul className="space-y-2 text-[14px]">
              <li>
                <a href="/ajuda" onClick={handleUnavailableLink('Central de ajuda')} className="text-[14px] font-normal text-text-primary hover:text-text-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-ink rounded-xs">
                  Central de ajuda
                </a>
              </li>
              <li>
                <a href="/como-comprar" onClick={handleUnavailableLink('Como comprar NFTs')} className="text-[14px] font-normal text-text-primary hover:text-text-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-ink rounded-xs">
                  Como comprar NFTs
                </a>
              </li>
              <li>
                <a href="/seguranca" onClick={handleUnavailableLink('Carteira e segurança')} className="text-[14px] font-normal text-text-primary hover:text-text-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-ink rounded-xs">
                  Carteira e segurança
                </a>
              </li>
              <li>
                <a href="/termos" onClick={handleUnavailableLink('Política do mercado')} className="text-[14px] font-normal text-text-primary hover:text-text-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-ink rounded-xs">
                  Política do mercado
                </a>
              </li>
              <li>
                <a href="/denunciar" onClick={handleUnavailableLink('Denunciar item')} className="text-[14px] font-normal text-text-primary hover:text-text-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-ink rounded-xs">
                  Denunciar item
                </a>
              </li>
            </ul>
          </div>

          {/* Coluna 3: Coleções */}
          <div className="flex-1">
            <h4 className="text-[18px] font-bold text-text-primary mb-4">Coleções</h4>
            <ul className="space-y-2 text-[14px]">
              <li>
                <a href="/colecoes?categoria=arte" onClick={handleUnavailableLink('Arte digital')} className="text-[14px] font-normal text-text-primary hover:text-text-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-ink rounded-xs">
                  Arte digital
                </a>
              </li>
              <li>
                <a href="/colecoes?categoria=fotografia" onClick={handleUnavailableLink('Fotografia')} className="text-[14px] font-normal text-text-primary hover:text-text-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-ink rounded-xs">
                  Fotografia
                </a>
              </li>
              <li>
                <a href="/colecoes?categoria=musica" onClick={handleUnavailableLink('Música')} className="text-[14px] font-normal text-text-primary hover:text-text-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-ink rounded-xs">
                  Música
                </a>
              </li>
              <li>
                <a href="/colecoes?categoria=3d" onClick={handleUnavailableLink('Arte 3D')} className="text-[14px] font-normal text-text-primary hover:text-text-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-ink rounded-xs">
                  Arte 3D
                </a>
              </li>
              <li>
                <a href="/colecoes?categoria=utilidade" onClick={handleUnavailableLink('Utilidade')} className="text-[14px] font-normal text-text-primary hover:text-text-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-ink rounded-xs">
                  Utilidade
                </a>
              </li>
            </ul>
          </div>

          {/* Coluna 4: Redes sociais e Carteiras */}
          <div className="w-full md:w-[228px] shrink-0 space-y-6">
            <div>
              <h4 className="text-[18px] font-bold text-text-primary mb-3">Redes sociais</h4>
              <div className="flex items-center gap-2">
                {[
                  { name: 'Facebook', icon: <IconFacebook className="h-4 w-4" /> },
                  { name: 'Instagram', icon: <IconInstagram className="h-4 w-4" /> },
                  { name: 'Twitter', icon: <IconTwitter className="h-4 w-4" /> },
                  { name: 'LinkedIn', icon: <IconLinkedin className="h-4 w-4" /> },
                  { name: 'YouTube', icon: <IconYoutube className="h-4 w-4" /> },
                ].map((social) => (
                  <button
                    key={social.name}
                    type="button"
                    onClick={() => handleSocialClick(social.name)}
                    aria-label={`Seguir no ${social.name}`}
                    className="flex h-9 w-9 items-center justify-center rounded-md border border-border-default bg-surface-raised text-text-primary hover:text-text-accent hover:border-border-soft hover:bg-surface-dark transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-ink cursor-pointer"
                  >
                    {social.icon}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h5 className="text-[18px] font-bold text-text-primary mb-3">Carteiras compatíveis</h5>
              <div className="flex items-center justify-between px-3 py-2 rounded-sm border border-border-default bg-surface-raised text-[10px] font-bold tracking-wider text-text-primary">
                <span>METAMASK</span>
                <span className="text-border-soft">•</span>
                <span>WALLETCONNECT</span>
                <span className="text-border-soft">•</span>
                <span>COINBASE</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Seção 4: Barra Inferior de Copyright */}
      <div className="w-full bg-surface-default min-h-[30px] py-2 px-4 flex items-center justify-center text-center">
        <p className="text-[12px] sm:text-[14px] text-text-primary text-center">
          © 2026 Kurio. Propriedade digital para todos.
        </p>
      </div>
    </footer>
  );
};

Footer.displayName = 'Footer';
