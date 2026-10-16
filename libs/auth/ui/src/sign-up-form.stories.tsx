import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import { SignUpForm } from './sign-up-form';

const meta: Meta<typeof SignUpForm> = {
  title: 'Auth/SignUpForm',
  component: SignUpForm,
  tags: ['autodocs'],
  args: {
    onSubmit: fn(),
    onNotice: fn(),
    isLoading: false,
    errorMessage: null,
    fieldErrors: null,
    redirect: null,
  },
};

export default meta;
type Story = StoryObj<typeof SignUpForm>;

export const Default: Story = {
  args: {},
};

export const Loading: Story = {
  args: {
    isLoading: true,
  },
};

export const WithConflictErrors: Story = {
  args: {
    fieldErrors: {
      email: 'Este email já está em uso.',
      username: 'Este username já foi escolhido.',
    },
  },
};

export const WithGlobalError: Story = {
  args: {
    errorMessage: 'Não foi possível completar o cadastro. Tente novamente mais tarde.',
  },
};

export const WithRedirect: Story = {
  args: {
    redirect: '/checkout?step=review',
  },
};
