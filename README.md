# Playwright-Powered: Selenium → Playwright Migration Demo

A practical demonstration of migrating from legacy Java/Selenium to modern Playwright/TypeScript. This project showcases resilient locators, Page Object Model patterns, visual regression testing, and CI/CD integration—achieving 40% runtime reduction and eliminating test flakiness.

**🎯 Purpose:** Portfolio project demonstrating test automation best practices and migration expertise.

**📚 Background:** See [migration.md](migration.md) for the full migration story, challenges, and solutions.

---

## What This Project Demonstrates

- ✅ **Resilient Locators:** `getByRole()`, `getByTestId()`, `getByLabel()` instead of brittle XPath
- ✅ **Page Object Model:** Centralized, maintainable page classes in `src/pages/`
- ✅ **API Auth Bypass:** Fast test setup via `request` fixture (no UI login each time)
- ✅ **Visual Regression:** Snapshot testing for layout changes
- ✅ **CI/CD Integration:** GitHub Actions workflow with parallel execution
- ✅ **Offline Testing:** Local file-based tests for demos/workshops

---

## Project Structure

```
playwright-powered/
├── src/pages/                    # Page Object Model classes
│   ├── PracticeLoginPage.ts      # POM for practice.html (resilient locators)
│   └── DocsHomePage.ts           # POM for playwright.dev (role-based selectors)
│
├── tests/
│   ├── ui/                       # UI smoke tests (public sites)
│   │   ├── homepage.spec.ts      # Playwright.dev navigation test
│   │   └── example.spec.ts       # Default Playwright starter tests
│   ├── api/                      # API-first testing patterns
│   │   └── auth-bypass.spec.ts   # Token injection via request fixture
│   ├── visual/                   # Visual regression tests
│   │   ├── visual.spec.ts        # Screenshot comparison tests
│   │   └── visual.spec.ts-snapshots/  # Baseline images (committed to git)
│   └── offline/                  # Offline-friendly tests (practice.html)
│       ├── practice-auth.spec.ts       # Local HTML file testing
│       ├── practice-login.pom.spec.ts  # Demonstrates POM benefits
│       └── offline-auth.spec.ts        # Auth flow via POM
│
├── extras/
│   └── jwt_validation.py         # Standalone Python/pytest JWT example (not part of Playwright suite)
│
├── .github/workflows/
│   └── playwright.yml            # CI/CD pipeline (parallel execution)
│
├── playwright.config.ts          # Runner config (retries, tracing, parallelism)
├── practice.html                 # Local test fixture with data-testid attributes
├── package.json                  # Dependencies and npm scripts
├── migration.md                  # Full migration story (resume talking points)
└── README.md                     # This file
```

---

## Key Files Explained (For Beginners)

### Configuration & Setup

**`playwright.config.ts`** - Test runner configuration
- **What:** Controls how Playwright runs tests (browsers, parallelism, retries, artifacts)
- **Why:** Centralized settings avoid per-test configuration
- **Key settings:**
  - `fullyParallel: true` → Tests run simultaneously (faster)
  - `retries: 2` on CI → Auto-retry flaky tests
  - `trace: 'retain-on-failure'` → Rich debugging artifacts on failures
  - `baseURL` → Shortens test URLs (`goto('/')` instead of full URL)

**`package.json`** - Project dependencies and scripts
- **What:** Defines npm packages (Playwright) and commands (`npm test`)
- **Why:** Standard Node.js way to manage dependencies
- **Scripts:**
  - `npm test` → Run all tests
  - `npm run test:ui` → Interactive UI mode (great for debugging)
  - `npm run test:debug` → Step-by-step debug mode

### Page Object Model (POM)

**`src/pages/PracticeLoginPage.ts`** - Login page object
- **What:** Class encapsulating locators and actions for `practice.html`
- **Why:** Tests read like `loginPage.login('user', 'pass')` instead of `page.fill('#username', 'user')`
- **Benefit:** Change a selector once here instead of in 30 test files
- **Locators used:**
  - `getByTestId('username-input')` → Finds `<input data-testid="username-input">`
  - `getByRole('button', { name: 'Login' })` → Finds button by accessible name

