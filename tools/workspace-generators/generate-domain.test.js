import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { generateDomainLibraries, LAYERS } from './generate-domain.js';

describe('Domain Libraries Generator', () => {
  let tempDir;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'nft-domain-gen-'));
  });

  afterEach(() => {
    if (tempDir && fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it('scaffolds all 4 standard layers for a domain with correct files and tags', () => {
    const domain = 'catalog';
    const domainBaseDir = path.join(tempDir, 'libs', domain);

    const generated = generateDomainLibraries(domain, { baseDir: domainBaseDir });

    expect(generated).toHaveLength(4);

    for (const layer of LAYERS) {
      const layerDir = path.join(domainBaseDir, layer);
      expect(fs.existsSync(layerDir)).toBe(true);

      // Check project.json
      const projectJsonPath = path.join(layerDir, 'project.json');
      expect(fs.existsSync(projectJsonPath)).toBe(true);
      const projectJson = JSON.parse(fs.readFileSync(projectJsonPath, 'utf-8'));
      expect(projectJson.name).toBe(`${domain}-${layer}`);
      expect(projectJson.tags).toEqual([
        `scope:${domain}`,
        `type:${layer}`,
        'flow:storefront',
      ]);
      expect(projectJson.targets).toHaveProperty('lint');
      expect(projectJson.targets).toHaveProperty('test');
      expect(projectJson.targets).toHaveProperty('typecheck');

      // Check tsconfig.json
      const tsconfigPath = path.join(layerDir, 'tsconfig.json');
      expect(fs.existsSync(tsconfigPath)).toBe(true);
      const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, 'utf-8'));
      expect(tsconfig.extends).toBe('../../../tsconfig.base.json');

      // Check tsconfig.spec.json
      const tsconfigSpecPath = path.join(layerDir, 'tsconfig.spec.json');
      expect(fs.existsSync(tsconfigSpecPath)).toBe(true);

      // Check vite.config.ts
      const viteConfigPath = path.join(layerDir, 'vite.config.ts');
      expect(fs.existsSync(viteConfigPath)).toBe(true);

      // Check src/index.ts
      const indexPath = path.join(layerDir, 'src', 'index.ts');
      expect(fs.existsSync(indexPath)).toBe(true);
      const indexContent = fs.readFileSync(indexPath, 'utf-8');
      expect(indexContent).toContain(`@nft/${domain}-${layer}`);
    }
  });

  it('correctly sets split flow tags for domains with shared and flow-specific layers (e.g. cart)', () => {
    const domain = 'cart';
    const domainBaseDir = path.join(tempDir, 'libs', domain);

    generateDomainLibraries(domain, { baseDir: domainBaseDir });

    // domain and data-access should have flow:shared
    const domainProject = JSON.parse(
      fs.readFileSync(path.join(domainBaseDir, 'domain', 'project.json'), 'utf-8'),
    );
    expect(domainProject.tags).toContain('flow:shared');

    const dataAccessProject = JSON.parse(
      fs.readFileSync(path.join(domainBaseDir, 'data-access', 'project.json'), 'utf-8'),
    );
    expect(dataAccessProject.tags).toContain('flow:shared');

    // feature and ui should have flow:checkout
    const featureProject = JSON.parse(
      fs.readFileSync(path.join(domainBaseDir, 'feature', 'project.json'), 'utf-8'),
    );
    expect(featureProject.tags).toContain('flow:checkout');

    const uiProject = JSON.parse(
      fs.readFileSync(path.join(domainBaseDir, 'ui', 'project.json'), 'utf-8'),
    );
    expect(uiProject.tags).toContain('flow:checkout');
  });
});
