/**
 * Vercel serverless entry point.
 * Exports the Hono app wrapped with the Vercel adapter.
 */
import { handle } from 'hono/vercel'
import app from './app'

export const config = { runtime: 'nodejs' }

export default handle(app)
