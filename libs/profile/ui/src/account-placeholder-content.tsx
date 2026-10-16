import * as React from 'react';
import { User, MapPin, Heart, TrendingUp, Download, AlertTriangle } from 'lucide-react';
import { IconCart, IconLogout } from '@nft/shared-ui';
import type { AccountMenuId } from './account-navigation';

export interface AccountPlaceholderContentProps {
  menuId: AccountMenuId;
}

const SECTION_CONFIG: Record<
  AccountMenuId,
  {
    title: string;
    description: string;
    icon: React.ComponentType<{ className?: string; size?: number | string; width?: number | string; height?: number | string }>;
    emptyMessage: string;
  }
> = {
  profile: {
    title: 'Dados do perfil',
    description: 'Gerencie suas credenciais e identidade pública.',
    icon: User,
    emptyMessage: '',
  },
  wallets: {
    title: 'Carteiras',
    description: 'Conecte e configure suas carteiras Ethereum.',
    icon: MapPin,
    emptyMessage: '',
  },
  activity: {
    title: 'Atividade',
    description: 'Histórico de transações, compras, vendas e lances.',
    icon: IconCart,
    emptyMessage: 'Nenhuma atividade recente registrada em sua conta.',
  },
  wishlist: {
    title: 'Lista de interesse',
    description: 'NFTs e coleções que você favoritou no marketplace.',
    icon: Heart,
    emptyMessage: 'Sua lista de interesse está vazia no momento.',
  },
  offers: {
    title: 'Ofertas',
    description: 'Ofertas recebidas e enviadas para seus colecionáveis.',
    icon: TrendingUp,
    emptyMessage: 'Você não possui ofertas ativas no momento.',
  },
  downloads: {
    title: 'Arquivos baixados',
    description: 'Assets de alta resolução e conteúdo destravável de NFTs adquiridos.',
    icon: Download,
    emptyMessage: 'Nenhum arquivo para download disponível no momento.',
  },
  support: {
    title: 'Suporte',
    description: 'Central de ajuda, dúvidas frequentes e atendimento.',
    icon: AlertTriangle,
    emptyMessage: 'Precisa de ajuda com sua conta? Nossa equipe está à disposição.',
  },
  logout: {
    title: 'Sair da conta',
    description: 'Encerre sua sessão atual com segurança neste dispositivo.',
    icon: IconLogout,
    emptyMessage: 'Clique no botão abaixo para confirmar o encerramento da sessão.',
  },
};

export const AccountPlaceholderContent: React.FC<AccountPlaceholderContentProps> = ({
  menuId,
}) => {
  const config = SECTION_CONFIG[menuId] ?? SECTION_CONFIG.activity;
  const Icon = config.icon;

  return (
    <div className="w-full font-mono">
      <div className="mb-8">
        <h1 className="text-[16px] font-bold text-text-primary tracking-tight">
          {config.title}
        </h1>
        <p className="mt-1 text-[14px] text-text-muted">
          {config.description}
        </p>
      </div>

      <div className="rounded-md border border-dashed border-border-default bg-[#1a110d]/60 p-12 text-center flex flex-col items-center justify-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#241612] text-text-muted mb-4">
          <Icon className="h-7 w-7 text-primary" />
        </div>
        <p className="text-[15px] font-medium text-text-secondary max-w-md">
          {config.emptyMessage}
        </p>

        {menuId === 'logout' ? (
          <button
            type="button"
            className="mt-6 h-[46px] px-8 rounded-xs bg-coral text-ink font-bold text-[14px] hover:bg-[#e06d4e] transition-colors cursor-pointer"
          >
            Confirmar e Sair
          </button>
        ) : (
          <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-border-default bg-[#241612] px-4 py-1.5 text-[12px] text-text-muted">
            <span className="h-2 w-2 rounded-full bg-primary" />
            <span>Layout responsivo pronto para integração</span>
          </div>
        )}
      </div>
    </div>
  );
};

AccountPlaceholderContent.displayName = 'AccountPlaceholderContent';
