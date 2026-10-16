import type { Meta, StoryObj } from '@storybook/react';
import { AuthTabs } from './auth-tabs';

const meta: Meta<typeof AuthTabs> = {
  title: 'Auth/AuthTabs',
  component: AuthTabs,
  tags: ['autodocs'],
  args: {
    activeTab: 'login',
    redirect: null,
  },
};

export default meta;
type Story = StoryObj<typeof AuthTabs>;

export const LoginActive: Story = {
  args: {
    activeTab: 'login',
  },
};

export const RegisterActive: Story = {
  args: {
    activeTab: 'register',
  },
};

export const WithRedirect: Story = {
  args: {
    activeTab: 'login',
    redirect: '/checkout?step=review',
  },
};
