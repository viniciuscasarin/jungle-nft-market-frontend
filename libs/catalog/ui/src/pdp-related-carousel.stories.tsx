import type { Meta, StoryObj } from '@storybook/react';
import { expect, within } from '@storybook/test';
import { PdpRelatedCarousel } from './pdp-related-carousel';

const meta: Meta<typeof PdpRelatedCarousel> = {
  title: 'Catalog/PdpRelatedCarousel',
  component: PdpRelatedCarousel,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof PdpRelatedCarousel>;

export const Default: Story = {
  args: {
    title: 'Mais dessa colecao',
  },
  render: (args) => (
    <div className="max-w-[1200px] w-full p-6 bg-surface-default">
      <PdpRelatedCarousel {...args} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Validação do cabeçalho
    const header = canvas.getByTestId('pdp-related-carousel-header');
    await expect(header).toBeInTheDocument();
    await expect(header).toHaveClass('border-primary');

    const title = canvas.getByTestId('pdp-related-carousel-title');
    await expect(title).toBeInTheDocument();
    await expect(title).toHaveTextContent('Mais dessa colecao');
    await expect(title).toHaveClass('h-[28px]');
    await expect(title).toHaveClass('text-[17px]');
    await expect(title).toHaveClass('font-bold');
    await expect(title).toHaveClass('text-accent');

    // Validação dos 5 itens visíveis
    const track = canvas.getByTestId('pdp-related-carousel-track');
    await expect(track).toBeInTheDocument();
    await expect(track).toHaveClass('gap-[26px]');

    const item1 = canvas.getByTestId('pdp-related-item-related-1');
    await expect(item1).toBeInTheDocument();

    const container1 = canvas.getByTestId('pdp-related-image-container-related-1');
    await expect(container1).toHaveClass('bg-surface-card');
    await expect(container1).toHaveClass('py-[20px]');
    await expect(container1).toHaveClass('px-[4px]');

    const img1 = canvas.getByTestId('pdp-related-image-related-1');
    await expect(img1).toHaveClass('w-[212px]');
    await expect(img1).toHaveClass('h-[212px]');
    await expect(img1).toHaveClass('rounded-[13px]');

    const name1 = canvas.getByTestId('pdp-related-name-related-1');
    await expect(name1).toHaveClass('mt-[12px]');
    await expect(name1).toHaveClass('text-[15px]');
    await expect(name1).toHaveClass('text-text-primary');

    const price1 = canvas.getByTestId('pdp-related-price-related-1');
    await expect(price1).toHaveClass('text-[16px]');
    await expect(price1).toHaveClass('font-bold');
    await expect(price1).toHaveClass('text-accent');
  },
};
