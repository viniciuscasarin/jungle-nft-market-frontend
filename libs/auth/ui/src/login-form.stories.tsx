import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import { LoginForm } from './login-form';

const meta: Meta<typeof LoginForm> = {
  title: 'Auth/LoginForm',
  component: LoginForm,
  tags: ['autodocs'],
  args: {
    onSubmit: fn(),
    onNotice: fn(),
    isLoading: false,
    errorMessage: null,
    redirect: null,
  },
};

export default meta;
type Story = StoryObj<typeof LoginForm>;

export const Default: Story = {
  args: {},
};

export const Loading: Story = {
  args: {
    isLoading: true,
  },
};

export const WithErrorMessage: Story = {
  args: {
    errorMessage: 'Credenciais inválidas. Verifique seu identificador e senha.',
  },
};

export const WithPreFilledIdentifier: Story = {
  args: {
    defaultIdentifier: 'crypto_collector',
  },
};

export const WithRedirect: Story = {
  args: {
    redirect: '/checkout?step=review',
  },
};
