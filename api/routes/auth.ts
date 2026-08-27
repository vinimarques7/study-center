import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import argon2 from 'argon2'
import { eq, and } from 'drizzle-orm'
import { db } from '../db/index'
import { users, refreshTokens } from '../db/schema'
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../lib/jwt'
import { rateLimitLogin } from '../middleware/rateLimit'

export const authRouter = new Hono()

const REFRESH_COOKIE = 'refresh_token'
const IS_PROD = process.env.NODE_ENV === 'production'
const COOKIE_OPTIONS = [
  'HttpOnly',
  ...(IS_PROD ? ['Secure'] : []),
  'SameSite=Strict',
  `Max-Age=${7 * 24 * 60 * 60}`,
  'Path=/',
].join('; ')

// ─── POST /api/auth/register ──────────────────────────────────────────────────

authRouter.post(
  '/register',
  zValidator(
    'json',
    z.object({
      email: z.string().email().max(255).toLowerCase(),
      password: z.string().min(8).max(128),
    }),
  ),
  async (c) => {
    const { email, password } = c.req.valid('json')

    const existing = await db.select({ id: users.id }).from(users).where(eq(users.email, email))
    if (existing.length > 0) {
      return c.json({ error: 'E-mail já cadastrado.' }, 409)
    }

    const passwordHash = await argon2.hash(password, { type: argon2.argon2id })

    const [user] = await db
      .insert(users)
      .values({ email, passwordHash, role: 'user' })
      .returning({ id: users.id, email: users.email, role: users.role, themeColor: users.themeColor })

    if (!user) return c.json({ error: 'Erro ao criar usuário.' }, 500)

    const [accessToken, { token: refreshToken, jti, expiresAt }] = await Promise.all([
      signAccessToken({ sub: user.id, email: user.email, role: user.role }),
      signRefreshToken(user.id),
    ])

    await db.insert(refreshTokens).values({ userId: user.id, jti, expiresAt })

    c.header('Set-Cookie', `${REFRESH_COOKIE}=${refreshToken}; ${COOKIE_OPTIONS}`)

    return c.json({ accessToken, user }, 201)
  },
)

// ─── POST /api/auth/login ─────────────────────────────────────────────────────

authRouter.post(
  '/login',
  rateLimitLogin,
  zValidator(
    'json',
    z.object({
      email: z.string().email().max(255).toLowerCase(),
      password: z.string().min(1).max(128),
    }),
  ),
  async (c) => {
    const { email, password } = c.req.valid('json')

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1)

    // Constant-time comparison avoidance of timing attacks
    if (!user) {
      await argon2.hash('dummy', { type: argon2.argon2id }) // prevent timing attack
      return c.json({ error: 'Credenciais inválidas.' }, 401)
    }

    const valid = await argon2.verify(user.passwordHash, password)
    if (!valid) {
      return c.json({ error: 'Credenciais inválidas.' }, 401)
    }

    const [accessToken, { token: refreshToken, jti, expiresAt }] = await Promise.all([
      signAccessToken({ sub: user.id, email: user.email, role: user.role }),
      signRefreshToken(user.id),
    ])

    await db.insert(refreshTokens).values({ userId: user.id, jti, expiresAt })

    c.header('Set-Cookie', `${REFRESH_COOKIE}=${refreshToken}; ${COOKIE_OPTIONS}`)

    return c.json({
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        themeColor: user.themeColor,
      },
    })
  },
)

// ─── POST /api/auth/refresh ───────────────────────────────────────────────────

authRouter.post('/refresh', async (c) => {
  const cookieHeader = c.req.header('Cookie') ?? ''
  const match = cookieHeader.match(new RegExp(`(?:^|; )${REFRESH_COOKIE}=([^;]+)`))
  const rawToken = match?.[1]

  if (!rawToken) {
    return c.json({ error: 'Refresh token ausente.' }, 401)
  }

  let payload
  try {
    payload = await verifyRefreshToken(rawToken)
  } catch {
    return c.json({ error: 'Refresh token inválido.' }, 401)
  }

  const [tokenRecord] = await db
    .select()
    .from(refreshTokens)
    .where(and(eq(refreshTokens.jti, payload.jti!), eq(refreshTokens.revoked, false)))
    .limit(1)

  if (!tokenRecord || tokenRecord.expiresAt < new Date()) {
    return c.json({ error: 'Refresh token expirado ou revogado.' }, 401)
  }

  const [user] = await db.select().from(users).where(eq(users.id, payload.sub!)).limit(1)
  if (!user) return c.json({ error: 'Usuário não encontrado.' }, 401)

  // Rotate: revoke old token, issue new ones
  await db
    .update(refreshTokens)
    .set({ revoked: true })
    .where(eq(refreshTokens.id, tokenRecord.id))

  const [newAccessToken, { token: newRefreshToken, jti: newJti, expiresAt }] = await Promise.all([
    signAccessToken({ sub: user.id, email: user.email, role: user.role }),
    signRefreshToken(user.id),
  ])

  await db.insert(refreshTokens).values({ userId: user.id, jti: newJti, expiresAt })

  c.header('Set-Cookie', `${REFRESH_COOKIE}=${newRefreshToken}; ${COOKIE_OPTIONS}`)

  return c.json({
    accessToken: newAccessToken,
    user: { id: user.id, email: user.email, role: user.role, themeColor: user.themeColor },
  })
})

// ─── POST /api/auth/logout ────────────────────────────────────────────────────

authRouter.post('/logout', async (c) => {
  const cookieHeader = c.req.header('Cookie') ?? ''
  const match = cookieHeader.match(new RegExp(`(?:^|; )${REFRESH_COOKIE}=([^;]+)`))
  const rawToken = match?.[1]

  if (rawToken) {
    try {
      const payload = await verifyRefreshToken(rawToken)
      await db
        .update(refreshTokens)
        .set({ revoked: true })
        .where(eq(refreshTokens.jti, payload.jti!))
    } catch {
      // ignore invalid token on logout
    }
  }

  c.header(
    'Set-Cookie',
    `${REFRESH_COOKIE}=; HttpOnly; ${IS_PROD ? 'Secure; ' : ''}SameSite=Strict; Max-Age=0; Path=/`,
  )

  return c.json({ message: 'Logout realizado com sucesso.' })
})
