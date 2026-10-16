import { HttpResponse } from 'msw';
import {
  CreateWalletInputSchema,
  type Wallet,
  type UserWallets,
} from '@nft/shared-contracts';
import {
  defineHandler,
  parseBody,
  requireSession,
  getMockDatabase,
  transaction,
} from '@nft/mocks-core';

export const walletsHandlers = [
  defineHandler('GET', '/wallets', ({ request }) => {
    const { session, response } = requireSession(request);
    if (response || !session) {
      return response!;
    }

    const db = getMockDatabase();
    const userId = session.user.id;
    const userWallets = db.wallets.filter((w) => w.userId === userId);

    let primary = userWallets.find((w) => w.isPrimary) ?? userWallets[0];

    // If no primary wallet exists for this user in the mock DB, initialize a default one
    if (!primary) {
      primary = transaction((currentDb) => {
        const defaultWallet: Wallet = {
          id: `wal_${globalThis.crypto.randomUUID().replace(/-/g, '').slice(0, 10)}`,
          userId,
          address: '0x1111111111111111111111111111111111111111',
          network: 'ethereum-mainnet',
          walletType: 'metamask',
          ensName: session.user.username ?? 'collector',
          label: 'Carteira Principal',
          displayName: session.user.displayName,
          email: session.user.email,
          referralCode: null,
          notes: null,
          isPrimary: true,
          createdAt: new Date().toISOString(),
        };
        currentDb.wallets.push(defaultWallet);
        return defaultWallet;
      });
    }

    const secondary =
      userWallets.find((w) => !w.isPrimary && w.id !== primary?.id) ?? null;

    const result: UserWallets = {
      primary,
      secondary: secondary ?? null,
    };

    return HttpResponse.json(result, { status: 200 });
  }),

  defineHandler('POST', '/wallets', async ({ request }) => {
    return handleSaveWallet(request);
  }),

  defineHandler('PUT', '/wallets', async ({ request }) => {
    return handleSaveWallet(request);
  }),

  defineHandler('PUT', '/wallets/:role', async ({ request, params }) => {
    const roleParam = params['role'];
    const forcePrimary = roleParam === 'primary';
    return handleSaveWallet(request, forcePrimary);
  }),
];

async function handleSaveWallet(request: Request, forcePrimary?: boolean) {
  const { session, response } = requireSession(request);
  if (response || !session) {
    return response!;
  }

  const parseResult = await parseBody(request, CreateWalletInputSchema);
  if (!parseResult.success) {
    return parseResult.response;
  }

  const data = parseResult.data;
  const userId = session.user.id;
  const isPrimary = forcePrimary !== undefined ? forcePrimary : Boolean(data.isPrimary);

  const savedWallet = transaction((db) => {
    let target = db.wallets.find((w) => w.userId === userId && w.isPrimary === isPrimary);

    if (target) {
      target.address = data.address;
      target.network = data.network;
      if (data.walletType !== undefined) target.walletType = data.walletType;
      if (data.ensName !== undefined) target.ensName = data.ensName;
      if (data.label !== undefined) target.label = data.label;
      if (data.displayName !== undefined) target.displayName = data.displayName;
      if (data.email !== undefined) target.email = data.email;
      if (data.referralCode !== undefined) target.referralCode = data.referralCode;
      if (data.notes !== undefined) target.notes = data.notes;
    } else {
      target = {
        id: `wal_${globalThis.crypto.randomUUID().replace(/-/g, '').slice(0, 10)}`,
        userId,
        address: data.address,
        network: data.network,
        walletType: data.walletType ?? 'metamask',
        ensName: data.ensName ?? null,
        label: data.label ?? (isPrimary ? 'Carteira Principal' : 'Carteira Secundária'),
        displayName: data.displayName ?? null,
        email: data.email ?? null,
        referralCode: data.referralCode ?? null,
        notes: data.notes ?? null,
        isPrimary,
        createdAt: new Date().toISOString(),
      };
      db.wallets.push(target);
    }

    // Ensure only one wallet is marked primary if this one is primary
    if (isPrimary && target) {
      for (const w of db.wallets) {
        if (w.userId === userId && w.id !== target.id) {
          w.isPrimary = false;
        }
      }
    }

    return target!;
  });

  return HttpResponse.json(savedWallet, { status: 200 });
}
