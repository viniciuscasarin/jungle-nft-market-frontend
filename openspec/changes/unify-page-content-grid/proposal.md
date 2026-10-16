# Padronizar grid de conteúdo

## Why
Header, breadcrumb e páginas usam larguras e recuos distintos, deixando o conteúdo desalinhado com o footer.

## What Changes
- Adotar o container do footer como padrão compartilhado: máximo de 1280px, centralizado, padding horizontal de 16px, 24px em sm e 32px em lg.
- Aplicar o padrão ao chrome, catálogo, detalhe, conta, carrinho e pagamento, incluindo estados assíncronos.
- Preservar as colunas internas e os modais, ajustando apenas a estrutura necessária para evitar recuos duplicados.

## Impact
shared-ui, shell, catalog-ui/feature, profile-ui, cart-ui, checkout-ui e web-e2e. A premissa é que “grid” significa os limites laterais do conteúdo, sem igualar a quantidade de colunas de cada página.
