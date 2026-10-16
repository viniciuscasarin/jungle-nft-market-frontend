import fs from 'node:fs';
import path from 'node:path';
import { describe, it, expect } from 'vitest';

describe('Self-Hosted Typography (Roboto Mono)', () => {
  it('should define self-hosted Roboto Mono 400, 500, and 700 with font-display: swap in fonts.css', () => {
    const fontsCssPath = path.resolve(__dirname, 'styles', 'fonts.css');
    expect(fs.existsSync(fontsCssPath)).toBe(true);

    const fontsCss = fs.readFileSync(fontsCssPath, 'utf-8');
    expect(fontsCss).toContain("font-family: 'Roboto Mono'");
    expect(fontsCss).toContain('font-weight: 400');
    expect(fontsCss).toContain('font-weight: 500');
    expect(fontsCss).toContain('font-weight: 700');
    expect(fontsCss).toContain('font-display: swap');

    // Verify zero external network requests/URLs
    expect(fontsCss).not.toContain('http://');
    expect(fontsCss).not.toContain('https://');
    expect(fontsCss).not.toContain('googleapis.com');
    expect(fontsCss).not.toContain('gstatic.com');
  });

  it('should include critical font preload tags in apps/shell/index.html with zero external fonts', () => {
    const indexPath = path.resolve(__dirname, '../../../../apps/shell/index.html');
    expect(fs.existsSync(indexPath)).toBe(true);

    const htmlContent = fs.readFileSync(indexPath, 'utf-8');
    expect(htmlContent).toContain('rel="preload"');
    expect(htmlContent).toContain('roboto-mono-400.woff2');
    expect(htmlContent).toContain('as="font"');
    expect(htmlContent).toContain('type="font/woff2"');
    expect(htmlContent).toContain('crossorigin');

    // No external Google fonts or CDN links
    expect(htmlContent).not.toContain('fonts.googleapis.com');
    expect(htmlContent).not.toContain('fonts.gstatic.com');
  });
});
