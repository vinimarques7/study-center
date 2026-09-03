import type { Context, Next } from 'hono'
import { createMiddleware } from 'hono/factory'
import { HTTPException } from 'hono/http-exception'
import { verifyAccessToken, type AccessTokenPayload } from '../_lib/jwt'

type AuthEnv = {
  Variables: {
    user: AccessTokenPayload
  }
}

export const requireAuth = createMiddleware<AuthEnv>(async (c: Context, next: Next) => {
  const authorization = c.req.header('Authorization')

  if (!authorization || !authorization.startsWith('Bearer ')) {
    throw new HTTPException(401, { message: 'Token de acesso ausente.' })
  }

  const token = authorization.slice(7)

  try {
    const payload = await verifyAccessToken(token)
    c.set('user', payload)
  } catch {
    throw new HTTPException(401, { message: 'Token inválido ou expirado.' })
  }

  await next()
})

export const requireAdmin = createMiddleware<AuthEnv>(async (c: Context, next: Next) => {
  const authorization = c.req.header('Authorization')

  if (!authorization || !authorization.startsWith('Bearer ')) {
    throw new HTTPException(401, { message: 'Token de acesso ausente.' })
  }

  const token = authorization.slice(7)

  try {
    const payload = await verifyAccessToken(token)
    if (payload.role !== 'admin') {
      throw new HTTPException(403, { message: 'Acesso restrito a administradores.' })
    }
    c.set('user', payload)
  } catch (e) {
    if (e instanceof HTTPException) throw e
    throw new HTTPException(401, { message: 'Token inválido ou expirado.' })
  }

  await next()
})
