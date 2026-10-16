# Auditoria de Tokens e Acessibilidade (WCAG 2.1)

Este documento registra a consolidação de tokens de design extraídos do arquivo Figma (`dKMJKBVdX6q0Ym4OX5vd3V`), as decisões de unificação de duplicidades/quase-duplicados e a auditoria matemática de contraste em conformidade com as diretrizes WCAG 2.1 AA (critério 1.4.3 para texto) e WCAG 1.4.11 (contraste não-textual para componentes e delimitadores de formulário).

---

## 1. Consolidação de Cores Quase-Duplicadas e Duplicidades de Nomenclatura

### 1.1 Quase-Duplicados de Luminosidade
No Figma foram identificadas duas variáveis de texto claro com diferença mínima de luminosidade:
- `color/text-primary`: `#f7f3ec` (luminância relativa: 0.908)
- `color/foreground`: `#f5f1eb` (luminância relativa: 0.887)

**Decisão de Consolidação:**
Unificado no token semântico `color.text.primary` com valor `#f7f3ec`.
- *Justificativa:* A diferença perceptiva é inferior a 1% no espaço sRGB e ambas cumprem com folga (17.39:1) o patamar WCAG AA sobre o fundo `#140d0a`. Manter duas cores quase idênticas no código geraria inconsistência de estilização e perda de manutenibilidade.

### 1.2 Duplicação de Casing nas Variables do Figma
O arquivo original do Figma registra todas as cores com duas convenções de nome simultâneas:

| Variable Original 1 | Variable Original 2 | Valor Hex | Token Consolidado |
|---|---|---|---|
| `color/ink` | `Color/Ink` | `#140d0a` | `color.surface.default` |
| `color/surface-card` | `Color/Surface Card` | `#241612` | `color.surface.card` |
| `color/surface-raised` | `Color/Surface Raised` | `#2f1d15` | `color.surface.raised` |
| `color/surface-dark` | `Color/Surface Dark` | `#38220f` | `color.surface.dark` |
| `color/border` | `Color/Border` | `#3f2319` | `color.border.default` |
| `color/border-soft` | `Color/Border Soft` | `#55321f` | `color.border.soft` |
| `color/primary` | `Color/Primary` | `#d28a4c` | `color.action.primary` |
| `color/secondary` | `Color/Secondary` | `#b39463` | `color.text.muted` |
| `color/text-secondary` | `Text/Secondary` | `#cfb28c` | `color.text.secondary` |
| `color/text-accent` | `Text/Accent` | `#e89b55` | `color.text.accent` |
| `color/text-coral` | `Color/Text Coral` | `#f0805f` | `color.text.coral` / `color.feedback.error` |
| `color/success` | `Color/Success` | `#00a66c` | `color.feedback.success` |

### 1.3 Cores de Marca Excluídas dos Tokens de Tema
As variáveis de marca de terceiros (`logo/google-*`, `logo/facebook`, `logo/blue`, `logo/orange`) foram excluídas de `tokens.json`. Elas pertencem ao domínio de ativos de autenticação social e são consumidas diretamente pelos SVGs dos respectivos botões.

---

## 2. Medições de Contraste WCAG 2.1

A fórmula padrão de luminância relativa ($L = 0.2126 R + 0.7152 G + 0.0722 B$) e de razão de contraste ($\frac{L_1 + 0.05}{L_2 + 0.05}$) foi aplicada a todos os pares de primeiro plano e fundo utilizados na interface.

### 2.1 Elementos de Texto (Critério WCAG 1.4.3 - Mínimo 4.5:1 para texto normal)

