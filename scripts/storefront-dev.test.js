import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import path from 'node:path';
import { test } from 'node:test';
import { setTimeout } from 'node:timers/promises';
import { createLogger, createServer } from 'vite';

test('storefront cold start optimizes standalone dependencies without errors', { timeout: 60000 }, async () => {
  const workspaceRoot = path.resolve(import.meta.dirname, '..');
  const cacheDir = await mkdtemp(path.join(workspaceRoot, 'node_modules/.vite-storefront-test-'));
  const errors = [];
  const logger = createLogger('silent');
  logger.error = (message) => errors.push(message);
  let server;

  try {
    server = await createServer({
      configFile: path.join(workspaceRoot, 'apps/storefront/vite.config.ts'),
      cacheDir,
      customLogger: logger,
      server: { port: 0, open: false },
      optimizeDeps: { force: true },
    });
    await server.listen();
    const optimizer = server.environments.client.depsOptimizer;
    assert.ok(optimizer);
    assert.notEqual(optimizer.options.noDiscovery, true);

    const dependencies = ['react', '@nft/shell-kit', 'axios', 'msw/browser', 'zod', 'decimal.js'];
    const deadline = Date.now() + 30000;
    while (dependencies.some((dependency) => !optimizer.metadata.optimized[dependency]) && errors.length === 0 && Date.now() < deadline) {
      await setTimeout(100);
    }
    assert.deepEqual(errors, []);
    for (const dependency of dependencies) {
      assert.ok(optimizer.metadata.optimized[dependency], `${dependency} was not optimized`);
    }

    const response = await fetch(server.resolvedUrls.local[0]);
    assert.equal(response.status, 200);
    assert.match(decodeURIComponent(await response.text()), /src\/main.tsx/);
    await server.transformRequest('/src/main.tsx');
    await optimizer.scanProcessing;
    await server.environments.client.waitForRequestsIdle();
    assert.deepEqual(errors, []);
  } finally {
    await server?.close();
    assert.equal(path.dirname(cacheDir), path.join(workspaceRoot, 'node_modules'));
    await rm(cacheDir, { recursive: true, force: true });
  }
});
