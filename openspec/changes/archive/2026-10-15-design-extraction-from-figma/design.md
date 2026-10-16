# Design: design-extraction-from-figma

## Context

O projeto necessita extrair com fidelidade máxima todos os parâmetros visuais do arquivo Figma (`dKMJKBVdX6q0Ym4OX5vd3V`) para alimentar o design system em `libs/shared/ui` na etapa subsequente. Para garantir isolamento arquitetural e pipelines de CI determinísticos, a extração deve ser estática, versionada em disco e executável offline.

Ver `proposal.md` para motivação e `specs/design-tokens-and-assets/spec.md` para requisitos detalhados.

## Goals / Non-Goals

**Goals:**
- Criar a base física de tokens (`design/tokens/tokens.json`), fontes (`design/fonts/`), imagens/ícones (`design/assets/`) e referências visuais (`design/screenshots/`).
- Documentar todas as telas, componentes, variantes, estados ausentes, regras responsivas e auditoria de acessibilidade em `docs/design/`.
- Assegurar rastreabilidade com `nodeId` de origem para cada token e ativo extraído.
- Implementar o script `pnpm design:check` com validação estrita via schema Zod e checagem de existência de arquivos no sistema de arquivos local.

**Non-Goals:**
- Não criar componentes React ou estilos Tailwind/CSS finais nesta etapa (escopo de `design-system-shared-ui`).
- Não expor endpoints de API ou interagir com a rede durante testes automatizados ou build do monorepo.
- Não alterar a árvore de dependências de runtime das aplicações.

## Decisions

### 1. Separação Estrita entre Design Extraído (`design/`) e Código de UI (`libs/shared/ui`)
- **Decisão**: Todos os artefatos extraídos (tokens JSON, fontes WOFF2, manifestos e SVGs/PNGs) residem no diretório raiz `design/`. A lib `libs/shared/ui` consumirá esses artefatos apenas na change seguinte.
- **Alternativas consideradas**:
  - *Colocar tokens direto em `libs/shared/ui`*: Rejeitado para manter o design agnóstico de framework e permitir que scripts de checagem validem o design sem compilar pacotes TypeScript.
- **Rationale**: Mantém fronteiras limpas e atende a regra de que a extração não implementa UI.

### 2. Taxonomia e Nomenclatura Semântica de Tokens
- **Decisão**: Normalizar todas as cores e estilos para tokens semânticos com categorias claras:
  - `color.surface.{default, card, raised, dark}`
  - `color.border.{default, soft}`
  - `color.text.{primary, secondary, accent, coral}`
  - `color.action.{primary, primaryHover, disabled}`
  - `space.{1..24}`
  - `radius.{sm, md, lg, xl, full}`
  - `shadow.{card, sheet, modal}`
  - `typography.{display, heading, title, body, caption, tiny}`
  Cada folha do JSON terá o formato `{ "value": "<css_val>", "nodeId": "<figma_node_id>", "description": "<texto>" }`.
- **Alternativas consideradas**:
  - *Exportar JSON bruto do Figma*: Rejeitado devido à duplicidade de casing (`color/ink` vs `Color/Ink`) e falta de semântica de espaçamento/raio no Figma.

### 3. Self-Hosting da Fonte Roboto Mono
- **Decisão**: Adicionar os arquivos WOFF2 de Roboto Mono (pesos 400, 500, 700) diretamente em `design/fonts/`.
- **Alternativas consideradas**:
  - *Google Fonts CDN via `<link>`*: Rejeitado por violar a exigência de assets self-hosted e determinismo em ambientes offline/CI.

### 4. Validador Offline `scripts/design-check.js`
- **Decisão**: Criar um script Node.js nativo (utilizando `zod` já presente no monorepo) que:
  1. Valida a estrutura de `tokens.json` (assegurando que todo token tenha `nodeId` não vazio e formato semântico).
  2. Valida o schema de `manifest.json`.
  3. Varre o disco confirmando que cada arquivo citado no manifesto existe em `design/assets/`.
  4. Falha com código de saída 1 caso encontre qualquer inconsistência.
- **Alternativas consideradas**:
  - *Validação apenas por teste Vitest*: Rejeitado porque `pnpm design:check` como script standalone no `package.json` é um requisito explícito do prompt do desafio.

### 5. Resolução de Contraste e Acessibilidade (WCAG 1.4.11)
- **Decisão**: Manter os valores originais extraídos do Figma em `tokens.json` com seus respectivos `nodeId`, mas registrar expressamente em `docs/design/token-audit.md` e em `ARCHITECTURE.md` §19 os pares que falham (bordas de campos com 1.3:1 e 1.7:1) e a recomendação de tokens de acessibilidade para a change de UI.

## Risks / Trade-offs

- **[Risco: URLs de assets do Figma são temporárias (expiram em 30 dias)]**
  → *Mitigação*: A extração faz o download imediato dos bytes de imagens e SVGs para o disco local em `design/assets/`, versionando os binários no Git.
- **[Risco: Telas sem frame mobile (Confirmação, Perfil, Carteiras) gerarem divergências na implementação]**
  → *Mitigação*: O arquivo `docs/design/screens.md` documentará explicitamente a estratégia de adaptação e o reuso de componentes mobile existentes (Bottom Sheet, Cards empilhados, Buy Bar).
- **[Risco: Inexistência de frame Tablet (768px)]**
  → *Mitigação*: `docs/design/responsive.md` definirá regras formais de grid e quebras para 768px (colapso de colunas do catálogo e comportamento de Drawer para a barra de filtros).

## Open Questions

- *Definição de variantes exatas do slider de faixa de preço*: O Figma exibe o slider estático; a especificação em `components.md` definirá o comportamento interativo de dois pontos (`min` e `max`).
