import { SignJWT, jwtVerify, type JWTPayload } from 'jose'
import { v4 as uuidv4 } from 'uuid'

const ACCESS_SECRET = new TextEncoder().encode(
  process.env.ACCESS_TOKEN_SECRET ?? 'dev-access-secret-change-in-production',
)
const REFRESH_SECRET = new TextEncoder().encode(
  process.env.REFRESH_TOKEN_SECRET ?? 'dev-refresh-secret-change-in-production',
)

const ALGORITHM = 'HS256'
const ACCESS_EXPIRY = '15m'
const REFRESH_EXPIRY = '7d'
const REFRESH_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000

export interface AccessTokenPayload extends JWTPayload {
  sub: string
  email: string
  role: 'user' | 'admin'
}

export interface RefreshTokenPayload extends JWTPayload {
  sub: string
  jti: string
}

export async function signAccessToken(payload: {
  sub: string
  email: string
  role: 'user' | 'admin'
}): Promise<string> {
  return new SignJWT({ email: payload.email, role: payload.role })
    .setProtectedHeader({ alg: ALGORITHM })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(ACCESS_EXPIRY)
    .sign(ACCESS_SECRET)
}

export async function signRefreshToken(userId: string): Promise<{ token: string; jti: string; expiresAt: Date }> {
  const jti = uuidv4()
  const expiresAt = new Date(Date.now() + REFRESH_EXPIRY_MS)

  const token = await new SignJWT({ jti })
    .setProtectedHeader({ alg: ALGORITHM })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime(REFRESH_EXPIRY)
    .sign(REFRESH_SECRET)

  return { token, jti, expiresAt }
}

export async function verifyAccessToken(token: string): Promise<AccessTokenPayload> {
  const { payload } = await jwtVerify<AccessTokenPayload>(token, ACCESS_SECRET, {
    algorithms: [ALGORITHM],
  })
  return payload
}

export async function verifyRefreshToken(token: string): Promise<RefreshTokenPayload> {
  const { payload } = await jwtVerify<RefreshTokenPayload>(token, REFRESH_SECRET, {
    algorithms: [ALGORITHM],
  })
  return payload
}
