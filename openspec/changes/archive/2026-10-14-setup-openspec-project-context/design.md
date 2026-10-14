# Design

## Context

Motivação em `proposal.md` (Why). Estado atual:

- OpenSpec 1.14.1, `schema: spec-driven`. As instruções de artefato (`openspec instructions <id>`) injetam o campo `context` do `openspec/config.yaml` e as `rules` do artefato correspondente. O `project.md` não é injetado; o agente só o lê se seguir a referência textual.
- `config.yaml` atual: `context` de 4 linhas, sem `rules`.
- `project.md` atual: visão geral e 6 regras; inclui `Idempotency-Key`, que o novo conteúdo trata como "Pedidos são idempotentes" (detalhe permanece em `ARCHITECTURE.md` §12).
- Conteúdo-fonte aprovado: `openspec/prompts/01-openspec-context`.

## Goals / Non-Goals

**Goals:**
- Toda instrução de artefato futura recebe as invariantes eliminatórias e as convenções de processo sem depender de leitura indireta.
- Cada tipo de informação tem um dono claro entre os documentos.

**Non-Goals:**
- Remover duplicações de `AGENTS.md` ou `ARCHITECTURE.md`.
- Criar specs de capability, backlog ou mapa de telas.

## Decisions

### D1. `config.yaml` é o canal para agentes; `project.md` é documento humano completo

Alternativas: (A) só `project.md` — agentes podem ignorar; (C) tudo no `config.yaml` — YAML longo e ruim de manter. Escolhida (B): `context` curto com o que é eliminatório; `rules` por artefato com o que é processo. As `rules` só são injetadas quando o artefato correspondente é escrito, o que mantém o contexto enxuto.

### D2. Divisão de responsabilidade

| Documento | Dono de |
|---|---|
| `openspec/project.md` | O quê: propósito, stack, topologia, regras de topologia, regras transversais, fora de escopo, eliminatórios |
| `ARCHITECTURE.md` | Como e por quê: decisões, fronteiras de libs, políticas (cache, sessão, realtime, pedidos), limitações |
| `AGENTS.md` | Processo: comandos, fluxo OpenSpec, git, definição de pronto |
| `openspec/config.yaml` | Resumo para injeção automática + regras por artefato |

Exceção deliberada: `AGENTS.md` §3 continua duplicando as regras invioláveis, pois é carregado automaticamente em toda sessão.

### D3. Ajustes sobre o conteúdo do prompt no `project.md`

- Linhas 1 (instrução ao agente) não entra no arquivo; o título passa a ser `# NFT Marketplace — Contexto do Projeto`.
- Seção "Arquitetura de libs" (prompt linhas 29–33) vira uma linha: libs por domínio em 4 camadas (`domain`, `data-access`, `feature`, `ui`), `shared/*`, `shell-kit`, `mocks/*`; fronteiras, direção de dependências e encapsulamento de terceiros em `ARCHITECTURE.md` §4.
- Seção "Convenções" (prompt linhas 47–52) sai; vai para `rules` (D4) e já existe em `AGENTS.md`.
- Demais seções entram com o texto do prompt sem alteração de significado.

### D4. Conteúdo do `openspec/config.yaml`

Manter os comentários de exemplo de `operations` ao final. Conteúdo efetivo:

```yaml
schema: spec-driven

context: |
  NFT Marketplace (desafio frontend). Monorepo Nx/pnpm, 4 apps React/Vite via Module Federation:
  shell (host) + storefront, checkout, account (remotes) + web-e2e.
  Backend 100% simulado (MSW + @mswjs/socket.io-binding). Sem blockchain, carteiras ou pagamentos reais.
  Stack obrigatória com uso efetivo: React, TS strict, TanStack Router, TanStack Query, Axios,
  socket.io-client, Tailwind, shadcn/ui, MSW, Playwright, Lighthouse.
  Invariantes (violação é eliminatória):
  - ETH é string decimal via shared/money; quantidades inteiras; totais vêm da cotação da API.
  - Mocks só em libs/mocks/*; tempo real só via socket.io-client, nunca setters/cache.
  - Query keys privadas incluem userId; logout/troca de usuário limpa cache, queries e subscriptions.
  - Pedidos idempotentes; confirmação só para pedido confirmed pela simulação.
  - Host é dono de rotas, guards e das instâncias únicas (QueryClient, HttpClient, RealtimeClient, SW).
  Referências: openspec/project.md (o quê), ARCHITECTURE.md (como), AGENTS.md (processo).
  Precedência: challenge.md > project.md > ARCHITECTURE.md.

rules:
  proposal:
    - Listar apps/libs Nx afetados e suas tags (scope, type, flow).
    - Declarar fora de escopo e premissas; premissas também vão para ARCHITECTURE.md.
  specs:
    - Requisitos com SHALL e cenários WHEN/THEN testáveis.
    - Dado assíncrono especifica loading, vazio, erro com retry e sucesso.
    - Incluir cenários de falha e de acessibilidade quando houver UI.
  design:
    - Respeitar fronteiras e encapsulamento de terceiros (ARCHITECTURE.md §4); justificar nova dependência.
  tasks:
    - Incluir tasks de teste (Vitest e/ou Playwright) e de cenário MSW para cada fluxo de falha.
    - Incluir task de atualização da documentação afetada (ARCHITECTURE.md, README.md, docs/*).
    - Última task: typecheck, lint, test e build nos projetos afetados.
```

## Risks / Trade-offs

- [Divergência entre `config.yaml`, `project.md` e `AGENTS.md` §3] → `config.yaml` só resume; mudanças de invariante atualizam os três na mesma change (já exigido por `AGENTS.md` §9.6).
- [Chave de artefato em `rules` com nome errado é ignorada silenciosamente] → verificar com `openspec instructions <id> --change <x> --json` que cada regra aparece no artefato correspondente.
- [Regra de task "typecheck/lint/test/build" não aplicável enquanto não houver workspace Nx] → aceitável; a primeira change real é o bootstrap do workspace.
- [Perda do detalhe `Idempotency-Key` no `project.md`] → detalhe preservado em `ARCHITECTURE.md` §12.

## Migration Plan

Edição direta dos dois arquivos. Rollback via `git revert`.
