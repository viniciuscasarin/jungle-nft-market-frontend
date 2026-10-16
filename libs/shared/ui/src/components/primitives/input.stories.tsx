import type { Meta, StoryObj } from '@storybook/react';
import * as React from 'react';
import { Search, User, Eye, EyeOff } from 'lucide-react';
import { Input } from './input';
import { Label } from './label';
import { FormField } from './form-field';

const meta: Meta<typeof Input> = {
  title: 'Primitives/Input',
  component: Input,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Componente de entrada de texto com suporte a ícones prefixo/sufixo, variantes transparente e elevada, estados inválido/desabilitado e composição com labels e validadores.',
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Input>;

/**
 * Entrada padrão com fundo elevado e placeholder.
 */
export const Default: Story = {
  args: {
    defaultValue: 'Vinicius Casarin',
    placeholder: 'Digite seu nome...',
  },
};

/**
 * Variante transparente sem placeholder utilizada nos formulários da conta e carteiras.
 */
export const Transparent: Story = {
  args: {
    defaultValue: 'Minha MetaMask',
    className: 'bg-transparent',
  },
};

/**
 * Campo de entrada com ícone à esquerda (ex: busca ou identificação de usuário).
 */
export const WithLeftIcon: Story = {
  args: {
    defaultValue: '',
    placeholder: 'Buscar coleções ou artistas...',
    leftIcon: <Search className="w-4 h-4 text-text-muted" />,
  },
};

/**
 * Campo de entrada de usuário com ícone.
 */
export const WithUserIcon: Story = {
  args: {
    defaultValue: 'vinicius_casarin',
    leftIcon: <User className="w-4 h-4 text-text-muted" />,
  },
};

/**
 * Campo de senha interativo com toggle de visibilidade (Eye / EyeOff).
 */
export const PasswordToggle: Story = {
  render: function PasswordToggleStory() {
    const [showPassword, setShowPassword] = React.useState(false);

    return (
      <div className="max-w-md w-full space-y-2 font-mono">
        <Label htmlFor="storybook-password">Senha</Label>
        <div className="relative">
          <Input
            id="storybook-password"
            type={showPassword ? 'text' : 'password'}
            defaultValue="senhaSegura123"
            className="pr-10 bg-transparent"
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={showPassword ? 'Ocultar senha' : 'Exibir senha'}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors cursor-pointer"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>
    );
  },
};

/**
 * Estado inválido com mensagem de validação destacada.
 */
export const Invalid: Story = {
  render: () => (
    <div className="max-w-md w-full space-y-1 font-mono">
      <FormField
        label="E-mail"
        required
        error="Por favor, informe um endereço de e-mail válido."
      >
        <Input
          defaultValue="email-invalido@"
          invalid
          className="bg-transparent"
        />
      </FormField>
    </div>
  ),
};

/**
 * Campo no estado desabilitado.
 */
export const Disabled: Story = {
  args: {
    defaultValue: '0x71C...3948 (Carteira Conectada)',
    disabled: true,
  },
};

/**
 * Campo composto ENS com seletor `.eth` de 78px fixos e gap de 10px.
 */
export const EnsCompoundField: Story = {
  render: () => (
    <div className="max-w-md w-full space-y-2 font-mono">
      <Label htmlFor="storybook-ens">
        Nome ENS <span className="text-coral">*</span>
      </Label>
      <div className="flex items-center gap-[10px]">
        <select
          id="storybook-ens-domain"
          aria-label="Extensão ENS"
          defaultValue=".eth"
          className="h-10 w-[78px] min-w-[78px] max-w-[78px] shrink-0 rounded-xs border border-border-default bg-transparent px-2.5 text-[14px] text-text-secondary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors cursor-pointer"
        >
          <option value=".eth" className="bg-surface-default text-text-primary">.eth</option>
          <option value=".xyz" className="bg-surface-default text-text-primary">.xyz</option>
        </select>
        <Input
          id="storybook-ens"
          defaultValue="vinicius"
          className="bg-transparent"
        />
      </div>
    </div>
  ),
};
