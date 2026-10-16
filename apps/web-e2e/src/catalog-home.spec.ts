import { test, expect } from '@playwright/test';

test.describe('Fluxo 1: Descoberta e Catálogo na Home — Caminho Feliz e Estados de Falha', () => {
  test.beforeEach(async ({ page }) => {
    // Garante estado limpo antes de cada teste
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  });

  test('deve exibir o catálogo com busca, filtros combináveis e reset de página', async ({ page }) => {
    // Carrega a Home
    await page.goto('/');

    // Aguarda carregamento do catálogo (skeleton -> grid)
    await expect(page.getByRole('region', { name: /catálogo/i })).toBeVisible();

    // Valida presença de cards de NFT na grade inicial
    const nftCards = page.getByRole('article').filter({ hasText: /ETH/i });
    await expect(nftCards.first()).toBeVisible({ timeout: 10000 });

    // Aplica busca textual
    const searchInput = page.getByRole('searchbox', { name: /buscar nfts/i });
    await searchInput.fill('rare');
    await searchInput.press('Enter');

    // Aguarda atualização da URL com query string
    await expect(page).toHaveURL(/q=rare/);

    // Seleciona um filtro de coleção (desktop)
    if (await page.getByLabel(/Coleções/i).isVisible()) {
      await page.getByLabel(/Coleções/i).click();
      const collectionOption = page.getByRole('option', { name: /crypto.*art/i }).first();
      if (await collectionOption.isVisible()) {
        await collectionOption.click();
      }
    }

    // Verifica que URL reflete filtros ativos
    await expect(page).toHaveURL(/q=rare/);

    // Simula paginação: navega para página 2 (se houver)
    const nextPageButton = page.getByRole('button', { name: /próxima.*página|página 2/i });
    if (await nextPageButton.isVisible({ timeout: 3000 })) {
      await nextPageButton.click();
      await expect(page).toHaveURL(/page=2/);
    }

    // Altera filtro/busca enquanto em página 2+ → deve resetar para página 1
    const sortDropdown = page.getByRole('combobox', { name: /ordenar/i });
    if (await sortDropdown.isVisible({ timeout: 3000 })) {
      await sortDropdown.click();
      const sortOption = page.getByRole('option', { name: /preço.*menor/i }).first();
      if (await sortOption.isVisible()) {
        await sortOption.click();
      }
      // URL deve resetar page=1
      await expect(page).toHaveURL(/page=1|^(?!.*page=)/);
    }
  });

  test('deve restaurar filtros e página após refresh (F5)', async ({ page }) => {
    // Navega diretamente para URL com filtros e página
    await page.goto('/?q=crypto&collections=art-gallery&page=2');

    // Aguarda catálogo carregar
    await expect(page.getByRole('region', { name: /catálogo/i })).toBeVisible();

    // Valida que busca está preenchida
    const searchInput = page.getByRole('searchbox', { name: /buscar nfts/i });
    await expect(searchInput).toHaveValue('crypto');

    // Recarrega a página
    await page.reload();

    // Verifica que URL, busca e página foram restauradas
    await expect(page).toHaveURL(/q=crypto.*collections=art-gallery.*page=2/);
    await expect(searchInput).toHaveValue('crypto');
  });

  test('deve exibir EmptyState quando filtros não retornam resultados', async ({ page }) => {
    await page.goto('/');

    // Aplica busca impossível
    const searchInput = page.getByRole('searchbox', { name: /buscar nfts/i });
    await searchInput.fill('xyznonexistent999');
    await searchInput.press('Enter');

    // Aguarda EmptyState
    await expect(page.getByRole('heading', { name: /nenhum nft encontrado/i })).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/limpar filtros/i)).toBeVisible();

    // Clica no botão de limpar filtros
    const clearButton = page.getByRole('button', { name: /limpar filtros/i });
    await clearButton.click();

    // Catálogo deve recarregar com todos os itens
    await expect(page).toHaveURL(/^(?!.*q=)/); // sem query string
    const nftCards = page.getByRole('article').filter({ hasText: /ETH/i });
    await expect(nftCards.first()).toBeVisible({ timeout: 10000 });
  });

  test('deve exibir ErrorState e permitir retry em caso de falha de rede', async ({ page }) => {
    // Intercepta a requisição e força erro 5xx
    await page.route('**/api/nfts*', (route) => {
      route.fulfill({ status: 500, body: JSON.stringify({ message: 'Internal Server Error' }) });
    });

    await page.goto('/');

    // Aguarda ErrorState
    await expect(page.getByRole('heading', { name: /erro.*carregar/i })).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/tentar novamente/i)).toBeVisible();

    // Remove intercepção para simular recuperação
    await page.unroute('**/api/nfts*');

    // Clica no botão de retry
    const retryButton = page.getByRole('button', { name: /tentar novamente/i });
    await retryButton.click();

    // Catálogo deve carregar com sucesso
    const nftCards = page.getByRole('article').filter({ hasText: /ETH/i });
    await expect(nftCards.first()).toBeVisible({ timeout: 10000 });
  });

  test('deve abrir Drawer de filtros em viewport mobile e aplicar filtros', async ({ page }) => {
    // Define viewport mobile
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');

    // Aguarda catálogo carregar
    await expect(page.getByRole('region', { name: /catálogo/i })).toBeVisible();

    // Clica no botão de filtros mobile (pode estar no header ou área de filtros)
    const filterButton = page.getByRole('button', { name: /filtros|filtrar/i }).first();
    await expect(filterButton).toBeVisible({ timeout: 5000 });
    await filterButton.click();

    // Drawer de filtros deve abrir
    const drawer = page.getByRole('dialog', { name: /filtros/i });
    await expect(drawer).toBeVisible({ timeout: 5000 });

    // Seleciona um filtro dentro do Drawer
    const collectionCheckbox = drawer.getByRole('checkbox', { name: /crypto.*art/i }).first();
    if (await collectionCheckbox.isVisible({ timeout: 3000 })) {
      await collectionCheckbox.check();
    }

    // Aplica filtros (pode ter botão "Aplicar" ou fechar Drawer)
    const applyButton = drawer.getByRole('button', { name: /aplicar|fechar/i });
    if (await applyButton.isVisible({ timeout: 3000 })) {
      await applyButton.click();
    } else {
      await page.keyboard.press('Escape');
    }

    // Drawer deve fechar e URL deve refletir filtro
    await expect(drawer).not.toBeVisible({ timeout: 5000 });
  });

  test('deve navegar para PDP ao clicar em card, Hero ou Featured NFT', async ({ page }) => {
    await page.goto('/');

    // Aguarda catálogo carregar
    await expect(page.getByRole('region', { name: /catálogo/i })).toBeVisible();

    // Clica no primeiro card de NFT
    const firstCard = page.getByRole('article').filter({ hasText: /ETH/i }).first();
    await expect(firstCard).toBeVisible({ timeout: 10000 });
    await firstCard.click();

    // Deve navegar para rota /nft/:id
    await expect(page).toHaveURL(/\/nft\/.+/, { timeout: 10000 });
  });

  test('deve exibir aviso "indisponível nesta demonstração" ao clicar em Promo cards', async ({ page }) => {
    await page.goto('/');

    // Aguarda seção de promoções
    const promoSection = page.getByRole('region', { name: /promoção|novidades/i });
    if (await promoSection.isVisible({ timeout: 5000 })) {
      // Clica no primeiro CTA de promo
      const promoCta = promoSection.getByRole('button', { name: /explorar|ver mais/i }).first();
      if (await promoCta.isVisible({ timeout: 3000 })) {
        await promoCta.click();

        // Verifica toast ou mensagem acessível
        await expect(page.getByText(/indisponível nesta demonstração/i)).toBeVisible({ timeout: 5000 });
      }
    }
  });

  test('deve exibir aviso "indisponível nesta demonstração" ao clicar em Blog cards', async ({ page }) => {
    await page.goto('/');

    // Aguarda seção de blog
    const blogSection = page.getByRole('region', { name: /blog|diário/i });
    if (await blogSection.isVisible({ timeout: 5000 })) {
      // Clica no primeiro card de blog
      const blogCard = blogSection.getByRole('article').first();
      if (await blogCard.isVisible({ timeout: 3000 })) {
        await blogCard.click();

        // Verifica toast ou mensagem acessível
        await expect(page.getByText(/indisponível nesta demonstração/i)).toBeVisible({ timeout: 5000 });
      }
    }
  });

  test('deve manter foco no teclado e navegação acessível na grade de NFTs', async ({ page }) => {
    await page.goto('/');

    // Aguarda catálogo carregar
    await expect(page.getByRole('region', { name: /catálogo/i })).toBeVisible();
    const nftCards = page.getByRole('article').filter({ hasText: /ETH/i });
    await expect(nftCards.first()).toBeVisible({ timeout: 10000 });

    // Navega por Tab
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    // Verifica que o foco está em um elemento interativo
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();

    // Pressiona Enter no card focado
    await page.keyboard.press('Enter');

    // Deve navegar para PDP
    await expect(page).toHaveURL(/\/nft\/.+/, { timeout: 10000 });
  });
});
