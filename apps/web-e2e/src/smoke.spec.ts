import { test, expect } from '@playwright/test';

test.describe('Smoke Test - Rotas Integradas do Shell', () => {
  test('deve renderizar a rota principal com cabeçalho e layout acessível', async ({ page }) => {
    await page.goto('/');

    // Verifica o título da aba e o logo Kurio
    await expect(page).toHaveTitle(/Jungle NFT Market/i);
    await expect(page.getByRole('link', { name: /Kurio/i })).toBeVisible();

    // Verifica a seção principal e o remote storefront
    const mainHeading = page.getByRole('heading', { level: 1, name: /Storefront Remote|Descubra, colecione/i });
    await expect(mainHeading).toBeVisible();
  });

  test('deve renderizar a página 404 com aviso acessível e permitir retorno ao início', async ({ page }) => {
    await page.goto('/rota-inexistente-smoke-404');

    // Verifica cabeçalhos da página 404
    await expect(page.getByRole('heading', { level: 1, name: '404' })).toBeVisible();
    await expect(page.getByRole('heading', { level: 2, name: /Página Não Encontrada/i })).toBeVisible();

    // Verifica o alerta acessível e a mensagem explicativa
    await expect(page.getByRole('alert').filter({ hasText: /Página Não Encontrada/i })).toBeVisible();
    await expect(
      page.getByText(/A página solicitada não existe ou foi removida/i),
    ).toBeVisible();

    // Clica no link de retorno e valida navegação para a home
    const backLink = page.getByRole('link', { name: /Voltar para o Início/i });
    await expect(backLink).toBeVisible();
    await backLink.click();

    await expect(page).toHaveURL(/\/\??.*/);
    await expect(page.getByRole('heading', { level: 1, name: /Storefront Remote|Descubra, colecione/i })).toBeVisible();
  });
});