**`src/pages/DocsHomePage.ts`** - Playwright.dev homepage object
- **What:** Page object for public website navigation
- **Why:** Demonstrates role-based locators with real-world site
- **Highlights:**
  - `getByRole('link', { name: 'Get started' })` → WCAG-compliant selector
  - Auto-waiting built-in (no manual waits needed)

### Test Files

**`tests/offline/practice-login.pom.spec.ts`** - POM demonstration
- **What:** Test using `PracticeLoginPage` class
- **Why:** Shows how POM improves readability and maintainability
- **Pattern:** Instantiate page object → call methods → assert results

**`tests/api/auth-bypass.spec.ts`** - API authentication
- **What:** Uses `request` fixture to get auth token, injects as cookie
- **Why:** 10x faster than logging in via UI for every test
- **Selenium comparison:** Selenium required custom HTTP clients; Playwright has it built-in

**`tests/visual/visual.spec.ts`** - Visual regression
- **What:** Screenshot comparison tests using `toHaveScreenshot()`
- **Why:** Catches layout bugs that functional tests miss
- **How it works:** First run creates baseline, subsequent runs compare pixel-by-pixel

**`tests/offline/practice-auth.spec.ts`** - Local file testing
- **What:** Tests against `practice.html` using `file://` protocol
- **Why:** No internet required; great for workshops/demos
- **Note:** Windows path handling (`file:///C:/Users/...`)

### Documentation

**`migration.md`** - Migration story
- **What:** Detailed narrative of Selenium → Playwright migration
- **Why:** Resume talking points, interview preparation
- **Sections:**
  - Before/after comparison
  - Locator strategy evolution
  - CI/CD improvements
  - Challenges overcome
  - Lessons learned

### CI/CD

**`.github/workflows/playwright.yml`** - GitHub Actions pipeline
- **What:** Automated CI pipeline triggered on push/PR
- **Why:** Continuous testing, parallel execution, artifact uploads
- **Steps:**
  1. Install Node.js
  2. `npm install` → Install Playwright
  3. `npx playwright install` → Install browsers
  4. `npx playwright test` → Run tests (8 parallel workers)
  5. Upload HTML report and test results as artifacts

---

## Getting Started

