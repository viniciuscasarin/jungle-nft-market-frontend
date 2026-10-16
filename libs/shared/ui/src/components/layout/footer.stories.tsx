import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within } from '@storybook/test';
import { Footer } from './footer';

const meta: Meta<typeof Footer> = {
  title: 'Layout/Footer',
  component: Footer,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/dKMJKBVdX6q0Ym4OX5vd3V?node-id=70491:1243',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Footer>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByPlaceholderText(/Digite seu e-mail/i);
    await expect(input).toBeInTheDocument();
    await userEvent.type(input, 'test@example.com');

    const submitBtn = canvas.getByRole('button', { name: /Inscrever-se/i });
    await userEvent.click(submitBtn);

    const alert = await canvas.findByRole('status');
    await expect(alert).toHaveTextContent(/indisponível nesta demonstração/i);
  },
};
