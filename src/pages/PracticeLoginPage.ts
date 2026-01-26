/**
 * PracticeLoginPage - Page Object Model for practice.html
 * 
 * WHY PAGE OBJECTS?
 * - Centralizes locators: change once instead of in every test
 * - Resilient selectors: getByRole() and getByTestId() survive DOM changes
 * - Readable tests: loginPage.fillUsername() vs page.fill('#username')
 * - Maintainability: encapsulates page logic, easier for teams
 * 
 * MIGRATION CONTEXT - Challenge 1: Dynamic DOM Elements
 * Problem: Financial regulatory forms with conditional fields breaking selectors
 * Solution: Use data-testid attributes + conditional logic in the POM
 * Learning: Importance of "testability" as a development requirement
 * 
 * OLD SELENIUM (Brittle):
 *   driver.findElement(By.xpath("//div[@class='form-wrapper-dynamic-123']/div[2]/input"))
 *   → Breaks when CSS classes change or elements reorder
 * 
 * NEW PLAYWRIGHT (Resilient):
 *   page.getByTestId('company-name-input')
 *   page.getByRole('button', { name: 'Submit Application' })
 *   → Survives CSS changes, DOM restructuring, and is more readable
 */

import { Page, Locator } from '@playwright/test';

export class PracticeLoginPage {
  // Page reference - Playwright's main object for browser interaction
  readonly page: Page;

  // BASIC FORM LOCATORS
  // Using data-testid for stable, testability-first identification
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly emailInput: Locator;
  readonly accountTypeSelect: Locator;
  
  // Using getByRole() - accessible, semantic, resilient to layout changes
  readonly submitButton: Locator;
  
  // CONDITIONAL FIELD LOCATORS (Business Account)
  // These fields appear only when accountType = 'business'
  // Demonstrates handling dynamic DOM elements
  readonly businessFields: Locator;
  readonly companyNameInput: Locator;
  readonly taxIdInput: Locator;
  
  // CONDITIONAL FIELD LOCATORS (Institutional Account)
  // These fields appear only when accountType = 'institutional'
  readonly institutionalFields: Locator;
  readonly institutionNameInput: Locator;
  readonly regulatoryIdInput: Locator;
  
  // SECURE AREA LOCATORS
  // Shown after successful form submission
  readonly secureArea: Locator;
  readonly tokenDisplay: Locator;
  readonly regionSelect: Locator;
  readonly statusMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    
    // RESILIENT LOCATORS - Basic form fields
    // data-testid attributes are stable identifiers added specifically for testing
    this.usernameInput = page.getByTestId('username-input');
    this.passwordInput = page.getByTestId('password-input');
    this.emailInput = page.getByTestId('email-input');
    this.accountTypeSelect = page.getByTestId('account-type-select');
    
    // Role-based selector: finds <button> with accessible name "Submit Application"
    // Better than CSS selectors like '#login-btn' which break if ID changes
    this.submitButton = page.getByRole('button', { name: 'Submit Application' });
    
    // Conditional fields - Business account
    this.businessFields = page.getByTestId('business-fields');
    this.companyNameInput = page.getByTestId('company-name-input');
    this.taxIdInput = page.getByTestId('tax-id-input');
    
    // Conditional fields - Institutional account
    this.institutionalFields = page.getByTestId('institutional-fields');
    this.institutionNameInput = page.getByTestId('institution-name-input');
    this.regulatoryIdInput = page.getByTestId('regulatory-id-input');
    
