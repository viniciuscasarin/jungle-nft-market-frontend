# Spec Delta

## Purpose

Define a sequência determinística de inicialização do host shell (mocks, clientes, sessão e roteador) e os metadados globais do documento HTML para SEO e acessibilidade.

## ADDED Requirements

### Requirement: Deterministic Shell Bootstrap Sequence
O host shell SHALL executar rigorosamente a ordem de inicialização: inicialização condicional de mocks MSW -> criação e injeção de clientes singleton (`QueryClient`, `HttpClient`, `RealtimeClient`) -> resolução inicial da sessão de usuário -> montagem do roteador TanStack Router. Nenhuma rota privada SHALL renderizar antes da resolução completa da sessão inicial.

#### Scenario: Boot com token persistido
- **WHEN** a aplicação carrega com um token existente no armazenamento local
- **THEN** o shell consulta a sessão via API simulada antes de liberar a renderização de rotas protegidas, exibindo área de usuário com `aria-busy="true"` e skeleton.

#### Scenario: Boot sem token (visitante)
- **WHEN** a aplicação carrega sem token persistido
- **THEN** o shell transita imediatamente para estado anônimo e o roteador inicia sem bloquear o carregamento do catálogo público.

### Requirement: Document Metadata and SEO Essentials
O documento raiz `index.html` e a casca do Shell SHALL configurar metadados essenciais incluindo `lang="pt-BR"`, `meta name="description"`, `viewport`, `theme-color`, favicon, `public/robots.txt` e preload de fontes críticas Roboto Mono. O console do navegador SHALL permanecer limpo de erros ou advertências no carregamento inicial sob o cenário padrão de mocks.

#### Scenario: Integridade de metadados no carregamento
- **WHEN** o documento raiz do shell é carregado no navegador
- **THEN** a tag `html` declara `lang="pt-BR"`, o arquivo `robots.txt` é servido com status 200 e nenhuma mensagem de erro ou aviso é impressa no console do navegador.
