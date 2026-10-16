import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within } from '@storybook/test';
import { SocialButton } from './social-button';

const meta: Meta<typeof SocialButton> = {
  title: 'Widgets/SocialButton',
  component: SocialButton,
  tags: ['autodocs'],
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/dKMJKBVdX6q0Ym4OX5vd3V?node-id=3:127',
    },
  },
};

export default meta;
type Story = StoryObj<typeof SocialButton>;

export const Google: Story = {
  args: {
    provider: 'google',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: /Continuar com Google/i });
    await expect(button).toBeInTheDocument();
    await userEvent.click(button);
    const notice = await canvas.findByRole('status');
    await expect(notice).toHaveTextContent(/indisponível nesta demonstração/i);
  },
};

export const Discord: Story = {
  args: {
    provider: 'discord',
  },
};

export const Apple: Story = {
  args: {
    provider: 'apple',
  },
};
