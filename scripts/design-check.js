import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DEFAULT_ROOT = path.resolve(__dirname, '..');

export const LeafTokenSchema = z.object({
  value: z.string().min(1, 'Token value must not be empty'),
  nodeId: z.string().min(1, 'Token nodeId must not be empty'),
  description: z.string().min(1, 'Token description must not be empty')
});

export const AssetSchema = z.object({
  id: z.string().min(1, 'Asset id is required'),
  nodeId: z.string().min(1, 'Asset nodeId is required'),
  path: z.string().min(1, 'Asset path is required'),
  format: z.enum(['svg', 'png', 'jpg', 'jpeg', 'webp', 'gif']),
  dimensions: z.object({
    width: z.number().positive('Asset width must be positive'),
    height: z.number().positive('Asset height must be positive')
  }),
  usage: z.string().min(1, 'Asset usage description is required'),
  alt: z.string().min(1, 'Asset alt text is required')
});

export const ManifestSchema = z.object({
  metadata: z.object({
    source: z.string().min(1),
    fileKey: z.string().min(1),
    extractedAt: z.string().min(1),
    totalAssets: z.number().int().positive()
  }),
  assets: z.array(AssetSchema).min(1, 'Manifest must contain at least one asset')
});

export function validateTokens(tokensData) {
  const errors = [];
  let tokenCount = 0;

  if (!tokensData || typeof tokensData !== 'object') {
    return { valid: false, count: 0, errors: ['Tokens data must be a valid JSON object'] };
  }

  const requiredCategories = ['color', 'typography', 'space', 'radius', 'shadow'];
  for (const cat of requiredCategories) {
    if (!tokensData[cat] || typeof tokensData[cat] !== 'object') {
      errors.push(`Missing required top-level category: "${cat}"`);
    }
  }

  function walk(node, currentPath = []) {
    if (!node || typeof node !== 'object') return;
    if (currentPath[0] === '$schema' || currentPath[0] === 'metadata') return;

    if ('value' in node || 'nodeId' in node || 'description' in node) {
      const result = LeafTokenSchema.safeParse(node);
      if (!result.success) {
        errors.push(`Invalid token at ${currentPath.join('.')}: ${result.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join(', ')}`);
      } else {
        tokenCount++;
      }
      return;
    }

    for (const [key, child] of Object.entries(node)) {
      walk(child, [...currentPath, key]);
    }
  }

  walk(tokensData);
  return { valid: errors.length === 0, count: tokenCount, errors };
}

export function validateManifest(manifestData) {
  const parsed = ManifestSchema.safeParse(manifestData);
  if (!parsed.success) {
    return {
      valid: false,
      count: 0,
      errors: parsed.error.issues.map(i => `${i.path.join('.')}: ${i.message}`)
    };
  }
  return { valid: true, count: manifestData.assets.length, errors: [] };
}

export function validateAssetFiles(manifestData, assetsDir) {
  const errors = [];
  if (!manifestData || !Array.isArray(manifestData.assets)) {
    return { valid: false, errors: ['No assets array to check'] };
  }

  for (const asset of manifestData.assets) {
    const fullPath = path.resolve(assetsDir, asset.path);
    if (!fs.existsSync(fullPath)) {
      errors.push(`Missing asset on disk: ${asset.path} (nodeId: ${asset.nodeId})`);
    } else {
      const stats = fs.statSync(fullPath);
      if (stats.size === 0) {
        errors.push(`Empty asset file: ${asset.path} (nodeId: ${asset.nodeId})`);
      }
    }
  }

  return { valid: errors.length === 0, errors };
}

export function validateFontFiles(fontsDir) {
  const errors = [];
  const requiredFonts = ['roboto-mono-400.woff2', 'roboto-mono-500.woff2', 'roboto-mono-700.woff2'];

  for (const font of requiredFonts) {
    const fullPath = path.resolve(fontsDir, font);
    if (!fs.existsSync(fullPath)) {
      errors.push(`Missing required self-hosted font: ${font}`);
    } else {
      const stats = fs.statSync(fullPath);
      if (stats.size === 0) {
        errors.push(`Empty font file: ${font}`);
      }
    }
  }

  return { valid: errors.length === 0, errors };
}

export function runDesignCheck({ rootDir = DEFAULT_ROOT } = {}) {
  const allErrors = [];
  const tokensPath = path.resolve(rootDir, 'design', 'tokens', 'tokens.json');
  const manifestPath = path.resolve(rootDir, 'design', 'assets', 'manifest.json');
  const assetsDir = path.resolve(rootDir, 'design', 'assets');
  const fontsDir = path.resolve(rootDir, 'design', 'fonts');

  let tokensCount = 0;
  let assetsCount = 0;

  // 1. Check tokens.json
  if (!fs.existsSync(tokensPath)) {
    allErrors.push(`Tokens file not found at: ${tokensPath}`);
  } else {
    try {
      const tokensContent = JSON.parse(fs.readFileSync(tokensPath, 'utf-8'));
      const tokensValidation = validateTokens(tokensContent);
      tokensCount = tokensValidation.count;
      if (!tokensValidation.valid) {
        allErrors.push(...tokensValidation.errors);
      }
    } catch (err) {
      allErrors.push(`Failed to parse tokens.json: ${err.message}`);
    }
  }

  // 2. Check manifest.json
  if (!fs.existsSync(manifestPath)) {
    allErrors.push(`Manifest file not found at: ${manifestPath}`);
  } else {
    try {
      const manifestContent = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
      const manifestValidation = validateManifest(manifestContent);
      assetsCount = manifestValidation.count;
      if (!manifestValidation.valid) {
        allErrors.push(...manifestValidation.errors);
      } else {
        // 3. Verify asset files existence on disk
        const assetFilesValidation = validateAssetFiles(manifestContent, assetsDir);
        if (!assetFilesValidation.valid) {
          allErrors.push(...assetFilesValidation.errors);
        }
      }
    } catch (err) {
      allErrors.push(`Failed to parse manifest.json: ${err.message}`);
    }
  }

  // 4. Verify fonts
  const fontsValidation = validateFontFiles(fontsDir);
  if (!fontsValidation.valid) {
    allErrors.push(...fontsValidation.errors);
  }

  return {
    success: allErrors.length === 0,
    errors: allErrors,
    summary: {
      tokensCount,
      assetsCount,
      fontsCount: 3
    }
  };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  console.log('--- Verificando integridade dos tokens, assets e fontes do Figma ---');
  const result = runDesignCheck();

  if (result.success) {
    console.log(`[OK] Tokens validados: ${result.summary.tokensCount} tokens semânticos com nodeId`);
    console.log(`[OK] Ativos validados: ${result.summary.assetsCount} arquivos (SVGs e PNGs) presentes em disco`);
    console.log(`[OK] Fontes validadas: ${result.summary.fontsCount} arquivos WOFF2 self-hosted`);
    console.log('Design check passou com sucesso! Zero dependências externas.');
    process.exit(0);
  } else {
    console.error(`[FALHA] Foram encontrados ${result.errors.length} erros no design check:`);
    result.errors.forEach((err, idx) => {
      console.error(`  ${idx + 1}. ${err}`);
    });
    process.exit(1);
  }
}
