import { test, expect } from '@playwright/test';

for (const width of [390, 768, 1024, 1440]) {
  for (const route of [
    { path: '/', testId: 'home-page-content' },
    { path: '/nft/nft-01', testId: 'pdp-page-content' },
    { path: '/nft/nao-existe', testId: 'pdp-not-found' },
    { path: '/carrinho', testId: 'checkout-cart-page' },
  ]) {
    test(`${route.path}: conteúdo alinhado ao footer em ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(route.path);
      const content = page.getByTestId(route.testId);
      await expect(content).toBeVisible({ timeout: 15000 });
      const footer = page.locator('footer .page-container').first();
      const bounds = async (locator: typeof content) => locator.evaluate((element) => {
        const rect = element.getBoundingClientRect();
        const style = getComputedStyle(element);
        return {
          left: rect.left + Number.parseFloat(style.paddingLeft),
          right: rect.right - Number.parseFloat(style.paddingRight),
        };
      });
      const expected = await bounds(footer);
      expect(await bounds(content)).toEqual(expected);
      if (width >= 1024) {
        expect(await bounds(page.locator('header .page-container').first())).toEqual(expected);
      }
      if (route.path !== '/') {
        expect(await bounds(page.locator('#main-content').locator('xpath=preceding-sibling::div[1]'))).toEqual(expected);
      }
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
    });
  }

  test(`conta e pagamento: conteúdo alinhado ao footer em ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/login');
    await page.getByLabel(/Email ou username/i).fill('alice@example.com');
    await page.getByLabel(/^Senha/i).fill('Password123!');
    await page.getByRole('button', { name: /^Entrar$/i }).click();
    await expect(page).not.toHaveURL(/\/login/);
    for (const path of ['/perfil', '/carteiras', '/pagamento']) {
      await page.goto(path);
      if (path === '/pagamento') {
        await expect(page.getByTestId('checkout-payment-page')).toBeVisible({ timeout: 15000 });
      } else {
        await expect(page.getByTestId('account-grid-layout')).toBeVisible({ timeout: 15000 });
      }
      await expect(page.locator('#main-content .page-container:visible').first()).toBeVisible();
      const containers = page.locator('#main-content .page-container:visible, footer .page-container:visible');
      const boundaries = await containers.evaluateAll((elements) => elements.map((element) => {
        const rect = element.getBoundingClientRect();
        const style = getComputedStyle(element);
        return [rect.left + Number.parseFloat(style.paddingLeft), rect.right - Number.parseFloat(style.paddingRight)];
      }));
      expect(boundaries.length).toBeGreaterThan(1);
      for (const boundary of boundaries) expect(boundary).toEqual(boundaries[0]);
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
    }
  });
}
