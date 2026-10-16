import { test, expect } from '@playwright/test';

test.describe('Fluxo 3: Autenticação, Ciclo de Sessão e Resiliência', () => {
  test.beforeEach(async ({ page }) => {
    // Garante estado limpo antes de cada teste
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  });

  test('deve permitir cadastro de novo usuário e atualizar o Header com a sessão', async ({ page }) => {
    await page.goto('/cadastro');

    await expect(page.getByRole('heading', { level: 1, name: 'Criar Conta' })).toBeVisible();

    // Preenche o formulário de cadastro
    const uniqueEmail = `novo_${Date.now()}@example.com`;
    await page.getByLabel(/Nome de Exibição/i).fill('Novo Colecionador');
    await page.getByLabel(/Nome de Usuário/i).fill(`user_${Date.now()}`);
    await page.getByLabel(/^E-mail$/i).fill(uniqueEmail);
    await page.getByLabel(/^Senha$/i).fill('Password123!');
    await page.getByLabel(/Confirmar Senha/i).fill('Password123!');

    // Submete o formulário
    await page.getByRole('button', { name: /^Criar conta$/i }).click();

    // Deve atualizar o Header com o nome do novo usuário
    await expect(page.getByText('Novo Colecionador')).toBeVisible({ timeout: 10000 });
  });

  test('deve realizar login com sucesso e atualizar o Header com avatar e nome', async ({ page }) => {
    await page.goto('/login');

    await expect(page.getByRole('heading', { level: 1, name: 'Entrar na Conta' })).toBeVisible();

    await page.getByLabel(/E-mail ou Usuário/i).fill('alice@example.com');
    await page.getByLabel(/^Senha$/i).fill('Password123!');

    await page.getByRole('button', { name: /^Entrar$/i }).click();

    // Header deve exibir o nome Alice Silva
    await expect(page.getByText('Alice Silva')).toBeVisible({ timeout: 10000 });
  });

  test('deve redirecionar acesso direto à rota protegida para /login e retornar após autenticação', async ({ page }) => {
    // Tenta acessar /perfil diretamente sem login
    await page.goto('/perfil');

    // É redirecionado com o parâmetro de redirect
    await expect(page).toHaveURL(/\/login\?redirect=.*perfil/);
    await expect(page.getByRole('heading', { level: 1, name: 'Entrar na Conta' })).toBeVisible();

    // Faz login com Alice
    await page.getByLabel(/E-mail ou Usuário/i).fill('alice@example.com');
    await page.getByLabel(/^Senha$/i).fill('Password123!');
    await page.getByRole('button', { name: /^Entrar$/i }).click();

    // Após login, é redirecionado de volta para /perfil
    await expect(page).toHaveURL(/\/perfil/);
    await expect(page.getByText('Alice Silva')).toBeVisible();
  });

  test('deve manter a sessão ativa após refresh da página (F5)', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel(/E-mail ou Usuário/i).fill('alice@example.com');
    await page.getByLabel(/^Senha$/i).fill('Password123!');
    await page.getByRole('button', { name: /^Entrar$/i }).click();

    await expect(page.getByText('Alice Silva')).toBeVisible({ timeout: 10000 });

    // Recarrega a página
    await page.reload();

    // A sessão continua válida e Alice Silva continua visível no Header
    await expect(page.getByText('Alice Silva')).toBeVisible({ timeout: 10000 });
  });

  test('deve realizar logout com sucesso e limpar sessão no Header', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel(/E-mail ou Usuário/i).fill('alice@example.com');
    await page.getByLabel(/^Senha$/i).fill('Password123!');
    await page.getByRole('button', { name: /^Entrar$/i }).click();

    await expect(page.getByText('Alice Silva')).toBeVisible({ timeout: 10000 });

    // Clica no botão de logout no header
    const logoutBtn = page.getByRole('button', { name: /Desconectar|Sair/i });
    await expect(logoutBtn).toBeVisible();
    await logoutBtn.click();

    // Header volta a exibir o botão "Entrar"
    await expect(page.getByRole('button', { name: /^Entrar$/i })).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Alice Silva')).not.toBeVisible();
  });

  test('deve isolar cache na troca de usuário A para B sem vazamento de dados', async ({ page }) => {
    // 1. Login com Alice
    await page.goto('/login');
    await page.getByLabel(/E-mail ou Usuário/i).fill('alice@example.com');
    await page.getByLabel(/^Senha$/i).fill('Password123!');
    await page.getByRole('button', { name: /^Entrar$/i }).click();
    await expect(page.getByText('Alice Silva')).toBeVisible({ timeout: 10000 });

    // 2. Logout de Alice
    const logoutBtn = page.getByRole('button', { name: /Desconectar|Sair/i });
    await logoutBtn.click();
    await expect(page.getByRole('button', { name: /^Entrar$/i })).toBeVisible();

    // 3. Login com Bob
    await page.goto('/login');
    await page.getByLabel(/E-mail ou Usuário/i).fill('bob@example.com');
    await page.getByLabel(/^Senha$/i).fill('Password123!');
    await page.getByRole('button', { name: /^Entrar$/i }).click();

    // Verifica que agora Bob Santos é o usuário ativo
    await expect(page.getByText('Bob Santos')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Alice Silva')).not.toBeVisible();
  });

  test('deve sincronizar logout entre abas via storage event', async ({ context }) => {
    // Cria duas abas
    const page1 = await context.newPage();
    const page2 = await context.newPage();

    // Realiza login na aba 1
    await page1.goto('/login');
    await page1.getByLabel(/E-mail ou Usuário/i).fill('alice@example.com');
    await page1.getByLabel(/^Senha$/i).fill('Password123!');
    await page1.getByRole('button', { name: /^Entrar$/i }).click();
    await expect(page1.getByText('Alice Silva')).toBeVisible({ timeout: 10000 });

    // Abre a aba 2 e verifica que Alice está autenticada
    await page2.goto('/');
    await expect(page2.getByText('Alice Silva')).toBeVisible({ timeout: 10000 });

    // Aba 2 realiza logout
    const logoutBtnPage2 = page2.getByRole('button', { name: /Desconectar|Sair/i });
    await logoutBtnPage2.click();
    await expect(page2.getByRole('button', { name: /^Entrar$/i })).toBeVisible();

    // Aba 1 deve detectar o logout automaticamente
    await expect(page1.getByRole('button', { name: /^Entrar$/i })).toBeVisible({ timeout: 10000 });
    await expect(page1.getByText('Alice Silva')).not.toBeVisible();

    await page1.close();
    await page2.close();
  });

  test('deve tratar expiração de sessão com mensagem explicativa e retenção de contexto', async ({ page }) => {
    // Simula navegação para login com reason=expired e redirect para rota de checkout
    await page.goto('/login?redirect=%2Fcheckout&reason=expired');

    // Valida anúncio acessível de sessão expirada
    await expect(page.getByRole('alert')).toBeVisible();
    await expect(
      page.getByText(/Sua sessão expirou\. Faça login novamente para continuar\./i),
    ).toBeVisible();

    // Faz login novamente
    await page.getByLabel(/E-mail ou Usuário/i).fill('alice@example.com');
    await page.getByLabel(/^Senha$/i).fill('Password123!');
    await page.getByRole('button', { name: /^Entrar$/i }).click();

    // Retoma para o destino pretendido (/checkout)
    await expect(page).toHaveURL(/\/checkout/);
  });
});
