/**
 * Local development server — não usado em produção (Vercel usa api/index.ts).
 */
import 'dotenv/config'
import { serve } from '@hono/node-server'
import app from './_app.js'

const PORT = parseInt(process.env.API_PORT ?? '3001', 10)

serve({ fetch: app.fetch, port: PORT }, (info) => {
  console.log(`\n🚀 API rodando em http://localhost:${info.port}/api/health\n`)
})
