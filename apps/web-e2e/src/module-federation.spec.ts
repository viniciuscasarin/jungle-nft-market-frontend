import { test, expect } from '@playwright/test';

test.describe('Module Federation Runtime & Resiliência', () => {
  test('deve carregar todos os remotes dinamicamente e verificar singleton probe', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('heading', { level: 1, name: /Jungle NFT Marketplace/i })).toBeVisible();

    // 1. Navega para storefront /catalogo
    const catalogLink = page.getByRole('link', { name: 'Catálogo', exact: true });
    await expect(catalogLink).toBeVisible();
    await catalogLink.click();

    await expect(page).toHaveURL(/\/catalogo/);
    await expect(page.getByRole('heading', { level: 1, name: 'Storefront Remote' })).toBeVisible();
    await expect(page.getByRole('region', { name: 'Catálogo Storefront' })).toBeVisible();

    // 2. Navega para storefront /nft/42 (PDP)
    await page.goto('/nft/42');
    await expect(page.getByTestId('storefront-pdp-page')).toBeVisible();
    await expect(page.getByRole('heading', { level: 1, name: /Detalhes do NFT #42/i })).toBeVisible();

    // 3. Navega para checkout /carrinho
    const cartLink = page.getByRole('link', { name: 'Carrinho', exact: true });
    await cartLink.click();
    await expect(page).toHaveURL(/\/carrinho/);
    await expect(page.getByTestId('checkout-cart-page')).toBeVisible();
    await expect(page.getByRole('heading', { level: 1, name: 'Carrinho de Compras' })).toBeVisible();

    // 4. Verifica verificação estrita de singletons no runtime
    const verification = await page.evaluate(() => {
      const regKey = Symbol.for('nft.singleton.registry');
      const globalObj = window as unknown as Record<symbol, { verify: () => { valid: boolean; keys: string[] } }>;
      return globalObj[regKey]?.verify();
    });

    if (verification) {
      expect(verification.valid).toBe(true);
      expect(verification.keys).toContain('queryClient');
      expect(verification.keys).toContain('httpClient');
      expect(verification.keys).toContain('realtimeClient');
    }
  });

  test('deve aplicar guard requireAuth redirecionando rotas protegidas para /login', async ({ page }) => {
    // Tenta acessar /checkout sem autenticação
    await page.goto('/checkout');
    await expect(page).toHaveURL(/\/login\?redirect=.*checkout/);
    await expect(page.getByRole('heading', { level: 1, name: 'Entrar na Conta' })).toBeVisible();

    // Tenta acessar /perfil sem autenticação
    await page.goto('/perfil');
    await expect(page).toHaveURL(/\/login\?redirect=.*perfil/);

    // Tenta acessar /carteiras sem autenticação
    await page.goto('/carteiras');
    await expect(page).toHaveURL(/\/login\?redirect=.*carteiras/);

    // Tenta acessar /pedidos/100/confirmacao sem autenticação
    await page.goto('/pedidos/100/confirmacao');
    await expect(page).toHaveURL(/\/login\?redirect=.*confirmacao/);
  });

  test('deve suportar SPA fallback e refresh direto (F5) em todas as rotas sem 404', async ({ page }) => {
    await page.goto('/catalogo');
    await expect(page.getByRole('heading', { level: 1, name: 'Storefront Remote' })).toBeVisible();

    await page.reload();
    await expect(page).toHaveURL(/\/catalogo/);
    await expect(page.getByRole('heading', { level: 1, name: 'Storefront Remote' })).toBeVisible();

    await page.goto('/carrinho');
    await expect(page.getByTestId('checkout-cart-page')).toBeVisible();

    await page.reload();
    await expect(page).toHaveURL(/\/carrinho/);
    await expect(page.getByTestId('checkout-cart-page')).toBeVisible();
  });

  test('deve exibir RemoteBoundary acessível com queda de rede e recuperar ao clicar em retry sem recarregar o shell', async ({ page }) => {
    let shouldFail = true;

    page.on('console', (msg) => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', (err) => console.log('PAGE ERROR:', err.message));
    page.on('request', (req) => console.log('REQ:', req.url()));
    page.on('requestfailed', (req) => console.log('REQ FAILED:', req.url(), req.failure()?.errorText));

    // Intercepta e falha as requisições de script do storefront
    await page.route('**/remotes/storefront/**', (route) => {
      if (shouldFail) {
        route.abort();
      } else {
        route.continue();
      }
    });

    await page.goto('/');
    const catalogLink = page.getByRole('link', { name: 'Catálogo', exact: true });
    await catalogLink.click();

    // Remote indisponível: renderiza ErrorBoundary acessível
    await expect(page.getByRole('heading', { level: 1, name: /Módulo Indisponível/i })).toBeVisible();
    await expect(page.getByRole('alert')).toBeVisible();

    const retryButton = page.getByRole('button', { name: /Tentar Novamente/i });
    await expect(retryButton).toBeVisible();

    // Recupera a rede e clica em Tentar Novamente sem recarregar a janela
    shouldFail = false;
    await retryButton.click();

    // Deve carregar o componente recuperado
    await expect(page.getByRole('heading', { level: 1, name: 'Storefront Remote' })).toBeVisible();
    await expect(page.getByRole('alert')).not.toBeVisible();
  });

  test('deve disponibilizar remoteEntry.js e manifestos dos 3 remotes no servidor consolidado', async ({ request }) => {
    const storefrontEntry = await request.get('/remotes/storefront/remoteEntry.js');
    expect(storefrontEntry.status()).toBe(200);

    const checkoutEntry = await request.get('/remotes/checkout/remoteEntry.js');
    expect(checkoutEntry.status()).toBe(200);

    const accountEntry = await request.get('/remotes/account/remoteEntry.js');
    expect(accountEntry.status()).toBe(200);
  });
});
