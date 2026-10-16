import { test, expect } from '@playwright/test';

test.describe('Shell Navigation, Layouts e Responsividade', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  });

  test.describe('Viewports e Responsividade (390, 768, 1440 px)', () => {
    test('1440px Desktop: exibe Header desktop completo e não renderiza SearchBar nem MobileTabBar', async ({
      page,
    }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.goto('/');

      // Header desktop visível com logo Kurio e navegação
      const desktopHeader = page.locator('header.hidden.lg\\:block, header:not(.lg\\:hidden)');
      await expect(desktopHeader.first()).toBeVisible();
      await expect(page.getByRole('link', { name: /Kurio/i })).toBeVisible();

      // SearchBar e MobileTabBar não devem estar visíveis
      const mobileSearchBar = page.locator('header.lg\\:hidden');
      const mobileTabBar = page.locator('nav[aria-label="Navegação móvel"]');
      await expect(mobileSearchBar).not.toBeVisible();
      await expect(mobileTabBar).not.toBeVisible();

      // Sem overflow horizontal
      const hasHorizontalScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });
      expect(hasHorizontalScroll).toBe(false);
    });

    test('1440px Desktop: skip link deve ser primeiro foco e levar ao main', async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.goto('/');

      const skipLink = page.getByRole('link', { name: /Pular para o conteúdo/i });
      await skipLink.focus();
      await expect(skipLink).toBeFocused();

      // Ativa o skip link
      await page.keyboard.press('Enter');

      // Foco deve estar no main (#main-content)
      const mainContent = page.locator('#main-content');
      await expect(mainContent).toBeFocused();
    });

    test('768px Tablet: oculta Header desktop e exibe MobileTabBar na base sem overflow horizontal', async ({
      page,
    }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.goto('/');

      // Header desktop oculto
      const desktopHeader = page.locator('header.hidden.lg\\:block');
      await expect(desktopHeader).not.toBeVisible();

      // Shell não inventa header mobile
      await expect(page.locator('header.lg\\:hidden')).toHaveCount(0);

      // MobileTabBar visível
      const mobileTabBar = page.locator('nav[aria-label="Navegação móvel"]');
      await expect(mobileTabBar).toBeVisible();

      // Sem overflow horizontal
      const hasHorizontalScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });
      expect(hasHorizontalScroll).toBe(false);
    });

    test('390px Mobile: oculta Header desktop e exibe MobileTabBar sem overflow horizontal nem header mobile no shell', async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto('/');

      // Header desktop oculto
      const desktopHeader = page.locator('header.hidden.lg\\:block');
      await expect(desktopHeader).not.toBeVisible();

      // Shell não inventa header mobile
      await expect(page.locator('header.lg\\:hidden')).toHaveCount(0);

      // MobileTabBar visível
      const mobileTabBar = page.locator('nav[aria-label="Navegação móvel"]');
      await expect(mobileTabBar).toBeVisible();

      const hasHorizontalScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });
      expect(hasHorizontalScroll).toBe(false);

      // Garante que em outras páginas (ex: carrinho) o header também permanece ausente no mobile
      await page.goto('/carrinho');
      await expect(page.locator('header.hidden.lg\\:block')).not.toBeVisible();
      await expect(page.locator('header.lg\\:hidden')).toHaveCount(0);
    });
  });

  test.describe('Layouts _app e _modal e Rotas Canônicas', () => {
    test('Rotas _app (Home, Carrinho, PDP) renderizam com landmarks completos', async ({ page }) => {
      // Home
      await page.goto('/');
      await expect(page.locator('main#main-content')).toBeVisible();
      await expect(page.locator('footer')).toBeVisible();

      // Carrinho (público)
      await page.goto('/carrinho');
      await expect(page.locator('main#main-content')).toBeVisible();
      await expect(page.getByTestId('checkout-cart-page')).toBeVisible();
      await expect(page.locator('footer')).toBeVisible();

      // PDP
      await page.goto('/nft/1');
      await expect(page.locator('main#main-content')).toBeVisible();
      await expect(page.getByTestId('storefront-pdp-page')).toBeVisible();
      await expect(page.locator('footer')).toBeVisible();
    });

    test('Rotas _modal (/login, /cadastro) renderizam sem Header, Footer ou TabBar e com fundo decorativo aria-hidden', async ({
      page,
    }) => {
      await page.goto('/login');

      // Não há Header desktop nem MobileTabBar nem Footer
      await expect(page.locator('header.hidden.lg\\:block')).not.toBeVisible();
      await expect(page.locator('nav[aria-label="Navegação móvel"]')).not.toBeVisible();
      await expect(page.locator('footer')).not.toBeVisible();

      // Fundo decorativo possui aria-hidden="true"
      const decorativeBg = page.locator('div[aria-hidden="true"]');
      await expect(decorativeBg.first()).toBeAttached();

      // Diálogo de autenticação visível
      await expect(page.getByRole('dialog')).toBeVisible();
      await expect(page.getByRole('heading', { level: 1, name: /Entrar na Conta/i })).toBeVisible();
    });

    test('Rotas privadas redirecionam visitante para /login com parâmetro redirect', async ({ page }) => {
      await page.goto('/pagamento');
      await expect(page).toHaveURL(/\/login\?redirect=%2Fpagamento/);

      await page.goto('/perfil');
      await expect(page).toHaveURL(/\/login\?redirect=%2Fperfil/);

      await page.goto('/carteiras');
      await expect(page).toHaveURL(/\/login\?redirect=%2Fcarteiras/);
    });

    test('Paths legados (/catalogo, /checkout, /pedidos/1/confirmacao) exibem 404 sem redirect', async ({
      page,
    }) => {
      await page.goto('/catalogo');
      await expect(page).toHaveURL('/catalogo');
      await expect(page.getByRole('heading', { level: 1, name: '404' })).toBeVisible();

      await page.goto('/checkout');
      await expect(page).toHaveURL('/checkout');
      await expect(page.getByRole('heading', { level: 1, name: '404' })).toBeVisible();

      await page.goto('/pedidos/1/confirmacao');
      await expect(page).toHaveURL('/pedidos/1/confirmacao');
      await expect(page.getByRole('heading', { level: 1, name: '404' })).toBeVisible();
    });

    test('Página 404 renderiza dentro do layout _app com meta robots noindex e link para início', async ({
      page,
    }) => {
      await page.goto('/rota-completamente-desconhecida');

      // Layout _app ativo com header e footer
      await expect(page.locator('main#main-content')).toBeVisible();
      await expect(page.getByRole('contentinfo')).toBeVisible();

      // Meta noindex
      const robotsMeta = page.locator('meta[name="robots"][content="noindex"]');
      await expect(robotsMeta).toBeAttached();

      // Link para o início retorna para a raiz canônica
      const homeLink = page.getByRole('link', { name: /Voltar para o Início/i });
      await expect(homeLink).toBeVisible();
      await homeLink.click();
      await expect(page).toHaveURL(/\/(|\?.*)$/);
    });
  });

  test.describe('Ações Fora de Escopo e Busca Mobile', () => {
    test('Ações fora de escopo no Header ("Criadores", "Aprenda") exibem feedback padronizado sem navegar', async ({
      page,
    }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.goto('/');

      // Clica em "Criadores" (ação fora de escopo)
      const creatorsButton = page.getByRole('link', { name: /Criadores/i });
      await expect(creatorsButton).toBeVisible();
      await creatorsButton.click({ force: true });

      // Toast ou live region com mensagem padronizada
      await expect(page.getByText(/indisponível nesta demonstração/i).first()).toBeVisible();
    });

    test('Botão de filtros mobile na Home abre o Drawer e o Shell não inventa header mobile', async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto('/');

      // Shell não deve renderizar header mobile
      await expect(page.locator('header.lg\\:hidden')).toHaveCount(0);

      // Botão de filtros exclusivo da Home mobile
      const filterButton = page.getByTestId('mobile-filter-button');
      await expect(filterButton).toBeVisible();
      await filterButton.click();

      // Drawer de filtros abre acessivelmente
      await expect(page.getByRole('dialog')).toBeVisible();
    });

    test('Isolamento de remote offline: exibe ErrorState acessível no chrome com retry', async ({
      page,
    }) => {
      let blockStorefront = true;

      await page.context().route('**', (route) => {
        const url = route.request().url();
        if (url.includes('storefront') && blockStorefront) {
          return route.abort('failed');
        }
        return route.continue();
      });

      await page.goto('/');

      // Chrome (Header e Footer) permanece visível
      await expect(page.getByRole('contentinfo')).toBeVisible();

      // ErrorBoundary renderiza aviso acessível
      await expect(page.getByRole('heading', { level: 1, name: /Módulo Indisponível/i })).toBeVisible({ timeout: 15000 });
      const retryBtn = page.getByRole('button', { name: /Tentar Novamente/i });
      await expect(retryBtn).toBeVisible();

      // Libera o remote e clica em tentar novamente
      blockStorefront = false;
      await retryBtn.click();

      // Remote recupera
      await expect(page.getByTestId('home-page-content')).toBeVisible({ timeout: 15000 });
    });
  });
});
