# Proposal: align-header-footer-figma

## Why

Atualmente, os componentes de layout `Header` e `Footer` em `libs/shared/ui` foram implementados a partir de templates genéricos de e-commerce e divergem substancialmente dos frames de design de alta fidelidade do Figma (`dKMJKBVdX6q0Ym4OX5vd3V`), visíveis nos frames `2:2` (`Desktop / Início`), `10:244` (`Desktop / Detalhes`), `11:1278` (`Desktop / Carrinho`) e `14:5226` (`Mobile / Início`).

A fidelidade visual ao Figma compõe 20 pontos da avaliação do desafio técnico e constitui requisito de primeira classe na arquitetura. Alinhar o `Header` e o `Footer` ao Figma garante conformidade estrita com a marca Kurio, estrutura de navegação autêntica, seções de benefícios, newsletter integrada, faixa institucional de contato e rodapé completo com seções de perfil, suporte, coleções e carteiras compatíveis.

## What Changes

- **Header (`libs/shared/ui/src/components/layout/header.tsx`)**:
  - **Logo da Marca**: Substituição do ícone SVG genérico pela tipografia de marca autêntica `KURIO` em Roboto Mono Bold (uppercase com espaçamento ótico).
  - **Navegação Central**: Adoção dos links reais do Figma: `Início`, `Mercado`, `Criadores`, `Aprenda`. O item ativo exibe sublinhado âmbar espesso (`border-b-2 border-primary`), idêntico aos frames desktop.
  - **Ações de Topo Compactas**: Remoção do input estendido de busca no centro do cabeçalho; inclusão de botão de busca com ícone de lupa, botão de carrinho de compras com badge circular âmbar com contagem de itens, e botão `Entrar` preenchido em âmbar (`bg-primary text-ink font-bold`) com ícone de acesso.
  - **Adaptação Mobile**: Alinhamento com o comportamento mobile do Figma, onde a navegação de páginas reside na barra inferior (`MobileTabBar`), enquanto o topo prioriza a busca contextual.

- **Footer (`libs/shared/ui/src/components/layout/footer.tsx`)**:
  - **Seção Superior de Benefícios e Newsletter (4 Colunas)**:
    - Coluna 1: `(W)` **Segurança da carteira** ("Proteja sua carteira e colecione arte digital verificada com confiança.")
    - Coluna 2: `(C)` **Criadores em destaque** ("Conheça artistas, estúdios e comunidades que moldam a cultura digital na rede.")
    - Coluna 3: `(D)` **Alertas de lançamentos** ("Receba calendários de cunhagem, novidades de listas de acesso e análises do mercado.")
    - Coluna 4: **Antecipe-se ao próximo lançamento** com input `digite seu e-mail...`, botão `Enviar` (âmbar) e subtexto de consentimento/novidades.
  - **Seção Intermediária - Faixa Institucional de Contato**:
    - Faixa horizontal contrastante em `bg-surface-dark` (`#38220f`): logo `KURIO`, slogan institucional ("Feito para colecionadores, criadores e cultura"), e-mail de suporte (`contato@email.com`) e telefone (`+55 11 4002 8922`).
  - **Seção Inferior de Navegação e Carteiras (4 Colunas)**:
    - Coluna 1 (`Meu perfil`): Meu perfil, Minha coleção, Atividade, Estúdio do criador, Lista de interesse.
    - Coluna 2 (`Central de ajuda`): Central de ajuda, Como comprar NFTs, Carteira e segurança, Política do mercado, Denunciar item.
    - Coluna 3 (`Coleções`): Arte digital, Fotografia, Música, Arte 3D, Utilidade.
    - Coluna 4 (`Redes sociais e Carteiras`): Ícones sociais em caixas compactas (Facebook, Instagram, Twitter, LinkedIn, YouTube) e badges de carteiras compatíveis (`METAMASK • WALLETCONNECT • COINBASE`).
  - **Barra Inferior de Copyright**:
    - Texto exato do Figma: `© 2026 Kurio. Propriedade digital para todos.`

- **Catálogo Storybook e Regressão Visual**:
  - Atualização dos stories colocalizados de `Header` e `Footer` em `libs/shared/ui`.
  - Atualização das baselines visuais do Playwright em `apps/web-e2e` para refletir os novos layouts fiéis.

## Capabilities

### New Capabilities
*(Nenhuma nova capacidade de sistema é introduzida; o escopo consiste no alinhamento de componentes de interface).*

### Modified Capabilities
- `design-system-ui`: Atualização dos requisitos e cenários de fidelidade visual de layout para `Header` e `Footer`, garantindo que os componentes compostos correspondam com precisão estrutural e textual aos frames `2:2`, `10:244`, `11:1278` e `14:5226` do Figma.

## Impact

- **Projetos Nx Afetados**:
  - `shared-ui` (`scope:shared`, `type:ui`): Implementação dos componentes `Header` e `Footer`.
  - `shell` (`scope:shell`, `type:app`): Layout host consome o `Header` e `Footer` atualizados em todas as rotas.
  - `storybook` (`scope:storybook`, `type:app`): Documentação e stories com props atualizadas.
  - `web-e2e` (`scope:e2e`, `type:app`): Atualização de baselines visuais de snapshots do Playwright.
- **Fora de Escopo**:
  - Integração com backend ou provedores de e-mail reais para a newsletter (mantém aviso amigável acessível de demonstração).
  - Rotas reais para links institucionais secundários (ex: "Aprenda", "Denunciar item" exibem toast/feedback acessível de demonstração).
- **Premissas**:
  - Em telas mobile, o Header desktop com links colapsa graciosamente, transferindo a navegação primária para a `MobileTabBar` do Figma.