    // Secure area elements
    this.secureArea = page.getByTestId('secure-area');
    this.tokenDisplay = page.getByTestId('token-display');
    this.regionSelect = page.getByTestId('region-select');
    this.statusMessage = page.getByTestId('status-message');
  }

  /**
   * Navigate to the practice page
   * Uses file:// protocol for local HTML testing (offline capability)
   * No network required - perfect for fast CI/CD feedback loops
   */
  async goto() {
    // Construct absolute path for Windows compatibility
    const practicePagePath = `file:///${process.cwd().replace(/\\/g, '/')}/practice.html`;
    await this.page.goto(practicePagePath);
  }

  /**
   * Fill basic information fields (common to all account types)
   * @param username - Username (min 3 characters)
   * @param password - Password (min 6 characters)
   * @param email - Valid email address
   */
  async fillBasicInfo(username: string, password: string, email: string) {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.emailInput.fill(email);
  }

  /**
   * Select account type
   * This triggers conditional fields to appear/disappear (dynamic DOM)
   * @param accountType - 'individual', 'business', or 'institutional'
   * 
   * PLAYWRIGHT AUTO-WAITING BENEFIT:
   * After selecting account type, Playwright automatically waits for
   * conditional fields to appear before interacting with them.
   * No explicit wait.until() needed like in Selenium!
   */
  async selectAccountType(accountType: 'individual' | 'business' | 'institutional') {
    await this.accountTypeSelect.selectOption(accountType);
  }

  /**
   * Fill business account conditional fields
   * Only call this after selecting accountType = 'business'
   * @param companyName - Company legal name
   * @param taxId - Tax ID in format XX-XXXXXXX (e.g., 12-3456789)
   * 
   * RESILIENT PATTERN:
   * - Waits for conditional fields to be visible before interacting
   * - Handles dynamic DOM elements gracefully
   * - Avoids race conditions that plagued Selenium tests
   */
  async fillBusinessInfo(companyName: string, taxId: string) {
    await this.businessFields.waitFor({ state: 'visible' });
    await this.companyNameInput.fill(companyName);
    await this.taxIdInput.fill(taxId);
  }

  /**
   * Fill institutional account conditional fields
   * Only call this after selecting accountType = 'institutional'
   * @param institutionName - Institution legal name
   * @param regulatoryId - SEC/FINRA regulatory ID
   */
  async fillInstitutionalInfo(institutionName: string, regulatoryId: string) {
    await this.institutionalFields.waitFor({ state: 'visible' });
    await this.institutionNameInput.fill(institutionName);
    await this.regulatoryIdInput.fill(regulatoryId);
  }

  /**
   * Submit the application form
   * Playwright auto-waits for button to be visible, enabled, and stable
   * This eliminates flaky "element not clickable" errors from Selenium
   */
  async submit() {
    await this.submitButton.click();
  }

  /**
   * Complete individual account application (simplified workflow)
   * Example of a "workflow method" - encapsulates multi-step process
   */
  async submitIndividualApplication(username: string, password: string, email: string) {
    await this.fillBasicInfo(username, password, email);
    await this.selectAccountType('individual');
    await this.submit();
  }

  /**
   * Complete business account application (demonstrates conditional field handling)
   * This is the key workflow for testing dynamic DOM elements
   */
  async submitBusinessApplication(
    username: string,
    password: string,
    email: string,
    companyName: string,
    taxId: string
  ) {
    await this.fillBasicInfo(username, password, email);
    await this.selectAccountType('business');
    await this.fillBusinessInfo(companyName, taxId);
    await this.submit();
  }

  /**
   * Complete institutional account application
   */
  async submitInstitutionalApplication(
    username: string,
    password: string,
    email: string,
    institutionName: string,
    regulatoryId: string
  ) {
    await this.fillBasicInfo(username, password, email);
    await this.selectAccountType('institutional');
    await this.fillInstitutionalInfo(institutionName, regulatoryId);
    await this.submit();
  }

  /**
   * Check if secure area is visible after successful submission
   * Returns boolean for test assertions
   */
  async isSecureAreaVisible(): Promise<boolean> {
    return await this.secureArea.isVisible();
  }

  /**
   * Get the authentication token text displayed after login
   * Useful for verifying login state and API integration
   */
  async getTokenValue(): Promise<string> {
    const text = await this.tokenDisplay.textContent();
    return text || '';
  }

  /**
   * Select a region from the server dropdown
   * Demonstrates handling of <select> elements
   * @param value - Region value (e.g., 'us-east-1', 'eu-west-1')
   */
  async selectRegion(value: string) {
    await this.regionSelect.selectOption(value);
  }

  /**
   * Get the current status message (success or error)
   * Useful for validation feedback testing
   */
  async getStatusMessage(): Promise<string> {
    const text = await this.statusMessage.textContent();
    return text || '';
  }

  /**
   * Check if business conditional fields are visible
   * Demonstrates testing dynamic DOM element visibility
   */
  async areBusinessFieldsVisible(): Promise<boolean> {
    return await this.businessFields.isVisible();
  }

  /**
   * Check if institutional conditional fields are visible
   */
  async areInstitutionalFieldsVisible(): Promise<boolean> {
    return await this.institutionalFields.isVisible();
  }
}
