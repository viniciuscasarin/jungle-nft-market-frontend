# design-tokens-and-assets Specification

## Purpose

Define as especificações e contratos duráveis para a extração, catalogação, auditoria e validação offline de tokens semânticos, ativos visuais, referências de telas e fontes tipográficas do Figma, garantindo autonomia completa para o CI e fidelidade visual estrita para o design system.

## Requirements

### Requirement: Rastreabilidade e Estrutura de Tokens de Design
O repositório SHALL manter um arquivo consolidado `design/tokens/tokens.json` definindo tokens semânticos de cores, tipografia, espaçamento, raio de borda e sombras derivados exclusivamente do Figma. Todo token individual SHALL conter um campo `nodeId` apontando para o elemento ou estilo de origem no Figma, sem valores fabricados ou arbitrários. Quase-duplicados e consolidações de casing SHALL ser auditados em `docs/design/token-audit.md`.

#### Scenario: Consulta de token rastreável
- **WHEN** um desenvolvedor ou ferramenta inspeciona qualquer token dentro de `design/tokens/tokens.json`
- **THEN** o token apresenta valor semântico válido e um campo `nodeId` com o identificador de nó do Figma correspondente.

#### Scenario: Consolidação de cores duplicadas
- **WHEN** cores no Figma possuírem duplicidade de casing (ex: `color/ink` e `Color/Ink`) ou variação mínima de luminosidade (ex: `#f7f3ec` e `#f5f1eb`)
- **THEN** o arquivo `tokens.json` expõe um único token semântico normalizado e a justificativa é documentada em `docs/design/token-audit.md`.

---

### Requirement: Validação Offline e Ausência de Dependência Externa
O projeto SHALL disponibilizar o script `pnpm design:check` que valida offline a integridade de `design/tokens/tokens.json` e `design/assets/manifest.json`. O script SHALL assegurar que todos os tokens possuam `nodeId`, que os schemas JSON sejam respeitados e que todo arquivo referenciado no manifesto exista em disco no diretório `design/assets/`. O CI e builds de produção SHALL executar sem nenhuma chamada de rede ao Figma.

#### Scenario: Execução com sucesso da validação de design
- **WHEN** o comando `pnpm design:check` é executado na raiz do projeto com todos os ativos e tokens presentes
- **THEN** o script finaliza com código 0 e reporta a validação bem-sucedida de schemas e integridade de ativos.

#### Scenario: Execução em ambiente sem conectividade externa
- **WHEN** o build ou o CI executa sem chaves de API do Figma e sem acesso à internet
- **THEN** todos os testes e builds passam utilizando exclusivamente os artefatos locais versionados em `design/`.

#### Scenario: Detecção de ativo faltante no manifesto
- **WHEN** um ativo declarado no manifesto `manifest.json` não existir fisicamente no disco
- **THEN** o comando `pnpm design:check` falha com código de saída diferente de 0 e aponta o caminho e `nodeId` do ativo ausente.

---

### Requirement: Auditoria de Contraste e Acessibilidade (WCAG)
A razão de contraste de todos os pares de cores de texto e superfícies SHALL ser documentada em `docs/design/token-audit.md` contra WCAG 2.1 AA (mínimo 4.5:1), e delimitadores de formulário SHALL ser avaliados contra WCAG 1.4.11 (mínimo 3:1), com proposta de ajuste de acessibilidade para elementos abaixo do patamar.

#### Scenario: Verificação de contraste de texto
- **WHEN** os tokens de texto sobre superfícies (`ink`, `surface-card`, `surface-raised`) são auditados
- **THEN** `docs/design/token-audit.md` registra que todos os pares passam com folga pelo patamar WCAG AA.

