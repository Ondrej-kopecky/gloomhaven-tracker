import { test, expect } from '@playwright/test'

test.describe('Campaign Flow', () => {
  test('create campaign and use the app', async ({ page }) => {
    // 1. Create campaign
    await page.goto('/kampan')
    await page.getByText('Nová kampaň').first().click()
    await page.locator('input[placeholder*="Název kampaně"]').fill('E2E Test')
    await page.getByRole('button', { name: /Vytvořit/i }).click()

    // Should redirect to /prehled (flowchart)
    await page.waitForURL('**/prehled', { timeout: 5000 })

    // 2. Navigate via header links
    // Click Družina
    await page.locator('header').getByText('Družina').click()
    await expect(page.getByText('Reputace')).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Blahobyt' })).toBeVisible()
    await expect(page.getByText('Městské události')).toBeVisible()

    // 3. Navigate to Postavy
    await page.locator('header').getByText('Postavy').click()
    await expect(page.getByText('Zatím žádné postavy')).toBeVisible()

    // Create a character
    await page.getByRole('button', { name: /Nová postava/i }).click()
    await page.locator('input[placeholder*="Jméno"]').fill('Brutalus')
    await page.getByRole('button', { name: /Vytvořit/i }).click()
    await expect(page.getByText('Brutalus')).toBeVisible()

    // 4. Navigate to Úspěchy
    await page.locator('header').getByText('Úspěchy').click()
    await expect(page.getByRole('heading', { name: 'Úspěchy', exact: true })).toBeVisible()

    // 5. Navigate to Nastavení
    await page.locator('header a[href="/nastaveni"]').first().click()
    await expect(page.getByText('E2E Test')).toBeVisible()
  })
})
