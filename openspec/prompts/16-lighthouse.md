Crie a change `lighthouse-audit`.

## Contexto
Executa a auditoria oficial de performance, acessibilidade, boas práticas e SEO com o Lighthouse sobre o build de produção integrado, conforme `openspec/project.md`, `ARCHITECTURE.md` (§5 e §14), `AGENTS.md` (§3.7) e `challenge.md` (§10).

**URGENTE — Prazo crítico (Foco em Medição + Quick Wins + Justificativa Técnica como Débito Técnico):**
Estamos muito perto do deadline do projeto. O enunciado exige as medições (3 execuções por página/perfil e mediana) e permite **justificar tecnicamente** em `ARCHITECTURE.md` qualquer métrica que fique abaixo da meta. Portanto, **não gaste tempo em refatorações profundas de arquitetura ou de bundles**: aplique apenas *quick wins* imediatos (HTML meta tags, `width`/`height` ou `aspect-ratio`, `fetchpriority="high"`, preload de fonte/remoteEntry), rode o script automatizado das 12 medições e **documente como justificativa técnica e débito técnico em `ARCHITECTURE.md` §14 e §17 qualquer indicador que ficar abaixo da meta** (como o overhead do Service Worker MSW + waterfall de Module Federation no mobile). Separe as tasks em **P0 (Obrigatório agora)** e **P1 (Débito Técnico)**.

## Estratégia de Prazo Crítico e Débito Técnico (P0 vs P1)
- **P0 (Fazer agora — Entrega Obrigatória da Etapa 18)**:
  - Criar o script `pnpm lighthouse` que roda sobre o build de produção (`pnpm build && pnpm preview` com `VITE_ENABLE_MOCKS=true`) para **Início** (`/`) e **Detalhe** (`/nft/:nftId`), nos perfis **mobile** e **desktop**, executando **3 medições por combinação** e calculando a **mediana** de Performance, Accessibility, Best Practices, SEO, LCP, CLS e TBT.

## Requisitos
1. **Script automatizado e metodologia de medição (`pnpm lighthouse`)**:
   - Auditar **Início** (`/`) e **Detalhe do NFT** (`/nft/:nftId`), em **mobile** e **desktop**, contra o build de produção integrado com o cenário padrão dos mocks ativo.
   - Executar **3 medições por página e perfil** e calcular a **mediana** dos scores (Performance, Accessibility, Best Practices, SEO) e de **LCP**, **CLS** e **TBT**.

## Cenários de aceitação
- WHEN rodo `pnpm build && pnpm lighthouse` THEN as 3 medições por página e perfil são executadas contra o build integrado com mocks e geram os relatórios HTML/JSON e a tabela de medianas em `docs/lighthouse/`.

## Fora de escopo
Refatorações estruturais de código ou novas features; deploy externo (Etapa 19).

Gere proposal, specs e tasks (separando claramente P0 Medição + Quick Wins vs P1 Débito Técnico). Não implemente nesta etapa: a implementação segue depois, uma task por vez, com pausa entre elas.