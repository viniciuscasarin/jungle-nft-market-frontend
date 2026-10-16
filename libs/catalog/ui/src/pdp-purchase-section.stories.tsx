import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within } from '@storybook/test';
import { PdpPurchaseSection } from './pdp-purchase-section';

const meta: Meta<typeof PdpPurchaseSection> = {
  title: 'Catalog/PdpPurchaseSection',
  component: PdpPurchaseSection,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof PdpPurchaseSection>;

export const Default: Story = {
  args: {
    title: 'Emerald Ape #042',
    priceEth: '1.19',
    rating: 4.8,
    reviewCount: 19,
    description:
      'Um colecionável digital finalizado à mão da coleção Kurio Editions, verificado na Ethereum, com arte desbloqueável e acesso para colecionadores.',
    tokenId: '#0042',
    collectionName: 'Kurio Apes',
  },
  render: (args) => (
    <div className="max-w-[600px] p-6 bg-surface-default border border-border-default rounded-2xl">
      <PdpPurchaseSection {...args} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Linha 1: Título do produto
    const title = canvas.getByTestId('pdp-product-title');
    await expect(title).toBeInTheDocument();
    await expect(title).toHaveTextContent('Emerald Ape #042');

    // Linha 2: Preço ETH e container de avaliação
    const priceEth = canvas.getByTestId('pdp-price-eth');
    await expect(priceEth).toHaveTextContent('1.19 ETH');
    const ratingContainer = canvas.getByTestId('pdp-rating-container');
    await expect(ratingContainer).toBeInTheDocument();

    // Linha 3: Sobre este NFT
    const aboutLabel = canvas.getByTestId('pdp-about-label');
    await expect(aboutLabel).toHaveTextContent('Sobre este NFT:');
    const description = canvas.getByTestId('pdp-product-description');
    await expect(description).toBeInTheDocument();

    // Linha 4: Opções de versão
    const versionOption1 = canvas.getByTestId('pdp-version-option-v-1');
    const versionOption2 = canvas.getByTestId('pdp-version-option-v-2');
    await expect(versionOption1).toBeInTheDocument();
    await expect(versionOption1).toHaveAttribute('aria-checked', 'true');

    // Seleciona versão 2
    await userEvent.click(versionOption2);
    await expect(versionOption2).toHaveAttribute('aria-checked', 'true');
    await expect(versionOption1).toHaveAttribute('aria-checked', 'false');

    // Linha 5: QuantityStepper e botões
    const buyButton = canvas.getByTestId('pdp-buy-now-button');
    const favoriteButton = canvas.getByTestId('pdp-favorite-button');
    await expect(buyButton).toBeInTheDocument();
    await expect(favoriteButton).toBeInTheDocument();

    // Toggle de favorito
    await userEvent.click(favoriteButton);
    await expect(favoriteButton).toHaveAttribute('aria-pressed', 'true');

    // Linhas consecutivas: Token ID, Coleção, Atributos
    const tokenIdVal = canvas.getByTestId('pdp-token-id-value');
    await expect(tokenIdVal).toHaveTextContent('#0042');

    const collectionName = canvas.getByTestId('pdp-collection-name');
    await expect(collectionName).toHaveTextContent('Kurio Apes');

    const attributesGrid = canvas.getByTestId('pdp-attributes-grid');
    await expect(attributesGrid).toBeInTheDocument();
  },
};
