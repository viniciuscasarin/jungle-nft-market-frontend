# Design: Shared Contracts and Monetary Precision

## Context

Conforme descrito em `proposal.md`, a arquitetura do marketplace exige contratos tipados universais e garantia matemática de precisão monetária em ETH para toda a aplicação. A regra inviolável do projeto estabelece que ETH é sempre uma string decimal, nunca `number`, e que `decimal.js` só pode ser importado em `libs/shared/money`.

Atualmente, `libs/shared/money` vaza `Decimal` como tipo de retorno de `parseEth`, expondo a API interna da biblioteca de terceiros para o restante do monorepo, e `libs/shared/contracts` contém apenas stubs que precisam ser expandidos para todos os domínios da aplicação.

## Goals / Non-Goals

**Goals:**
- Proteger todo o monorepo contra erros de arredondamento IEEE-754 através de um tipo opaco `EthAmount` e helpers puros em `@nft/shared-money`.
- Encapsular 100% o `decimal.js`, mantendo zero vazamento de tipos ou métodos para fora de `@nft/shared-money`.
- Definir schemas Zod universais e tipos TypeScript inferidos em `@nft/shared-contracts` para erros de API, sessão, catálogo, avaliações, favoritos, carrinho, cotações, pedidos, dados do colecionador, perfil, carteiras, envelopes Socket.IO e search params.
- Fornecer documentação OpenAPI-like completa em `docs/contracts.md`.
- Exportar fixtures canônicas em `@nft/shared-contracts` para testes e mocks.

**Non-Goals:**
- Implementar chamadas de rede ou persistência de dados (responsabilidade de `shared/http`, `shared/query` e `libs/mocks`).
- Conectar a blockchains reais ou extensões de carteiras Web3 (fora de escopo do projeto).
- Permitir edição ou submissão de avaliações (o contrato de reviews é estritamente de consulta pública).

## Decisions

### 1. Branded Type `EthAmount` vs. Strings Abertas
- **Decisão**: Utilizar um tipo nominal com brand `declare const EthAmountBrand: unique symbol; export type EthAmount = string & { readonly [EthAmountBrand]: typeof EthAmountBrand };`.
- **Motivo**: Previne que strings arbitrárias não validadas (ou com formato incorreto) sejam passadas para operações aritméticas monetárias sem passar por `parse()` ou por validação de schema Zod (`EthAmountSchema`).
- **Alternativas consideradas**:
  - *String pura sem brand*: Frágil em tempo de compilação, permitindo passar IDs ou textos arbitrários onde se espera valor monetário.
  - *Classe com wrapper de objeto*: Introduziria sobrecarga de instanciação e dificultaria serialização direta em JSON / REST.

### 2. Encapsulamento Total de `decimal.js`
- **Decisão**: Toda manipulação com `Decimal` ocorre exclusivamente dentro de `libs/shared/money`. Funções públicas recebem `EthAmount` e retornam `EthAmount` ou tipos primitivos (`boolean`, `number` de comparação, `string` formatada).
- **Motivo**: Respeita rigorosamente a regra arquitetural de terceiros encapsulados (ARCHITECTURE.md §4). Se a biblioteca matemática for trocada no futuro (ex: bignumber.js), zero código externo será alterado.
- **Alternativas consideradas**:
  - *Expor `Decimal` como retorno de `parse`*: Rejeitado; quebra o encapsulamento e incentiva consumidores a usar aritmética arbitrária fora dos helpers validados.

### 3. Zod-First com Inferência de Tipos
- **Decisão**: Escrever schemas Zod para todas as entidades e derivar tipos com `z.infer<typeof Schema>`.
- **Motivo**: Garante fonte única da verdade (Single Source of Truth) entre validação de borda em tempo de execução (MSW, Axios, URL) e os tipos do compilador TypeScript.
- **Alternativas consideradas**:
  - *Duplicar interfaces TS e schemas Zod*: Propenso a desvios (drift) e quebra de regras de tipagem.

### 4. Validação Refinada do Objeto `Collector`
- **Decisão**: Utilizar `superRefine` no schema do Zod para validar campos condicionais:
  - Se `useSecondaryWallet === true`, `secondaryWallet` torna-se obrigatória e deve ter campos de rede, endereço e tipo preenchidos, gerando erro com `path: ['secondaryWallet']` se omitida.
  - O endereço de carteira é estritamente validado por regex `/^0x[a-fA-F0-9]{40}$/`.
  - O `ensName` é validado para não conter o sufixo `.eth` (conforme exigido pelo desafio).
- **Motivo**: Atende pontualmente aos cenários de aceitação do desafio com mensagens amigáveis e vinculadas diretamente aos campos (`fieldErrors`).

### 5. Eventos Socket.IO com Envelope Unificado e Helpers Puros
- **Decisão**: Modelar o envelope como união discriminada por `type` (`nft.updated` e `order.updated`), com helpers puros `isDuplicate(incoming, listOrSet)` e `isStale(incomingVersion, currentVersion)`.
- **Motivo**: Permite que os consumidores de tempo real (hooks e data-access) façam deduplicação e descarte de eventos fora de ordem de forma puramente determinística e testável.

### 6. Search Params Tolerantes via Zod
- **Decisão**: Utilizar `.catch()` ou métodos de safe parse nos schemas de search params. Se a URL contiver parâmetros corrompidos (ex: `?page=abc&sort=foo`), o parser retorna os defaults sem estourar exceção na renderização da rota.
- **Motivo**: Resiliência da interface diante de links quebrados ou entradas manuais de usuários.

### 7. Organização Modular de `@nft/shared-contracts`
- **Decisão**: Separar os contratos por domínio em arquivos dedicados (`auth.ts`, `catalog.ts`, `reviews.ts`, `cart.ts`, `quote.ts`, `orders.ts`, `profile.ts`, `wallets.ts`, `realtime.ts`, `search-params.ts`, `errors.ts`, `common.ts`) e reexportá-los através do `index.ts`.
- **Motivo**: Facilita manutenção, legibilidade e evita um arquivo monolítico de milhares de linhas, preservando a regra de export único via `index.ts`.

## Risks / Trade-offs

- **[Risco]** Erros de tipagem nos projetos que já importavam `parseEth` retornando `Decimal`.
  - **Mitigação**: O único uso existente no repositório era no próprio teste `money.spec.ts`. Ajustaremos o teste para consumir a nova API pura com `EthAmount`.
- **[Risco]** Formatação de ETH em pt-BR gerar inconsistência com o símbolo ou decimais.
  - **Mitigação**: `format()` aceitará opções (`decimals`, `showSymbol`) e usará Intl ou substituição determinística sem notação científica, garantindo `1.250,50` com testes unitários.
- **[Risco]** Cotação da API divergir de cálculos manuais no cliente.
  - **Mitigação**: A regra arquitetural é reforçada nos contratos: a UI não calcula totais de pedidos nem descontos; consome diretamente os valores `EthAmount` emitidos no `QuoteSchema`.

## Migration Plan

1. Atualizar `libs/shared/money` com os novos arquivos, tipo `EthAmount`, helpers e testes unitários.
2. Implementar os schemas modulares em `libs/shared/contracts`, atualizar `ApiError` e criar fixtures canônicas.
3. Criar a documentação `docs/contracts.md`.
4. Executar `pnpm typecheck`, `pnpm lint` e `pnpm test` para garantir integridade estrutural contínua.
