import * as React from 'react';
import { cn } from '../../index';
import { IconKurioLogo } from '../../icons/IconKurioLogo';
import { IconDiscord } from '../../icons/IconDiscord';
import { IconTwitter } from '../../icons/IconTwitter';
import { IconInstagram } from '../../icons/IconInstagram';
import { IconFacebook } from '../../icons/IconFacebook';
import { Button } from '../primitives/button';

export interface FooterProps {
  onNewsletterSubmit?: (email: string) => void;
  className?: string;
}

export const Footer: React.FC<FooterProps> = ({
  onNewsletterSubmit,
  className,
}) => {
  const [email, setEmail] = React.useState('');
  const [notice, setNotice] = React.useState<string | null>(null);

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onNewsletterSubmit) {
      onNewsletterSubmit(email);
    } else {
      setNotice('Funcionalidade indisponível nesta demonstração.');
    }
  };

  const handleSocialClick = (e: React.MouseEvent, network: string) => {
    e.preventDefault();
    setNotice(`Acesso ao ${network} indisponível nesta demonstração.`);
  };

  return (
    <footer
      className={cn(
        'w-full border-t border-border-default bg-surface-card font-mono text-text-secondary select-none',
        className
      )}
    >
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand Info */}
          <div className="space-y-4 lg:col-span-2">
            <a href="/" aria-label="Kurio - Início" className="inline-block">
              <IconKurioLogo className="h-8 w-auto text-text-primary" />
            </a>
            <p className="text-body-14 text-text-secondary max-w-sm">
              O marketplace definitivo para descoberta, coleção e negociação de NFTs exclusivos com experiência web rápida e acessível.
            </p>
            {/* Social Icons */}
            <div className="flex items-center gap-3 pt-2">
              {[
                { name: 'Discord', icon: <IconDiscord className="h-5 w-5" /> },
                { name: 'Twitter', icon: <IconTwitter className="h-5 w-5" /> },
                { name: 'Instagram', icon: <IconInstagram className="h-5 w-5" /> },
                { name: 'Facebook', icon: <IconFacebook className="h-5 w-5" /> },
              ].map((social) => (
                <button
                  key={social.name}
                  type="button"
                  onClick={(e) => handleSocialClick(e, social.name)}
                  aria-label={`Seguir no ${social.name}`}
                  className="flex h-10 w-10 items-center justify-center rounded-md border border-border-default bg-surface-raised text-text-muted hover:text-text-primary hover:border-border-soft hover:bg-surface-dark transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-ink cursor-pointer"
                >
                  {social.icon}
                </button>
              ))}
            </div>
          </div>

          {/* Column 1: Mercado */}
          <div>
            <h4 className="text-body-14 font-bold text-text-primary mb-4">Mercado</h4>
            <ul className="space-y-2 text-caption-12">
              <li>
                <a href="/" className="hover:text-text-primary transition-colors">
                  Todas as Coleções
                </a>
              </li>
              <li>
                <a href="/arte" className="hover:text-text-primary transition-colors">
                  Arte Digital
                </a>
              </li>
              <li>
                <a href="/colecionaveis" className="hover:text-text-primary transition-colors">
                  Colecionáveis
                </a>
              </li>
              <li>
                <a href="/fotografia" className="hover:text-text-primary transition-colors">
                  Fotografia
                </a>
              </li>
            </ul>
          </div>

          {/* Column 2: Minha Conta */}
          <div>
            <h4 className="text-body-14 font-bold text-text-primary mb-4">Minha Conta</h4>
            <ul className="space-y-2 text-caption-12">
              <li>
                <a href="/perfil" className="hover:text-text-primary transition-colors">
                  Perfil
                </a>
              </li>
              <li>
                <a href="/carteiras" className="hover:text-text-primary transition-colors">
                  Carteiras
                </a>
              </li>
              <li>
                <a href="/favoritos" className="hover:text-text-primary transition-colors">
                  Favoritos
                </a>
              </li>
              <li>
                <a href="/pedidos" className="hover:text-text-primary transition-colors">
                  Histórico de Pedidos
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Newsletter */}
          <div className="space-y-4">
            <h4 className="text-body-14 font-bold text-text-primary">Receba Novidades</h4>
            <p className="text-caption-12 text-text-secondary">
              Assine nossa newsletter para receber alertas de novos drops e coleções exclusivas.
            </p>
            <form onSubmit={handleNewsletterSubmit} className="flex flex-col gap-2">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Seu e-mail..."
                aria-label="E-mail para newsletter"
                className="h-10 px-3 rounded-md bg-surface-raised border border-border-default text-text-primary placeholder:text-text-muted text-caption-12 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-ink"
              />
              <Button type="submit" variant="primary" size="sm" className="w-full">
                Inscrever-se
              </Button>
            </form>
          </div>
        </div>

        {/* Out-of-scope Accessible Notice */}
        {notice && (
          <div
            role="status"
            aria-live="polite"
            className="mt-6 p-3 rounded-md border border-accent/40 bg-surface-raised text-caption-12 text-accent"
          >
            {notice}
          </div>
        )}

        {/* Bottom Bar: Copyright */}
        <div className="mt-12 border-t border-border-default pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-caption-12 text-text-muted">
          <p>© 2026 Kurio Marketplace. Todos os direitos reservados.</p>
          <div className="flex gap-4">
            <a href="/termos" className="hover:text-text-primary transition-colors">
              Termos de Uso
            </a>
            <a href="/privacidade" className="hover:text-text-primary transition-colors">
              Privacidade
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

Footer.displayName = 'Footer';
