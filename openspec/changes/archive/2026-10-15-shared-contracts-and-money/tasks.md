# Tasks

## 1. Implementação e Testes de `@nft/shared-money`

- [x] 1.1 Implementar o tipo opaco `EthAmount`, `InvalidEthAmountError` e configuração interna de `decimal.js` (precisão 36, `ROUND_HALF_UP`) em `libs/shared/money/src/` e verificar que `decimal.js` não vaza tipos públicos.
- [x] 1.2 Implementar funções puras (`parse`, `add`, `sub`, `mul`, `percent`, `sum`, `compare`, `isZero`, `format`, `toApi`) com rejeição de `number`, exponencial e entradas inválidas, e verificar com testes unitários em `libs/shared/money/src/money.spec.ts`.

## 2. Schemas Fundamentais e Catálogo em `@nft/shared-contracts`

- [x] 2.1 Implementar `ApiErrorSchema`, `ApiErrorCode` e classe normalizada `ApiError` em `libs/shared/contracts/src/errors.ts` e verificar compatibilidade com `libs/shared/http` e `libs/shared/query`.
- [x] 2.2 Implementar schemas e tipos de Sessão/Autenticação (`SignUpInput`, `SignInInput`, `Session`, `User`) e Perfil/Carteiras em `libs/shared/contracts/src/` e verificar com testes que senhas nunca retornam em respostas.
- [x] 2.3 Implementar schemas e tipos de Catálogo, NFTs e Avaliações públicas (`ReviewSchema`, `NftItemSchema`, `NftEditionSchema`, `NftListQuerySchema`) e verificar que reviews rejeitam notas 0, 6 ou fracionárias e preços `number` falham.

## 3. Schemas Transacionais, Validações do Colecionador e Tempo Real

- [x] 3.1 Implementar schemas de Carrinho e Cotação (`CartItemSchema`, `QuoteSchema`, `ItemAvailabilitySchema`) garantindo quantidades inteiras e totais autoritativos da API, e verificar com testes unitários.
- [x] 3.2 Implementar schemas de Pedidos, Recibo imutável e validações refinadas de `Collector` (`useSecondaryWallet` condicional, `0x` + 40 hex, ENS sem `.eth`) e verificar com testes unitários de sucesso e falhas de campo.
- [x] 3.3 Implementar união discriminada de envelopes de eventos Socket.IO (`RealtimeEnvelope`, `NftUpdatedEvent`, `OrderUpdatedEvent`) e helpers puros `isDuplicate` e `isStale`, e verificar com testes unitários.
- [x] 3.4 Implementar schemas tolerantes de Search Params para catálogo, carrinho e checkout com parsing seguro e verificar com testes unitários de fallback em parâmetros inválidos.

## 4. Documentação, Fixtures Canônicas e Validação Geral

- [x] 4.1 Criar e exportar fixtures canônicas para todos os contratos em `libs/shared/contracts/src/fixtures/` e verificar com testes unitários que 100% das fixtures são aceitas pelos respectivos schemas Zod.
- [x] 4.2 Criar documentação OpenAPI-like de todos os contratos REST e Socket.IO em `docs/contracts.md` e atualizar o registro em `ARCHITECTURE.md`.
- [x] 4.3 Executar verificação completa (`pnpm typecheck`, `pnpm lint`, `pnpm test`) em todos os projetos afetados do workspace e verificar zero erros.
