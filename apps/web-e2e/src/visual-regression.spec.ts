import { test, expect } from '@playwright/test';

test.describe('Visual Regression - Storybook Components', () => {
  const stories = [
    { id: 'layout-header--guest', name: 'header-guest' },
    { id: 'layout-footer--default', name: 'footer-default' },
    { id: 'widgets-nftcard--default', name: 'nft-card-default' },
    { id: 'widgets-nftcard--promotional-price', name: 'nft-card-promotional' },
    { id: 'widgets-walletoption--default', name: 'wallet-option-default' },
    { id: 'widgets-modallayout--login-modal', name: 'modal-layout-login' },
    { id: 'primitives-button--primary', name: 'button-primary' },
    { id: 'primitives-formfield--default', name: 'form-field-default' },
    { id: 'primitives-alert--info', name: 'alert-info' },
  ];

  test.describe('Desktop (1440px)', () => {
    test.use({ viewport: { width: 1440, height: 900 } });

    for (const story of stories) {
      test(`deve corresponder ao snapshot visual de ${story.name} (1440px)`, async ({ page }) => {
        await page.goto(`/storybook/iframe.html?id=${story.id}&viewMode=story`);
        await page.waitForSelector('#storybook-root > *', { state: 'visible' });
        await page.waitForLoadState('networkidle');

        // Aguarda estabilização de fontes e renderização
        await page.evaluate(() => document.fonts.ready);

        await expect(page).toHaveScreenshot(`${story.name}-desktop-1440.png`, {
          animations: 'disabled',
          maxDiffPixelRatio: 0.02,
        });
      });
    }
  });

  test.describe('Mobile (390px)', () => {
    test.use({ viewport: { width: 390, height: 844 } });

    const mobileStories = [
      ...stories,
      { id: 'layout-mobiletabbar--default', name: 'mobile-tab-bar-default' },
    ];

    for (const story of mobileStories) {
      test(`deve corresponder ao snapshot visual de ${story.name} (390px)`, async ({ page }) => {
        await page.goto(`/storybook/iframe.html?id=${story.id}&viewMode=story`);
        await page.waitForSelector('#storybook-root > *', { state: 'attached' });
        await page.waitForLoadState('networkidle');

        // Aguarda estabilização de fontes e renderização
        await page.evaluate(() => document.fonts.ready);

        await expect(page).toHaveScreenshot(`${story.name}-mobile-390.png`, {
          animations: 'disabled',
          maxDiffPixelRatio: 0.02,
        });
      });
    }
  });
});
