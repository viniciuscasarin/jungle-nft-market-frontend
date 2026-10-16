import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const rootDir = process.cwd();
const integratedDir = path.join(rootDir, 'dist', 'integrated');

console.log('🚀 Iniciando processo de build consolidado...');

// 1. Executa o build de todos os apps pelo Nx (a menos que explicitamente pulado)
if (!process.argv.includes('--skip-nx')) {
  console.log('📦 Compilando aplicações via Nx...');
  execSync('npx nx run-many -t build', { stdio: 'inherit' });
}

// 2. Prepara o diretório dist/integrated
console.log('🧹 Limpando e preparando diretório dist/integrated...');
if (fs.existsSync(integratedDir)) {
  fs.rmSync(integratedDir, { recursive: true, force: true });
}
fs.mkdirSync(integratedDir, { recursive: true });

// 3. Copia o host (apps/shell) para a raiz de dist/integrated
const shellDist = path.join(rootDir, 'dist', 'apps', 'shell');
if (!fs.existsSync(shellDist)) {
  console.error(`❌ Diretório de build do shell não encontrado: ${shellDist}`);
  process.exit(1);
}

console.log('📄 Copiando apps/shell para a raiz de dist/integrated...');
fs.cpSync(shellDist, integratedDir, { recursive: true });

// 4. Copia os remotes para dist/integrated/remotes/<app>
const remotes = ['storefront', 'checkout', 'account'];
const remotesTargetDir = path.join(integratedDir, 'remotes');
fs.mkdirSync(remotesTargetDir, { recursive: true });

for (const remote of remotes) {
  const remoteDist = path.join(rootDir, 'dist', 'apps', remote);
  const targetDir = path.join(remotesTargetDir, remote);

  if (!fs.existsSync(remoteDist)) {
    console.error(`❌ Diretório de build do remote ${remote} não encontrado: ${remoteDist}`);
    process.exit(1);
  }

  console.log(`📦 Copiando apps/${remote} para dist/integrated/remotes/${remote}...`);
  fs.mkdirSync(targetDir, { recursive: true });
  fs.cpSync(remoteDist, targetDir, { recursive: true });
}

// 5. Copia o Storybook para dist/integrated/storybook
const storybookDist = path.join(rootDir, 'dist', 'apps', 'storybook');
const storybookTargetDir = path.join(integratedDir, 'storybook');

if (!fs.existsSync(storybookDist)) {
  console.log('📚 Compilando Storybook...');
  execSync('pnpm build:storybook', { stdio: 'inherit' });
}

if (fs.existsSync(storybookDist)) {
  console.log('📚 Copiando apps/storybook para dist/integrated/storybook...');
  fs.mkdirSync(storybookTargetDir, { recursive: true });
  fs.cpSync(storybookDist, storybookTargetDir, { recursive: true });
} else {
  console.error(`❌ Diretório de build do Storybook não encontrado: ${storybookDist}`);
  process.exit(1);
}

console.log('✅ Build consolidado concluído com sucesso!');
console.log(`📁 Estrutura gerada em: ${integratedDir}`);
