import { expect, test, type Page } from '@playwright/test';
import { ApiErrorSchema, CartSchema, NftItemSchema } from '@nft/shared-contracts';

async function cartRequest(
  page: Page,
  method: string,
  path = '',
  input?: unknown,
  sessionId = 'cart-api-e2e',
) {
  return page.evaluate(
    async ({ method, path, input, sessionId }) => {
      const response = await fetch(`/api/cart${path}`, {
        method,
        headers: { 'Content-Type': 'application/json', 'X-Session-Id': sessionId },
        ...(input === undefined ? {} : { body: JSON.stringify(input) }),
      });
      const body: unknown = await response.json();
      return { status: response.status, body };
    },
    { method, path, input, sessionId },
  );
}

test('carrinho visitante usa os endpoints canônicos pelo service worker do Shell', async ({
  page,
}) => {
  await page.goto('/nft/nft-01?scenario=default');
  await expect(page.getByTestId('pdp-page-content')).toBeVisible({ timeout: 15000 });
  const nft = NftItemSchema.parse(
    await page.evaluate(async () => {
      const response = await fetch('/api/nfts/nft-01');
      const body: unknown = await response.json();
      return body;
    }),
  );
  const edition = nft.editions.find(candidate => candidate.availableSupply >= 2);
  if (!edition) throw new Error('Missing edition with stock in the default scenario');

  const input = { nftId: nft.id, editionId: edition.id, quantity: 1 };
  const added = await cartRequest(page, 'POST', '/items', input);
  expect(added.status).toBe(200);
  const cart = CartSchema.parse(added.body);
  const item = cart.items[0];
  expect(item).toMatchObject({ ...input, unitPrice: edition.price });
  if (!item) throw new Error('Cart response did not contain the added item');

  const otherGuest = await cartRequest(page, 'GET', '', undefined, 'another-cart-api-e2e');
  expect(CartSchema.parse(otherGuest.body).items).toEqual([]);
  const updated = await cartRequest(page, 'PUT', `/items/${item.id}`, { quantity: 2 });
  expect(updated.status).toBe(200);
  expect(CartSchema.parse(updated.body).items[0]?.quantity).toBe(2);

  const rejected = await cartRequest(page, 'POST', '/items', {
    ...input,
    quantity: edition.availableSupply + 1,
  });
  expect(rejected.status).toBe(409);
  expect(ApiErrorSchema.parse(rejected.body).code).toBe('AVAILABILITY_CONFLICT');
  expect(CartSchema.parse((await cartRequest(page, 'GET')).body).items[0]?.quantity).toBe(2);

  const removed = await cartRequest(page, 'DELETE', `/items/${item.id}`);
  expect(removed.status).toBe(200);
  expect(CartSchema.parse(removed.body).items).toEqual([]);
  await expect(page.getByTestId('pdp-product-title')).toHaveText(nft.title);
});
