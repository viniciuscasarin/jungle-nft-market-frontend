import { expect, test, type Page } from '@playwright/test';
import { CartSchema, NftItemSchema, OrderSchema } from '@nft/shared-contracts';

async function api(page: Page, path: string) {
  return page.evaluate(async path => {
    const headers = new Headers();
    const token = localStorage.getItem('nft.session.token');
    const guest = localStorage.getItem('nft.guest.id');
    if (token) headers.set('Authorization', `Bearer ${token}`);
    else if (guest) headers.set('X-Session-Id', guest);
    const response = await fetch(`/api${path}`, { headers });
    if (!response.ok) throw new Error(`API ${path}: ${response.status}`);
    const body: unknown = await response.json();
    return body;
  }, path);
}

for (const account of ['alice', 'new'] as const) {
  test(`catalogue to confirmed receipt with ${account} account and refresh`, async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto('/?scenario=default');
    await page.getByTestId('catalog-item-nft-01').click();
    await expect(page.getByTestId('pdp-page-content')).toBeVisible();
    const nft = NftItemSchema.parse(await api(page, '/nfts/nft-01'));
    const edition = nft.editions.find(item => item.availableSupply >= 3);
    if (!edition) throw new Error('Default scenario needs an edition with three units');
    await page.getByTestId(`pdp-version-option-${edition.id}`).click();
    await page.getByRole('button', { name: 'Aumentar quantidade', exact: true }).filter({ visible: true }).click();
    await page.getByRole('button', { name: 'Adicionar ao carrinho', exact: true }).filter({ visible: true }).click();
    await expect.poll(async () => CartSchema.parse(await api(page, '/cart')).items[0]?.quantity).toBe(2);
    await page.goto('/carrinho');
    await page.getByRole('button', { name: 'Aumentar quantidade', exact: true }).filter({ visible: true }).click();
    await expect.poll(async () => CartSchema.parse(await api(page, '/cart')).items[0]?.quantity).toBe(3);
    await page.reload();
    await expect(page.getByRole('spinbutton').filter({ visible: true })).toHaveAttribute('aria-valuenow', '3');

    await page.getByLabel('Código promocional', { exact: true }).filter({ visible: true }).fill('JUNGLE10');
    await page.getByRole('button', { name: 'Aplicar', exact: true }).filter({ visible: true }).click();
    await expect.poll(async () => CartSchema.parse(await api(page, '/cart')).couponCode).toBe('JUNGLE10');
    await page.getByRole('button', { name: 'Conectar e finalizar', exact: true }).filter({ visible: true }).click();
    await expect(page).toHaveURL(/\/login/);
    if (account === 'new') {
      await page.goto('/cadastro?redirect=%2Fpagamento');
      await page.getByLabel(/Nome de exibição/i).fill('Purchase Collector');
      await page.getByLabel(/^Username/i).fill('purchase_collector');
      await page.getByLabel(/^Email/i).fill('purchase@example.com');
      await page.getByLabel(/^Senha/i).fill('Password123!');
      await page.getByRole('button', { name: /^Criar conta$/i }).click();
    } else {
      await page.getByLabel(/Email ou username/i).fill('alice@example.com');
      await page.getByLabel(/^Senha/i).fill('Password123!');
      await page.getByRole('button', { name: /^Entrar$/i }).click();
    }
    await expect(page).toHaveURL(/\/pagamento/);
    await expect(page.getByRole('button', { name: 'Confirmar compra', exact: true }).filter({ visible: true })).toBeEnabled();
    await page.reload();
    await expect(page.locator('#display-name:visible')).not.toHaveValue('');
    await page.locator('#wallet-address:visible').fill('0x1234567890123456789012345678901234567890');
    const cart = CartSchema.parse(await api(page, '/cart'));
    expect(cart.items.find(item => item.nftId === nft.id && item.editionId === edition.id)?.quantity).toBeGreaterThanOrEqual(3);
    await expect(page.getByTestId('checkout-nfts-summary').filter({ visible: true })).toContainText(nft.title);
    for (const width of [390, 768, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
      await expect(page.locator('#wallet-address:visible')).toHaveValue('0x1234567890123456789012345678901234567890');
    }
    const created = page.waitForResponse(response => response.url().endsWith('/api/orders') && response.request().method() === 'POST');
    await page.getByRole('button', { name: 'Confirmar compra', exact: true }).filter({ visible: true }).click();
    const order = OrderSchema.parse(await (await created).json());
    expect(order.status).toBe('confirmed');
    await expect(page).toHaveURL(new RegExp(`/pedido/${order.id}`));
    expect(order.items.map(({ nftId, editionId, quantity }) => ({ nftId, editionId, quantity }))).toEqual(
      cart.items.map(({ nftId, editionId, quantity }) => ({ nftId, editionId, quantity })),
    );
    expect(OrderSchema.parse(await api(page, `/orders/${order.id}`)).receipt?.total).toBe(order.total);
    expect(CartSchema.parse(await api(page, '/cart')).items).toEqual([]);
    await page.goto('/');
    await expect(page.getByLabel('Carrinho de compras', { exact: true }).filter({ visible: true })).toBeVisible();
  });
}

test('buy now waits for the selected edition to be saved and opens the canonical cart', async ({ page }) => {
  await page.goto('/nft/nft-01?scenario=default');
  await expect(page.getByTestId('pdp-page-content')).toBeVisible();
  const nft = NftItemSchema.parse(await api(page, '/nfts/nft-01'));
  const edition = nft.editions.find(item => item.availableSupply >= 2);
  if (!edition) throw new Error('Missing edition');
  await page.getByTestId(`pdp-version-option-${edition.id}`).click();
  await page.getByRole('button', { name: 'Aumentar quantidade', exact: true }).filter({ visible: true }).click();
  await page.getByRole('button', { name: 'COMPRAR', exact: true }).filter({ visible: true }).click();
  await expect(page).toHaveURL(/\/carrinho$/);
  expect(CartSchema.parse(await api(page, '/cart')).items).toMatchObject([
    { nftId: nft.id, editionId: edition.id, quantity: 2 },
  ]);
});

test('buy now announces a network failure and stays on the detail page', async ({ page }) => {
  await page.goto('/nft/nft-01?scenario=default');
  await expect(page.getByTestId('pdp-page-content')).toBeVisible();
  await page.evaluate(() => {
    const control: unknown = Reflect.get(window, '__mocks');
    if (!control || typeof control !== 'object' || !('setScenario' in control) || typeof control.setScenario !== 'function')
      throw new Error('Missing mock controls');
    control.setScenario('connection-down');
  });
  await page.getByRole('button', { name: 'COMPRAR', exact: true }).filter({ visible: true }).click();
  await expect(page.getByText('Falha de conexão. Tente novamente.', { exact: true }).first()).toBeVisible();
  await expect(page).toHaveURL(/\/nft\/nft-01/);
  await expect(page.getByRole('button', { name: 'COMPRAR', exact: true }).filter({ visible: true })).toBeEnabled();
});
