# Spec Delta: lighthouse-audit

## Purpose
Estabelece a infraestrutura automatizada de auditoria oficial de qualidade e performance via Lighthouse contra o build integrado de produção, cobrindo rotas críticas em mobile e desktop com metodologia de 3 execuções e mediana, exportando relatórios e documentando justificativas técnicas e débitos técnicos.

## ADDED Requirements

### Requirement: Execução Automatizada do Lighthouse
O sistema SHALL disponibilizar o script automatizado `pnpm lighthouse` que executa a auditoria completa contra o servidor de preview do build integrado de produção (`http://localhost:4200`) com o cenário padrão de mocks ativo.

#### Scenario: Execução em Início e Detalhe
- **WHEN** o comando `pnpm lighthouse` for executado após o build de produção
- **THEN** o script SHALL auditar sucessivamente a rota de Início (`/`) e a rota de Detalhe do NFT (`/nft/nft-01`), nos perfis `desktop` e `mobile`.

#### Scenario: Subida ou Reutilização do Servidor de Preview
- **WHEN** `pnpm lighthouse` for disparado e o servidor de preview (`http://localhost:4200`) não estiver em execução
- **THEN** o script SHALL inicializar o servidor de preview automaticamente e encerrá-lo ao término das auditorias, ou reutilizar a instância existente se já estiver ativa.

---

### Requirement: Metodologia de Medição e Cálculo de Medianas
Para cada combinação de página (Início e Detalhe) e perfil (Mobile e Desktop), o sistema SHALL executar exatamente 3 medições independentes e calcular a mediana estatística dos scores e das Core Web Vitals.

#### Scenario: Coleta de Métricas e Categorias
- **WHEN** as 3 execuções de uma rota e perfil forem concluídas
- **THEN** o sistema SHALL extrair os scores das categorias Performance, Acessibilidade, Boas Práticas e SEO (escala 0 a 100), e os valores absolutos de LCP (segundos ou ms), CLS (adimensional) e TBT (ms).

#### Scenario: Determinação da Mediana
- **WHEN** os resultados das 3 rodadas forem ordenados numericamente
- **THEN** a medição central (2ª rodada na ordem) SHALL ser adotada como o valor consolidado oficial da métrica para aquela combinação.

---

### Requirement: Geração e Versionamento de Relatórios
O runner do Lighthouse SHALL exportar relatórios completos em formatos HTML e JSON, além de gerar uma tabela consolidada em Markdown em `docs/lighthouse/summary.md`.

#### Scenario: Estrutura de Diretórios de Saída
- **WHEN** a auditoria for concluída com sucesso
- **THEN** os relatórios detalhados SHALL ser gravados em `docs/lighthouse/runs/` identificados por rota, perfil e número da execução, e a tabela de medianas consolidada SHALL ser escrita em `docs/lighthouse/summary.md`.

#### Scenario: Tabela Consolidada com Metas
- **WHEN** o arquivo `docs/lighthouse/summary.md` for gerado
- **THEN** ele SHALL apresentar uma tabela comparativa com os valores obtidos vs metas do desafio (Performance ≥ 90, Acessibilidade ≥ 95, Boas Práticas ≥ 95, SEO ≥ 90, e métricas LCP, CLS, TBT), além de versão do Node, Lighthouse e navegador utilizado.

---

### Requirement: Integridade da Aplicação e Preservação de Recursos
A auditoria SHALL ser executada sobre a aplicação real completa, sem simplificações ou remoções artificiais de assets.

#### Scenario: Preservação de Fontes, Imagens e Componentes
- **WHEN** o Lighthouse navegar e auditar as rotas
- **THEN** todas as fontes self-hosted, imagens de catálogo/cards e componentes interativos SHALL carregar normalmente sem flags que ocultem conteúdo ou desativem renderização para inflar pontuação.

---

### Requirement: Documentação de Débito Técnico e Justificativas Técnicas
Quaisquer métricas que fiquem abaixo das metas teóricas devido a características arquiteturais (como a sobrecarga de interceptação do Service Worker MSW e cascata de Module Federation em rede simulada de mobile) SHALL ser tecnicamente justificadas em `ARCHITECTURE.md` (§14 e §17).

#### Scenario: Registro Formal de Desvios
- **WHEN** um score ou métrica de Core Web Vitals em mobile ou desktop não atingir a meta estrita
- **THEN** a documentação em `ARCHITECTURE.md` §14 SHALL descrever a causa raiz identificada (ex.: impacto do SW MSW no LCP mobile) e registrar em §17 como débito técnico P1 aceitável conforme o enunciado do desafio.
