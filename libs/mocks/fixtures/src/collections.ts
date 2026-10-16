export interface MockCollection {
  id: string;
  name: string;
  slug: string;
  description: string;
  network: 'ethereum' | 'polygon' | 'solana';
  itemCount: number;
  bannerUrl: string;
}

export const mockCollections: MockCollection[] = [
  {
    id: 'col_cyber_jungle',
    name: 'Cyber Jungle',
    slug: 'cyber-jungle',
    description: 'High-tech biomechanical primates from the neon rainforest.',
    network: 'ethereum',
    itemCount: 12,
    bannerUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe',
  },
  {
    id: 'col_neon_predators',
    name: 'Neon Predators',
    slug: 'neon-predators',
    description: 'Bioluminescent wild felines prowling the digital canopy.',
    network: 'polygon',
    itemCount: 10,
    bannerUrl: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4',
  },
  {
    id: 'col_solana_apes',
    name: 'Solana Apes Genesis',
    slug: 'solana-apes',
    description: 'High-speed speedrunner apes built on Solana.',
    network: 'solana',
    itemCount: 10,
    bannerUrl: 'https://images.unsplash.com/photo-1618172193763-c511deb635ca',
  },
  {
    id: 'col_quantum_mecha',
    name: 'Quantum Mecha Flora',
    slug: 'quantum-mecha',
    description: 'Synthetic flora and mechanical insect pollinators.',
    network: 'ethereum',
    itemCount: 8,
    bannerUrl: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e',
  },
  {
    id: 'col_pixel_wildlife',
    name: 'Pixel Wildlife',
    slug: 'pixel-wildlife',
    description: 'Charming 8-bit endangered species preserved on-chain.',
    network: 'polygon',
    itemCount: 8,
    bannerUrl: 'https://images.unsplash.com/photo-1614728894747-a83421e2b9c9',
  },
];