| Par de Cores | Uso na Interface | Razão Calculada | Status WCAG AA |
|---|---|---|---|
| `#f7f3ec` (`text.primary`) sobre `#140d0a` (`surface.default`) | Texto principal, títulos e navegação | **17.39:1** | **PASS (Excelente)** |
| `#f7f3ec` (`text.primary`) sobre `#241612` (`surface.card`) | Texto principal em cards e modais | **15.84:1** | **PASS (Excelente)** |
| `#f7f3ec` (`text.primary`) sobre `#2f1d15` (`surface.raised`) | Texto em modais elevados | **14.52:1** | **PASS (Excelente)** |
| `#cfb28c` (`text.secondary`) sobre `#140d0a` (`surface.default`) | Labels secundárias e descrições na página | **9.53:1** | **PASS** |
| `#cfb28c` (`text.secondary`) sobre `#241612` (`surface.card`) | Subtítulos e dados secundários em cards | **8.68:1** | **PASS** |
| `#e89b55` (`text.accent`) sobre `#140d0a` (`surface.default`) | Preços e links em destaque na página | **8.47:1** | **PASS** |
| `#e89b55` (`text.accent`) sobre `#241612` (`surface.card`) | Preços de NFTs em cards do catálogo | **7.72:1** | **PASS** |
| `#f0805f` (`text.coral`) sobre `#140d0a` (`surface.default`) | Mensagens de validação e alertas | **7.29:1** | **PASS** |
| `#140d0a` (`ink`) sobre `#d28a4c` (`action.primary`) | Texto escuro do botão CTA primário | **6.85:1** | **PASS** |
| `#b39463` (`text.muted`) sobre `#140d0a` (`surface.default`) | Texto atenuado e preço anterior riscado | **6.72:1** | **PASS** |
| `#00a66c` (`feedback.success`) sobre `#140d0a` (`surface.default`) | Mensagens e indicadores de sucesso | **6.11:1** | **PASS** |
| `#b39463` (`text.muted`) sobre `#241612` (`surface.card`) | Metadados e contagens atenuadas em cards | **6.12:1** | **PASS** |
| `#b39463` (`text.muted`) sobre `#38220f` (`surface.dark`) | Texto de placeholder ("digite seu e-mail...") | **5.22:1** | **PASS** |

> **Conclusão de Texto:** Todos os pares de texto atendem e superam com folga o patamar de 4.5:1 exigido pela WCAG 2.1 AA.

---

### 2.2 Delimitadores de Componentes e Bordas (Critério WCAG 1.4.11 - Mínimo 3:1)

| Par de Cores | Elemento na Interface | Razão Calculada | Status WCAG 1.4.11 |
|---|---|---|---|
| `#3f2319` (`border.default`) sobre `#140d0a` (`surface.default`) | Bordas de botões secundários e paginação | **1.34:1** | **FALHA (< 3:1)** |
| `#55321f` (`border.soft`) sobre `#140d0a` (`surface.default`) | Delimitadores de formulários sobre a página | **1.71:1** | **FALHA (< 3:1)** |
| `#55321f` (`border.soft`) sobre `#241612` (`surface.card`) | Bordas de inputs dentro de cards de checkout | **1.55:1** | **FALHA (< 3:1)** |
| `#55321f` (`border.soft`) sobre `#2f1d15` (`surface.raised`) | Bordas de campos dentro de modais | **1.42:1** | **FALHA (< 3:1)** |
| `#55321f` (`action.disabled`) sobre `#2f1d15` (`surface.raised`) | Botão desabilitado em modais | **1.42:1** | *Isento* (estados desabilitados são isentos pela WCAG) |

---

## 3. Estados Ausentes no Figma e Proposta de Ajustes

### 3.1 Falha de Contraste em Bordas de Campo (WCAG 1.4.11)
- **Problema:** As bordas dos campos de entrada (`#55321f`) oferecem contraste de apenas 1.42:1 a 1.71:1 sobre os fundos escuros do tema, ficando abaixo do mínimo de 3:1 exigido pelo critério WCAG 1.4.11 para identificação visual de áreas interativas de entrada.
- **Proposta de Ajuste (para a change `design-system-shared-ui`):**
  1. No estado default/repouso, manter a borda original do Figma com apoio visual adicional (preenchimento contrastante de container `surface-card`/`surface-dark` com 1.5x a 2.5x contraste ou fundo claramente diferenciado).
  2. Implementar token semântico `color.border.accessible` (`#8a583e`, contraste 3.40:1 sobre `ink`) opcional para conformidade estrita.
  3. No estado de foco (`:focus-visible`), acionar indicador de foco de alta ênfase (mínimo 3:1).

### 3.2 Estado de Foco Ausente no Figma (WCAG 2.4.7)
- **Problema:** Não existe no Figma nenhum estado desenhado para foco via teclado (`:focus` / `:focus-visible`).
- **Solução Padronizada:**
  - Implementar anel de foco visível utilizando o token primário `color.action.primary` (`#d28a4c`, que possui contraste de **6.85:1** sobre o fundo `ink`), com espaçamento `ring-offset-2 ring-offset-ink ring-2 ring-primary`.

### 3.3 Estados de Validação e Erro
- **Erro em Campo de Entrada:** Borda e texto de erro utilizam `color.feedback.error` (`#f0805f`), atingindo **7.29:1** de contraste sobre `ink` e acompanhado de ícone ou mensagem textual descritiva associada via `aria-describedby` (atendendo ao critério de não utilizar apenas cor para transmitir informação).
- **Hover em Elementos Interativos:** Botões e links escurecem/clareiam suavemente mantendo a legibilidade garantida (hover primário `#b87437` sobre `ink` atinge **5.54:1**).
