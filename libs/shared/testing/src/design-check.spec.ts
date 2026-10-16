import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { pathToFileURL } from 'node:url';
import { describe, it, expect, beforeAll } from 'vitest';

interface TokenValidationResult {
  valid: boolean;
  count: number;
  errors: string[];
}

interface ManifestValidationResult {
  valid: boolean;
  count: number;
  errors: string[];
}

interface FileValidationResult {
  valid: boolean;
  errors: string[];
}

interface CheckResult {
  success: boolean;
  summary: {
    tokensCount: number;
    assetsCount: number;
    fontsCount: number;
  };
  errors: string[];
}

let validateTokens: (tokens: unknown) => TokenValidationResult;
let validateManifest: (manifest: unknown) => ManifestValidationResult;
let validateAssetFiles: (manifest: unknown, assetsDir: string) => FileValidationResult;
let validateFontFiles: (fontsDir: string) => FileValidationResult;
let runDesignCheck: (options?: { rootDir?: string }) => CheckResult;

describe('Design Verification Suite (design-check.js)', () => {
  const rootDir = path.resolve(__dirname, '../../../../');

  beforeAll(async () => {
    const scriptPath = path.resolve(rootDir, 'scripts/design-check.js');
    const mod = await import(pathToFileURL(scriptPath).href);
    validateTokens = mod.validateTokens;
    validateManifest = mod.validateManifest;
    validateAssetFiles = mod.validateAssetFiles;
    validateFontFiles = mod.validateFontFiles;
    runDesignCheck = mod.runDesignCheck;
  });

  describe('Cenários de Sucesso com Artefatos Atuais', () => {
    it('valida tokens.json com sucesso, confirmando presença de nodeId em todos os tokens', () => {
      const tokensContent = JSON.parse(
        fs.readFileSync(path.join(rootDir, 'design', 'tokens', 'tokens.json'), 'utf-8')
      );
      const result = validateTokens(tokensContent);

      expect(result.valid).toBe(true);
      expect(result.count).toBeGreaterThan(50);
      expect(result.errors).toHaveLength(0);
    });

    it('valida manifest.json com schema estrito de 35 ativos', () => {
      const manifestContent = JSON.parse(
        fs.readFileSync(path.join(rootDir, 'design', 'assets', 'manifest.json'), 'utf-8')
      );
      const result = validateManifest(manifestContent);

      expect(result.valid).toBe(true);
      expect(result.count).toBe(35);
      expect(result.errors).toHaveLength(0);
    });

    it('confirma a existência física e tamanho de todos os 35 ativos em design/assets/', () => {
      const manifestContent = JSON.parse(
        fs.readFileSync(path.join(rootDir, 'design', 'assets', 'manifest.json'), 'utf-8')
      );
      const assetsDir = path.join(rootDir, 'design', 'assets');
      const result = validateAssetFiles(manifestContent, assetsDir);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('confirma a presença dos arquivos de fonte Roboto Mono self-hosted (400, 500, 700)', () => {
      const fontsDir = path.join(rootDir, 'design', 'fonts');
      const result = validateFontFiles(fontsDir);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('executa runDesignCheck com código e status de sucesso completo', () => {
      const result = runDesignCheck({ rootDir });

      expect(result.success).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.summary.tokensCount).toBeGreaterThan(50);
      expect(result.summary.assetsCount).toBe(35);
      expect(result.summary.fontsCount).toBe(3);
    });
  });

  describe('Cenários de Falha e Validação de Invariantes', () => {
    it('falha quando um token não possui nodeId', () => {
      const invalidTokens = {
        color: {
          surface: {
            default: {
              value: '#140d0a',
              // nodeId ausente intencionalmente
              description: 'Token inválido sem nodeId'
            }
          }
        },
        typography: {},
        space: {},
        radius: {},
        shadow: {}
      };

      const result = validateTokens(invalidTokens);
      expect(result.valid).toBe(false);
      expect(result.errors.some(err => err.includes('nodeId'))).toBe(true);
    });

    it('falha quando uma categoria obrigatória está ausente nos tokens', () => {
      const missingCategoryTokens = {
        color: {},
        typography: {},
        // space ausente
        radius: {},
        shadow: {}
      };

      const result = validateTokens(missingCategoryTokens);
      expect(result.valid).toBe(false);
      expect(result.errors.some(err => err.includes('Missing required top-level category: "space"'))).toBe(true);
    });

    it('falha quando um ativo no manifesto possui formato inválido', () => {
      const invalidManifest = {
        metadata: {
          source: 'test',
          fileKey: 'test',
          extractedAt: '2026-10-15T00:00:00Z',
          totalAssets: 1
        },
        assets: [
          {
            id: 'invalid-asset',
            nodeId: '1:1',
            path: 'icons/test.bmp',
            format: 'bmp', // formato não suportado pelo enum
            dimensions: { width: 10, height: 10 },
            usage: 'Test usage',
            alt: 'Test alt'
          }
        ]
      };

      const result = validateManifest(invalidManifest);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('falha quando um ativo declarado no manifesto não existe fisicamente em disco', () => {
      const mockManifest = {
        metadata: {
          source: 'test',
          fileKey: 'test',
          extractedAt: '2026-10-15T00:00:00Z',
          totalAssets: 1
        },
        assets: [
          {
            id: 'non-existent-asset',
            nodeId: '999:999',
            path: 'icons/does-not-exist.svg',
            format: 'svg',
            dimensions: { width: 24, height: 24 },
            usage: 'Non existent',
            alt: 'Non existent'
          }
        ]
      };

      const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'nft-design-test-'));
      try {
        const result = validateAssetFiles(mockManifest, tempDir);
        expect(result.valid).toBe(false);
        expect(result.errors[0]).toContain('Missing asset on disk: icons/does-not-exist.svg');
      } finally {
        fs.rmSync(tempDir, { recursive: true, force: true });
      }
    });

    it('falha quando um arquivo de ativo existe em disco mas está vazio (0 bytes)', () => {
      const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'nft-design-test-empty-'));
      const emptyFilePath = path.join(tempDir, 'empty.svg');
      fs.writeFileSync(emptyFilePath, ''); // 0 bytes

      const mockManifest = {
        metadata: {
          source: 'test',
          fileKey: 'test',
          extractedAt: '2026-10-15T00:00:00Z',
          totalAssets: 1
        },
        assets: [
          {
            id: 'empty-asset',
            nodeId: '888:888',
            path: 'empty.svg',
            format: 'svg',
            dimensions: { width: 24, height: 24 },
            usage: 'Empty asset',
            alt: 'Empty asset'
          }
        ]
      };

      try {
        const result = validateAssetFiles(mockManifest, tempDir);
        expect(result.valid).toBe(false);
        expect(result.errors[0]).toContain('Empty asset file: empty.svg');
      } finally {
        fs.rmSync(tempDir, { recursive: true, force: true });
      }
    });
  });
});
