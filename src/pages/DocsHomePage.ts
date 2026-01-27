/**
 * DocsHomePage - Page Object Model for Playwright testing
 * 
 * This class represents the Playwright documentation homepage (https://playwright.dev)
 * and provides reusable methods to interact with it.
 * 
 * @class DocsHomePage
 * @example
 * ```typescript
 * const page = await browser.newPage();
 * const docsPage = new DocsHomePage(page);
 * await docsPage.goto();
 * await docsPage.goToGetStarted();
 * ```
 * 
 * KEY CONCEPTS FOR BEGINNERS:
 * 
 * **Page Object Model (POM)**: Instead of writing selectors in every test,
 * we organize them in a class. This makes tests cleaner and easier to maintain.
 * If the website changes, we only update one place.
 * 
 * **Role-based selectors** (getByRole): These find elements by their purpose
 * rather than CSS selectors. For example, finding a link by its text "Get started"
 * is more reliable than finding `<a class="nav-link-item">`.
 * 
 * **Auto-waiting**: Playwright automatically waits for elements to be ready
 * before interacting. In older tools like Selenium, you had to manually wait.
 * 
 * @property {Page} page - The Playwright page instance
 * @property {Locator} getStartedLink - Locator for the "Get started" navigation link
 * @property {Locator} heading - Locator for the main page heading
 */
/**
 * DocsHomePage - Page Object for https://playwright.dev
 * 
 * PURPOSE:
 * Demonstrates POM pattern with a public website (Playwright docs)
 * Shows how role-based selectors work with real-world navigation
 * 
 * MIGRATION INSIGHT:
 * In Selenium, you might have done:
 *   WebElement link = driver.findElement(By.linkText("Get started"));
 *   link.click();
 * 
 * In Playwright:
 *   await page.getByRole('link', { name: 'Get started' }).click();
 * 
 * Advantages:
 * - Auto-waiting: no need for explicit waits (Selenium's flakiness culprit)
 * - ARIA-aware: encourages accessible markup
 * - Intent-clear: role='link' is more semantic than CSS selectors
 */

import { Page, Locator } from '@playwright/test';

export class DocsHomePage {
  readonly page: Page;
  
  // Role-based locators for navigation
  readonly getStartedLink: Locator;
  readonly heading: Locator;

  constructor(page: Page) {
    this.page = page;
    
    // getByRole('link') finds <a> elements by accessible name
    // This is the WCAG-friendly way to locate interactive elements
    this.getStartedLink = page.getByRole('link', { name: 'Get started' });
    
    // getByRole('heading') finds <h1>, <h2>, etc.
    // Level can be specified: { level: 1 } for <h1> only
    this.heading = page.getByRole('heading', { name: 'Playwright enables reliable end-to-end testing for modern web apps.' });
  }

  /**
   * Navigate to the homepage
   * Uses baseURL from playwright.config.ts (https://playwright.dev)
   */
  async goto() {
    // Relative URL - baseURL prepended automatically
    await this.page.goto('./');
  }

  /**
   * Click "Get started" link and wait for navigation
   * Playwright automatically waits for navigation to complete
   * No need for Selenium's WebDriverWait or Thread.sleep()
   */
  async goToGetStarted() {
    await this.getStartedLink.click();
    // Playwright waits for 'load' event by default
    // Can customize: .click({ waitUntil: 'networkidle' })
  }

  /**
   * Check if the main heading is visible
   * Useful for smoke tests
   */
  async isHeadingVisible(): Promise<boolean> {
    return await this.heading.isVisible();
  }

  /**
   * Get current page title
   * Common check in smoke tests
   */
  async getTitle(): Promise<string> {
    return await this.page.title();
  }

  /**
   * Verify we're on the expected URL
   * Better than Selenium's getCurrentUrl() which could be timing-dependent
   */
  async expectUrl(pattern: string | RegExp) {
    // This returns the current URL
    return this.page.url();
  }
}
