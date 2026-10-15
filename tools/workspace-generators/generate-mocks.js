import fs from 'node:fs';
import path from 'node:path';

const MOCK_LIBS = ['core', 'fixtures', 'handlers', 'socket'];

export function generateMocksLibs(rootDir = process.cwd()) {
  const mocksBaseDir = path.join(rootDir, 'libs', 'mocks');

  for (const lib of MOCK_LIBS) {
    const libDir = path.join(mocksBaseDir, lib);
    const srcDir = path.join(libDir, 'src');
    fs.mkdirSync(srcDir, { recursive: true });

    const projectName = `mocks-${lib}`;
    const projectJson = {
      name: projectName,
      $schema: '../../../node_modules/nx/schemas/project-schema.json',
      sourceRoot: `libs/mocks/${lib}/src`,
      projectType: 'library',
      tags: ['scope:mocks', 'type:mocks', 'flow:shared'],
      targets: {
        lint: {
          executor: '@nx/eslint:lint',
          options: {
            lintFilePatterns: [`libs/mocks/${lib}/**/*.{ts,tsx,js,jsx}`],
          },
        },
        test: {
          executor: '@nx/vitest:test',
          outputs: ['{options.reportsDirectory}'],
          options: {
            config: `libs/mocks/${lib}/vite.config.ts`,
          },
        },
        typecheck: {
          executor: 'nx:run-commands',
          options: {
            command: `tsc -p libs/mocks/${lib}/tsconfig.json --noEmit`,
          },
        },
      },
    };

    fs.writeFileSync(
      path.join(libDir, 'project.json'),
      JSON.stringify(projectJson, null, 2) + '\n',
    );

    const tsconfigJson = {
      extends: '../../../tsconfig.base.json',
      compilerOptions: {
        outDir: '../../../dist/out-tsc',
        declaration: true,
        types: ['node'],
      },
      include: ['src/**/*.ts', 'src/**/*.tsx'],
      exclude: ['src/**/*.spec.ts', 'src/**/*.spec.tsx', 'src/**/*.test.ts', 'src/**/*.test.tsx'],
    };

    fs.writeFileSync(
      path.join(libDir, 'tsconfig.json'),
      JSON.stringify(tsconfigJson, null, 2) + '\n',
    );

    const tsconfigSpecJson = {
      extends: './tsconfig.json',
      compilerOptions: {
        outDir: '../../../dist/out-tsc',
        types: ['vitest/globals', 'vitest/importMeta', 'vite/client', 'node'],
      },
      include: [
        'src/**/*.spec.ts',
        'src/**/*.spec.tsx',
        'src/**/*.test.ts',
        'src/**/*.test.tsx',
        'src/**/*.d.ts',
      ],
    };

    fs.writeFileSync(
      path.join(libDir, 'tsconfig.spec.json'),
      JSON.stringify(tsconfigSpecJson, null, 2) + '\n',
    );

    const viteConfigTs = `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import path from 'node:path';

export default defineConfig({
  root: __dirname,
  plugins: [
    react(),
    tsconfigPaths({ projects: [path.resolve(__dirname, '../../../tsconfig.base.json')] }),
  ],
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    passWithNoTests: true,
  },
});
`;

    fs.writeFileSync(path.join(libDir, 'vite.config.ts'), viteConfigTs);
  }

  // Write content for core
  fs.writeFileSync(
    path.join(mocksBaseDir, 'core', 'src', 'index.ts'),
    `export type MockScenario =
  | 'default'
  | 'empty'
  | 'latency'
  | 'error'
  | 'session-expired'
  | 'unauthorized'
  | 'conflict'
  | 'payment-confirmed'
  | 'payment-rejected'
  | 'price-changed'
  | 'sold-out';

export interface MockState {
  scenario: MockScenario;
  latencyMs: number;
  isOffline: boolean;
  version: number;
}

export const initialMockState: MockState = {
  scenario: 'default',
  latencyMs: 150,
  isOffline: false,
  version: 1,
};

let currentState: MockState = { ...initialMockState };

export function getMockState(): MockState {
  return { ...currentState };
}

export function setMockScenario(scenario: MockScenario): void {
  currentState.scenario = scenario;
}

export function setMockLatency(latencyMs: number): void {
  currentState.latencyMs = latencyMs;
}

export function resetMockState(): void {
  currentState = { ...initialMockState };
}
`,
  );

  fs.writeFileSync(
    path.join(mocksBaseDir, 'core', 'src', 'index.spec.ts'),
    `import { describe, it, expect, beforeEach } from 'vitest';
import {
  getMockState,
  setMockScenario,
  setMockLatency,
  resetMockState,
  initialMockState,
} from './index';

describe('mocks-core public exports', () => {
  beforeEach(() => {
    resetMockState();
  });

  it('exports state management and scenarios functions', () => {
    expect(getMockState()).toEqual(initialMockState);
    setMockScenario('empty');
    expect(getMockState().scenario).toBe('empty');
    setMockLatency(300);
    expect(getMockState().latencyMs).toBe(300);
    resetMockState();
    expect(getMockState()).toEqual(initialMockState);
  });
});
`,
  );

  // Write content for fixtures
  fs.writeFileSync(
    path.join(mocksBaseDir, 'fixtures', 'src', 'index.ts'),
    `export interface MockNftItem {
  id: string;
  title: string;
  priceEth: string;
  creator: string;
  imageUrl: string;
  edition: number;
  totalEditions: number;
  available: boolean;
}

export interface MockUserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
}

export interface MockWalletItem {
  id: string;
  address: string;
  name: string;
  isDefault: boolean;
}

export const mockUsers: MockUserProfile[] = [
  {
    id: 'user_alice',
    name: 'Alice Silva',
    email: 'alice@example.com',
  },
  {
    id: 'user_bob',
    name: 'Bob Santos',
    email: 'bob@example.com',
  },
];

export const mockNfts: MockNftItem[] = [
  {
    id: 'nft_1',
    title: 'Cyber Ape #001',
    priceEth: '0.45',
    creator: 'CryptoJungle',
    imageUrl: '/assets/nfts/cyber-ape-001.webp',
    edition: 1,
    totalEditions: 10,
    available: true,
  },
  {
    id: 'nft_2',
    title: 'Neon Jaguar #042',
    priceEth: '1.20',
    creator: 'NeonLabs',
    imageUrl: '/assets/nfts/neon-jaguar-042.webp',
    edition: 42,
    totalEditions: 50,
    available: true,
  },
];

export const mockWallets: MockWalletItem[] = [
  {
    id: 'wallet_1',
    address: '0x1111111111111111111111111111111111111111',
    name: 'Main Vault',
    isDefault: true,
  },
];
`,
  );

  fs.writeFileSync(
    path.join(mocksBaseDir, 'fixtures', 'src', 'index.spec.ts'),
    `import { describe, it, expect } from 'vitest';
import { mockUsers, mockNfts, mockWallets } from './index';

describe('mocks-fixtures public exports', () => {
  it('exports mockUsers, mockNfts and mockWallets arrays', () => {
    expect(mockUsers.length).toBeGreaterThan(0);
    expect(mockNfts.length).toBeGreaterThan(0);
    expect(mockWallets.length).toBeGreaterThan(0);
  });
});
`,
  );

  // Write content for handlers
  fs.writeFileSync(
    path.join(mocksBaseDir, 'handlers', 'src', 'index.ts'),
    `import { http, HttpResponse } from 'msw';
import { mockNfts, mockUsers } from '@nft/mocks-fixtures';

export const authHandlers = [
  http.get('/api/session', () => {
    return HttpResponse.json({ user: mockUsers[0] });
  }),
  http.post('/api/auth/login', () => {
    return HttpResponse.json({ token: 'mock-session-token', user: mockUsers[0] });
  }),
  http.post('/api/auth/logout', () => {
    return HttpResponse.json({ success: true });
  }),
];

export const catalogHandlers = [
  http.get('/api/nfts', () => {
    return HttpResponse.json({ items: mockNfts, total: mockNfts.length });
  }),
  http.get('/api/nfts/:id', ({ params }) => {
    const nft = mockNfts.find((item) => item.id === params['id']);
    if (!nft) {
      return new HttpResponse(null, { status: 404 });
    }
    return HttpResponse.json(nft);
  }),
];

export const cartHandlers = [
  http.get('/api/cart', () => {
    return HttpResponse.json({ items: [], subtotalEth: '0', totalEth: '0' });
  }),
];

export const checkoutHandlers = [
  http.post('/api/checkout/quote', () => {
    return HttpResponse.json({
      subtotalEth: '0.45',
      discountEth: '0',
      networkFeeEth: '0.005',
      totalEth: '0.455',
    });
  }),
  http.post('/api/orders', () => {
    return HttpResponse.json({
      orderId: 'order_123',
      status: 'confirmed',
    });
  }),
];

export const handlers = [
  ...authHandlers,
  ...catalogHandlers,
  ...cartHandlers,
  ...checkoutHandlers,
];
`,
  );

  fs.writeFileSync(
    path.join(mocksBaseDir, 'handlers', 'src', 'index.spec.ts'),
    `import { describe, it, expect } from 'vitest';
import { handlers, authHandlers, catalogHandlers, cartHandlers, checkoutHandlers } from './index';

describe('mocks-handlers public exports', () => {
  it('exports MSW handlers arrays', () => {
    expect(Array.isArray(handlers)).toBe(true);
    expect(handlers.length).toBeGreaterThan(0);
    expect(authHandlers.length).toBeGreaterThan(0);
    expect(catalogHandlers.length).toBeGreaterThan(0);
    expect(cartHandlers.length).toBeGreaterThan(0);
    expect(checkoutHandlers.length).toBeGreaterThan(0);
  });
});
`,
  );

  // Write content for socket
  fs.writeFileSync(
    path.join(mocksBaseDir, 'socket', 'src', 'index.ts'),
    `import { ws } from 'msw';
import { toSocketIo } from '@mswjs/socket.io-binding';

export interface MockRealtimeEvent<T = unknown> {
  id: string;
  type: string;
  resource: { kind: string; id: string };
  version: number;
  occurredAt: string;
  userId?: string;
  payload: T;
}

export const socketInterceptor = ws.link('wss://*');

export function createMockSocketHandler(
  onConnection?: (socketIo: ReturnType<typeof toSocketIo>) => void,
) {
  return socketInterceptor.addEventListener('connection', (connection) => {
    const socketIo = toSocketIo(connection);
    onConnection?.(socketIo);
  });
}
`,
  );

  fs.writeFileSync(
    path.join(mocksBaseDir, 'socket', 'src', 'index.spec.ts'),
    `import { describe, it, expect } from 'vitest';
import { socketInterceptor, createMockSocketHandler } from './index';

describe('mocks-socket public exports', () => {
  it('exports socketInterceptor and helper functions', () => {
    expect(socketInterceptor).toBeDefined();
    expect(typeof createMockSocketHandler).toBe('function');
  });
});
`,
  );

  console.log(`✓ Scaffolded ${MOCK_LIBS.length} mocks libraries`);
}

if (process.argv[1] && process.argv[1].endsWith('generate-mocks.js')) {
  generateMocksLibs();
}
