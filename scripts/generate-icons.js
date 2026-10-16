import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DEFAULT_ROOT = path.resolve(__dirname, '..');

// Helper to convert kebab-case or snake_case to PascalCase
export function toPascalCase(str) {
  return str
    .replace(/^icon[-_]/i, '')
    .split(/[-_]/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('');
}

// Convert HTML/SVG attributes to JSX props
export function svgToJsxAttributes(svgString) {
  return svgString
    .replace(/stroke-width=/g, 'strokeWidth=')
    .replace(/stroke-linecap=/g, 'strokeLinecap=')
    .replace(/stroke-linejoin=/g, 'strokeLinejoin=')
    .replace(/stroke-miterlimit=/g, 'strokeMiterlimit=')
    .replace(/stroke-dasharray=/g, 'strokeDasharray=')
    .replace(/stroke-dashoffset=/g, 'strokeDashoffset=')
    .replace(/stroke-opacity=/g, 'strokeOpacity=')
    .replace(/fill-rule=/g, 'fillRule=')
    .replace(/clip-rule=/g, 'clipRule=')
    .replace(/fill-opacity=/g, 'fillOpacity=')
    .replace(/clip-path=/g, 'clipPath=')
    .replace(/stop-color=/g, 'stopColor=')
    .replace(/stop-opacity=/g, 'stopOpacity=')
    .replace(/font-family=/g, 'fontFamily=')
    .replace(/font-size=/g, 'fontSize=')
    .replace(/font-weight=/g, 'fontWeight=')
    .replace(/letter-spacing=/g, 'letterSpacing=')
    .replace(/#[0-9a-fA-F]{3,8}/g, 'currentColor');
}

// Additional 17 icons essential for design system and marketplace UI
export const ADDITIONAL_ICONS = [
  {
    name: 'IconStar',
    width: 24,
    height: 24,
    viewBox: '0 0 24 24',
    content: '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />'
  },
  {
    name: 'IconStarFilled',
    width: 24,
    height: 24,
    viewBox: '0 0 24 24',
    content: '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" fill="currentColor" />'
  },
  {
    name: 'IconHeart',
    width: 24,
    height: 24,
    viewBox: '0 0 24 24',
    content: '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />'
  },
  {
    name: 'IconHeartFilled',
    width: 24,
    height: 24,
    viewBox: '0 0 24 24',
    content: '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" fill="currentColor" />'
  },
  {
    name: 'IconFilter',
    width: 20,
    height: 20,
    viewBox: '0 0 24 24',
    content: '<polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />'
  },
  {
    name: 'IconSliders',
    width: 20,
    height: 20,
    viewBox: '0 0 24 24',
    content: '<line x1="4" x2="4" y1="21" y2="14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /><line x1="4" x2="4" y1="10" y2="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /><line x1="12" x2="12" y1="21" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /><line x1="12" x2="12" y1="8" y2="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /><line x1="20" x2="20" y1="21" y2="16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /><line x1="20" x2="20" y1="12" y2="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /><line x1="1" x2="7" y1="14" y2="14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /><line x1="9" x2="15" y1="8" y2="8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /><line x1="17" x2="23" y1="16" y2="16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />'
  },
  {
    name: 'IconPlus',
    width: 16,
    height: 16,
    viewBox: '0 0 24 24',
    content: '<path d="M5 12h14M12 5v14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />'
  },
  {
    name: 'IconMinus',
    width: 16,
    height: 16,
    viewBox: '0 0 24 24',
    content: '<path d="M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />'
  },
  {
    name: 'IconCopy',
    width: 16,
    height: 16,
    viewBox: '0 0 24 24',
    content: '<rect width="14" height="14" x="8" y="8" rx="2" ry="2" stroke="currentColor" strokeWidth="2" fill="none" /><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" stroke="currentColor" strokeWidth="2" fill="none" />'
  },
  {
    name: 'IconCheck',
    width: 16,
    height: 16,
    viewBox: '0 0 24 24',
    content: '<path d="M20 6 9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />'
  },
  {
    name: 'IconCheckCircle',
    width: 20,
    height: 20,
    viewBox: '0 0 24 24',
    content: '<circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" /><path d="m9 12 2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />'
  },
  {
    name: 'IconAlertCircle',
    width: 20,
    height: 20,
    viewBox: '0 0 24 24',
    content: '<circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" /><line x1="12" x2="12" y1="8" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /><line x1="12" x2="12.01" y1="16" y2="16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />'
  },
  {
    name: 'IconInfo',
    width: 20,
    height: 20,
    viewBox: '0 0 24 24',
    content: '<circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" /><path d="M12 16v-4M12 8h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />'
  },
  {
    name: 'IconMenu',
    width: 24,
    height: 24,
    viewBox: '0 0 24 24',
    content: '<line x1="4" x2="20" y1="12" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /><line x1="4" x2="20" y1="6" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /><line x1="4" x2="20" y1="18" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />'
  },
  {
    name: 'IconUser',
    width: 24,
    height: 24,
    viewBox: '0 0 24 24',
    content: '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" /><circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" fill="none" />'
  },
  {
    name: 'IconGrid',
    width: 20,
    height: 20,
    viewBox: '0 0 24 24',
    content: '<rect width="7" height="7" x="3" y="3" rx="1" stroke="currentColor" strokeWidth="2" fill="none" /><rect width="7" height="7" x="14" y="3" rx="1" stroke="currentColor" strokeWidth="2" fill="none" /><rect width="7" height="7" x="14" y="14" rx="1" stroke="currentColor" strokeWidth="2" fill="none" /><rect width="7" height="7" x="3" y="14" rx="1" stroke="currentColor" strokeWidth="2" fill="none" />'
  },
  {
    name: 'IconExternalLink',
    width: 16,
    height: 16,
    viewBox: '0 0 24 24',
    content: '<path d="M15 3h6v6M10 14 21 3M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />'
  }
];

export function generateIconComponent({ name, width, height, viewBox, content }) {
  return `import type { IconProps } from './types';

export function ${name}({ title, size, width = ${width}, height = ${height}, className, ...props }: IconProps) {
  const isAriaHidden = !title;
  return (
    <svg
      width={size ?? width}
      height={size ?? height}
      viewBox="${viewBox}"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...(isAriaHidden ? { 'aria-hidden': 'true' } : { role: 'img' })}
      {...props}
    >
      {title && <title>{title}</title>}
      ${content}
    </svg>
  );
}
`;
}

export function generateIcons({ rootDir = DEFAULT_ROOT } = {}) {
  const manifestPath = path.resolve(rootDir, 'design', 'assets', 'manifest.json');
  const iconsDir = path.resolve(rootDir, 'design', 'assets');
  const outDir = path.resolve(rootDir, 'libs', 'shared', 'ui', 'src', 'icons');

  if (!fs.existsSync(manifestPath)) {
    throw new Error(`Manifest file not found at ${manifestPath}`);
  }

  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
  fs.mkdirSync(outDir, { recursive: true });

  // 1. Generate types.ts
  const typesContent = `import type { SVGProps } from 'react';

export interface IconProps extends SVGProps<SVGSVGElement> {
  size?: number | string;
  title?: string;
  className?: string;
}
`;
  fs.writeFileSync(path.resolve(outDir, 'types.ts'), typesContent, 'utf-8');

  const generatedIcons = [];

  // 2. Process SVG icons from manifest
  const svgAssets = manifest.assets.filter((a) => a.format === 'svg');
  for (const asset of svgAssets) {
    const filePath = path.resolve(iconsDir, asset.path);
    if (!fs.existsSync(filePath)) {
      console.warn(`Warning: Missing asset at ${filePath}`);
      continue;
    }

    const rawSvg = fs.readFileSync(filePath, 'utf-8');

    // Extract viewBox
    const viewBoxMatch = rawSvg.match(/viewBox="([^"]+)"/);
    const viewBox = viewBoxMatch ? viewBoxMatch[1] : `0 0 ${asset.dimensions.width} ${asset.dimensions.height}`;

    // Extract inside of <svg ...> ... </svg>
    const innerContentMatch = rawSvg.match(/<svg[^>]*>([\s\S]*?)<\/svg>/);
    let innerContent = innerContentMatch ? innerContentMatch[1].trim() : '';

    // Convert attributes to JSX and replace literal hex codes with currentColor
    innerContent = svgToJsxAttributes(innerContent);

    const componentName = `Icon${toPascalCase(asset.id)}`;
    const componentCode = generateIconComponent({
      name: componentName,
      width: asset.dimensions.width,
      height: asset.dimensions.height,
      viewBox,
      content: innerContent
    });

    fs.writeFileSync(path.resolve(outDir, `${componentName}.tsx`), componentCode, 'utf-8');
    generatedIcons.push(componentName);
  }

  // 3. Process additional icons
  for (const addIcon of ADDITIONAL_ICONS) {
    const componentCode = generateIconComponent({
      name: addIcon.name,
      width: addIcon.width,
      height: addIcon.height,
      viewBox: addIcon.viewBox,
      content: addIcon.content
    });

    fs.writeFileSync(path.resolve(outDir, `${addIcon.name}.tsx`), componentCode, 'utf-8');
    generatedIcons.push(addIcon.name);
  }

  // 4. Generate index.ts exporting all icon components and types
  const exportLines = [
    "/* Auto-generated by scripts/generate-icons.js - DO NOT EDIT MANUALLY */",
    "export * from './types';",
    ...generatedIcons.map((name) => `export { ${name} } from './${name}';`),
    ''
  ];
  fs.writeFileSync(path.resolve(outDir, 'index.ts'), exportLines.join('\n'), 'utf-8');

  return { total: generatedIcons.length, icons: generatedIcons };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  console.log('Gerando componentes de ícones React nomeados individuais...');
  const result = generateIcons();
  console.log(`[OK] ${result.total} ícones gerados com sucesso em libs/shared/ui/src/icons/`);
}
