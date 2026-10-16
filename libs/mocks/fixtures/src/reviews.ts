import type { Review } from '@nft/shared-contracts';

const REVIEW_AUTHORS = [
  { id: 'rev_auth_1', name: 'CryptoPioneer', avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100' },
  { id: 'rev_auth_2', name: 'Web3Voyager', avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100' },
  { id: 'rev_auth_3', name: 'MetaverseCurator', avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100' },
  { id: 'rev_auth_4', name: 'EtherKnight', avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100' },
  { id: 'rev_auth_5', name: 'NeonSamurai', avatarUrl: null },
  { id: 'rev_auth_6', name: 'PixelArtist_99', avatarUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=100' },
];

const SAMPLE_COMMENTS = [
  'Outstanding art piece and stellar community support!',
  'The details on the texture and colors are unmatched.',
  'Great value for an original digital collectible.',
  'Fast transaction and looks incredible in full resolution.',
  'One of the gems in my collection!',
  'Love the lore behind this collection.',
  'Solid rarity and edition supply.',
  'Looking forward to upcoming drops from this artist.',
];

export function generateReviewsFixtures(): Review[] {
  const reviews: Review[] = [];

  // Generate 28 reviews for nft-01 (satisfies >= 25 paginated requirement)
  for (let i = 1; i <= 28; i++) {
    const author = REVIEW_AUTHORS[(i - 1) % REVIEW_AUTHORS.length]!;
    const rating = ((i * 3) % 5) + 1; // Always integer 1 to 5
    const comment = `${SAMPLE_COMMENTS[(i - 1) % SAMPLE_COMMENTS.length]} (Review #${i})`;

    reviews.push({
      id: `review_nft_01_${String(i).padStart(2, '0')}`,
      nftId: 'nft-01',
      author,
      rating,
      comment,
      createdAt: new Date(Date.UTC(2026, 0, i, 12, 0, 0)).toISOString(),
    });
  }

  // Generate a few reviews for other NFTs (nft-02 to nft-05)
  for (let nftIndex = 2; nftIndex <= 5; nftIndex++) {
    const nftId = `nft-${String(nftIndex).padStart(2, '0')}`;
    for (let j = 1; j <= 3; j++) {
      const author = REVIEW_AUTHORS[(j + nftIndex) % REVIEW_AUTHORS.length]!;
      reviews.push({
        id: `review_${nftId}_${j}`,
        nftId,
        author,
        rating: 4 + (j % 2),
        comment: `Spectacular piece from ${nftId}! Verified authentic artwork.`,
        createdAt: new Date(Date.UTC(2026, 0, j + 5, 14, 0, 0)).toISOString(),
      });
    }
  }

  // Note: nft-48 intentionally has 0 reviews to satisfy empty reviews requirement

  return reviews;
}

export const mockReviews: Review[] = generateReviewsFixtures();
