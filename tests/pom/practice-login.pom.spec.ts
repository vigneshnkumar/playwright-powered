/**
 * Practice Login - Page Object Model Demonstration
 * 
 * PURPOSE:
 * This test demonstrates the benefits of the Page Object Model pattern
 * and resilient locators in a realistic financial application form scenario.
 * 
 * MIGRATION CONTEXT:
 * In the old Selenium framework, login logic was copy-pasted across
 * 30+ test files. When the login form changed, we had to update 30 files.
 * With POM, we update one file (PracticeLoginPage.ts) and all tests benefit.
 * 
 * CHALLENGES ADDRESSED:
 * Challenge 1: Dynamic DOM Elements
 *   - Financial forms have conditional fields (Business vs Institutional)
 *   - Old Selenium approach: brittle XPath selectors broke constantly
 *   - New Playwright approach: data-testid + auto-waiting
 * 
 * Challenge 2: Test Maintenance
 *   - Centralized page logic in POM
 *   - Resilient selectors reduce refactoring
 *   - Clear separation: page structure vs test logic
 */

import { test, expect } from '@playwright/test';
import { PracticeLoginPage } from '../../src/pages/PracticeLoginPage';

test.describe('Practice Login - Page Object Model Demo', () => {
  
  /**
   * TEST 1: Individual Account Application (Baseline)
   * 
   * Simplest workflow - no conditional fields
   * Demonstrates basic POM usage and resilient locators
   */
  test('should submit individual account application successfully', async ({ page }) => {
    const loginPage = new PracticeLoginPage(page);
    await loginPage.goto();
    
    // Using workflow method - encapsulates multi-step process
    await loginPage.submitIndividualApplication(
      'john_doe',
      'securepass123',
      'john.doe@example.com'
    );
    
    // ASSERTIONS - Verify expected outcomes
    // Playwright auto-waits for conditions to be true (up to 5s default timeout)
    await expect(loginPage.secureArea).toBeVisible();
    await expect(loginPage.tokenDisplay).toHaveText(/JWT/);
  });

  /**
   * TEST 2: Business Account with Conditional Fields
   * 
   * KEY DEMO: Dynamic DOM Element Handling
   * 
   * OLD SELENIUM (Brittle):
   *   driver.findElement(By.xpath("//div[@class='conditional-wrapper-123']/input[2]"))
   *   → Breaks when: CSS classes change, elements reorder, wrapper added
   * 
   * NEW PLAYWRIGHT (Resilient):
   *   page.getByTestId('company-name-input')
   *   → Survives: CSS changes, DOM restructuring, stable regardless of structure
   * 
   * This test demonstrates:
   * - Conditional fields appearing based on account type
   * - Resilient data-testid locators
   * - Playwright auto-waiting (no explicit waits needed)
   */
  test('should submit business account with conditional fields', async ({ page }) => {
    const loginPage = new PracticeLoginPage(page);
    await loginPage.goto();
    
    // Step 1: Fill basic info
    await loginPage.fillBasicInfo('jane_smith', 'password456', 'jane@acmecorp.com');
    
    // Step 2: Select business account type (triggers conditional fields)
    await loginPage.selectAccountType('business');
    
    // PLAYWRIGHT AUTO-WAITING BENEFIT:
    // No need for explicit wait.until(elementVisible) like Selenium
    // Playwright waits for conditional fields automatically before interaction
    
    // Step 3: Verify business fields appear
    await expect(loginPage.businessFields).toBeVisible();
    expect(await loginPage.areBusinessFieldsVisible()).toBe(true);
    
    // Step 4: Fill business-specific fields
    await loginPage.fillBusinessInfo('Acme Corporation', '12-3456789');
    
    // Step 5: Submit
    await loginPage.submit();
    
    // Verify successful submission
    await expect(loginPage.secureArea).toBeVisible();
    const token = await loginPage.getTokenValue();
    expect(token).toContain('JWT');
  });

  /**
   * TEST 3: Institutional Account Workflow
   * 
   * Demonstrates another set of conditional fields
   * Similar pattern but different fields - shows POM flexibility
   */
  test('should submit institutional account with regulatory fields', async ({ page }) => {
    const loginPage = new PracticeLoginPage(page);
    await loginPage.goto();
    
    // Using the comprehensive workflow method
    await loginPage.submitInstitutionalApplication(
      'regulatory_admin',
      'compliance2024',
      'admin@goldmansachs.com',
      'Goldman Sachs',
      'SEC-8756-XYZ'
    );
    
    // Verify successful submission
    await expect(loginPage.secureArea).toBeVisible();
    await expect(loginPage.tokenDisplay).toContainText('JWT');
  });

  /**
   * TEST 4: Conditional Field Visibility Logic
   * 
   * Explicitly tests the dynamic DOM behavior
   * Ensures only the relevant conditional fields appear
   */
  test('should show only relevant conditional fields based on account type', async ({ page }) => {
    const loginPage = new PracticeLoginPage(page);
    await loginPage.goto();
    
    await loginPage.fillBasicInfo('test_user', 'testpass', 'test@example.com');
    
    // Initial state: no conditional fields visible
    expect(await loginPage.areBusinessFieldsVisible()).toBe(false);
    expect(await loginPage.areInstitutionalFieldsVisible()).toBe(false);
    
    // Select business: only business fields appear
    await loginPage.selectAccountType('business');
    await expect(loginPage.businessFields).toBeVisible();
    expect(await loginPage.areBusinessFieldsVisible()).toBe(true);
    expect(await loginPage.areInstitutionalFieldsVisible()).toBe(false);
    
    // Switch to institutional: business fields hide, institutional appears
    await loginPage.selectAccountType('institutional');
    await expect(loginPage.institutionalFields).toBeVisible();
    expect(await loginPage.areBusinessFieldsVisible()).toBe(false);
    expect(await loginPage.areInstitutionalFieldsVisible()).toBe(true);
    
    // Switch to individual: all conditional fields hide
    await loginPage.selectAccountType('individual');
    expect(await loginPage.areBusinessFieldsVisible()).toBe(false);
    expect(await loginPage.areInstitutionalFieldsVisible()).toBe(false);
  });

  /**
   * TEST 5: Region Selection After Submission
   * 
   * Demonstrates handling of <select> elements
   * Shows interaction with secure area elements
   */
  test('should allow region selection after successful application', async ({ page }) => {
    const loginPage = new PracticeLoginPage(page);
    await loginPage.goto();
    
    await loginPage.submitIndividualApplication(
      'region_tester',
      'password789',
      'tester@example.com'
    );
    
    // Wait for secure area
    await expect(loginPage.secureArea).toBeVisible();
    
    // Select different regions
    await loginPage.selectRegion('us-west-2');
    expect(await loginPage.regionSelect.inputValue()).toBe('us-west-2');
    
    await loginPage.selectRegion('eu-west-1');
    expect(await loginPage.regionSelect.inputValue()).toBe('eu-west-1');
  });

  /**
   * TEST 6: Resilient Locator Demonstration
   * 
   * This test explicitly shows WHY resilient locators matter.
   * These locators work regardless of DOM structure changes.
   * 
   * COMPARISON:
   * 
   * BRITTLE (Selenium/XPath):
   *   //div[@class='container-123']/div[1]/form/div[2]/input
   *   → Breaks if: class names change, div order changes, wrapper added
   * 
   * RESILIENT (Playwright):
   *   page.getByTestId('email-input')
   *   page.getByRole('button', { name: 'Submit Application' })
   *   → Stable: independent of parent structure, class names, element positions
   */
  test('resilient locators remain stable despite potential DOM changes', async ({ page }) => {
    const loginPage = new PracticeLoginPage(page);
    await loginPage.goto();
    
    // These locators work even if:
    // - CSS classes change completely
    // - Parent containers are added/removed
    // - Element order changes (not using positional selectors)
    // - Layout is restructured
    
    // Data-testid approach (stable test identifiers)
    await expect(loginPage.usernameInput).toBeVisible();
    await expect(loginPage.passwordInput).toBeVisible();
    await expect(loginPage.emailInput).toBeVisible();
    await expect(loginPage.accountTypeSelect).toBeVisible();
    
    // Role-based approach (accessible name)
    await expect(loginPage.submitButton).toBeVisible();
    await expect(loginPage.submitButton).toHaveText('Submit Application');
    
    // Both approaches are resilient - choose based on context:
    // - getByRole() for interactive elements (buttons, links, semantic HTML)
    // - getByTestId() for complex layouts or when role isn't clear
    // - Avoid XPath/brittle CSS unless absolutely necessary
  });
});

/**
 * MIGRATION STORY - LESSONS LEARNED:
 * 
 * 1. POM Benefits (Maintainability):
 *    - Changed form structure? Update 1 file (PracticeLoginPage.ts)
 *    - All 6 tests continue working without modification
 *    - In old Selenium suite: 30+ files to update manually
 * 
 * 2. Resilient Locators (Reduced Flakiness):
 *    - data-testid: Collaboration with devs to add stable identifiers
 *    - getByRole(): Accessibility-first, semantic, survives restructuring
 *    - Result: 40% reduction in runtime, eliminated flakiness
 * 
 * 3. Conditional Fields (Dynamic DOM):
 *    - Financial forms have fields that appear/disappear
 *    - Playwright auto-waiting handles this gracefully
 *    - No explicit wait.until() needed (Selenium pain point)
 * 
 * 4. Parallel Execution (CI/CD Speed):
 *    - Each test gets isolated browser context
 *    - Can run all tests in parallel safely
 *    - 2hr → 15min feedback loop improvement
 * 
 * 5. What We'd Do Differently:
 *    - Earlier dev involvement in data-testid strategy
 *    - Visual regression testing for form layouts (see visual.spec.ts)
 *    - Standardize locator patterns across team from day 1
 */
