import fs from 'node:fs';
import path from 'node:path';

const REMOTES = [
  {
    name: 'storefront',
    port: 4201,
    title: 'Storefront Remote',
    badge: 'Catálogo & PDP',
    description:
      'Módulo responsável pela vitrine de produtos, filtros por categoria, ordenação por preço e página de detalhes do NFT (PDP).',
    ariaLabel: 'Catálogo Storefront',
  },
  {
    name: 'checkout',
    port: 4202,
    title: 'Checkout Remote',
    badge: 'Carrinho & Pedidos',
    description:
      'Módulo responsável pelo gerenciamento de carrinho, cálculo de cotação com cupom e taxas de rede, e confirmação idempotente de pedido.',
    ariaLabel: 'Fluxo de Checkout',
  },
  {
    name: 'account',
    port: 4203,
    title: 'Account Remote',
    badge: 'Perfil & Carteiras',
    description:
      'Módulo responsável pela gestão do perfil do colecionador, preferências e gerenciamento seguro de carteiras Ethereum simuladas.',
    ariaLabel: 'Painel de Conta e Carteiras',
  },
];

export function generateRemotes(rootDir = process.cwd()) {
  const appsDir = path.join(rootDir, 'apps');

  for (const remote of REMOTES) {
    const remoteDir = path.join(appsDir, remote.name);
    const srcDir = path.join(remoteDir, 'src');
    fs.mkdirSync(srcDir, { recursive: true });

    // 1. project.json
    const projectJson = {
      name: remote.name,
      $schema: '../../node_modules/nx/schemas/project-schema.json',
      sourceRoot: `apps/${remote.name}/src`,
      projectType: 'application',
      tags: [`scope:${remote.name}`, 'type:app', `flow:${remote.name}`],
      targets: {
        dev: {
          executor: '@nx/vite:dev-server',
          defaultConfiguration: 'development',
          options: {
            buildTarget: `${remote.name}:build`,
            port: remote.port,
          },
        },
        serve: {
          executor: '@nx/vite:dev-server',
          defaultConfiguration: 'development',
          options: {
            buildTarget: `${remote.name}:build`,
            port: remote.port,
          },
        },
        build: {
          executor: '@nx/vite:build',
          outputs: ['{options.outputPath}'],
          defaultConfiguration: 'production',
          options: {
            outputPath: `dist/apps/${remote.name}`,
            configFile: `apps/${remote.name}/vite.config.ts`,
          },
        },
        preview: {
          executor: '@nx/vite:preview-server',
          defaultConfiguration: 'development',
          options: {
            buildTarget: `${remote.name}:build`,
            port: remote.port,
          },
        },
        test: {
          executor: '@nx/vitest:test',
          outputs: ['{options.reportsDirectory}'],
          options: {
            config: `apps/${remote.name}/vite.config.ts`,
          },
        },
        lint: {
          executor: '@nx/eslint:lint',
          options: {
            lintFilePatterns: [`apps/${remote.name}/**/*.{ts,tsx,js,jsx}`],
          },
        },
        typecheck: {
          executor: 'nx:run-commands',
          options: {
            command: `tsc -p apps/${remote.name}/tsconfig.json --noEmit`,
          },
        },
      },
    };

    fs.writeFileSync(
      path.join(remoteDir, 'project.json'),
      JSON.stringify(projectJson, null, 2) + '\n',
    );

    // 2. tsconfig.json
    const tsconfigJson = {
      extends: '../../tsconfig.base.json',
      compilerOptions: {
        outDir: '../../dist/out-tsc',
        types: ['node', 'vite/client'],
      },
      include: ['src/**/*.ts', 'src/**/*.tsx'],
      exclude: ['src/**/*.spec.ts', 'src/**/*.spec.tsx', 'src/**/*.test.ts', 'src/**/*.test.tsx'],
    };

    fs.writeFileSync(
      path.join(remoteDir, 'tsconfig.json'),
      JSON.stringify(tsconfigJson, null, 2) + '\n',
    );

    // 3. tsconfig.spec.json
    const tsconfigSpecJson = {
      extends: './tsconfig.json',
      compilerOptions: {
        outDir: '../../dist/out-tsc',
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
      path.join(remoteDir, 'tsconfig.spec.json'),
      JSON.stringify(tsconfigSpecJson, null, 2) + '\n',
    );

    // 4. vite.config.ts
    const viteConfigTs = `/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import path from 'node:path';

export default defineConfig({
  root: __dirname,
  plugins: [
    tailwindcss(),
    react(),
    tsconfigPaths({ projects: [path.resolve(__dirname, '../../tsconfig.base.json')] }),
  ],
  server: {
    port: ${remote.port},
    host: 'localhost',
  },
  preview: {
    port: ${remote.port},
    host: 'localhost',
  },
  build: {
    outDir: '../../dist/apps/${remote.name}',
    emptyOutDir: true,
    reportCompressedSize: true,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
  },
});
`;

    fs.writeFileSync(path.join(remoteDir, 'vite.config.ts'), viteConfigTs);

    // 5. index.html
    const indexHtml = `<!DOCTYPE html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${remote.title} - Jungle NFT Market</title>
  </head>
  <body class="min-h-screen bg-slate-950 text-slate-100 antialiased">
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`;
    fs.writeFileSync(path.join(remoteDir, 'index.html'), indexHtml);

    // 6. src/styles.css
    fs.writeFileSync(path.join(srcDir, 'styles.css'), '@import "tailwindcss";\n');

    // 7. src/App.tsx
    const appTsx = `import React from 'react';

export function App() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800 bg-slate-950/80 px-6 py-4 backdrop-blur">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">🌿</span>
            <span className="text-lg font-extrabold tracking-tight text-emerald-400">
              ${remote.title}
            </span>
          </div>
          <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400">
            Porta ${remote.port}
          </span>
        </div>
      </header>

      <main className="container mx-auto flex-1 px-4 py-12" role="region" aria-label="${remote.ariaLabel}">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-8 shadow-xl backdrop-blur sm:p-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400">
            ${remote.badge}
          </div>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-100 sm:text-4xl">
            ${remote.title}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-400">
            ${remote.description}
          </p>
          <div className="mt-8 rounded-xl border border-dashed border-slate-800 bg-slate-950/40 p-6 text-sm text-slate-500">
            <p className="font-medium text-slate-400">Status de Integração</p>
            <p className="mt-1">
              Pronto para execução independente em desenvolvimento ou consumo via Module Federation pelo host shell.
            </p>
          </div>
        </div>
      </main>

      <footer className="border-t border-slate-800 py-6 text-center text-xs text-slate-500">
        <p>© 2026 Jungle NFT Market - Remote Independente</p>
      </footer>
    </div>
  );
}

export default App;
`;
    fs.writeFileSync(path.join(srcDir, 'App.tsx'), appTsx);

    // 8. src/main.tsx
    const mainTsx = `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles.css';

const rootElement = document.getElementById('root');
if (rootElement && !rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
}
`;
    fs.writeFileSync(path.join(srcDir, 'main.tsx'), mainTsx);

    // 9. src/App.spec.tsx
    const appSpecTsx = `import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';

describe('${remote.title}', () => {
  it('renders accessible header and placeholder content', () => {
    render(<App />);

    expect(screen.getByRole('heading', { level: 1, name: '${remote.title}' })).toBeDefined();
    expect(screen.getByRole('region', { name: '${remote.ariaLabel}' })).toBeDefined();
    expect(screen.getByText(/Porta ${remote.port}/i)).toBeDefined();
  });
});
`;
    fs.writeFileSync(path.join(srcDir, 'App.spec.tsx'), appSpecTsx);
  }

  console.log(`✓ Scaffolded ${REMOTES.length} independent remotes (storefront, checkout, account)`);
}

if (process.argv[1] && process.argv[1].endsWith('generate-remotes.js')) {
  generateRemotes();
}
