import { defineConfig } from '@playwright/test';

export default defineConfig({
  timeout: 60000,
  use: {
    baseURL: 'http://localhost:8081',
    headless: true,
    viewport: { width: 1280, height: 800 },
  },
});
