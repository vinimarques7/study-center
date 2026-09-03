import 'dotenv/config'
import { db } from './index.js'
import { decks, users, cards } from './schema.js'
import { eq } from 'drizzle-orm'

async function main() {
  const rows = await db
    .select({
      deckName: decks.name,
      deckId: decks.id,
      email: users.email,
      owner: users.displayName,
    })
    .from(decks)
    .innerJoin(users, eq(decks.ownerId, users.id))

  console.log('\nDecks e donos:')
  console.table(rows.map((r) => ({ deck: r.deckName, email: r.email, owner: r.owner })))

  // Cards do deck DevOps - Básico
  const devopsDeck = rows.find((r) => r.deckName === 'DevOps - Básico')
  if (devopsDeck) {
    const deckCards = await db.select().from(cards).where(eq(cards.deckId, devopsDeck.deckId))
    console.log(`\nCards em "${devopsDeck.deckName}" (dono: ${devopsDeck.email}):`)
    console.table(deckCards.map((c) => ({ id: c.id.slice(0, 8), question: c.question.slice(0, 50) })))
  }
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1) })
