import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const sourceWorker = path.join(rootDir, 'apps', 'shell', 'public', 'mockServiceWorker.js');
const sourceAssets = path.join(rootDir, 'design', 'assets');
const apps = ['shell', 'storefront', 'checkout', 'account'];

for (const app of apps) {
  const targetDir = path.join(rootDir, 'apps', app, 'public');
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  // Copia o worker MSW para remotes
  if (app !== 'shell' && fs.existsSync(sourceWorker)) {
    const targetWorker = path.join(targetDir, 'mockServiceWorker.js');
    fs.copyFileSync(sourceWorker, targetWorker);
    console.log(`[copy-mock-worker] Copied mockServiceWorker.js to ${targetWorker}`);
  }

  // Assegura que assets estáticos estejam disponíveis em cada app para dev server
  const targetAssets = path.join(targetDir, 'assets');
  if (fs.existsSync(sourceAssets) && !fs.existsSync(targetAssets)) {
    fs.cpSync(sourceAssets, targetAssets, { recursive: true });
    console.log(`[copy-mock-worker] Copied design/assets to ${targetAssets}`);
  }
}
