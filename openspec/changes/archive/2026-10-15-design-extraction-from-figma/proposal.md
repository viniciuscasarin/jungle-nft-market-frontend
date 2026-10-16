# Proposal: design-extraction-from-figma

## Why

A fidelidade visual ao Figma vale 20 pontos na avaliação do desafio. Esta change realiza a extração completa e estruturada de todos os tokens, fontes, assets vetoriais/raster e referências visuais diretamente do arquivo Figma (`dKMJKBVdX6q0Ym4OX5vd3V`), persistindo-os de forma versionada no repositório.

Com isso, o CI, os testes e as etapas seguintes de desenvolvimento (iniciando por `design-system-shared-ui`) tornam-se 100% autônomos, determinísticos e independentes de acesso externo ao Figma ou tokens de API em tempo de execução.

## What Changes

- **Descoberta e Mapeamento de Telas**: Geração de `docs/design/screens.md` mapeando todos os frames de tela desktop (1440px) e mobile (414px), modais (Login, Cadastro, Confirmação) e registrando formalmente as telas sem frame mobile (Confirmação, Perfil, Carteiras) e a ausência de frame tablet (768px).
- **Extração Semântica de Tokens**: Extração e consolidação de cores, tipografia, espaçamentos, raios e sombras em `design/tokens/tokens.json`, com cada token referenciando seu `nodeId` de origem no Figma.
- **Auditoria de Tokens e Contraste**: Geração de `docs/design/token-audit.md` registrando as consolidações de quase-duplicados (ex: `#f7f3ec` vs `#f5f1eb`), medições de contraste WCAG AA para textos e apontamento de falhas de contraste em bordas de campos segundo o critério WCAG 1.4.11 (mínimo 3:1).
- **Tipografia e Self-hosting de Fontes**: Download e estruturação da fonte Roboto Mono (pesos 400, 500, 700) em `design/fonts/`, com escala tipográfica consolidada e resolução de unidades (`letterSpacing: 10` = 10% / 0.1em).
- **Extração e Otimização de Assets**: Download de ícones (Iconly, carteiras, redes sociais) e imagens para `design/assets/`, acompanhados de `design/assets/manifest.json` com metadados (nodeId, dimensões, formato, uso e sugestão de alt text) e otimização de SVGs.
- **Inventário de Componentes e Estados**: Geração de `docs/design/components.md` catalogando componentes repetidos do Figma, variantes, props sugeridas para `shared/ui` e especificação dos estados não desenhados (hover, focus, disabled, erro, loading).
- **Layout, Responsividade e Movimento**: Criação de `docs/design/responsive.md` (grids, breakpoints, regras para tablet 768px e telas sem mobile) e `docs/design/motion.md` (diretrizes de animação e shimmer de skeleton).
- **Registro de Decisões de Design**: Geração de `docs/design/open-questions.md` consolidando decisões tomadas (rotas para modais, formulário de pagamento com campos validados, avaliações somente leitura, elementos fora de escopo) e propostas de resolução para pendências visuais.
- **Rastreabilidade e Validação Offline**: Geração de `design/figma.json` com metadados da extração e criação do script `pnpm design:check` (`scripts/design-check.js`) que valida a integridade de `tokens.json` e `manifest.json` contra schemas estritos sem chamadas de rede.
- **Atualização de Documentação de Arquitetura**: Atualização de `ARCHITECTURE.md` (§18 Decisões de UX e §19 Desvios do Figma e ajustes de acessibilidade).

## Capabilities

### New Capabilities
- `design-tokens-and-assets`: Sistema estruturado de tokens semânticos, ativos visuais, fontes self-hosted, manifestos e verificação automatizada offline de conformidade com o design do Figma.

### Modified Capabilities
*(Nenhuma capability existente tem requisitos funcionais modificados).*

## Impact

- **Projetos e Libs Afetados**:
  - `libs/shared/ui` (`scope:shared`, `type:ui`, `flow:shared`): Preparada para consumir os tokens e fontes extraídos na change subsequente.
  - Diretórios raiz `design/` e `docs/design/`: Armazenamento de todos os artefatos visuais, tokens e documentações.
  - `scripts/design-check.js` e `package.json`: Novo script `"design:check"`.
  - `ARCHITECTURE.md`: Atualização das seções §18 e §19.
- **Dependências Externas**: Nenhuma dependência adicionada em tempo de execução. Fontes são servidas localmente.
- **Premissas e Restrições**:
  - Acesso ao Figma ocorre exclusivamente em tempo de desenvolvimento/extração; o CI e builds nunca dependem de rede para ativos do Figma.
  - Valores de borda de campo abaixo de 3:1 identificados no Figma serão ajustados na implementação de `shared/ui` para garantir conformidade com WCAG 1.4.11.
- **Fora de Escopo**:
  - Implementação de componentes React, classes finais de CSS e configuração do Tailwind CSS (atribuídos à change subsequente `design-system-shared-ui`).
