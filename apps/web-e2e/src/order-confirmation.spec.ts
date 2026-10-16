import { test, expect } from '@playwright/test';

test.describe('Order Confirmation Receipt Flow (@nft/checkout)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  });

  test('redirects unauthenticated direct access to /pedido/:orderId to login preserving redirect parameter', async ({
    page,
  }) => {
    await page.goto('/pedido/order_confirmed_1');
    await expect(page).toHaveURL(/\/login\?redirect=.*pedido.*order_confirmed_1/);
    await expect(page.getByRole('heading', { level: 1, name: 'Entrar na Conta' })).toBeVisible();
  });

  test('renders confirmed receipt modal after authentication on /pedido/order_confirmed_1', async ({
    page,
  }) => {
    // 1. Perform login with alice
    await page.goto('/login?redirect=%2Fpedido%2Forder_confirmed_1');
    await page.getByLabel(/Email ou username/i).fill('alice@example.com');
    await page.getByLabel(/^Senha/i).fill('Password123!');
    await page.getByRole('button', { name: /^Entrar$/i }).click();

    // 2. Redirected to /pedido/order_confirmed_1
    await expect(page).toHaveURL(/\/pedido\/order_confirmed_1/);

    // 3. Verifies modal dialog and elements
    const modal = page.getByRole('dialog');
    await expect(modal).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Seus NFTs agora estão na sua carteira')).toBeVisible();
    await expect(page.getByText('Neon Cyber Ape #01')).toBeVisible();

    // 4. Verifies action on Etherscan shows informative toast
    const etherscanBtn = page.getByRole('button', { name: /ver no etherscan/i });
    await expect(etherscanBtn).toBeVisible();
    await etherscanBtn.click();
    await expect(page.getByText(/indisponível nesta demonstração/i)).toBeVisible();

    // 5. Closes modal via X and navigates to /
    const closeBtn = page.getByLabel('Fechar modal de confirmação');
    await closeBtn.click();
    await expect(page).toHaveURL('/');
  });

  test('renders error state and does not show success modal for rejected order /pedido/order_rejected_1', async ({
    page,
  }) => {
    // 1. Perform login
    await page.goto('/login?redirect=%2Fpedido%2Forder_rejected_1');
    await page.getByLabel(/Email ou username/i).fill('alice@example.com');
    await page.getByLabel(/^Senha/i).fill('Password123!');
    await page.getByRole('button', { name: /^Entrar$/i }).click();

    await expect(page).toHaveURL(/\/pedido\/order_rejected_1/);

    // 2. Error state displayed without receipt modal
    await expect(page.getByText('Pedido não concluído')).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole('dialog')).toBeHidden();
    await expect(page.getByText('Seus NFTs agora estão na sua carteira')).toBeHidden();
  });
});
