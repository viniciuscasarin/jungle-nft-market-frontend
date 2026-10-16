import type { NftItem, NftNetwork } from '@nft/shared-contracts';
import { mockCollections } from './collections';

export const LOCAL_NFT_IMAGES = [
  '/assets/images/hero-nft.png',
  '/assets/images/featured-nft.png',
  '/assets/images/nft-03-emerald-ape.png',
  '/assets/images/nft-04-sage-nomad.png',
  '/assets/images/nft-05-neon-vessel.png',
  '/assets/images/nft-06-cosmic-bloom.png',
  '/assets/images/nft-07-violet-nomad.png',
  '/assets/images/nft-08-ivory-baron.png',
  '/assets/images/nft-09-golden-beat.png',
  '/assets/images/nft-10-artwork.png',
  '/assets/images/nft-11-golden-signal.png',
];

const CREATORS = [
  {
    id: 'creator_jungle_lab',
    name: 'Jungle Labs',
    avatarUrl: '/assets/images/nft-03-emerald-ape.png',
    verified: true,
  },
  {
    id: 'creator_neon_art',
    name: 'Neon Master',
    avatarUrl: '/assets/images/nft-04-sage-nomad.png',
    verified: true,
  },
  {
    id: 'creator_cyber_fox',
    name: 'Cyber Fox',
    avatarUrl: '/assets/images/nft-05-neon-vessel.png',
    verified: false,
  },
  {
    id: 'creator_pixel_sage',
    name: 'Pixel Sage',
    avatarUrl: '/assets/images/nft-06-cosmic-bloom.png',
    verified: true,
  },
];

const TITLES = [
  'Alpha Primate', 'Emerald Viper', 'Cyber Gorilla', 'Panther Strike', 'Solar Chimp',
  'Neon Jaguar', 'Midnight Puma', 'Opal Chameleon', 'Hologram Tiger', 'Prism Macaw',
  'Speedrunner Ape', 'Quantum Toucan', 'Hyper Lynx', 'Turbo Mandrill', 'Vortex Baboon',
  'Glitch Ocelot', 'Echo Spider', 'Pulse Lemur', 'Sonic Sloth', 'Zenith Falcon',
  'Mecha Orchid', 'Iron Lotus', 'Nano Fern', 'Titanium Spore', 'Cobalt Vine',
  'Chrome Petal', 'Mercury Moss', 'Steel Blossom', 'Pixel Jaguar', 'Byte Gecko',
  'Voxel Piranha', '8-Bit Anaconda', 'Raster Rhino', 'Vector Elephant', 'Retro Tapir',
  'Bitwise Bear', 'Cyber Capybara', 'Digital Koala', 'Robo Iguana', 'Neon Frog',
  'Laser Mantis', 'Plasma Dragonfly', 'Specter Wolf', 'Ghost Lemur', 'Crystal Beetle',
  'Circuit Cobra', 'Apex Falcon', 'Genesis Seed',
];

export function generateCatalogFixtures(): NftItem[] {
  const nfts: NftItem[] = [];
  let itemIndex = 0;

  for (const collection of mockCollections) {
    for (let c = 0; c < collection.itemCount; c++) {
      itemIndex++;
      const idNum = String(itemIndex).padStart(2, '0');
      const nftId = `nft-${idNum}`;
      const title = `${TITLES[itemIndex - 1] ?? `Jungle Beast #${idNum}`}`;
      const creator = CREATORS[(itemIndex - 1) % CREATORS.length]!;
      const imageUrl = LOCAL_NFT_IMAGES[(itemIndex - 1) % LOCAL_NFT_IMAGES.length]!;

      const priceEth = (0.25 + ((itemIndex * 7) % 35) * 0.1).toFixed(2);
      const isFirst = itemIndex === 1;
      const isLast = itemIndex === 48;

      const ratingCount = isFirst ? 28 : isLast ? 0 : (itemIndex * 3) % 20;
      const ratingAverage = isLast ? 0 : Number((3.5 + ((itemIndex * 13) % 15) * 0.1).toFixed(1));

      const totalEditions = 5 + (itemIndex % 6) * 5;
      const availableSupply = isLast ? 0 : Math.max(1, totalEditions - (itemIndex % 4));

      const editions = [
        {
          id: `edition_${nftId}_1`,
          editionNumber: 1,
          name: 'First Edition',
          maxSupply: totalEditions,
          availableSupply,
          price: priceEth,
          version: 1,
        },
      ];

      if (itemIndex % 2 === 0) {
        const rarePrice = (Number(priceEth) * 1.5).toFixed(2);
        editions.push({
          id: `edition_${nftId}_2`,
          editionNumber: 2,
          name: 'Collector Foil Edition',
          maxSupply: 5,
          availableSupply: Math.max(0, 5 - (itemIndex % 3)),
          price: rarePrice,
          version: 1,
        });
      }

      const rarity =
        itemIndex % 5 === 0
          ? 'ÉPICO'
          : itemIndex % 3 === 0
            ? 'RARO'
            : itemIndex % 2 === 0
              ? 'COMUM'
              : undefined;

      const previousPriceEth =
        itemIndex % 4 === 0
          ? (Number(priceEth) * 1.25).toFixed(2)
          : undefined;

      nfts.push({
        id: nftId,
        title,
        description: `${title} is an exclusive digital collectible from the ${collection.name} universe living on ${collection.network}.`,
        imageUrl,
        creator,
        category: collection.id,
        collectionName: collection.name,
        network: collection.network as NftNetwork,
        rarity,
        previousPriceEth,
        tags: [collection.network, collection.slug, 'jungle', 'collectible'],
        price: priceEth,
        rating: {
          average: ratingAverage,
          count: ratingCount,
        },
        editions,
        featured: itemIndex <= 6,
        version: 1,
        createdAt: new Date(Date.UTC(2026, 0, 1 + (itemIndex % 28))).toISOString(),
        updatedAt: new Date(Date.UTC(2026, 0, 2 + (itemIndex % 28))).toISOString(),
      });
    }
  }

  return nfts;
}

export const mockCatalogNfts: NftItem[] = generateCatalogFixtures();
