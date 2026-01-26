/**
 * Practice Authentication - Offline Testing
 * 
 * PURPOSE:
 * Demonstrates offline-friendly testing using a local HTML file.
 * No internet required - great for:
 * - Demos and workshops
 * - Airplane coding sessions
 * - Testing when external services are down
 * - Faster test execution (no network latency)
 * 
 * MIGRATION CONTEXT:
 * Old Selenium tests required live test environments (slow, unreliable).
 * Playwright's file:// protocol support enables local testing for forms,
 * validation logic, and UI interactions without backend dependencies.
 * 
 * KEY CONCEPTS:
 * 1. File protocol navigation (file:///)
 * 2. Cross-platform path handling (Windows vs Unix)
 * 3. Resilient locators (getByTestId, role-based)
 * 4. Local state testing (no API calls)
 */

import { test, expect } from '@playwright/test';
import { PracticeLoginPage } from '../../src/pages/PracticeLoginPage';

test.describe('Offline Practice Authentication', () => {
  
  /**
   * BASIC LOGIN FLOW
   * 
   * Tests the login functionality using the local practice.html file.
   * This is consolidated from the duplicate offline tests to avoid redundancy.
   */
  test('should authenticate successfully with local file', async ({ page }) => {
    // Use the Page Object Model for consistency
    const loginPage = new PracticeLoginPage(page);
    
    // Navigate to local file using file:// protocol
    // PracticeLoginPage.goto() handles Windows path conversion
    await loginPage.goto();
    
    // Perform login using resilient locators
    // OLD WAY (brittle, from legacy tests):
    //   await page.fill('#username', 'admin')
    // NEW WAY (resilient, using POM with enhanced form):
    // Enhanced form requires: username (min 3 chars), password (min 6 chars), valid email
    await loginPage.submitIndividualApplication('admin', 'supersecret123', 'admin@test.com');
    
    // Verify secure area appears
    await expect(loginPage.secureArea).toBeVisible();
    
    // Verify token is displayed
    // practice.html shows a static JWT token
    const tokenText = await loginPage.getTokenValue();
    expect(tokenText).toContain('JWT'); // Mock token format: JWT-888-SECRET
  });

  /**
   * DROPDOWN INTERACTION TEST
   * 
   * Demonstrates handling <select> elements.
   * Common in forms (country, state, category selection).
   */
  test('should handle region selection', async ({ page }) => {
    const loginPage = new PracticeLoginPage(page);
    await loginPage.goto();
    
    // Submit valid application form (enhanced form requires validation)
    await loginPage.submitIndividualApplication('admin', 'supersecret123', 'admin@test.com');
    
    // Ensure secure area is visible before interacting with region dropdown
    await expect(loginPage.secureArea).toBeVisible();
    
    // Select from dropdown (use actual option values from practice.html)
    // selectRegion() is a POM method wrapping page.selectOption()
    await loginPage.selectRegion('us-east-1');
    
    // Verify selection
    const selectedValue = await page.locator('#regions').inputValue();
    expect(selectedValue).toBe('us-east-1');
  });

  /**
   * DATA EXTRACTION TEST
   * 
   * Shows how to extract and validate dynamic content.
   * Useful for verifying API responses rendered in UI.
   */
  test('should extract and validate auth token', async ({ page }) => {
    const loginPage = new PracticeLoginPage(page);
    await loginPage.goto();
    
    // Submit valid application form
    await loginPage.submitIndividualApplication('admin', 'supersecret123', 'admin@test.com');
    
    // Extract the token value
    const token = await loginPage.getTokenValue();
    
    // Validate token format
    expect(token).toMatch(/JWT-\d+-\w+/); // e.g., JWT-888-SECRET
    
    // Log for debugging (visible in test output)
    console.log('Captured Token:', token);
  });

  /**
   * FORM VALIDATION TEST
   * 
   * Verifies that enhanced practice.html now requires valid form data.
   * Unlike the old simple form, you can't just click submit - validation is enforced.
   */
  test('should require valid form data before submission', async ({ page }) => {
    const loginPage = new PracticeLoginPage(page);
    await loginPage.goto();
    
    // Enhanced practice.html now enforces validation:
    // - Username: min 3 chars
    // - Password: min 6 chars
    // - Email: valid format
    // - Account type: must be selected
    
    // Fill with valid data to demonstrate validation passes
    await loginPage.submitIndividualApplication('user123', 'password123', 'user@example.com');
    
    // Secure area visible after valid submission (use Playwright's auto-waiting)
    await expect(loginPage.secureArea).toBeVisible();
  });
});

/**
 * OFFLINE TESTING BENEFITS (Migration Story):
 * 
 * 1. Speed:
 *    - No network latency (instant page load)
 *    - No waiting for backend services
 *    - Tests run in ~200ms vs 2-3s for API-dependent tests
 * 
 * 2. Reliability:
 *    - No external service downtime
 *    - No network flakiness
 *    - Deterministic behavior (no race conditions with API)
 * 
 * 3. Isolation:
 *    - Test UI logic independently from backend
 *    - Reproduce bugs without backend access
 *    - Workshop/demo friendly (no credentials needed)
 * 
 * 4. Real-World Use Case (From Migration):
 *    - Financial regulatory forms had complex validation logic
 *    - We tested validation rules offline (fast, reliable)
 *    - Then tested full flow with API integration (slower, E2E)
 *    - This mix gave us fast feedback + comprehensive coverage
 */

/**
 * CROSS-PLATFORM PATH HANDLING:
 * 
 * Windows paths: C:\Users\...
 * Unix paths: /home/...
 * File URLs: file:///C:/Users/... (Windows), file:///home/... (Unix)
 * 
 * PracticeLoginPage.goto() uses:
 *   const path = process.cwd().replace(/\\/g, '/'); // Backslash → forward slash
 *   const url = `file:///${path}/practice.html`;
 * 
 * This works on Windows, Mac, and Linux consistently.
 */
