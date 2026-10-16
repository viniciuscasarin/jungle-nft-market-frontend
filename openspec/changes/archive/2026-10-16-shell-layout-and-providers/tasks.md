# Tasks

## 1. Constantes de rotas, contratos e infraestrutura base

- [x] 1.1 Criar constantes de rotas e âncoras em `libs/shared/router` (`ROUTES`, `ANCHORS`) e verificar com testes unitários em `libs/shared/router/src/index.spec.ts`
- [x] 1.2 Atualizar `REMOTE_MANIFESTS` e tipos de remote em `libs/shell-kit/src/contracts.ts` para refletir `/`, `/pagamento` e `/pedido/$orderId`, verificando com `pnpm test libs/shell-kit`

## 2. Ciclo de vida do Realtime por contagem de referências

- [x] 2.1 Refatorar `createRealtimeClient` em `libs/shared/realtime` para encapsular contador de subscriptions ativas e conectar sob demanda apenas com sessão ativa
- [x] 2.2 Adicionar testes unitários em `libs/shared/realtime` verificando conexão sob demanda, desconexão ao zerar subscriptions e no logout
- [x] 2.3 Atualizar `SessionController` em `libs/auth/feature` para chamar apenas `disconnect()` em transições de usuário e verificar aprovação de `pnpm test libs/auth/feature`

## 3. Primitivos de UI e componentes do design system

- [x] 3.1 Adicionar primitivo acessível `DropdownMenu` em `libs/shared/ui/src/components/primitives/dropdown-menu.tsx` encapsulando `@radix-ui/react-dropdown-menu`
- [x] 3.2 Atualizar `Header` em `libs/shared/ui` (breakpoint 1024px `lg:`, lupa como link `/#busca`, carrinho com link e badge opcional, menu do usuário com DropdownMenu) e adicionar stories em `header.stories.tsx`
- [x] 3.3 Atualizar `MobileTabBar` e `SearchBar` em `libs/shared/ui` com mapeamento correto, badges opcionais e stories em `mobile-tab-bar.stories.tsx` e `search-bar.stories.tsx`
- [x] 3.4 Atualizar `Footer` e `SocialButton` em `libs/shared/ui` para remover live regions locais e aceitar prop `onUnavailable`, verificando com `pnpm test libs/shared/ui`

## 4. Shell-kit providers, hooks e feedback acessível

- [x] 4.1 Implementar live regions globais e `ToastProvider` no host, expondo `feedback` em `ShellContext` (`libs/shell-kit`)
- [x] 4.2 Criar hook `useUnavailable` em `libs/shell-kit` para disparar aviso padronizado via toast e live region
- [x] 4.3 Criar hook `usePageChrome` em `libs/shell-kit` para gerenciamento dinâmico de `breadcrumbLabel` e `filtersHandler` com limpeza no unmount
- [x] 4.4 Atualizar asserção de singleton em `libs/shell-kit` para validar que apenas uma live region global existe por runtime e verificar com `pnpm test libs/shell-kit`

## 5. Árvore de rotas, layouts e navegação acessível no host

- [x] 5.1 Criar layouts sem path `_app` (chrome completo, skip link, landmarks, breadcrumb, footer, tab bar) e `_modal` (fundo decorativo `aria-hidden`, sem chrome) em `apps/shell`
- [x] 5.2 Implementar tabela completa de rotas em `apps/shell/src/routes.tsx` usando constantes de `shared/router`, RemoteBoundary dentro do layout e preload por intenção
- [x] 5.3 Implementar comportamento acessível de troca de rota: foco no `main` (`tabIndex={-1}`), scroll restoration e anúncio do novo título na live region `polite`
- [x] 5.4 Atualizar componente 404 (`NotFoundComponent`) e erro de renderização (`RootErrorBoundary`) usando tokens de design e `ErrorState`
- [x] 5.5 Atualizar testes unitários de rotas e layouts em `apps/shell/src/routes.spec.tsx` e validar com `pnpm test apps/shell`

## 6. Sequência de boot, metadados e SEO

- [x] 6.1 Implementar ordem estrita de boot em `apps/shell/src/main.tsx` (`mocks -> singletons -> sessão -> router`) com skeleton e `aria-busy` durante resolução de sessão
- [x] 6.2 Configurar `apps/shell/index.html` e `public/robots.txt` com metadados SEO (`lang="pt-BR"`, viewport, theme-color, description, preload de fontes) e verificar console limpo no boot

## 7. Testes integrados e E2E Playwright

- [x] 7.1 Atualizar suíte Playwright em `apps/web-e2e` cobrindo acesso direto, refresh e navegação em todas as rotas nos viewports 390, 768 e 1440
- [x] 7.2 Implementar testes E2E para rota 404, isolamento de remote offline com retry no chrome, ações fora de escopo e busca mobile

## 8. Documentação e validação final

- [x] 8.1 Atualizar `docs/federation.md`, `docs/design/responsive.md`, `docs/design/fidelity-notes.md` e `ARCHITECTURE.md` (§5, §14, §18, §19)
- [x] 8.2 Executar `typecheck`, `lint`, `test` e `build` em todos os projetos afetados (`pnpm typecheck`, `pnpm lint`, `pnpm test`)
