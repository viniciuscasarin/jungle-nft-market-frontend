# Agent Rules for this Workspace

## OpenSpec Apply Orchestration
When executing the `opsx-apply-change` skill (via `/opsx-apply`):
- DO NOT execute all tasks in a single continuous loop by default.
- Execute tasks incrementally (one by one, or up to the specified target task).
- After implementing a task and marking it as complete (`[x]`), unless the user previously chose to execute all remaining tasks or a target task has not yet been reached, PAUSE execution immediately.
- Use the interactive `ask_question` tool to ask whether to continue in the same session:
  - Question: "Deseja continuar com a próxima task nesta mesma sessão?"
  - Options:
    - "(Recommended) Sim, continuar com a próxima task nesta mesma sessão"
    - "Sim, executar todas as próximas tasks nesta mesma sessão"
    - "Sim, executar até uma task/subtask específica (informe o número no campo de resposta, ex: 'até 2.2')"
    - "Não, prefiro abrir um novo chat para manter o contexto limpo"
- Option behavior:
  - "Sim, continuar com a próxima task...": implement next task, mark `[x]`, and re-prompt with the gate.
  - "Sim, executar todas as próximas tasks...": continue implementing all remaining tasks in the change sequentially without prompting between tasks (unless an error or blocker occurs).
  - Execute up to a specific task/subtask (e.g. "até 2.2" or typed in the write-in field): continue executing sequentially until the specified task is completed. Once that task is completed, PAUSE execution and re-open the exact same gate (`ask_question`) with the same options.
  - "Não...": stop and display current progress.
- Wait for user response before proceeding. In all continuous execution modes, pause immediately if an error or blocker occurs.

## OpenSpec Archive Finalization
When executing the `openspec-archive-change` skill (via `/opsx-archive`):
- After displaying the archive completion summary, use the interactive `ask_question` tool to ask if the user wants to commit to Git:
  - Question: "Deseja commitar as alterações do arquivamento no Git?"
  - Options:
    - "(Recommended) Sim, commitar alterações do arquivamento"
    - "Não, não commitar agora"
- If confirmed ("Sim"), commit the changes following conventional commit format (`docs(openspec): archive <change-name>`).
