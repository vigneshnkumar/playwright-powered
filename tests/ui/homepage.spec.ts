import { test, expect } from '@playwright/test';

// Simple smoke tests that leverage baseURL from playwright.config.ts
test.describe('Playwright docs smoke', () => {
  test('has title', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Playwright/);
  });

  test('navigates to intro', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'Get started' }).click();
    await expect(page).toHaveURL(/.*intro/);
  });
});
