import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdtemp, rm } from 'node:fs/promises';
import path from 'node:path';
import { test } from 'node:test';
import { chromium } from '@playwright/test';

test('federated dev cold start renders catalog, cart and reloads without optimizer failures', { timeout: 180000 }, async () => {
  const root = path.resolve(import.meta.dirname, '..');
  const cacheRoot = await mkdtemp(path.join(root, 'node_modules/.vite-federated-test-'));
  const apps = ['shell', 'storefront', 'checkout', 'account'];
  const children = [];
  const logs = [];
  const pageErrors = [];
  const staleResponses = [];
  const sourceTestRequests = [];
  let browser;

  try {
    await Promise.all(apps.map((name, index) => new Promise((resolve, reject) => {
      const port = 4300 + index;
      const source = `
        import assert from 'node:assert/strict';
        import { createServer, loadConfigFromFile } from 'vite';
        const { config } = await loadConfigFromFile(
          { command: 'serve', mode: 'development' },
          ${JSON.stringify(`apps/${name}/vite.config.ts`)},
        );
        assert.ok(config.cacheDir.replaceAll('\\\\', '/').endsWith('/.vite/${name}'));
        assert.equal(config.server.strictPort, true);
        const server = await createServer({
          ...config,
          configFile: false,
          cacheDir: ${JSON.stringify(cacheRoot + '/' + name)},
          server: { ...config.server, port: ${port}, origin: 'http://localhost:${port}', open: false },
          optimizeDeps: { ...config.optimizeDeps, force: true },
        });
        await server.listen();
        process.send('ready');
      `;
      const child = spawn(process.execPath, ['--input-type=module', '-e', source], {
        cwd: root,
        env: {
          ...process.env,
          VITE_ENABLE_MOCKS: 'true',
          VITE_REMOTE_STOREFRONT_URL: 'http://localhost:4301',
          VITE_REMOTE_CHECKOUT_URL: 'http://localhost:4302',
          VITE_REMOTE_ACCOUNT_URL: 'http://localhost:4303',
        },
        stdio: ['ignore', 'pipe', 'pipe', 'ipc'],
      });
      children.push(child);
      child.stdout.on('data', (chunk) => logs.push(`${name}: ${chunk}`));
      child.stderr.on('data', (chunk) => logs.push(`${name}: ${chunk}`));
      child.once('error', reject);
      child.once('exit', (code) => reject(new Error(`${name} exited with ${code}`)));
      child.once('message', () => {
        process.stdout.write(`${name} ready on ${port}\n`);
        resolve();
      });
    })));

    browser = await chromium.launch();
    const page = await browser.newPage();
    page.on('pageerror', (error) => pageErrors.push(error.stack ?? error.message));
    page.on('request', (request) => {
      if (/\.(?:spec|test)\.[jt]sx?(?:\?|$)/.test(request.url())) sourceTestRequests.push(request.url());
    });
    page.on('response', (response) => {
      if (response.status() === 504) staleResponses.push(response.url());
    });
    await page.goto('http://localhost:4300');
    await page.getByTestId('home-page-content').waitFor({ timeout: 60000 });
    await page.getByTestId(/^catalog-price-/).first().waitFor({ timeout: 30000 });
    await page.reload();
    await page.getByTestId('home-page-content').waitFor({ timeout: 30000 });
    await page.goto('http://localhost:4300/carrinho');
    await page.getByTestId('checkout-cart-page').waitFor({ timeout: 30000 });
    await page.goto('http://localhost:4300/perfil');
    await page.getByLabel(/Email ou username/i).fill('alice@example.com');
    await page.getByLabel(/^Senha/i).fill('Password123!');
    await page.getByRole('button', { name: /^Entrar$/i }).click();
    await page.getByTestId('account-grid-layout').waitFor({ timeout: 30000 });
    await page.getByRole('heading', { name: 'Perfil do colecionador', exact: true }).waitFor({ timeout: 30000 });
    const singletonState = await page.evaluate(() => globalThis[Symbol.for('nft.singleton.registry')]?.verify());
    assert.equal(singletonState?.valid, true);
    for (const [index, heading] of ['Storefront Remote', 'Checkout Remote', 'Account Remote'].entries()) {
      await page.goto(`http://localhost:${4301 + index}`);
      await page.getByRole('heading', { name: heading, exact: true }).waitFor({ timeout: 30000 });
    }
    assert.deepEqual(pageErrors, []);
    assert.deepEqual(staleResponses, []);
    assert.deepEqual(sourceTestRequests, []);
    assert.ok(!logs.some((line) => line.includes('error while updating dependencies')));
  } catch (error) {
    process.stderr.write(`${logs.join('\n')}\nPage errors: ${JSON.stringify(pageErrors)}\n504: ${JSON.stringify(staleResponses)}\n`);
    throw error;
  } finally {
    await browser?.close();
    await Promise.all(children.map((child) => new Promise((resolve) => {
      if (child.exitCode !== null) return resolve();
      child.once('exit', resolve);
      child.kill();
    })));
    assert.equal(path.dirname(cacheRoot), path.join(root, 'node_modules'));
    await rm(cacheRoot, { recursive: true, force: true });
  }
});
