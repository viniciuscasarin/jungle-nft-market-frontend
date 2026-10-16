import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import http from 'node:http';
import type { AddressInfo } from 'node:net';
import { server } from './preview.js';

describe('Preview Server Integration Tests', () => {
  let baseUrl = '';

  beforeAll(async () => {
    await new Promise<void>((resolve) => {
      server.listen(0, '127.0.0.1', () => {
        const address = server.address() as AddressInfo;
        baseUrl = `http://127.0.0.1:${address.port}`;
        resolve();
      });
    });
  });

  afterAll(async () => {
    await new Promise<void>((resolve, reject) => {
      server.close((err) => (err ? reject(err) : resolve()));
    });
  });

  const fetchResource = async (path: string) => {
    return new Promise<{ status: number; headers: http.IncomingHttpHeaders; body: string }>(
      (resolve, reject) => {
        http
          .get(`${baseUrl}${path}`, (res) => {
            let data = '';
            res.on('data', (chunk) => {
              data += chunk;
            });
            res.on('end', () => {
              resolve({
                status: res.statusCode || 0,
                headers: res.headers,
                body: data,
              });
            });
          })
          .on('error', reject);
      },
    );
  };

  it('serves /mockServiceWorker.js with 200 and strict no-cache headers', async () => {
    const res = await fetchResource('/mockServiceWorker.js');
    expect(res.status).toBe(200);
    expect(res.headers['cache-control']).toBe('no-cache, no-store, must-revalidate');
    expect(res.headers['content-type']).toContain('application/javascript');
  });

  it('serves /remotes/storefront/remoteEntry.js with 200 and strict no-cache headers', async () => {
    const res = await fetchResource('/remotes/storefront/remoteEntry.js');
    expect(res.status).toBe(200);
    expect(res.headers['cache-control']).toBe('no-cache, no-store, must-revalidate');
    expect(res.headers['content-type']).toContain('application/javascript');
  });

  it('serves hashed assets in /assets/* with 200 and immutable cache header', async () => {
    // Find an existing asset file from dist/integrated/assets
    const fs = await import('node:fs');
    const path = await import('node:path');
    const assetsDir = path.join(process.cwd(), 'dist', 'integrated', 'assets');
    const files = fs.existsSync(assetsDir) ? fs.readdirSync(assetsDir) : [];
    const sampleAsset = files[0];

    if (sampleAsset) {
      const res = await fetchResource(`/assets/${sampleAsset}`);
      expect(res.status).toBe(200);
      expect(res.headers['cache-control']).toBe('public, max-age=31536000, immutable');
    }
  });

  const deepRoutes = [
    '/',
    '/nft/1',
    '/login',
    '/cadastro',
    '/carrinho',
    '/checkout/pagamento',
    '/pedido/1',
    '/conta/perfil',
    '/conta/carteiras',
    '/rota-inexistente',
  ];

  for (const route of deepRoutes) {
    it(`serves SPA fallback index.html with 200 for deep route: ${route}`, async () => {
      const res = await fetchResource(route);
      expect(res.status).toBe(200);
      expect(res.headers['cache-control']).toBe('no-cache, no-store, must-revalidate');
      expect(res.headers['content-type']).toContain('text/html');
      expect(res.body).toContain('<div id="root">');
    });
  }
});
