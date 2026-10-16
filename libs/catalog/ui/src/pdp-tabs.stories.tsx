import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within } from '@storybook/test';
import { PdpTabs } from './pdp-tabs';

const meta: Meta<typeof PdpTabs> = {
  title: 'Catalog/PdpTabs',
  component: PdpTabs,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof PdpTabs>;

export const Default: Story = {
  args: {
    reviewCount: 0,
  },
  render: (args) => (
    <div className="max-w-[1200px] w-full p-6 bg-surface-default">
      <PdpTabs {...args} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Validação da linha sólida color primary no cabeçalho
    const header = canvas.getByTestId('pdp-tabs-header');
    await expect(header).toBeInTheDocument();
    await expect(header).toHaveClass('border-primary');

    // Tab 1: Detalhes do NFT
    const detailsTab = canvas.getByTestId('pdp-tab-details-btn');
    await expect(detailsTab).toBeInTheDocument();
    await expect(detailsTab).toHaveTextContent('Detalhes do NFT');
    await expect(detailsTab).toHaveClass('h-[28px]');
    await expect(detailsTab).toHaveClass('text-[17px]');
    await expect(detailsTab).toHaveAttribute('aria-selected', 'true');
    await expect(detailsTab).toHaveClass('text-accent');
    await expect(detailsTab).toHaveClass('font-bold');

    // Tab 2: Avaliacao de colecionadores (0)
    const reviewsTab = canvas.getByTestId('pdp-tab-reviews-btn');
    await expect(reviewsTab).toBeInTheDocument();
    await expect(reviewsTab).toHaveTextContent('Avaliacao de colecionadores (0)');
    await expect(reviewsTab).toHaveClass('h-[28px]');
    await expect(reviewsTab).toHaveClass('text-[17px]');
    await expect(reviewsTab).toHaveAttribute('aria-selected', 'false');
    await expect(reviewsTab).toHaveClass('text-text-primary');

    // Conteúdo da tab Detalhes: font size 14, line height 24, text secondary, padding top 12px
    const detailsPanel = canvas.getByTestId('pdp-tabpanel-details');
    await expect(detailsPanel).toBeInTheDocument();
    await expect(detailsPanel).toHaveClass('text-[14px]');
    await expect(detailsPanel).toHaveClass('leading-[24px]');
    await expect(detailsPanel).toHaveClass('text-text-secondary');
    await expect(detailsPanel).toHaveClass('pt-[12px]');

    // Interação: clicar na segunda tab
    await userEvent.click(reviewsTab);
    await expect(reviewsTab).toHaveAttribute('aria-selected', 'true');
    await expect(reviewsTab).toHaveClass('text-accent');
    await expect(reviewsTab).toHaveClass('font-bold');
    await expect(detailsTab).toHaveAttribute('aria-selected', 'false');

    // Conteúdo da tab Avaliações ativo com mensagem de sem avaliações
    const reviewsPanel = canvas.getByTestId('pdp-tabpanel-reviews');
    await expect(reviewsPanel).toBeInTheDocument();
    await expect(reviewsPanel).toHaveClass('text-[14px]');
    await expect(reviewsPanel).toHaveClass('leading-[24px]');
    await expect(reviewsPanel).toHaveClass('text-text-secondary');
    await expect(reviewsPanel).toHaveClass('pt-[12px]');

    const emptyMsg = canvas.getByTestId('pdp-no-reviews-message');
    await expect(emptyMsg).toBeInTheDocument();
    await expect(emptyMsg).toHaveTextContent('Ainda não há avaliações neste produto');
  },
};
