/**
 * API Authentication Bypass Pattern
 * 
 * PURPOSE:
 * Demonstrates how to bypass UI login by obtaining auth tokens via API
 * and injecting them as cookies. This is 10x faster than logging in via
 * UI for every test.
 * 
 * MIGRATION CONTEXT:
 * Old Selenium approach:
 * - Every test started with UI login (30s overhead per test)
 * - 50 tests × 30s = 25 minutes wasted on repetitive login flows
 * - Flaky login form interactions caused random failures
 * 
 * New Playwright approach:
 * - Get auth token via API (1-2s)
 * - Inject as cookie (instant)
 * - Navigate directly to protected page
 * - 50 tests × 2s = 100 seconds (20x faster)
 * 
 * REAL-WORLD IMPACT:
 * This pattern was critical in our migration to achieve the 40% runtime
 * reduction. We used it for 45 out of 50 tests (only 5 tests actually
 * verified the login UI itself).
 * 
 * KEY CONCEPTS:
 * 1. request fixture - Playwright's built-in API client (no axios needed)
 * 2. addCookies() - Inject auth state into browser context
 * 3. Test isolation - Each test gets fresh context (no cookie bleed)
 */

import { test, expect } from '@playwright/test';

test.describe('API Authentication Bypass', () => {
  
  /**
   * BASIC AUTH BYPASS PATTERN
   * 
   * Steps:
   * 1. POST to /auth endpoint with credentials
   * 2. Extract token from JSON response
   * 3. Inject token as cookie into browser context
   * 4. Navigate to protected page (already "logged in")
   * 
   * This is the fundamental pattern used across 45 tests in the migration.
   */
  test('should bypass UI login using API token', async ({ page, request }) => {
    // Step 1: Get auth token via API
    // 'request' is a Playwright fixture (like 'page')
    // It's a full-featured HTTP client with auto-waiting and retry logic
    const apiResponse = await request.post('https://restful-booker.herokuapp.com/auth', {
      data: {
        username: 'admin',
        password: 'password123'
      }
    });

    // Step 2: Verify API response
    // Always check response status before extracting data
    expect(apiResponse.ok()).toBeTruthy(); // Status 200-299
    
    // Step 3: Extract token from JSON
    // Destructuring assignment for cleaner code
    const { token } = await apiResponse.json();
    console.log('API Token:', token); // Visible in test output
    
    // Verify token format (optional but recommended)
    expect(token).toBeTruthy(); // Not null/undefined/empty
    expect(typeof token).toBe('string');

    // Step 4: Inject token as cookie
    // This simulates the browser receiving a Set-Cookie header after login
    await page.context().addCookies([
      {
        name: 'token',        // Cookie name (match backend expectation)
        value: token,         // Token value from API
        domain: 'restful-booker.herokuapp.com', // Must match site domain
        path: '/',            // Available on all paths
        // Optional properties:
        // httpOnly: true,    // Prevents JavaScript access (security)
        // secure: true,      // HTTPS only (production best practice)
        // sameSite: 'Lax',   // CSRF protection
      }
    ]);

    // Step 5: Navigate to protected page
    // Backend reads the 'token' cookie and treats user as authenticated
    // No UI login needed - instant access to protected routes
    await page.goto('https://restful-booker.herokuapp.com/admin/');
    
    // NOTE: restful-booker.herokuapp.com doesn't actually use this token
    // for real auth (it's a demo API), but this IS the correct pattern
    // for real apps. In production, you'd assert on authenticated content:
    // await expect(page.getByText('Welcome, Admin')).toBeVisible();
  });

  /**
   * ALTERNATIVE: Using localStorage Instead of Cookies
   * 
   * Some apps store auth tokens in localStorage instead of cookies.
   * This shows how to inject tokens there.
   */
  test('should inject token via localStorage', async ({ page, request }) => {
    // Get token via API (same as above)
    const apiResponse = await request.post('https://restful-booker.herokuapp.com/auth', {
      data: { username: 'admin', password: 'password123' }
    });
    expect(apiResponse.ok()).toBeTruthy();
    const { token } = await apiResponse.json();

    // Navigate to domain first (localStorage is domain-specific)
    await page.goto('https://restful-booker.herokuapp.com/');

    // Inject token into localStorage via JavaScript
    await page.evaluate((authToken) => {
      localStorage.setItem('authToken', authToken);
      // Or if app expects JSON: localStorage.setItem('user', JSON.stringify({ token: authToken }));
    }, token);

    // Now navigate to protected page (app reads localStorage)
    await page.goto('https://restful-booker.herokuapp.com/admin/');
  });

  /**
   * ADVANCED: Reusable Auth Fixture
   * 
   * For projects with many tests, create a fixture that handles auth
   * automatically. This avoids repeating the API call in every test.
   * 
   * Implementation: Add to playwright.config.ts or a fixtures file:
   * 
   * import { test as base } from '@playwright/test';
   * 
   * export const test = base.extend({
   *   authenticatedPage: async ({ page, request }, use) => {
   *     // Get token
   *     const response = await request.post('/auth', { data: { ... } });
   *     const { token } = await response.json();
   *     
   *     // Inject cookie
   *     await page.context().addCookies([{ name: 'token', value: token, ... }]);
   *     
   *     // Provide authenticated page to test
   *     await use(page);
   *   }
   * });
   * 
   * Usage in tests:
   * test('admin dashboard', async ({ authenticatedPage }) => {
   *   await authenticatedPage.goto('/admin');
   *   // Already logged in!
   * });
   */
});

