/**
 * Visual Regression Testing
 * 
 * PURPOSE:
 * Catch layout bugs that functional tests miss. For example:
 * - Overlapping form fields (CSS issue)
 * - Broken responsive design (mobile view)
 * - Unintended style changes (CSS refactor side effects)
 * 
 * MIGRATION CONTEXT:
 * In the old Selenium framework, we missed several production bugs where
 * forms rendered incorrectly but functional tests passed (buttons worked,
 * just looked wrong or overlapped).
 * 
 * Visual regression testing would have caught these issues in PR tests.
 * 
 * HOW IT WORKS:
 * 1. First run: Playwright captures a baseline screenshot
 * 2. Subsequent runs: Compares new screenshot to baseline pixel-by-pixel
 * 3. Fails if differences exceed threshold (configurable)
 * 4. You review diff and either fix the bug or update the baseline
 * 
 * BEST PRACTICES:
 * - Commit baselines to git (team shares same reference)
 * - Use consistent viewport sizes (avoid flaky diffs)
 * - Mask dynamic content (timestamps, random IDs)
 * - Update baselines deliberately (review visual changes)
 */

import { test, expect } from '@playwright/test';
import { PracticeLoginPage } from '../../src/pages/PracticeLoginPage';

test.describe('Visual Regression Tests', () => {
  
  /**
   * LOGIN FORM LAYOUT
   * 
   * Verifies the login form renders correctly before any interaction.
   * Catches:
   * - CSS positioning issues
   * - Responsive design breaks
   * - Font rendering changes
   * - Color/theme inconsistencies
   */
  test('login form should match visual baseline', async ({ page }) => {
    const loginPage = new PracticeLoginPage(page);
    await loginPage.goto();
    
    // FIRST RUN:
    // This creates: tests/visual/__screenshots__/visual-spec-ts-login-form-snapshot-chromium-win32.png
    // Commit this file to git as the "source of truth"
    
    // SUBSEQUENT RUNS:
    // Playwright compares current screenshot to baseline
    // Fails if pixel difference > threshold (default: 0.2% of pixels)
    
    await expect(page).toHaveScreenshot('login-form-snapshot.png', {
      // Optional: Define specific area to snapshot (avoid full page)
      // clip: { x: 0, y: 0, width: 400, height: 300 },
      
      // Optional: Mask dynamic content
      // mask: [page.locator('.timestamp')],
      
      // Optional: Adjust comparison threshold (0 = exact match, 1 = allow all diffs)
      // maxDiffPixelRatio: 0.01, // Allow 1% pixel difference
    });
  });

  /**
   * AUTHENTICATED STATE LAYOUT
   * 
   * Verifies the UI after successful login.
   * Important for financial apps where conditional fields appear.
   * 
   * REAL-WORLD EXAMPLE:
   * In our financial regulatory forms, fields appeared based on prior
   * answers (e.g., "Business" account type shows company fields). 
   * Visual snapshots catch if these conditional fields render incorrectly.
   */
  test('secure area should match visual baseline after login', async ({ page }) => {
    const loginPage = new PracticeLoginPage(page);
    await loginPage.goto();
    
    // Submit a simple individual account application
    await loginPage.submitIndividualApplication(
      'visual_test',
      'password123',
      'visual@example.com'
    );
    
    // Wait for transition to complete
    await expect(loginPage.secureArea).toBeVisible();
    
    // Snapshot the authenticated view
    await expect(page).toHaveScreenshot('secure-area-snapshot.png');
  });

  /**
   * CONDITIONAL FIELDS: Business Account Form
   * 
   * MIGRATION LESSON - Challenge 1: Dynamic DOM Elements
   * 
   * Problem we faced: Financial forms had conditional fields that appeared
   * based on previous selections. Functional tests passed, but fields
   * overlapped or had wrong spacing.
   * 
   * Solution: Visual snapshots of each conditional state ensure layout
   * integrity when dynamic fields appear.
   */
  test('business account form with conditional fields should match baseline', async ({ page }) => {
    const loginPage = new PracticeLoginPage(page);
    await loginPage.goto();
    
    // Fill basic info
    await loginPage.fillBasicInfo('business_user', 'password456', 'biz@example.com');
    
    // Trigger business conditional fields
    await loginPage.selectAccountType('business');
    
    // Wait for conditional fields to appear
    await expect(loginPage.businessFields).toBeVisible();
    
    // Snapshot showing business-specific fields
    // This catches layout issues like:
    // - Overlapping labels and inputs
    // - Misaligned conditional fields
    // - Broken responsive behavior when new fields appear
    await expect(page).toHaveScreenshot('business-form-conditional-fields.png');
  });

  /**
   * CONDITIONAL FIELDS: Institutional Account Form
   * 
   * Another conditional state - demonstrates complete coverage
   * of all form variations
   */
  test('institutional account form with regulatory fields should match baseline', async ({ page }) => {
    const loginPage = new PracticeLoginPage(page);
    await loginPage.goto();
    
    await loginPage.fillBasicInfo('institutional_user', 'password789', 'inst@example.com');
    await loginPage.selectAccountType('institutional');
    
    // Wait for conditional fields
    await expect(loginPage.institutionalFields).toBeVisible();
    
    // Snapshot institutional-specific layout
    await expect(page).toHaveScreenshot('institutional-form-conditional-fields.png');
  });

  /**
   * RESPONSIVE DESIGN CHECK
   * 
   * Test the same page at different viewport sizes.
   * Catches mobile layout issues.
   * 
   * CONFIGURATION:
   * You can add this to playwright.config.ts to test multiple viewports:
   * 
   * projects: [
   *   { name: 'Desktop Chrome', use: { ...devices['Desktop Chrome'] } },
   *   { name: 'Mobile Chrome', use: { ...devices['Pixel 5'] } },
   * ]
   * 
   * Then snapshots are per-device (separate baselines).
   */
  test('mobile viewport should match baseline', async ({ page }) => {
    // Override viewport for this test
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE size
    
    const loginPage = new PracticeLoginPage(page);
    await loginPage.goto();
    
    // Mobile layout snapshot
    await expect(page).toHaveScreenshot('login-form-mobile.png');
  });

  /**
   * ELEMENT-SPECIFIC SNAPSHOT
   * 
   * Instead of full page, snapshot a specific element.
   * Useful for component-level regression testing.
   * 
   * ADVANTAGE:
   * Smaller image size, faster comparisons, less likely to have
   * unrelated diffs (e.g., footer change doesn't fail header snapshot).
   */
  test('submit button should match visual baseline', async ({ page }) => {
    const loginPage = new PracticeLoginPage(page);
    await loginPage.goto();
    
    // Snapshot just the button element
    await expect(loginPage.submitButton).toHaveScreenshot('submit-button.png');
  });

  /**
   * MASKING DYNAMIC CONTENT
   * 
   * Some content changes every run (timestamps, session IDs, random data).
   * Use 'mask' option to exclude these areas from comparison.
   */
  test('snapshot with masked dynamic content', async ({ page }) => {
    const loginPage = new PracticeLoginPage(page);
    await loginPage.goto();
    await loginPage.submitIndividualApplication('test', 'password123', 'test@example.com');
    
    // Wait for secure area
    await expect(loginPage.secureArea).toBeVisible();
    
    // The auth token is static in our demo, but in real apps might be dynamic
    await expect(page).toHaveScreenshot('masked-snapshot.png', {
      mask: [loginPage.tokenDisplay], // This area ignored in comparison
    });
  });
});

