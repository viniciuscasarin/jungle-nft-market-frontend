# Kiro Custom Commands - OpenSpec

Este diretório contém os comandos customizados do Kiro para gerenciar OpenSpec changes.

## Comandos Disponíveis

### `/opsx-propose`
Cria uma nova proposta de mudança OpenSpec.
- Guia você através do processo de criação de uma nova change
- Define requirements, design e tasks

### `/opsx-update [change-name]`
Atualiza uma change existente.
- Modifica requirements, design ou tasks de uma change
- Se não especificar o nome, lista as changes disponíveis

### `/opsx-apply [change-name]`
Implementa as tasks de uma change.
- Executa incrementalmente (task por task)
- Segue as regras definidas em `.agents/AGENTS.md`
- Pede confirmação entre tasks
- Se não especificar o nome, lista as changes disponíveis

### `/opsx-archive [change-name]`
Arquiva uma change completada.
- Move a change para o arquivo
- Opcionalmente faz commit das mudanças
- Se não especificar o nome, lista as changes disponíveis

### `/opsx-sync`
Sincroniza changes com especificações externas.
- Verifica atualizações em API specs
- Sincroniza com schemas GraphQL
- Mantém documentação atualizada

### `/opsx-explore`
Explora e analisa as changes existentes.
- Lista todas as changes
- Mostra status e progresso
- Analisa a estrutura OpenSpec

## Como Usar

1. Digite `/` no chat do Kiro
2. Comece a digitar `opsx` para ver os comandos disponíveis
3. Selecione o comando desejado
4. Opcionalmente adicione parâmetros (ex: nome da change)

## Exemplos

```
/opsx-propose
/opsx-update add-nft-marketplace
/opsx-apply add-nft-marketplace
/opsx-archive add-nft-marketplace
/opsx-explore
```

## Estrutura do Repositório

- `.agents/skills/` - Skills do OpenSpec (lógica principal)
- `.kiro/commands/opsx/` - Comandos customizados do Kiro
- `openspec/` - Diretório com as changes OpenSpec
- `.agents/AGENTS.md` - Regras específicas do workspace

## Notas

- Os comandos são atalhos que invocam as skills correspondentes
- As skills contêm a lógica detalhada de cada operação
- As regras de comportamento estão em `.agents/AGENTS.md`
