import { expect, test } from '@playwright/test';

test('rejects a CSV that is missing a required column', async ({ page }) => {
  await page.goto('/transactions');
  await page.locator('input[type="file"]').setInputFiles({
    name: 'missing-description.csv',
    mimeType: 'text/csv',
    buffer: Buffer.from('Date,Amount\n2026-01-01,-25.00'),
  });

  await expect(page.getByText(/CSV must have Date, Description, and Amount/i)).toBeVisible();
});

test('reports an invalid amount without importing the row', async ({ page }) => {
  await page.goto('/transactions');
  await page.locator('input[type="file"]').setInputFiles({
    name: 'invalid-amount.csv',
    mimeType: 'text/csv',
    buffer: Buffer.from('Date,Description,Amount\n2026-01-01,Coffee,not-a-number'),
  });

  await expect(page.getByText(/No valid transactions found/i)).toBeVisible();
});
