# Spec Delta

## Purpose

Define a infraestrutura centralizada de feedback acessível gerenciada exclusivamente pelo host shell, incluindo live regions globais e ToastProvider com garantia de instância singleton.

## ADDED Requirements

### Requirement: Centralized Accessible Feedback Singleton
O host shell SHALL prover uma única instância de `ToastProvider` e exatamente duas live regions globais no documento (`polite` e `assertive`), exportando métodos unificados via `ShellContext.feedback` para consumo por remotes e features. O runtime SHALL proibir que remotes ou bibliotecas instanciem live regions globais adicionais.

#### Scenario: Notificação acessível via ShellContext
- **WHEN** um remote ou feature invoca `feedback.notify({ message: "Operação realizada", tone: "info", politeness: "polite" })`
- **THEN** uma notificação visual tipo Toast é exibida e o texto é anunciado na live region `polite` global do host, sem criar elementos de anúncio redundantes no DOM.

#### Scenario: Detecção de live region duplicada
- **WHEN** um remote ou componente tenta montar uma live region global redundante no documento
- **THEN** a asserção de singleton falha acusando violação de instância única no runtime.

#### Scenario: Anúncio imediato assertive
- **WHEN** ocorre um erro crítico e o sistema chama `feedback.announce("Falha na conexão", "assertive")`
- **THEN** a live region global `assertive` emite o anúncio com interrupção prioritária para tecnologias assistivas.
