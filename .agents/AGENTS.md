# Agent Rules for this Workspace

## OpenSpec Apply Orchestration
When executing the `opsx-apply-change` skill (via `/opsx-apply`):
- DO NOT execute all tasks in a single continuous loop.
- Execute exactly ONE task at a time.
- After implementing the task and marking it as complete (`[x]`), PAUSE your execution immediately.
- Use the interactive `ask_question` tool with Yes/No options to ask whether to continue in the same session:
  - Question: "Deseja continuar com a próxima task nesta mesma sessão?"
  - Options:
    - "(Recommended) Sim, continuar com a próxima task nesta mesma sessão"
    - "Não, prefiro abrir um novo chat para manter o contexto limpo"
- Wait for user response before proceeding to the next task.

## OpenSpec Archive Finalization
When executing the `openspec-archive-change` skill (via `/opsx-archive`):
- After displaying the archive completion summary, use the interactive `ask_question` tool to ask if the user wants to commit to Git:
  - Question: "Deseja commitar as alterações do arquivamento no Git?"
  - Options:
    - "(Recommended) Sim, commitar alterações do arquivamento"
    - "Não, não commitar agora"
- If confirmed ("Sim"), commit the changes following conventional commit format (`docs(openspec): archive <change-name>`).
