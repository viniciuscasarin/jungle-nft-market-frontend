import fs from 'node:fs';
import path from 'node:path';
import { describe, it, expect } from 'vitest';

export function findHexColorViolations(dir: string, allowedExtensions = ['.ts', '.tsx']) {
  const violations: { file: string; line: number; match: string; lineContent: string }[] = [];
  const hexRegex = /#[0-9a-fA-F]{3,8}\b/g;

  function scan(currentDir: string) {
    if (!fs.existsSync(currentDir)) return;
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      if (entry.isDirectory()) {
        // Skip styles directory where theme.css lives, node_modules, and test directories
        if (entry.name === 'styles' || entry.name === '__tests__' || entry.name === 'node_modules') continue;
        scan(fullPath);
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name);
        if (!allowedExtensions.includes(ext)) continue;
        // Skip test files, spec files, stories
        if (
          entry.name.includes('.spec.') ||
          entry.name.includes('.test.') ||
          entry.name.includes('.stories.')
        ) {
          continue;
        }

        const content = fs.readFileSync(fullPath, 'utf-8');
        const lines = content.split('\n');
        lines.forEach((line, index) => {
          const trimmed = line.trim();
          if (trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*')) return;

          const matches = line.match(hexRegex);
          if (matches) {
            matches.forEach((match) => {
              violations.push({
                file: path.relative(dir, fullPath),
                line: index + 1,
                match,
                lineContent: trimmed,
              });
            });
          }
        });
      }
    }
  }

  scan(dir);
  return violations;
}

export function detectHexInCode(code: string): string[] {
  const hexRegex = /#[0-9a-fA-F]{3,8}\b/g;
  const lines = code.split('\n');
  const found: string[] = [];
  lines.forEach((line) => {
    const trimmed = line.trim();
    if (trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*')) return;
    const matches = line.match(hexRegex);
    if (matches) {
      found.push(...matches);
    }
  });
  return found;
}

describe('Design Tokens Integrity in @nft/shared-ui', () => {
  it('should not contain any literal hex colors in UI component source code', () => {
    const srcDir = path.resolve(__dirname);
    const violations = findHexColorViolations(srcDir);
    expect(violations).toEqual([]);
  });

  it('should detect when a component declares a forbidden hex color', () => {
    const invalidComponentCode = `
      export function BadButton() {
        return <button style={{ backgroundColor: '#ff0000' }}>Click</button>;
      }
    `;
    const violations = detectHexInCode(invalidComponentCode);
    expect(violations).toContain('#ff0000');
  });

  it('should verify theme.css contains all critical design tokens and semantic variables', () => {
    const themeCssPath = path.resolve(__dirname, 'styles', 'theme.css');
    expect(fs.existsSync(themeCssPath)).toBe(true);

    const themeContent = fs.readFileSync(themeCssPath, 'utf-8');
    expect(themeContent).toContain('--color-ink: #140d0a;');
    expect(themeContent).toContain('--color-primary: #d28a4c;');
    expect(themeContent).toContain('--color-accent: #e89b55;');
    expect(themeContent).toContain('--color-muted: #b39463;');
    expect(themeContent).toContain('--color-border-accessible: #8a583e;');
    expect(themeContent).toContain('--breakpoint-mobile: 390px;');
    expect(themeContent).toContain('--breakpoint-tablet: 768px;');
    expect(themeContent).toContain('--breakpoint-desktop: 1440px;');
  });
});
