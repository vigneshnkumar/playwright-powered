import { test, expect } from '@playwright/test';
import { PracticeLoginPage } from '../src/pages/PracticeLoginPage';

test('Offline Auth Flow Practice', async ({ page }) => {
  // Use POM for consistency with enhanced form
  const loginPage = new PracticeLoginPage(page);
  
  // 1. Load the local file (Works perfectly offline!)
  await loginPage.goto();

  // 2. Submit individual application with valid data
  // Enhanced form now requires: username (min 3 chars), password (min 6 chars), valid email
  await loginPage.submitIndividualApplication('admin', 'supersecret123', 'admin@test.com');

  // 3. Assertions (Resume Story: "Validation")
  await expect(loginPage.secureArea).toBeVisible();

  // 4. Extract Data (Resume Story: "Token Validation")
  const tokenText = await loginPage.getTokenValue();
  console.log('Captured Token:', tokenText);
  expect(tokenText).toContain('JWT');

  // 5. Dropdown Handling (use actual option value from practice.html)
  await loginPage.selectRegion('us-west-2');
});