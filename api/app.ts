import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { HTTPException } from 'hono/http-exception'
import { authRouter } from './routes/auth'
import { usersRouter } from './routes/users'
import { decksRouter } from './routes/decks'
import { cardsRouter } from './routes/cards'
import { adminRouter } from './routes/admin'

const app = new Hono().basePath('/api')

// ─── Global Middleware ─────────────────────────────────────────────────────────

app.use(
  '*',
  cors({
    origin: [
      process.env.FRONTEND_URL ?? 'http://localhost:5173',
      'http://localhost:5173',
    ],
    credentials: true,
    allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
  }),
)

app.use('*', logger())

// ─── Routes ───────────────────────────────────────────────────────────────────

app.route('/auth', authRouter)
app.route('/users', usersRouter)
app.route('/decks', decksRouter)
app.route('/cards', cardsRouter)
app.route('/admin', adminRouter)

// ─── Health check ─────────────────────────────────────────────────────────────

app.get('/health', (c) => c.json({ status: 'ok', ts: new Date().toISOString() }))

// ─── Global Error Handler ─────────────────────────────────────────────────────

app.onError((err, c) => {
  if (err instanceof HTTPException) {
    return c.json({ error: err.message }, err.status)
  }

  const msg = err instanceof Error ? err.message : ''
  const dbUnavailable =
    msg.includes('ECONNREFUSED') ||
    msg.includes('connect ECONNREFUSED') ||
    msg.includes('fetch failed') ||
    msg.includes('Connection terminated') ||
    msg.includes('password authentication failed') ||
    msg.includes('does not exist')

  if (dbUnavailable) {
    return c.json(
      {
        error:
          'Banco indisponivel ou schema ausente. Configure DATABASE_URL e rode: npm run db:push',
      },
      503,
    )
  }

  console.error('[API Error]', err)
  return c.json({ error: 'Erro interno do servidor.' }, 500)
})

app.notFound((c) => c.json({ error: 'Rota não encontrada.' }, 404))

export default app
