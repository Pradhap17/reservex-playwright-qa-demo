import { test, expect } from '@playwright/test';

test.describe('ReserveX travel booking UI', () => {
  test('searches tours and displays price and availability @smoke', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('heading', { name: 'Find your next adventure' }).waitFor();
    await page.getByLabel('Destination or tour').fill('Colorado');
    await page.getByRole('button', { name: 'Search tours' }).click();
    await expect(page.getByRole('heading', { name: 'Rocky Mountain Explorer' })).toBeVisible();
    await expect(page.getByText('$420')).toBeVisible();
    await expect(page.getByText('8 spaces available')).toBeVisible();
  });

  test('confirms booking and shows total plus commission @smoke', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Select tour' }).first().click();
    await page.getByLabel('Email').fill('qa.demo@example.com');
    await page.getByLabel('Guests').selectOption('2');
    await page.getByRole('button', { name: 'Confirm booking' }).click();
    await expect(page.locator('#message')).toContainText('CONFIRMED');
    await expect(page.locator('#message')).toContainText('Total $840.00');
    await expect(page.locator('#message')).toContainText('Commission $100.80');
  });

  test('shows a useful message when simulated payment is declined', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Select tour' }).first().click();
    await page.getByLabel('Payment scenario').selectOption('decline');
    await page.getByRole('button', { name: 'Confirm booking' }).click();
    await expect(page.locator('#message')).toContainText('Payment declined');
    await expect(page.locator('#message')).toHaveAttribute('data-status', 'error');
  });

  test('allows retry after a declined payment and confirms only on success', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Select tour' }).first().click();
    await page.getByLabel('Payment scenario').selectOption('decline');
    await page.getByRole('button', { name: 'Confirm booking' }).click();
    await expect(page.locator('#message')).toContainText('Payment declined');

    await page.getByLabel('Payment scenario').selectOption('success');
    await page.getByRole('button', { name: 'Confirm booking' }).click();
    await expect(page.locator('#message')).toContainText('CONFIRMED');
  });

  test('prevents selection of a sold-out tour', async ({ page }) => {
    await page.goto('/');
    await page.getByLabel('Destination or tour').fill('Canada');
    await page.getByRole('button', { name: 'Search tours' }).click();
    await expect(page.getByRole('heading', { name: 'Alpine Lakes Expedition' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Select tour' })).toBeDisabled();
  });
});