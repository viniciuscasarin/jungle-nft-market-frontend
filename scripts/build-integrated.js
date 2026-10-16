import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const rootDir = process.cwd();
const integratedDir = path.join(rootDir, 'dist', 'integrated');

console.log('🚀 Iniciando processo de build consolidado...');

// 1. Executa a compilação ordenada: remotes primeiro, depois host shell
if (!process.argv.includes('--skip-nx')) {
  console.log('📦 Compilando remotes (storefront, checkout, account)...');
  execSync('npx nx run-many -t build -p storefront checkout account', { stdio: 'inherit' });

  console.log('📦 Compilando host (shell)...');
  execSync('npx nx run shell:build', { stdio: 'inherit' });
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

// 4. Garante que mockServiceWorker.js esteja presente na raiz de dist/integrated
const swIntegratedPath = path.join(integratedDir, 'mockServiceWorker.js');
if (!fs.existsSync(swIntegratedPath)) {
  const sourceSw = path.join(rootDir, 'apps', 'shell', 'public', 'mockServiceWorker.js');
  if (fs.existsSync(sourceSw)) {
    console.log('🛡️ Copiando mockServiceWorker.js para a raiz de dist/integrated...');
    fs.copyFileSync(sourceSw, swIntegratedPath);
  } else {
    console.error(`❌ mockServiceWorker.js não encontrado em: ${sourceSw}`);
    process.exit(1);
  }
}

// 5. Copia os remotes para dist/integrated/remotes/<app>
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

// 6. Copia o Storybook para dist/integrated/storybook se existir (desacoplado)
const storybookDist = path.join(rootDir, 'dist', 'apps', 'storybook');
const storybookTargetDir = path.join(integratedDir, 'storybook');

if (fs.existsSync(storybookDist)) {
  console.log('📚 Copiando Storybook existente para dist/integrated/storybook...');
  fs.mkdirSync(storybookTargetDir, { recursive: true });
  fs.cpSync(storybookDist, storybookTargetDir, { recursive: true });
} else {
  console.log('ℹ️ Storybook não compilado previamente. Prosseguindo sem Storybook (build padrão desacoplado).');
}

// 7. Validação estrita de integridade dos artefatos essenciais
console.log('🔍 Validando integridade dos artefatos em dist/integrated...');

const essentialFiles = [
  path.join(integratedDir, 'index.html'),
  path.join(integratedDir, 'mockServiceWorker.js'),
  path.join(remotesTargetDir, 'storefront', 'remoteEntry.js'),
  path.join(remotesTargetDir, 'checkout', 'remoteEntry.js'),
  path.join(remotesTargetDir, 'account', 'remoteEntry.js'),
];

for (const filePath of essentialFiles) {
  if (!fs.existsSync(filePath)) {
    console.error(`❌ Falha de integridade: Arquivo essencial não encontrado: ${filePath}`);
    process.exit(1);
  }
}

console.log('✅ Build consolidado concluído com sucesso e integridade verificada!');
console.log(`📁 Estrutura gerada em: ${integratedDir}`);
