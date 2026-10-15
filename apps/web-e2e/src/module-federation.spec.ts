import { test, expect } from '@playwright/test';

test.describe('Module Federation Runtime & Resiliência', () => {
  test('deve carregar o remote Storefront dinamicamente via navegação e comprovar singleton probe', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('heading', { level: 1, name: /Jungle NFT Marketplace/i })).toBeVisible();

    // Navega para a rota federada do catálogo
    const catalogLink = page.getByRole('link', { name: 'Catálogo', exact: true });
    await expect(catalogLink).toBeVisible();
    await catalogLink.click();

    await expect(page).toHaveURL('/catalogo');

    // Confirma que o componente do remote foi montado dentro do layout do shell
    const remoteHeading = page.getByRole('heading', { level: 1, name: 'Storefront Remote' });
    await expect(remoteHeading).toBeVisible();
    await expect(page.getByRole('region', { name: 'Catálogo Storefront' })).toBeVisible();

    // Layout do host permanece íntegro
    await expect(page.getByRole('link', { name: /Jungle NFT Market/i })).toBeVisible();
    await expect(page.getByText(/Demonstração de Frontend/i)).toBeVisible();

    // Comprova que o singleton probe registrou instâncias compartilhadas
    const probeBadge = page.getByTestId('singleton-probe-count');
    await expect(probeBadge).toBeVisible();
    // Host incrementou na inicialização (1) e remote incrementou ao montar (2)
    await expect(probeBadge).toHaveText('2');
  });

  test('deve suportar SPA fallback e refresh direto (F5) em rota federada sem 404', async ({ page }) => {
    // Acesso direto via URL profunda
    await page.goto('/catalogo');

    await expect(page.getByRole('heading', { level: 1, name: 'Storefront Remote' })).toBeVisible();

    // Simula reload (F5) na rota federada
    await page.reload();

    await expect(page).toHaveURL('/catalogo');
    await expect(page.getByRole('heading', { level: 1, name: 'Storefront Remote' })).toBeVisible();
  });

  test('deve exibir error boundary acessível quando o remote estiver offline e permitir navegação de retorno', async ({ page }) => {
    // Intercepta e falha todas as requisições para os assets do remote storefront
    await page.route('**/remotes/storefront/**', (route) => route.abort());

    await page.goto('/');
    const catalogLink = page.getByRole('link', { name: 'Catálogo', exact: true });
    await catalogLink.click();

    // Deve capturar a falha e renderizar o RemoteErrorComponent acessível
    await expect(page.getByRole('heading', { level: 1, name: /Módulo Indisponível/i })).toBeVisible();
    await expect(page.getByRole('alert')).toBeVisible();
    await expect(page.getByRole('button', { name: /Tentar Novamente/i })).toBeVisible();

    // O layout do shell permanece navegável
    const backToHome = page.getByRole('link', { name: 'Voltar para o Início' });
    await expect(backToHome).toBeVisible();
    await backToHome.click();

    await expect(page).toHaveURL('/');
    await expect(page.getByRole('heading', { level: 1, name: /Jungle NFT Marketplace/i })).toBeVisible();
  });
});
