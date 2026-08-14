import { expect, test } from '@playwright/test';

test('shows an error for invalid login credentials', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel(/email/i).fill('invalid-user@example.com');
  await page.getByLabel(/^password/i).fill('incorrect-password');
  await page.getByRole('button', { name: /login|sign in/i }).click();

  await expect(page.locator('[class*="red"]')).toBeVisible();
});

test('redirects an unauthenticated visitor from the dashboard', async ({ page }) => {
  await page.goto('/dashboard');
  await expect(page).toHaveURL(/\/login/);
});
