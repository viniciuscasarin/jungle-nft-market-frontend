import { test, expect } from '@playwright/test';

test.describe('PDP: detalhe do NFT conectado à API simulada', () => {
  test('acesso direto exibe dados vindos de GET /api/nfts/:id', async ({ page }) => {
    await page.goto('/nft/nft-01');

    await expect(page.getByTestId('pdp-page-content')).toBeVisible({ timeout: 15000 });
    await expect(page.getByTestId('pdp-product-title')).not.toHaveText('');
    await expect(page.getByTestId('pdp-price-eth')).toContainText('ETH');
  });

  test('NFT inexistente mostra estado 404 com retorno ao catálogo', async ({ page }) => {
    await page.goto('/nft/nao-existe');

    await expect(page.getByTestId('pdp-not-found')).toBeVisible({ timeout: 15000 });
    await page.getByRole('button', { name: /voltar ao catálogo/i }).click();
    await expect(page).toHaveURL(/\/$/);
  });

  test('navega do catálogo para a PDP ao clicar em um card', async ({ page }) => {
    await page.goto('/');

    const card = page.getByRole('article').filter({ hasText: /ETH/i }).first();
    await expect(card).toBeVisible({ timeout: 15000 });
    await card.click();

    await expect(page).toHaveURL(/\/nft\/.+/);
    await expect(page.getByTestId('pdp-page-content')).toBeVisible({ timeout: 15000 });
  });
});
