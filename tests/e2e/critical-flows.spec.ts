import { test, expect, type Page } from '@playwright/test'

function uniqueEmail() {
  return `e2e_${Date.now()}_${Math.random().toString(36).slice(2, 8)}@studycenter.test`
}

async function registerUser(page: Page, email: string, password: string, displayName: string) {
  await page.goto('/register')
  await page.getByLabel('E-mail').fill(email)
  await page.getByLabel('Senha').first().fill(password)
  await page.getByLabel('Confirmar senha').fill(password)
  await page.getByRole('button', { name: 'Próximo' }).click()

  await page.getByLabel('Nome de perfil *').fill(displayName)
  await page.getByRole('button', { name: 'Criar conta' }).click()
}

test('registro, login e criacao de deck', async ({ page }) => {
  const email = uniqueEmail()
  const password = 'password123'

  await registerUser(page, email, password, 'E2E Tester')

  await expect(page).toHaveURL(/\/dashboard/)
  await expect(page.getByRole('heading', { name: 'Meus Decks' })).toBeVisible()

  await page.getByRole('button', { name: 'Novo Deck' }).click()
  await page.getByLabel('Nome *').fill('E2E Deck')
  await page.getByLabel('Descrição').fill('Deck criado por teste E2E')
  await page.getByRole('button', { name: 'Criar deck' }).click()

  await expect(page.getByText('E2E Deck')).toBeVisible()
})

test('fluxo de quiz e segura e responde aparece com deck >= 2 cards', async ({ page }) => {
  const email = uniqueEmail()
  const password = 'password123'

  await registerUser(page, email, password, 'E2E Tester')

  await page.getByRole('button', { name: 'Novo Deck' }).click()
  await page.getByLabel('Nome *').fill('Deck Jogo E2E')
  await page.getByRole('button', { name: 'Criar deck' }).click()

  await page.getByRole('link', { name: 'Ver cards' }).first().click()

  // Card 1
  await page.getByRole('button', { name: 'Novo card' }).click()
  await page.getByLabel('Pergunta *').fill('Pergunta 1?')
  await page.getByLabel('Resposta *').fill('Resposta 1')
  await page.getByRole('button', { name: 'Salvar card' }).click()

  // Card 2
  await page.getByRole('button', { name: 'Novo card' }).click()
  await page.getByLabel('Pergunta *').fill('Pergunta 2?')
  await page.getByLabel('Resposta *').fill('Resposta 2')
  await page.getByRole('button', { name: 'Salvar card' }).click()

  await expect(page.getByRole('link', { name: 'Segura e Responde' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Quiz Solo' })).toBeVisible()
})