#### Scenario: Sinalização de contraste em bordas de campos de entrada
- **WHEN** as bordas de campos (`border` e `border-soft`) sobre o fundo `ink` são auditadas
- **THEN** `docs/design/token-audit.md` registra a razão inferior a 3:1 (1.3:1 e 1.7:1) como não-conforme com WCAG 1.4.11, indicando a necessidade de reforço de borda no design system.

---

### Requirement: Tipografia Self-Hosted e Resolução de Unidades
A tipografia do projeto SHALL utilizar exclusivamente a família Roboto Mono, disponibilizada de forma self-hosted em `design/fonts/` nos pesos 400, 500 e 700 em formato woff2. A escala tipográfica SHALL ser consolidada a partir dos estilos de texto do Figma, e espaçamentos entre letras (letter-spacing) com valores percentuais no Figma SHALL ser resolvidos para unidades CSS relativas (`em`) ou absolutas (`px`) proporcionais.

#### Scenario: Inspeção dos arquivos de fonte local
- **WHEN** o diretório `design/fonts/` é verificado
- **THEN** constam os arquivos de fonte Roboto Mono nos pesos 400 (Regular), 500 (Medium) e 700 (Bold) sem dependência de carregamento remoto.

#### Scenario: Resolução de letter-spacing do Figma
- **WHEN** estilos de texto como `Body/14 Medium · lh 16` com `letterSpacing: 10` são convertidos para tokens
- **THEN** o valor é convertido para 1.4px (10% de 14px) ou `0.1em`, mantendo fidelidade estrita ao design.

---

### Requirement: Mapeamento de Telas e Responsividade
O repositório SHALL documentar em `docs/design/screens.md` o mapeamento de todas as telas para frames desktop (1440px) e mobile (414px), registrando modais sobre backdrop e telas sem frame mobile. Regras de layout fluido e adaptação para tablet 768px SHALL ser descritas em `docs/design/responsive.md`.

#### Scenario: Consulta de frame de tela
- **WHEN** qualquer tela do enunciado do desafio é pesquisada em `docs/design/screens.md`
- **THEN** a tela é encontrada com os nós de frame desktop e mobile correspondentes ou explicitamente marcada como "sem frame" com sua estratégia de derivação.

#### Scenario: Adaptação para tablet 768px
- **WHEN** a responsividade em 768px é verificada em `docs/design/responsive.md`
- **THEN** constam regras para o colapso de 4 para 2 colunas do catálogo e a conversão da sidebar de filtros em drawer.

---

### Requirement: Inventário de Componentes e Decisões de Design
O repositório SHALL catalogar em `docs/design/components.md` todos os componentes repetidos do Figma com suas variantes, props mapeadas para `libs/shared/ui` e estados não desenhados. Diretrizes de animação e decisões arquiteturais SHALL ser registradas em `docs/design/motion.md` e `docs/design/open-questions.md`.

#### Scenario: Inventário de estados não desenhados
- **WHEN** um componente interativo (ex: botão, input, card de NFT) é consultado em `docs/design/components.md`
- **THEN** constam os estados desenhados e a especificação explícita dos estados não desenhados a serem implementados.

#### Scenario: Registro de decisões arquiteturais fechadas
- **WHEN** as decisões sobre modais, checkout e avaliações são consultadas em `docs/design/open-questions.md`
- **THEN** constam as decisões consolidadas da seção 7 do pré-levantamento alinhadas com `ARCHITECTURE.md`.

---

### Requirement: Tratamento de Erro na Extração de Design
Se o servidor MCP ou a API do Figma retornar erro de autenticação, permissão ou indisponibilidade durante o processo de extração, a rotina de extração SHALL interromper imediatamente com erro explícito descritivo, proibindo categoricamente a fabricação ou suposição de valores não validados.

#### Scenario: Falha de autenticação no Figma
- **WHEN** as credenciais de acesso ao Figma forem inválidas ou expiradas
- **THEN** o processo de extração falha com mensagem de erro explícita sobre a falta de autorização e nenhum arquivo parcial ou inconsistente é gerado.
