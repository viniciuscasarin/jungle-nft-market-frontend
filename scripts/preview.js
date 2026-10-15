import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const PORT = Number(process.env.PORT) || 4200;
const rootDir = process.cwd();
const integratedDir = path.join(rootDir, 'dist', 'integrated');
const fallbackDir = path.join(rootDir, 'dist', 'apps', 'shell');

const baseDir = fs.existsSync(integratedDir) ? integratedDir : fallbackDir;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
};

function getCacheControl(filePath) {
  const fileName = path.basename(filePath).toLowerCase();

  if (
    fileName === 'remoteentry.js' ||
    fileName.startsWith('remoteentry') ||
    fileName === 'mf-manifest.json' ||
    fileName.startsWith('mf-manifest') ||
    fileName === 'index.html'
  ) {
    return 'public, max-age=0, must-revalidate';
  }

  if (filePath.includes(`${path.sep}assets${path.sep}`) || filePath.includes('/assets/')) {
    return 'public, max-age=31536000, immutable';
  }

  return 'public, max-age=0, must-revalidate';
}

function serveFile(filePath, res) {
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Erro interno do servidor');
      return;
    }

    const headers = {
      'Content-Type': contentType,
      'Cache-Control': getCacheControl(filePath),
      'Access-Control-Allow-Origin': '*',
    };

    res.writeHead(200, headers);
    res.end(content);
  });
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
  let pathname = decodeURIComponent(url.pathname);

  // Remotes routing or direct files
  let candidatePath = path.join(baseDir, pathname);

  if (fs.existsSync(candidatePath) && fs.statSync(candidatePath).isDirectory()) {
    candidatePath = path.join(candidatePath, 'index.html');
  }

  if (fs.existsSync(candidatePath) && !fs.statSync(candidatePath).isDirectory()) {
    serveFile(candidatePath, res);
    return;
  }

  // SPA fallback to shell index.html
  const fallbackIndex = path.join(baseDir, 'index.html');
  if (fs.existsSync(fallbackIndex)) {
    serveFile(fallbackIndex, res);
    return;
  }

  res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('Build não encontrado. Execute `pnpm build` antes de rodar o preview.');
});

if (process.argv[1] && process.argv[1].endsWith('preview.js')) {
  server.listen(PORT, () => {
    console.log(`🌐 Preview server rodando em http://localhost:${PORT}`);
    console.log(`📁 Servindo diretório: ${baseDir}`);
  });
}

export { server };
