import type { NftItem } from '@nft/shared-contracts';
import { mockCollections } from './collections';

const SAMPLE_IMAGES = [
  'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1618172193763-c511deb635ca?w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1633493106115-61849a04a601?w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1549887534-1541e9326642?w=800&auto=format&fit=crop',
];

const CREATORS = [
  {
    id: 'creator_jungle_lab',
    name: 'Jungle Labs',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop',
    verified: true,
  },
  {
    id: 'creator_neon_art',
    name: 'Neon Master',
    avatarUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=120&auto=format&fit=crop',
    verified: true,
  },
  {
    id: 'creator_cyber_fox',
    name: 'Cyber Fox',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop',
    verified: false,
  },
  {
    id: 'creator_pixel_sage',
    name: 'Pixel Sage',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop',
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
      const imageUrl = SAMPLE_IMAGES[(itemIndex - 1) % SAMPLE_IMAGES.length]!;

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

      nfts.push({
        id: nftId,
        title,
        description: `${title} is an exclusive digital collectible from the ${collection.name} universe living on ${collection.network}.`,
        imageUrl,
        creator,
        category: collection.id,
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
