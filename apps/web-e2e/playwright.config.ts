import { defineConfig, devices } from '@playwright/test';
import path from 'node:path';

const PORT = 4200;
const baseURL = `http://localhost:${PORT}`;
const workspaceRoot = path.resolve(import.meta.dirname, '../..');

export default defineConfig({
  testDir: './src',
  outputDir: path.join(workspaceRoot, 'dist/.playwright/apps/web-e2e/test-results'),
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  ...(process.env.CI ? { workers: 1 } : {}),
  reporter: [
    ['html', { outputFolder: path.join(workspaceRoot, 'dist/.playwright/apps/web-e2e/report'), open: 'never' }],
    ['list'],
  ],
  use: {
    baseURL,
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npx nx serve shell',
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    cwd: workspaceRoot,
    timeout: 60000,
  },
});
