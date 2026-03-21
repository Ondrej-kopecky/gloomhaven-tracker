import { test, expect } from '@playwright/test'

test.describe('Navigation', () => {
  test('home loads without error', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('header')).toBeVisible()
  })

  test('header shows branding', async ({ page }) => {
    await page.goto('/kampan')
    await expect(page.locator('header').getByText('GLOOMHAVEN')).toBeVisible()
  })

  test('shows campaign select page', async ({ page }) => {
    await page.goto('/kampan')
    await expect(page.getByText('Nová kampaň')).toBeVisible()
  })

  test('redirects to campaign select when no campaign', async ({ page }) => {
    await page.goto('/druzina')
    await expect(page).toHaveURL(/kampan/)
  })

  test('feedback button is visible', async ({ page }) => {
    await page.goto('/kampan')
    await expect(page.locator('button[title*="Nahlásit"]')).toBeVisible()
  })

  test('feedback modal opens and shows form', async ({ page }) => {
    await page.goto('/kampan')
    await page.locator('button[title*="Nahlásit"]').click()
    await expect(page.getByText('Zpětná vazba')).toBeVisible()
    await expect(page.getByRole('button', { name: /Odeslat/i })).toBeVisible()
  })

  test('login page loads', async ({ page }) => {
    await page.goto('/prihlaseni')
    await expect(page.getByRole('heading', { name: 'Přihlášení' })).toBeVisible()
  })

  test('register page loads', async ({ page }) => {
    await page.goto('/registrace')
    await expect(page.getByRole('heading', { name: 'Registrace' })).toBeVisible()
  })
})
