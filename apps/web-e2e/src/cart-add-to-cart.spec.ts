import { expect, test, type Page } from '@playwright/test';

async function openPdp(page: Page) {
  await page.goto('/nft/nft-01?scenario=default');
  await expect(page.getByTestId('pdp-product-title')).toBeVisible();
}
async function add(page: Page) {
  const response = page.waitForResponse(
    response =>
      response.url().endsWith('/api/cart/items') && response.request().method() === 'POST',
  );
  await page.getByRole('button', { name: 'Adicionar ao carrinho', exact: true }).click();
  expect((await response).status()).toBe(200);
  await expect(page.getByTestId('pdp-cart-announcement')).toHaveText('Item adicionado ao carrinho');
}
function badge(page: Page) {
  return page.locator('[data-testid="cart-badge"]:visible');
}

test('PDP → badge → carrinho: quantidade, cotação e remoção persistidas', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await openPdp(page);
  await add(page);
  await expect(badge(page)).toHaveText('1');
  await page.getByRole('link', { name: 'Carrinho com 1 itens' }).click();
  await expect(page).toHaveURL(/\/carrinho/);
  const row = page.locator('[data-testid^="cart-item-row-"]:visible').first();
  await expect(row).toBeVisible();
  await expect(page.getByTestId('cart-total')).toBeVisible();
  const update = page.waitForResponse(
    response =>
      response.url().includes('/api/cart/items/') && response.request().method() === 'PUT',
  );
  await row.getByRole('button', { name: 'Aumentar quantidade' }).click();
  expect((await update).status()).toBe(200);
  await expect(badge(page)).toHaveText('2');
  await page.reload();
  await expect(badge(page)).toHaveText('2');
  await row.getByRole('button', { name: /Remover .* do carrinho/ }).click();
  await expect(page.getByText('Seu carrinho está vazio')).toBeVisible();
  await expect(badge(page)).toHaveCount(0);
});

test('adição otimista sob latência e rollback acessível em falha de rede', async ({ page }) => {
  await openPdp(page);
  await page.evaluate(() => {
    const control: unknown = Reflect.get(window, '__mocks');
    if (
      typeof control !== 'object' ||
      !control ||
      !('setScenario' in control) ||
      typeof control.setScenario !== 'function'
    )
      throw new Error('Mock controls unavailable');
    control.setScenario('slow-network');
  });
  const addButton = page.getByRole('button', { name: 'Adicionar ao carrinho', exact: true });
  await addButton.click();
  await expect(badge(page)).toHaveText('1');
  await expect(page.getByTestId('pdp-add-to-cart-button')).toBeDisabled();
  await expect(page.getByTestId('pdp-cart-announcement')).toHaveText(
    'Item adicionado ao carrinho',
    { timeout: 12000 },
  );
  await page.evaluate(() => {
    const control: unknown = Reflect.get(window, '__mocks');
    if (
      typeof control !== 'object' ||
      !control ||
      !('setScenario' in control) ||
      typeof control.setScenario !== 'function'
    )
      throw new Error('Mock controls unavailable');
    control.setScenario('connection-down');
  });
  await page.getByRole('button', { name: 'Adicionar ao carrinho', exact: true }).click();
  await expect(page.getByTestId('pdp-cart-announcement')).toHaveText(
    'Erro ao adicionar item ao carrinho',
  );
  await expect(badge(page)).toHaveText('1');
});

for (const width of [390, 768, 1440]) {
  test(`carrinho responsivo e teclado em ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    await openPdp(page);
    const button = page.getByRole('button', { name: 'Adicionar ao carrinho', exact: true });
    await button.focus();
    await expect(button).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(badge(page)).toHaveText('1');
    await page.goto('/cart');
    await expect(page.getByRole('heading', { name: 'Carrinho de NFTs' })).toBeVisible();
    await expect
      .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth))
      .toBe(true);
    if (width < 1024) {
      const trigger = page.getByRole('button', { name: 'Abrir resumo da carteira' });
      await trigger.click();
      const dialog = page.getByRole('dialog');
      await expect(dialog).toBeVisible();
      await page.keyboard.press('Tab');
      await expect
        .poll(() =>
          page.evaluate(() =>
            document.querySelector('[role="dialog"]')?.contains(document.activeElement),
          ),
        )
        .toBe(true);
      await page.keyboard.press('Escape');
      await expect(dialog).not.toBeVisible();
      await expect(trigger).toBeFocused();
    }
    await page.evaluate(() => {
      document.documentElement.style.zoom = '2';
    });
    await expect
      .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth))
      .toBe(true);
    await page.screenshot({ path: `dist/cart-${width}.png`, fullPage: true });
  });
}
