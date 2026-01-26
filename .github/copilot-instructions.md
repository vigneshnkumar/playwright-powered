# Copilot instructions for this repo

## Big picture
- This is a Playwright Test project; all tests live under tests/ and run via Playwright’s test runner.
- Test runner behavior is centralized in [playwright.config.ts](playwright.config.ts): HTML reporter, Chromium-only project, parallelism, retries on CI, and tracing on first retry.

## Developer workflows
- Install: npm install ; then install browsers with npx playwright install (documented in README).
- Run tests: npm test (runs npx playwright test).
- UI runner: npm run test:ui.
- Debug: npm run test:debug.

## Project-specific patterns
- Tests use the @playwright/test fixtures (e.g., `page`, `request`) and Playwright’s role-based selectors.
- Example baseline tests are in [example.spec.ts](example.spec.ts).
- API-auth bypass pattern is demonstrated in [tests/auth_bypass.spec.ts](tests/auth_bypass.spec.ts):
  - Obtain auth token via `request.post(...)`.
  - Assert `apiResponse.ok()` and parse JSON.
  - Inject token as a cookie via `page.context().addCookies(...)` before navigation.

## Integrations and external deps
- External dependency is Playwright Test (@playwright/test) with TypeScript.
- Tests currently target public demo sites: https://playwright.dev and https://restful-booker.herokuapp.com.

## Conventions to follow when editing
- Keep new tests under tests/ and name them *.spec.ts.
- Use the existing Playwright fixtures and patterns (e.g., `test`, `expect`, `page`, `request`) shown in current tests.
- If adding new browser targets or reporters, update [playwright.config.ts](playwright.config.ts).
