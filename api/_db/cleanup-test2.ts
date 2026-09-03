import 'dotenv/config'
import { db } from './index'
import { users } from './schema'
import { eq } from 'drizzle-orm'

async function main() {
  const deleted = await db
    .delete(users)
    .where(eq(users.email, 'teste2@lumora.app'))
    .returning({ email: users.email })

  if (deleted.length > 0) {
    console.log('✅ Usuário removido:', deleted[0].email)
  } else {
    console.log('ℹ️  Usuário não encontrado.')
  }
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1) })
