import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within } from '@storybook/test';
import { PdpGallery } from './pdp-gallery';

const meta: Meta<typeof PdpGallery> = {
  title: 'Catalog/PdpGallery',
  component: PdpGallery,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof PdpGallery>;

export const Default: Story = {
  render: () => (
    <div className="max-w-[700px] p-4 bg-surface-default">
      <PdpGallery />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Verifica se os 4 thumbnails foram renderizados
    const thumb0 = canvas.getByTestId('pdp-thumbnail-0');
    const thumb1 = canvas.getByTestId('pdp-thumbnail-1');
    const thumb2 = canvas.getByTestId('pdp-thumbnail-2');
    const thumb3 = canvas.getByTestId('pdp-thumbnail-3');

    await expect(thumb0).toBeInTheDocument();
    await expect(thumb1).toBeInTheDocument();
    await expect(thumb2).toBeInTheDocument();
    await expect(thumb3).toBeInTheDocument();

    // Primeiro thumbnail está ativo por padrão
    await expect(thumb0).toHaveAttribute('aria-selected', 'true');
    await expect(thumb1).toHaveAttribute('aria-selected', 'false');

    // Clica no segundo thumbnail
    await userEvent.click(thumb1);
    await expect(thumb1).toHaveAttribute('aria-selected', 'true');
    await expect(thumb0).toHaveAttribute('aria-selected', 'false');

    // Imagem principal e container de zoom
    const mainImgContainer = canvas.getByTestId('pdp-main-image-container');
    await expect(mainImgContainer).toBeInTheDocument();
  },
};
