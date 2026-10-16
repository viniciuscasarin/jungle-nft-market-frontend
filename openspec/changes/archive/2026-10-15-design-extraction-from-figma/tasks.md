# Tasks

## 1. Descoberta e Mapeamento de Telas

- [x] 1.1 Gerar `docs/design/screens.md` mapeando cada tela do enunciado (Início, Detalhes, Carrinho, Pagamento, Confirmação, Login, Cadastro, Perfil, Carteiras) aos frames desktop e mobile do Figma, registrando modais e telas sem frame, e verificar que todos os nodeIds coincidem com o Figma.
- [x] 1.2 Exportar screenshots dos frames (desktop e mobile) para `design/screenshots/<tela>-<viewport>.png` com dimensões registradas, e verificar a presença de todas as imagens em disco.

## 2. Extração e Auditoria de Tokens de Design

- [x] 2.1 Extrair e consolidar tokens semânticos de cores, tipografia, espaçamento, raios e sombras em `design/tokens/tokens.json`, incluindo `nodeId` de origem em cada token, e verificar integridade estrutural do JSON.
- [x] 2.2 Gerar `docs/design/token-audit.md` documentando consolidações de cores quase-duplicadas, medições de contraste WCAG 2.1 AA para texto e sinalização de falhas em bordas segundo WCAG 1.4.11 com proposta de ajuste de acessibilidade, e verificar cálculos de contraste.

## 3. Tipografia, Fontes e Movimento

- [x] 3.1 Disponibilizar a família tipográfica Roboto Mono (pesos 400, 500 e 700 em woff2) para self-hosting em `design/fonts/`, definindo escala consolidada, e verificar a presença dos arquivos locais.
- [x] 3.2 Gerar `docs/design/motion.md` registrando diretrizes de transições e padrão de shimmer para skeletons respeitando `prefers-reduced-motion`, e verificar documentação.

## 4. Ativos Visuais e Manifesto

- [x] 4.1 Baixar ícones vetoriais (Iconly, carteiras, redes sociais) e imagens rasterizadas do Figma para `design/assets/`, otimizar SVGs e verificar integridade dos arquivos baixados.
- [x] 4.2 Gerar `design/assets/manifest.json` catalogando cada ativo (nodeId, caminho, dimensões, formato, uso e sugestão de texto alternativo), e verificar que todo ativo do manifesto existe em disco.

## 5. Inventário de Componentes, Responsividade e Decisões

- [x] 5.1 Gerar `docs/design/components.md` com inventário de padrões repetidos do Figma, variantes, props sugeridas para `libs/shared/ui` e especificação formal de estados não desenhados, e verificar completude do catálogo.
- [x] 5.2 Gerar `docs/design/responsive.md` detalhando grids, larguras de container, margens e regras de adaptação para 768px (tablet) e telas sem frame mobile, e verificar cobertura de todos os viewports.
- [x] 5.3 Gerar `docs/design/open-questions.md` consolidando decisões tomadas da seção 7 do pré-levantamento e propostas de resolução para pendências visuais, e verificar alinhamento com `ARCHITECTURE.md`.

## 6. Rastreabilidade, Script de Verificação e Documentação

- [x] 6.1 Gerar `design/figma.json` registrando `fileKey`, data da extração e lista consolidada de nodeIds utilizados.
- [x] 6.2 Implementar o script `scripts/design-check.js` e adicioná-lo ao `package.json` (`"design:check"`), validando schemas de `tokens.json` e `manifest.json`, presença de `nodeId` em todos os tokens e existência física de cada asset, criando teste unitário de validação e cenário de falha.
- [x] 6.3 Atualizar `ARCHITECTURE.md` (§18 Decisões de UX e §19 Desvios do Figma e ajustes de acessibilidade) e `README.md` com o novo script e documentação da extração de design.
- [x] 6.4 Executar validação final rodando `pnpm design:check`, `pnpm typecheck`, `pnpm lint`, `pnpm test` e `pnpm build`, garantindo que todas as verificações passam com sucesso.
