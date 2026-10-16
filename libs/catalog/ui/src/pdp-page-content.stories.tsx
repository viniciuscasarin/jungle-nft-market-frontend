import type { Meta, StoryObj } from '@storybook/react';
import { expect, within } from '@storybook/test';
import { PdpPageContent } from './pdp-page-content';

const meta: Meta<typeof PdpPageContent> = {
  title: 'Catalog/PdpPageContent',
  component: PdpPageContent,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof PdpPageContent>;

export const Default: Story = {
  render: () => (
    <div className="min-h-screen bg-surface-default py-8">
      <PdpPageContent />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Grid com as duas colunas principais
    const galleryCol = canvas.getByTestId('pdp-col-gallery');
    const purchaseCol = canvas.getByTestId('pdp-col-purchase-info');

    await expect(galleryCol).toBeInTheDocument();
    await expect(purchaseCol).toBeInTheDocument();
  },
};

export const MobileViewport: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'mobile2',
    },
  },
  render: () => (
    <div className="w-full max-w-[414px] mx-auto min-h-screen bg-surface-default relative">
      <PdpPageContent />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const mobileTopBar = canvas.getByTestId('pdp-mobile-top-bar');
    const stickyBuyBar = canvas.getByTestId('pdp-mobile-sticky-buy-bar');
    const gradientBg = canvas.getByTestId('pdp-mobile-top-gradient-bg');
    const purchaseCol = canvas.getByTestId('pdp-col-purchase-info');

    await expect(mobileTopBar).toBeInTheDocument();
    await expect(stickyBuyBar).toBeInTheDocument();
    await expect(gradientBg).toBeInTheDocument();
    await expect(purchaseCol).toBeInTheDocument();
    await expect(purchaseCol).toHaveClass('rounded-t-[40px]');
    await expect(purchaseCol).toHaveClass('w-full');
  },
};

