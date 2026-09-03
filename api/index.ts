/**
 * Vercel serverless entry point.
 * Exports the Hono app wrapped with the Vercel adapter.
 */
import { handle } from 'hono/vercel'
import app from './_app.js'

export const config = { runtime: 'nodejs' }

const handler = handle(app)

export const GET = handler
export const POST = handler
export const PUT = handler
export const PATCH = handler
export const DELETE = handler
export const OPTIONS = handler
