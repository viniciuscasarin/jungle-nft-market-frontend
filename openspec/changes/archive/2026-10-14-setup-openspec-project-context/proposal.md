# Proposal

## Why

O contexto permanente do projeto está fragmentado e duplicado entre `AGENTS.md`, `ARCHITECTURE.md`, `openspec/project.md` e `openspec/config.yaml`. No OpenSpec 1.x, só o `context` e as `rules` do `config.yaml` são injetados nas instruções de cada artefato; hoje o `config.yaml` tem 5 linhas e nenhuma regra, então as invariantes eliminatórias do desafio chegam aos agentes apenas de forma indireta. Isso precisa estar resolvido antes da primeira change de implementação (bootstrap do workspace Nx).

## What Changes

- Substituir o conteúdo de `openspec/project.md` pelo contexto permanente definido em `openspec/prompts/01-openspec-context` (propósito, stack, topologia, regras de topologia, regras transversais, fora de escopo, critérios eliminatórios e documentos de referência).
- No `project.md`, reduzir a seção "Arquitetura de libs" a uma referência a `ARCHITECTURE.md` §4 e retirar a seção "Convenções" (processo), que passa a viver nas `rules` do `config.yaml`.
- Reescrever `openspec/config.yaml`:
  - `context`: resumo do projeto, stack obrigatória, invariantes eliminatórias, papéis dos documentos de referência e precedência.
  - `rules` por artefato (`proposal`, `specs`, `design`, `tasks`) com as convenções de OpenSpec, testes, documentação e verificação.
- Estabelecer a divisão de responsabilidade entre documentos: `project.md` = o quê (invariantes), `ARCHITECTURE.md` = como e por quê, `AGENTS.md` = processo, `config.yaml` = canal efetivo para os agentes.

## Capabilities

### New Capabilities
<!-- Nenhuma. Change de documentação/configuração de workflow. -->

### Modified Capabilities
<!-- Nenhuma. Sem mudança de comportamento do sistema; a change usa `skip_specs: true`. -->

## Impact

- Arquivos alterados: `openspec/project.md`, `openspec/config.yaml`.
- Não alterados: `AGENTS.md`, `ARCHITECTURE.md`, `challenge.md`. O `AGENTS.md` mantém o §3 (regras invioláveis) duplicado de propósito, pois é carregado automaticamente em toda sessão de agente.
- Nenhum código, dependência ou app afetado.
- Todas as instruções futuras de `openspec instructions <artefato>` passam a receber o novo `context` e as `rules`.

### Fora de escopo e premissas

- Não fecha lacunas entre o enunciado e o contexto (ex.: estado na URL, metas Lighthouse, deploy); essas regras continuam em `challenge.md` e `ARCHITECTURE.md`.
- Papel de `shared/router`, backlog de changes e mapeamento de telas ficam em aberto e serão definidos conforme a implementação evoluir.