/**
 * WORKFLOW: HANDLING VISUAL CHANGES
 * 
 * 1. Test fails with visual diff:
 *    - Playwright shows diff in HTML report
 *    - Three images: expected, actual, diff (highlighted changes)
 * 
 * 2. Review the diff:
 *    - Is it a bug? Fix the CSS/HTML
 *    - Is it intentional? Update the baseline
 * 
 * 3. Update baseline (if change is intentional):
 *    npx playwright test --update-snapshots
 *    This overwrites baseline with new screenshot
 * 
 * 4. Commit new baseline:
 *    git add tests/visual/__screenshots__/
 *    git commit -m "Update visual baseline for login form redesign"
 * 
 * TEAM WORKFLOW:
 * - Baselines committed to git (everyone uses same reference)
 * - CI fails if visual diffs detected
 * - PR reviews include visual diff inspection
 * - Deliberate baseline updates (not automatic)
 */

/**
 * CONFIGURATION TIPS:
 * 
 * In playwright.config.ts, you can set global snapshot options:
 * 
 * export default defineConfig({
 *   expect: {
 *     toHaveScreenshot: {
 *       maxDiffPixelRatio: 0.01, // Allow 1% difference (fonts vary by OS)
 *       threshold: 0.2, // Pixel color threshold (0-1, higher = more lenient)
 *     },
 *   },
 * });
 * 
 * CROSS-PLATFORM CONSIDERATIONS:
 * - Font rendering differs slightly between Windows/Mac/Linux
 * - Consider separate baselines per OS (Playwright supports this)
 * - Or use maxDiffPixelRatio to tolerate minor font differences
 */

/**
 * WHEN TO USE VISUAL TESTS:
 * 
 * ✅ Good use cases:
 * - Complex forms with many fields (layout regression)
 * - CSS refactors (ensure no visual side effects)
 * - Component libraries (button styles, card layouts)
 * - Critical user journeys (checkout flow, dashboards)
 * 
 * ❌ Bad use cases:
 * - Highly dynamic content (real-time data, ads)
 * - Third-party widgets (you don't control, changes frequently)
 * - Temporary promotional banners (noise in diffs)
 * 
 * COMPROMISE:
 * Use 'mask' option to exclude dynamic areas while testing stable layout.
 */
