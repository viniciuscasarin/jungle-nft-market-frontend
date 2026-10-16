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

  const handleSocialClick = (network: string) => {
    setNotice(`Acesso ao ${network} indisponível nesta demonstração.`);
  };

  return (
    <footer
      className={cn(
        'w-full bg-surface-card font-mono text-text-secondary select-none',
        className
      )}
    >
      <div className="mx-auto max-w-7xl px-[32px]">
        {/* Seção 1: Benefícios e Newsletter (4 Colunas com spacers de 1px) */}
        <div className="flex flex-col md:flex-row items-stretch pt-[32px] pb-[16px] border-b border-border-default">
          {/* Card 1: Segurança da carteira */}
          <div className="flex-1 flex flex-col px-[16px] gap-[12px]">
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

          <div className="hidden md:block w-[1px] bg-border-default shrink-0 self-stretch" aria-hidden="true" />
          <div className="md:hidden h-[1px] bg-border-default w-full my-6" aria-hidden="true" />

          {/* Card 2: Criadores em destaque */}
          <div className="flex-1 flex flex-col px-[16px] gap-[12px]">
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

          <div className="hidden md:block w-[1px] bg-border-default shrink-0 self-stretch" aria-hidden="true" />
          <div className="md:hidden h-[1px] bg-border-default w-full my-6" aria-hidden="true" />

          {/* Card 3: Alertas de lançamentos */}
          <div className="flex-1 flex flex-col px-[16px] gap-[12px]">
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

          <div className="hidden md:block w-[1px] bg-border-default shrink-0 self-stretch" aria-hidden="true" />
          <div className="md:hidden h-[1px] bg-border-default w-full my-6" aria-hidden="true" />

          {/* Card 4: Newsletter */}
          <div className="flex-1 flex flex-col px-[16px] gap-[12px]">
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
                  className="h-10 flex-1 px-3 rounded-l-md rounded-r-none bg-surface-raised border border-r-0 border-border-default text-text-primary placeholder:text-text-muted text-[14px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-ink"
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
        <div className="mx-auto max-w-7xl px-[32px] py-[32px] flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-[92px] text-text-primary">
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

          <div className="w-full md:w-[228px] shrink-0">
            <a
              href="tel:+551140028922"
              className="text-[14px] font-normal text-text-primary hover:text-text-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-ink rounded-xs"
            >
              +55 11 4002 8922
            </a>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-[32px] py-[32px]">
        {/* Seção 3: Navegação Inferior e Carteiras (3 colunas flex-1 + 1 coluna 228px com gap de 92px) */}
        <div className="flex flex-col md:flex-row items-start gap-8 md:gap-[92px] text-text-primary">
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
                <a href="/perfil/colecao" className="text-[14px] font-normal text-text-primary hover:text-text-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-ink rounded-xs">
                  Minha coleção
                </a>
              </li>
              <li>
                <a href="/perfil/atividade" className="text-[14px] font-normal text-text-primary hover:text-text-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-ink rounded-xs">
                  Atividade
                </a>
              </li>
              <li>
                <a href="/criadores" className="text-[14px] font-normal text-text-primary hover:text-text-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-ink rounded-xs">
                  Estúdio do criador
                </a>
              </li>
              <li>
                <a href="/favoritos" className="text-[14px] font-normal text-text-primary hover:text-text-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-ink rounded-xs">
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
                <a href="/ajuda" className="text-[14px] font-normal text-text-primary hover:text-text-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-ink rounded-xs">
                  Central de ajuda
                </a>
              </li>
              <li>
                <a href="/como-comprar" className="text-[14px] font-normal text-text-primary hover:text-text-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-ink rounded-xs">
                  Como comprar NFTs
                </a>
              </li>
              <li>
                <a href="/seguranca" className="text-[14px] font-normal text-text-primary hover:text-text-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-ink rounded-xs">
                  Carteira e segurança
                </a>
              </li>
              <li>
                <a href="/termos" className="text-[14px] font-normal text-text-primary hover:text-text-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-ink rounded-xs">
                  Política do mercado
                </a>
              </li>
              <li>
                <a href="/denunciar" className="text-[14px] font-normal text-text-primary hover:text-text-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-ink rounded-xs">
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
                <a href="/colecoes?categoria=arte" className="text-[14px] font-normal text-text-primary hover:text-text-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-ink rounded-xs">
                  Arte digital
                </a>
              </li>
              <li>
                <a href="/colecoes?categoria=fotografia" className="text-[14px] font-normal text-text-primary hover:text-text-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-ink rounded-xs">
                  Fotografia
                </a>
              </li>
              <li>
                <a href="/colecoes?categoria=musica" className="text-[14px] font-normal text-text-primary hover:text-text-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-ink rounded-xs">
                  Música
                </a>
              </li>
              <li>
                <a href="/colecoes?categoria=3d" className="text-[14px] font-normal text-text-primary hover:text-text-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-ink rounded-xs">
                  Arte 3D
                </a>
              </li>
              <li>
                <a href="/colecoes?categoria=utilidade" className="text-[14px] font-normal text-text-primary hover:text-text-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-ink rounded-xs">
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

        {/* Live Region de Notificação Acessível */}
        {notice && (
          <div
            role="status"
            aria-live="polite"
            className="mt-6 mb-2 p-3 rounded-md border border-accent/40 bg-surface-raised text-caption-12 text-accent"
          >
            {notice}
          </div>
        )}
      </div>

      {/* Seção 4: Barra Inferior de Copyright */}
      <div className="w-full bg-surface-default h-[30px] flex items-center justify-center">
        <p className="text-[14px] text-text-primary">
          © 2026 Kurio. Propriedade digital para todos.
        </p>
      </div>
    </footer>
  );
};

Footer.displayName = 'Footer';
