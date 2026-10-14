# Tasks

## 1. Canal para agentes (`openspec/config.yaml`)

- [x] 1.1 Reescrever `openspec/config.yaml` com o `context` e as `rules` (`proposal`, `specs`, `design`, `tasks`) definidos em `design.md` D4, mantendo os comentários de exemplo de `operations`; verificar que `openspec list --json` continua retornando `root` sem erro de parse.
- [x] 1.2 Verificar a injeção: rodar `openspec instructions proposal --change setup-openspec-project-context --json` e `openspec instructions tasks --change setup-openspec-project-context --json` e confirmar que `context` traz o novo texto e que as `rules` de cada artefato aparecem na saída correspondente (se não aparecerem, corrigir as chaves antes de seguir).

## 2. Documento humano (`openspec/project.md`)

- [x] 2.1 Substituir o conteúdo de `openspec/project.md` pelo texto de `openspec/prompts/01-openspec-context` aplicando os ajustes de `design.md` D3 (sem a linha de instrução, título novo, "Arquitetura de libs" reduzida a referência a `ARCHITECTURE.md` §4, sem "Convenções"); verificar que todas as demais seções do prompt estão presentes e que `AGENTS.md`, `ARCHITECTURE.md` e `challenge.md` não aparecem em `git status` como modificados.

## 3. Validação

- [x] 3.1 Rodar `openspec validate setup-openspec-project-context` e confirmar que passa (change com `skip_specs: true`).

## Workflow follow-up

- Commit sugerido: `docs(openspec): define project context and artifact rules`.
- Arquivar com `/opsx-archive` após revisão.
