# Fontes Self-Hosted e Escala Tipográfica Consolidada

Este diretório contém os binários da família tipográfica **Roboto Mono** em formato WOFF2 para distribuição 100% autônoma e self-hosted, em conformidade com as diretrizes do desafio e os requisitos de determinismo para CI.

## 1. Arquivos de Fonte em Disco

| Arquivo | Peso | Estilo | Formato | Tamanho (bytes) | Origem / Licença |
|---|---|---|---|---|---|
| `roboto-mono-400.woff2` | 400 (Regular) | Normal | WOFF2 | 13.732 | Apache License 2.0 (Google Fonts / Roboto Mono) |
| `roboto-mono-500.woff2` | 500 (Medium) | Normal | WOFF2 | 14.056 | Apache License 2.0 (Google Fonts / Roboto Mono) |
| `roboto-mono-700.woff2` | 700 (Bold) | Normal | WOFF2 | 13.916 | Apache License 2.0 (Google Fonts / Roboto Mono) |

---

## 2. Escala Tipográfica Consolidada

O design do Figma utiliza tamanhos tipográficos entre 9px e 43px. A escala foi mapeada e consolidada para fornecer consistência ao design system em `libs/shared/ui`:

| Nível Semântico | Tamanho (px) | Line Height | Peso Padrão | Estilos no Figma | Uso Principal |
|---|---|---|---|---|---|
| `display` | 43px | 70px | 700 (Bold) | `Display/43 Bold` | Título principal da Hero |
| `heading-lg` | 28px | 36px | 700 (Bold) | `Blog Section Header` | Títulos de seções amplas (Blog) |
| `heading-md` | 24px | 32px | 700 (Bold) | `Heading/24 Bold` | Títulos de modais e cabeçalhos de tela |
| `title` | 20px | 26px | 500 (Medium) | `Title/20 Medium` | Subtítulos de seções e grupos |
| `body-xl` | 18px | 24px / 16px | 700 / 400 | `Body Large/18 Bold`, `Body Large/18 Regular` | Preços em destaque e títulos de cards |
| `body-lg` | 16px | 24px / 20px | 400 / 500 / 700 | `Body Large/16 Regular`, `Medium`, `Bold` | Navegação, botões principais e nomes de NFTs |
| `body-md` | 15px | 22px / 40px | 400 / 500 | `Body/15 Regular`, `Medium`, `Bold` | Itens de filtros e abas da toolbar |
| `body` | 14px | 24px / 16px | 400 / 500 / 700 | `Body/14 Regular`, `Medium`, `Bold` | Corpo de texto padrão, labels e descrições |
| `caption-lg` | 13px | 22px | 400 (Regular) | `Caption/13 Regular` | Textos secundários de rodapé |
| `caption` | 12px | 14px / 16px | 700 / 500 | `Caption/12 Bold` | Ações de cards ("Ler mais") e metadados |
| `tiny-md` | 10px | 13px | 500 (Medium) | `Tiny/10 Medium` | Badge numérico do carrinho |
| `tiny` | 9px | 12px | 700 (Bold) | `Tiny/9 Bold` | Rótulo de carteiras compatíveis |

---

## 3. Resolução de Unidades e Letter-Spacing

No Figma, alguns estilos tipográficos apresentam valores de espaçamento entre caracteres numéricos (ex: `letterSpacing: 10`):
- **Estilos `Body/14 Medium · lh 16` e `Body/14 Bold · lh auto`:**
  - O valor `10` no Figma representa **10%** do tamanho da fonte (`0.1em`).
  - Para `font-size: 14px`, 10% corresponde a **1.4px**.
  - No CSS e tokens, é padronizado como `letter-spacing: 0.1em`.
- **Estilo `Tiny/9 Bold`:**
  - Apresenta `letterSpacing: 0.0111em` (~0.1px), padronizado no token `typography.letterSpacing.caps`.
