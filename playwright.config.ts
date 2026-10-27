import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: 2,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'http://127.0.0.1:4173',
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
    locale: 'ja-JP',
    colorScheme: 'light',
    reducedMotion: 'reduce',
  },
  projects: [
    { name: 'desktop-chromium', testIgnore: '**/*.visual.spec.ts', use: { ...devices['Desktop Chrome'] } },
    { name: 'pixel-5-chromium', testIgnore: '**/*.visual.spec.ts', use: { ...devices['Pixel 5'] } },
    { name: 'iphone-13-webkit', testIgnore: '**/*.visual.spec.ts', use: { ...devices['iPhone 13'] } },
    {
      name: 'visual-chromium-linux',
      testMatch: '**/*.visual.spec.ts',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 900 }, deviceScaleFactor: 1 },
    },
  ],
  webServer: {
    command: 'npm run preview -- --host 127.0.0.1 --port 4173 --strictPort',
    url: 'http://127.0.0.1:4173',
    reuseExistingServer: false,
    timeout: 30_000,
  },
})
