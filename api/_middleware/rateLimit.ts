import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import type { Context, Next } from 'hono'
import { HTTPException } from 'hono/http-exception'

let ratelimit: Ratelimit | null = null

function getRateLimiter(): Ratelimit | null {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    // Rate limiting disabled — env vars not configured
    return null
  }

  if (!ratelimit) {
    ratelimit = new Ratelimit({
      redis: new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      }),
      limiter: Ratelimit.slidingWindow(5, '15 m'),
      analytics: false,
      prefix: 'studycenter:ratelimit',
    })
  }

  return ratelimit
}

export async function rateLimitLogin(c: Context, next: Next) {
  const limiter = getRateLimiter()

  if (!limiter) {
    await next()
    return
  }

  // Use IP as identifier — in Vercel: x-forwarded-for header
  const ip =
    c.req.header('x-forwarded-for')?.split(',')[0]?.trim() ??
    c.req.header('x-real-ip') ??
    'unknown'

  const { success, reset } = await limiter.limit(ip)

  if (!success) {
    const retryAfter = Math.ceil((reset - Date.now()) / 1000)
    c.header('Retry-After', String(retryAfter))
    throw new HTTPException(429, {
      message: `Muitas tentativas de login. Tente novamente em ${retryAfter}s.`,
    })
  }

  await next()
}
