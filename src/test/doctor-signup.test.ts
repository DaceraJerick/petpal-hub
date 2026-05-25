import { test, expect } from '@playwright/test';

test('Register Doctor -> Login -> Open Doctor Panel', async ({ page }) => {
  const email = `doctor+auto${Date.now()}@example.com`;
  const password = 'TestPass123!';
  // Go to register
  await page.goto('/register');
  await expect(page.getByRole('heading', { name: /create account/i })).toBeVisible();
  await page.getByLabel(/full name/i).fill('Dr Auto Tester');
  await page.getByLabel(/email/i).fill(email);
  await page.getByLabel(/password/i).fill(password);
  // Choose Doctor account type first so doctor-only fields appear
  await page.getByLabel(/doctor/i).check();
  await page.getByLabel(/specialization/i).fill('General Veterinary');
  await page.getByLabel(/clinic address/i).fill('123 Pet Street, Clinic City');
  // Fill contact
  await page.getByLabel(/contact number/i).fill('+1-555-0123');
  await page.getByRole('button', { name: /create account/i }).click();

  // Wait for redirect to doctor panel
  await page.waitForURL('**/doctor', { timeout: 20000 });
  await expect(page).toHaveURL(/\/doctor/);
  await expect(page.getByText(/doctor dashboard/i)).toBeVisible({ timeout: 10000 });

  // Log out and log back in to verify login flow
  await page.goto('/profile');
  await page.getByRole('button', { name: /log out/i }).click();
  await page.waitForURL(/.*(?:\/login|\/|\/home)/, { timeout: 15000 });

  await page.goto('/login');
  await page.getByLabel(/email/i).fill(email);
  await page.getByLabel(/password/i).fill(password);
  await page.getByRole('button', { name: /sign in|login/i }).click();

  await page.waitForURL('**/doctor', { timeout: 20000 });
  await expect(page.getByText(/doctor dashboard/i)).toBeVisible({ timeout: 10000 });
});
