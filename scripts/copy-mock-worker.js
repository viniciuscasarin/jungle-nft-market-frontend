import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const sourceWorker = path.join(rootDir, 'apps', 'shell', 'public', 'mockServiceWorker.js');
const remotes = ['storefront', 'checkout', 'account'];

if (!fs.existsSync(sourceWorker)) {
  console.warn(`[copy-mock-worker] Source worker not found at ${sourceWorker}`);
  process.exit(0);
}

for (const remote of remotes) {
  const targetDir = path.join(rootDir, 'apps', remote, 'public');
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }
  const targetFile = path.join(targetDir, 'mockServiceWorker.js');
  fs.copyFileSync(sourceWorker, targetFile);
  console.log(`[copy-mock-worker] Copied mockServiceWorker.js to ${targetFile}`);
}