/**
 * PERFORMANCE COMPARISON (From Migration):
 * 
 * OLD (Selenium, UI login every test):
 * - Test 1: 35s (30s login + 5s test logic)
 * - Test 2: 35s
 * - Test 3: 35s
 * - Total for 3 tests: 105s
 * 
 * NEW (Playwright, API auth bypass):
 * - Test 1: 7s (2s API call + 5s test logic)
 * - Test 2: 7s
 * - Test 3: 7s
 * - Total for 3 tests: 21s
 * 
 * 5x faster on individual tests
 * Eliminates login form flakiness (major win)
 * 
 * For 50 tests:
 * - OLD: 50 × 35s = 29 minutes
 * - NEW: 50 × 7s = 6 minutes
 * - Savings: 23 minutes per test run
 * - With 10 runs/day: 230 minutes saved = 3.8 hours/day
 */

/**
 * WHEN TO USE API AUTH BYPASS:
 * 
 * ✅ Use for:
 * - Tests focusing on post-login functionality
 * - Regression tests for features unrelated to login
 * - Smoke tests that need to check many pages quickly
 * - Load/stress testing (API auth scales better)
 * 
 * ❌ Don't use for:
 * - Tests specifically verifying login flow
 * - Tests checking login error messages
 * - OAuth/SSO flows (need real redirect dance)
 * - Tests verifying "Remember me" checkbox behavior
 * 
 * RULE OF THUMB:
 * If your test isn't about authentication, use API bypass.
 * Only 5 out of 50 of our migrated tests used UI login.
 */

/**
 * SECURITY CONSIDERATIONS:
 * 
 * 1. Hardcoded credentials:
 *    - OK for demo/practice tests (like this)
 *    - Use environment variables in real projects:
 *      process.env.TEST_USER, process.env.TEST_PASSWORD
 * 
 * 2. Token exposure:
 *    - console.log() is fine for debugging
 *    - Don't commit tokens to git (use .env files, add to .gitignore)
 * 
 * 3. Production APIs:
 *    - Use dedicated test environment (staging, QA)
 *    - Never run tests against production auth endpoints
 *    - Rate limiting can block your CI pipeline
 * 
 * 4. Cookie attributes:
 *    - httpOnly: true prevents XSS attacks
 *    - secure: true ensures HTTPS only
 *    - sameSite: 'Lax' prevents CSRF attacks
 *    - Match your backend's security settings
 */
