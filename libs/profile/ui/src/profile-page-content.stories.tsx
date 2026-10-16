import type { Meta, StoryObj } from '@storybook/react';
import { ProfilePageContent } from './profile-page-content';

const meta: Meta<typeof ProfilePageContent> = {
  component: ProfilePageContent,
  title: 'Profile/ProfilePageContent',
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof ProfilePageContent>;

export const Default: Story = {
  args: {
    initialValues: {
      displayName: 'Satoshi Nakamoto',
      username: 'satoshi',
      email: 'satoshi@bitcoin.org',
      ensName: 'satoshi',
      ensDomain: '.eth',
      walletNickname: 'Carteira Principal',
      bio: 'Criador do Bitcoin',
    },
    avatarUrl: null,
    isSavingProfile: false,
    isSavingPassword: false,
    fieldErrors: {},
    passwordFieldErrors: {},
    successMessage: null,
    passwordSuccessMessage: null,
  },
};

export const WithAvatar: Story = {
  args: {
    ...Default.args,
    avatarUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDYiIGhlaWdodD0iNDYiIHZpZXdCb3g9IjAgMCA0NiA0NiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIyMyIgY3k9IjIzIiByPSIyMyIgZmlsbD0iI0ZGRDcwMCIvPjwvc3ZnPg==',
  },
};

export const WithSuccess: Story = {
  args: {
    ...Default.args,
    successMessage: 'Perfil atualizado com sucesso!',
  },
};

export const WithFieldErrors: Story = {
  args: {
    ...Default.args,
    fieldErrors: {
      email: 'E-mail já está em uso',
      username: 'Nome de usuário inválido',
    },
  },
};

export const Saving: Story = {
  args: {
    ...Default.args,
    isSavingProfile: true,
  },
};
