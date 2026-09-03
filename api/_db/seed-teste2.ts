/**
 * Script one-shot: cria usuário teste2 + deck DevOps - Básico + card CI/CD
 */
import 'dotenv/config'
import { db } from './index.js'
import { users, decks, cards } from './schema.js'
import argon2 from 'argon2'
import { eq } from 'drizzle-orm'

async function main() {
  console.log('🌱 Inserindo dados de teste2...')

  // ── Usuário ────────────────────────────────────────────────────────────────
  const hash = await argon2.hash('teste2pass', { type: argon2.argon2id })

  const existing = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, 'teste2@lumora.app'))

  let userId: string

  if (existing.length > 0) {
    userId = existing[0].id
    console.log('ℹ️  Usuário teste2 já existe, reutilizando.')
  } else {
    const [user] = await db
      .insert(users)
      .values({
        email: 'teste2@lumora.app',
        passwordHash: hash,
        role: 'user',
        displayName: 'Teste 2',
        occupation: 'Estudante de DevOps',
        themeColor: '#14b8a6',
      })
      .returning()
    userId = user.id
    console.log('✅ Usuário teste2 criado:', userId)
  }

  // ── Deck ───────────────────────────────────────────────────────────────────
  const existingDeck = await db
    .select({ id: decks.id })
    .from(decks)
    .where(eq(decks.name, 'DevOps - Básico'))

  let deckId: string

  if (existingDeck.length > 0) {
    deckId = existingDeck[0].id
    console.log('ℹ️  Deck já existe, reutilizando.')
  } else {
    const [deck] = await db
      .insert(decks)
      .values({
        name: 'DevOps - Básico',
        description: 'Conceitos fundamentais de DevOps: CI/CD, containers, automação e boas práticas.',
        ownerId: userId,
        isPublic: true,
        category: 'DevOps',
        deckDifficulty: 'easy',
      })
      .returning()
    deckId = deck.id
    console.log('✅ Deck criado:', deckId)
  }

  // ── Card CI/CD ─────────────────────────────────────────────────────────────
  const [card] = await db
    .insert(cards)
    .values({
      deckId,
      authorId: userId,
      question: 'O que é CI/CD e para que serve?',
      answer:
        'CI/CD (Continuous Integration / Continuous Delivery ou Deployment) é a prática de automatizar a integração de código e a entrega de software, reduzindo erros manuais e acelerando o ciclo de releases.',
      explanation:
        'CI (Integração Contínua) consiste em fazer merge frequente do código no repositório principal, ' +
        'seguido de build e testes automáticos — garantindo que o novo código não quebra o que já existia. ' +
        'CD pode ser Continuous Delivery (o software fica pronto para deploy a qualquer momento, mas o envio ao ' +
        'ambiente de produção é manual) ou Continuous Deployment (todo commit aprovado vai automaticamente para ' +
        'produção). Ferramentas comuns: GitHub Actions, GitLab CI, Jenkins, CircleCI, ArgoCD.',
      analogy:
        'Pense numa linha de produção de uma fábrica: cada peça nova que entra passa pela esteira de testes ' +
        'de qualidade (CI) antes de ser embalada e enviada ao cliente (CD). Se uma peça falha na esteira, ' +
        'o processo para e avisa — em vez de chegar defeituosa ao destino.',
      imageUrl:
        'https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?auto=format&fit=crop&w=1280&q=80',
      difficulty: 'medium',
      position: 0,
    })
    .returning()

  console.log('✅ Card CI/CD criado:', card.id)
  console.log('\n📋 Credenciais do teste2:')
  console.log('   Email: teste2@lumora.app')
  console.log('   Senha: teste2pass')
  console.log(`   Deck:  ${deckId}`)
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Erro:', err)
    process.exit(1)
  })
