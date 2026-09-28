import { test, expect } from '@playwright/test';

test('homepage loads correctly', async ({ page }) => {
  await page.goto('/');

  // Check page loads
  await expect(page).toHaveURL(/localhost/);

  // Basic visibility check
  await expect(page.locator('body')).toBeVisible();

  // Scroll test
  await page.mouse.wheel(0, 1000);

  // Screenshot for debugging
  await page.screenshot({ path: 'test-result.png' });
});