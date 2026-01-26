import { test, expect } from '@playwright/test';

test('Bypass UI Login using API Context', async ({ page, request }) => {
  // 1. API Step: Get the Token directly (No UI interaction)
  const apiResponse = await request.post('https://restful-booker.herokuapp.com/auth', {
    data: {
      username: 'admin',
      password: 'password123'
    }
  });
  
  expect(apiResponse.ok()).toBeTruthy();
  const responseBody = await apiResponse.json();
  const token = responseBody.token;
  console.log('Got Token:', token);

  // 2. Injection Step: Put token in browser storage
  // (Simulates what your "Migration" story claims you did)
  await page.context().addCookies([
    {
      name: 'token',
      value: token,
      domain: 'restful-booker.herokuapp.com',
      path: '/'
    }
  ]);

  // 3. UI Step: Go to dashboard. It should be logged in.
  // Note: This specific test site might not auto-login with just a cookie, 
  // but this IS the code pattern you need to memorize.
  await page.goto('https://restful-booker.herokuapp.com/admin/');
});