import { test, expect } from '@playwright/test';
import { PracticeLoginPage } from '../../src/pages/PracticeLoginPage';

// Practices offline-friendly locators and assertions against enhanced form.
test('offline auth flow practice', async ({ page }) => {
  // Use POM for consistency with enhanced form
  const loginPage = new PracticeLoginPage(page);
  await loginPage.goto();

  // Enhanced form requires valid data: username (min 3 chars), password (min 6 chars), valid email
  await loginPage.submitIndividualApplication('admin', 'supersecret123', 'admin@test.com');

  // Verify secure area and token
  await expect(loginPage.secureArea).toBeVisible();
  const tokenText = await loginPage.getTokenValue();
  expect(tokenText).toContain('JWT');

  // Test dropdown interaction (use actual option value from practice.html)
  await loginPage.selectRegion('eu-west-1');
});
