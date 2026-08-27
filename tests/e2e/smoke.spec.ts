import { test, expect } from '@playwright/test'

test('homepage loads and shows CTA', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: /Lumora/i })).toBeVisible()
  await expect(page.getByRole('link', { name: /Criar conta/i })).toBeVisible()
})
