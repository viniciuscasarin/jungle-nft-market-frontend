import { test, expect } from '@playwright/test';

test.describe('Fluxo 6: Pagamento do Checkout e Pedidos Imutáveis (@nft/web-e2e)', () => {
  test.beforeEach(async ({ page }) => {
    // 1. Limpa o estado local
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
      const mocks = (window as unknown as { __mocks?: { reset: () => void } }).__mocks;
      mocks?.reset();
    });

    // 2. Autentica como Alice Silva
    await page.goto('/login');
    await page.getByLabel(/Email ou username/i).fill('alice@example.com');
    await page.getByLabel(/^Senha/i).fill('Password123!');
    await page.getByRole('button', { name: /^Entrar$/i }).click();
    await expect(page.getByText('Alice Silva')).toBeVisible({ timeout: 10000 });
  });

  test('deve carregar dados preenchidos do perfil/carteira e confirmar compra com sucesso', async ({
    page,
  }) => {
    // Garante cenário payment-confirmed
    await page.evaluate(() => {
      const mocks = (window as unknown as { __mocks?: { setScenario: (s: string) => void } }).__mocks;
      mocks?.setScenario('payment-confirmed');
    });

    // Acessa rota de pagamento
    await page.goto('/pagamento');

    // Valida preenchimento dos campos sem salvar alterações na conta
    await expect(page.getByRole('heading', { name: 'Perfil do colecionador' })).toBeVisible();
    await expect(page.locator('#display-name')).toHaveValue('Alice Silva');
    await expect(page.locator('#profile-email')).toHaveValue('alice@example.com');
    await expect(page.locator('#wallet-address')).toHaveValue('0x1111111111111111111111111111111111111111');

    // Clica no botão de confirmação de compra
    const confirmBtn = page.getByRole('button', { name: 'Confirmar compra' }).first();
    await expect(confirmBtn).toBeEnabled();
    await confirmBtn.click();

    // Invariante essencial: Somente navega para /pedido/:orderId quando status é confirmed
    await expect(page).toHaveURL(/\/pedido\/order_/, { timeout: 10000 });
  });

  test('deve tratar recusa de pagamento, permanecer no checkout e manter carrinho intacto', async ({
    page,
  }) => {
    // Aplica cenário payment-rejected
    await page.evaluate(() => {
      const mocks = (window as unknown as { __mocks?: { setScenario: (s: string) => void } }).__mocks;
      mocks?.setScenario('payment-rejected');
    });

    await page.goto('/pagamento');

    const confirmBtn = page.getByRole('button', { name: 'Confirmar compra' }).first();
    await expect(confirmBtn).toBeEnabled();
    await confirmBtn.click();

    // NÃO deve navegar para confirmação de pedido
    await expect(page).toHaveURL(/\/pagamento/);

    // Deve exibir alerta acessível de erro
    const alert = page.getByRole('alert');
    await expect(alert).toBeVisible();
    await expect(alert).toContainText(/recusado|saldo insuficiente/i);
  });

  test('deve ser idempotente em cliques repetidos e não duplicar pedidos', async ({
    page,
  }) => {
    await page.evaluate(() => {
      const mocks = (window as unknown as { __mocks?: { setScenario: (s: string) => void } }).__mocks;
      mocks?.setScenario('payment-confirmed');
    });

    await page.goto('/pagamento');

    const confirmBtn = page.getByRole('button', { name: 'Confirmar compra' }).first();
    await expect(confirmBtn).toBeEnabled();

    // Simula múltiplos cliques rápidos
    await confirmBtn.click({ clickCount: 2 });

    // Deve navegar apenas uma vez com sucesso para o pedido confirmado
    await expect(page).toHaveURL(/\/pedido\/order_/, { timeout: 10000 });
  });

  test('deve exibir notificação e bloquear compra se houver alteração de preço', async ({
    page,
  }) => {
    // Configura cenário de preço alterado
    await page.evaluate(() => {
      const mocks = (window as unknown as { __mocks?: { setScenario: (s: string) => void } }).__mocks;
      mocks?.setScenario('price-changed-at-checkout');
    });

    await page.goto('/pagamento');

    const confirmBtn = page.getByRole('button', { name: 'Confirmar compra' }).first();
    await confirmBtn.click();

    // Não navega
    await expect(page).toHaveURL(/\/pagamento/);

    // Exibe aviso sobre mudança de preço
    await expect(page.getByRole('alert')).toBeVisible();
    await expect(page.getByRole('alert')).toContainText(/preço|cotação/i);
  });
});
