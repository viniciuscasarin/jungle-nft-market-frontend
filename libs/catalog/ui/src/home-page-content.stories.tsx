import type { Meta, StoryObj } from '@storybook/react';
import { expect, within } from '@storybook/test';
import { HomePageContent } from './home-page-content';

const meta: Meta<typeof HomePageContent> = {
  title: 'Catalog/HomePageContent',
  component: HomePageContent,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof HomePageContent>;

export const Default: Story = {
  render: () => (
    <div className="min-h-screen bg-surface-default py-8">
      <HomePageContent />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const hero = canvas.getByTestId('home-hero-banner');
    const catalogSection = canvas.getByTestId('home-catalog-section');
    const nftGrid = canvas.getByTestId('catalog-nft-grid');
    const promoSection = canvas.getByTestId('home-promo-section');
    const blogSection = canvas.getByTestId('home-blog-section');

    await expect(hero).toBeInTheDocument();
    await expect(catalogSection).toBeInTheDocument();
    await expect(nftGrid).toBeInTheDocument();
    await expect(promoSection).toBeInTheDocument();
    await expect(blogSection).toBeInTheDocument();
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
      <HomePageContent />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const heroMobile = canvas.getByTestId('home-hero-mobile');
    const catalogGrid = canvas.getByTestId('catalog-nft-grid');

    await expect(heroMobile).toBeInTheDocument();
    await expect(catalogGrid).toBeInTheDocument();
  },
};