### Prerequisites
- **Node.js** 18+ ([download](https://nodejs.org/))
- **Git** (for cloning)
- **Windows/Mac/Linux** (Playwright supports all)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/playwright-powered.git
cd playwright-powered

# Install dependencies
npm install

# Install Playwright browsers (Chromium, Firefox, WebKit)
npx playwright install
```

### Running Tests

```bash
# Run all tests (headless, terminal output)
npm test

# Run with UI mode (interactive, visual test runner)
npm run test:ui

# Run with debug mode (step through tests, pause on errors)
npm run test:debug

# Run specific test file
npx playwright test tests/offline/practice-login.pom.spec.ts

# Run tests matching a pattern
npx playwright test --grep "login"

# Run in headed mode (see browser)
npx playwright test --headed

# Generate HTML report (auto-opens in browser)
npx playwright show-report
```

### Viewing Test Results

After running tests:
1. **Terminal output:** Pass/fail summary
2. **HTML report:** `playwright-report/index.html` (run `npx playwright show-report`)
3. **Trace viewer:** On failures, see `test-results/` folders with traces
   ```bash
   npx playwright show-trace test-results/<test-name>/trace.zip
   ```

---

## CI/CD Setup

This project includes a GitHub Actions workflow (`.github/workflows/playwright.yml`).

**What it does:**
- Runs on every push and pull request
- Executes tests in parallel (8 workers)
- Uploads HTML report and traces as artifacts
- Automatically retries flaky tests

**To enable:**
1. Push this repo to GitHub
2. GitHub Actions runs automatically
3. View results in "Actions" tab
4. Download artifacts (reports, traces) from workflow runs

---

## Common Workflows

### Adding a New Test

1. **Identify the page/feature:** What are you testing?
2. **Create/update page object:** Add to `src/pages/` if needed
3. **Write test:** Add to appropriate folder (`ui/`, `api/`, `pom/`)
4. **Use resilient locators:** Prefer `getByRole()` > `getByLabel()` > `getByTestId()` > CSS
5. **Run locally:** `npm run test:ui` to debug interactively
6. **Commit:** Tests run in CI automatically

Example:
```typescript
// tests/my-feature/my-test.spec.ts
import { test, expect } from '@playwright/test';
import { MyPage } from '../../src/pages/MyPage';

test('user can submit form', async ({ page }) => {
  const myPage = new MyPage(page);
  await myPage.goto();
  await myPage.fillForm('data');
  await myPage.submit();
  await expect(page.getByText('Success')).toBeVisible();
});
```

### Updating a Locator

1. **Open page object:** `src/pages/SomePage.ts`
2. **Update locator:** Change `getByTestId('old')` to `getByTestId('new')`
3. **Run tests:** All tests using that page object update automatically
4. **No need to touch test files** (that's the POM benefit!)

### Debugging a Failing Test

1. **Run in UI mode:**
   ```bash
   npm run test:ui
   ```
2. **Use trace viewer:**
   ```bash
   npx playwright show-trace test-results/<test-name>/trace.zip
   ```
3. **Add `await page.pause()`** in test code to pause execution
4. **Check screenshots/videos** in `test-results/` folder

---

## Locator Strategy (Quick Reference)

**Priority order (most resilient → least resilient):**

1. **`getByRole('button', { name: 'Submit' })`** → Best for interactive elements
2. **`getByLabel('Username')`** → Forms with proper labels
3. **`getByTestId('submit-btn')`** → Stable test IDs (requires dev collaboration)
4. **`getByText('Welcome')`** → Text content (fragile if text changes)
5. **CSS/XPath** → Last resort (brittle, avoid if possible)

**Why this order?**
- Role-based locators enforce accessibility (WCAG compliance)
- Test IDs are stable (don't change with CSS refactors)
- CSS selectors break easily (class names, IDs change)

**Examples:**
```typescript
// ✅ GOOD: Resilient, readable, accessible
await page.getByRole('button', { name: 'Submit Application' }).click();
await page.getByLabel('Email Address').fill('test@example.com');
await page.getByTestId('confirm-btn').click();

// ❌ BAD: Brittle, breaks with DOM changes
await page.locator('//div[@class="form-v2"]/button[2]').click(); // XPath
await page.locator('#submit-btn-123').click(); // Dynamic ID
await page.locator('div.container > button:nth-child(3)').click(); // Positional CSS
```

---

## Migration Story Highlights

**Problem:** Legacy Selenium tests took 2 hours to run, failed randomly 30% of the time, blocked CI/CD.

**Solution:** Migrated to Playwright using:
- Resilient locators (`getByRole()`, `getByTestId()`)
- Page Object Model for maintainability
- Parallel execution (8 workers)
- Built-in retry logic

**Results:**
- ⏱️ 40% faster (2hr → 15min feedback loop)
- 🎯 Zero flaky failures in 3 months
- 🚀 Enabled per-PR testing (previously impossible)
- 📈 Faster release cycles (weekly → twice-weekly)

**Full story:** [migration.md](migration.md)

---

## Technologies Used

- **Playwright Test** ([docs](https://playwright.dev)) - Modern E2E testing framework
- **TypeScript** ([docs](https://www.typescriptlang.org/)) - Type-safe JavaScript
- **GitHub Actions** ([docs](https://docs.github.com/actions)) - CI/CD automation
- **Node.js** - JavaScript runtime

---

## Learning Resources

**Playwright Docs:**
- [Getting Started](https://playwright.dev/docs/intro)
- [Locators Guide](https://playwright.dev/docs/locators)
- [Page Object Model](https://playwright.dev/docs/pom)
- [Best Practices](https://playwright.dev/docs/best-practices)

**This Project:**
- [Migration Story](migration.md) - Full context and lessons learned
- [POM Examples](src/pages/) - Annotated page object classes
- [Test Examples](tests/) - Various test patterns

---

## License

MIT License - Feel free to use this project as a portfolio reference or learning material.

---

## Contact

For questions or feedback about this migration demo, please open an issue on GitHub.
