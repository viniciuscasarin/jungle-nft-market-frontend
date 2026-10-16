import { test, expect } from '@playwright/test';

for (const width of [390, 768, 1440]) {
  test(`payment presentation remains accessible at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/storybook/iframe.html?id=checkout-paymentpagecontent--default&viewMode=story');
    await expect(page.getByRole('heading', { name: 'Pagamento com carteira' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: /^E-mail/ })).toHaveValue('demo@example.test');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    const ids = await page.locator('[id]').evaluateAll((elements) => elements.map((element) => element.id));
    expect(new Set(ids).size).toBe(ids.length);
    await page.getByRole('radio', { name: 'Coinbase Wallet' }).focus();
    await page.keyboard.press('ArrowLeft');
    await expect(page.getByRole('radio', { name: 'WalletConnect' })).toBeFocused();
    if (width < 1024) {
      const trigger = page.getByRole('button', { name: 'Resumo da carteira' });
      await trigger.click();
      await expect(page.getByRole('dialog')).toBeVisible();
      await page.keyboard.press('Escape');
      await expect(page.getByRole('dialog')).toBeHidden();
      await expect(trigger).toBeFocused();
    }
    await page.evaluate(() => { document.documentElement.style.zoom = '2'; });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
}
