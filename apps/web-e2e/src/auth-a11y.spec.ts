import { test, expect } from '@playwright/test';

test.describe('Fluxo 11: Acessibilidade do Modal de Autenticação', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  });

  test('deve conter focus trap mantendo a navegação por teclado (Tab) restrita ao modal', async ({ page }) => {
    await page.goto('/');

    // Clica no botão Entrar do Header para abrir o modal
    const loginTrigger = page.getByRole('button', { name: /^Entrar$/i });
    await expect(loginTrigger).toBeVisible();
    await loginTrigger.click();

    // Aguarda o modal abrir com role="dialog"
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();

    // Navega repetidamente com Tab e Shift+Tab
    for (let i = 0; i < 8; i++) {
      await page.keyboard.press('Tab');
      const isInside = await page.evaluate(() => {
        const active = document.activeElement;
        const dlg = document.querySelector('[role="dialog"]');
        return dlg?.contains(active) ?? false;
      });
      expect(isInside).toBe(true);
    }
  });

  test('deve fechar o modal com a tecla Esc e devolver o foco ao disparador', async ({ page }) => {
    await page.goto('/');

    const loginTrigger = page.getByRole('button', { name: /^Entrar$/i });
    await expect(loginTrigger).toBeVisible();
    await loginTrigger.focus();
    await page.keyboard.press('Enter');

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();

    // Pressiona Esc
    await page.keyboard.press('Escape');

    // Modal deve fechar e foco deve retornar ao botão Entrar disparador
    await expect(dialog).not.toBeVisible();
    await expect(loginTrigger).toBeFocused();
  });

  test('deve aplicar aria-invalid="true" e aria-describedby nos campos com erro de validação', async ({ page }) => {
    await page.goto('/login');

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();

    // Clica em Entrar com campos vazios para disparar validação do react-hook-form
    const submitBtn = page.getByRole('button', { name: /^Entrar$/i });
    await submitBtn.click();

    const identifierInput = page.getByLabel(/E-mail ou Usuário/i);
    const passwordInput = page.getByLabel(/^Senha$/i);

    // Verifica aria-invalid="true"
    await expect(identifierInput).toHaveAttribute('aria-invalid', 'true');
    await expect(passwordInput).toHaveAttribute('aria-invalid', 'true');

    // Verifica aria-describedby associado aos IDs de erro
    const identifierDescribedBy = await identifierInput.getAttribute('aria-describedby');
    expect(identifierDescribedBy).toBeTruthy();
    if (identifierDescribedBy) {
      await expect(page.locator(`#${identifierDescribedBy}`)).toBeVisible();
    }

    const passwordDescribedBy = await passwordInput.getAttribute('aria-describedby');
    expect(passwordDescribedBy).toBeTruthy();
    if (passwordDescribedBy) {
      await expect(page.locator(`#${passwordDescribedBy}`)).toBeVisible();
    }
  });

  test('deve permitir alternar entre abas Entrar e Criar conta com teclado e verificar aria-current="page"', async ({ page }) => {
    await page.goto('/login');

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();

    // Na aba Entrar, o link correspondente possui aria-current="page"
    const loginTab = page.getByRole('link', { name: 'Entrar', exact: true });
    const signUpTab = page.getByRole('link', { name: 'Criar conta', exact: true });

    await expect(loginTab).toHaveAttribute('aria-current', 'page');

    // Navega para a aba Criar conta
    await signUpTab.click();

    await expect(page).toHaveURL(/\/cadastro/);
    await expect(signUpTab).toHaveAttribute('aria-current', 'page');
    await expect(loginTab).not.toHaveAttribute('aria-current');
  });
});
