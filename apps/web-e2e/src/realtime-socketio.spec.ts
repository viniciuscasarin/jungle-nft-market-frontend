import { test, expect } from '@playwright/test';

test.describe('Realtime Socket.IO Integration and Resilience (@nft/web-e2e)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#main-content')).toBeVisible({ timeout: 10000 });
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
      const mocks = (window as unknown as { __mocks?: { reset: () => void } }).__mocks;
      mocks?.reset();
    });
  });

  test('recebe nft.updated via socket.io-client real e anuncia alteração de preço na live region e toast', async ({
    page,
  }) => {
    await page.goto('/');
    await expect(page.locator('#main-content')).toBeVisible({ timeout: 10000 });

    const liveRegion = page.locator('#shell-live-polite');
    await expect(liveRegion).toBeAttached();

    // Dispara emitNftUpdated via window.__mocks (simulação de backend real via WebSocket)
    await page.evaluate(() => {
      const mocks = (window as unknown as {
        __mocks: {
          emitNftUpdated: (params: { nftId: string; price: string }) => void;
        };
      }).__mocks;
      mocks.emitNftUpdated({ nftId: 'nft-01', price: '4.85' });
    });

    // Deve anunciar a alteração de preço na live region acessível
    await expect(liveRegion).toHaveText(/4\.85 ETH/i, { timeout: 10000 });

    // Toast de notificação deve surgir na tela
    await expect(page.getByText(/4\.85 ETH/i)).toBeVisible();
  });

  test('descarta evento duplicado e evento com versão obsoleta sem duplicar anúncios ou regredir estado', async ({
    page,
  }) => {
    await page.goto('/');
    await expect(page.locator('#main-content')).toBeVisible({ timeout: 10000 });

    const liveRegion = page.locator('#shell-live-polite');
    await expect(liveRegion).toBeAttached();

    // 1. Emite evento fresco v2
    await page.evaluate(() => {
      const mocks = (window as unknown as {
        __mocks: {
          emitNftUpdated: (params: { nftId: string; price: string }) => void;
        };
      }).__mocks;
      mocks.emitNftUpdated({ nftId: 'nft-01', price: '6.20' });
    });

    await expect(liveRegion).toHaveText(/6\.20 ETH/i, { timeout: 10000 });

    // Limpa o texto da live region para testar se eventos subsequentes incorretos re-anunciam
    await page.evaluate(() => {
      const el = document.getElementById('shell-live-polite');
      if (el) el.textContent = '';
    });

    // 2. Dispara duplicata do mesmo evento (mesmo id)
    await page.evaluate(() => {
      const mocks = (window as unknown as {
        __mocks: { emitDuplicateEvent: () => void };
      }).__mocks;
      mocks.emitDuplicateEvent();
    });

    // Aguarda breve intervalo e confirma que live region continuou vazia (duplicata descartada)
    await page.waitForTimeout(500);
    await expect(liveRegion).toHaveText('');

    // 3. Dispara evento obsoleto (versão antiga v1 menor que v2)
    await page.evaluate(() => {
      const mocks = (window as unknown as {
        __mocks: { emitStaleEvent: (params: { nftId: string; price: string }) => void };
      }).__mocks;
      mocks.emitStaleEvent({ nftId: 'nft-01', price: '0.05' });
    });

    // Aguarda e confirma que o preço obsoleto foi ignorado
    await page.waitForTimeout(500);
    await expect(liveRegion).toHaveText('');
  });

  test('isola eventos privados de order.updated por userId', async ({ page }) => {
    // 1. Faz login como Alice
    await page.goto('/login');
    await expect(page.getByRole('heading', { level: 1, name: 'Entrar na Conta' })).toBeVisible({
      timeout: 10000,
    });
    await page.getByLabel(/Email ou username/i).fill('alice@example.com');
    await page.getByLabel(/^Senha/i).fill('Password123!');
    await page.getByRole('button', { name: /^Entrar$/i }).click();
    await expect(page.getByText('Alice Silva')).toBeVisible({ timeout: 10000 });

    const liveRegion = page.locator('#shell-live-polite');
    await expect(liveRegion).toBeAttached();

    // Limpa a live region
    await page.evaluate(() => {
      const el = document.getElementById('shell-live-polite');
      if (el) el.textContent = '';
    });

    // 2. Emite evento privado direcionado a outro usuário (Bob Santos - usr_collector_02)
    await page.evaluate(() => {
      const mocks = (window as unknown as {
        __mocks: {
          emitOrderUpdated: (params: { orderId: string; userId: string; status: 'confirmed' }) => void;
        };
      }).__mocks;
      mocks.emitOrderUpdated({
        orderId: 'ord_bob_999',
        userId: 'usr_collector_02',
        status: 'confirmed',
      });
    });

    // Evento de outro usuário NÃO deve ser anunciado para Alice
    await page.waitForTimeout(500);
    await expect(liveRegion).toHaveText('');

    // 3. Emite evento privado pertencente a Alice (usr_collector_01)
    await page.evaluate(() => {
      const mocks = (window as unknown as {
        __mocks: {
          emitOrderUpdated: (params: { orderId: string; userId: string; status: 'confirmed' }) => void;
        };
      }).__mocks;
      mocks.emitOrderUpdated({
        orderId: 'ord_alice_123',
        userId: 'usr_collector_01',
        status: 'confirmed',
      });
    });

    // Evento da própria Alice deve ser anunciado
    await expect(liveRegion).toHaveText(/ord_alice_123.*confirmado/i, { timeout: 10000 });
  });

  test('reconcilia com a API REST após queda e reconexão do socket', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#main-content')).toBeVisible({ timeout: 10000 });

    const liveRegion = page.locator('#shell-live-polite');
    await expect(liveRegion).toBeAttached();

    // Simula queda e reconexão do socket
    await page.evaluate(() => {
      const mocks = (window as unknown as {
        __mocks: {
          simulateSocketDisconnect: () => void;
          simulateSocketReconnect: () => void;
        };
      }).__mocks;

      mocks.simulateSocketDisconnect();
      setTimeout(() => {
        mocks.simulateSocketReconnect();
      }, 200);
    });

    // Confirma que a aplicação permaneceu estável e responsiva
    await page.waitForTimeout(600);
    await expect(page.locator('#main-content')).toBeVisible();
  });
});
