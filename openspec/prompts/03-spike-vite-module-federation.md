Crie a change `spike-vite-module-federation`.

## Contexto
O Nx não tem generator oficial para Vite + `@module-federation/vite` (o suporte nativo é webpack/Rspack). Esta é a maior incerteza técnica do projeto. Valide a combinação com os apps placeholder da change `bootstrap-nx-workspace`, sem lógica de negócio.

## Requisitos
1. Integrar `apps/shell` (host) e `apps/storefront` (remote) com `@module-federation/vite`, expondo uma página placeholder e carregando-a via `lazy` no host.
2. Singletons funcionando em dev e em build: `react`, `react-dom`, `@tanstack/react-router`, `@tanstack/react-query` e uma lib do workspace (prova de instância única, por exemplo um contador de instâncias de um módulo compartilhado).
3. Targets Nx `serve`, `build` e `preview` por app, com cache e `dependsOn` corretos (remote construído antes do host no preview integrado).
4. Build consolidado em pasta única: shell em `/` e remote em `/remotes/storefront/`, servido por `preview` com SPA fallback e refresh em rota do remote funcionando.
5. Headers de cache: `remoteEntry` sem cache longo, chunks com hash imutáveis.
6. Remote fora do ar: o host não quebra (apenas confirme o comportamento; o `RemoteBoundary` definitivo vem depois).
7. Tailwind v4 aplicado uma vez pelo host, sem CSS duplicado no remote integrado.
8. Medir e registrar: tempo de build, número de requisições e tamanho do `remoteEntry` na carga inicial.

## Entregável
`docs/spikes/module-federation.md` com: configuração que funcionou, problemas encontrados, comandos, medições e **decisão go/no-go**. Se for no-go, descreva o fallback: os fluxos continuam apps isolados com as mesmas tags e fronteiras, mas integrados por `import()` de libs de página no shell, sem federation, e liste o impacto nas Etapas 0, 1 e 5 e em `ARCHITECTURE.md`.

## Cenários de aceitação
- WHEN rodo `pnpm build && pnpm preview` THEN o shell em `/` carrega a página do remote servida de `/remotes/storefront/`.
- WHEN dou refresh na rota da página do remote THEN ela carrega.
- WHEN host e remote estão ativos THEN existe uma única instância de react e do módulo compartilhado de teste.
- WHEN o remote está fora do ar THEN o shell continua carregando as demais rotas.

## Fora de escopo
Telas reais, ShellContext, RemoteBoundary final, checkout e account.

Gere proposal, specs e tasks. Não implemente nesta etapa: a implementação segue depois, uma task por vez, com pausa entre elas.