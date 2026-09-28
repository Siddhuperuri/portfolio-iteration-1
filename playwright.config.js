import { defineConfig } from '@playwright/test';

export default defineConfig({
  timeout: 60000,
  webServer: {
    command: 'npm run dev -- -p 3001',
    url: 'http://localhost:3001',
    timeout: 120000,
    reuseExistingServer: !process.env.CI,
  },
  use: {
    baseURL: 'http://localhost:3001',
    headless: false,
  },
});
