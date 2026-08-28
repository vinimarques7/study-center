import { describe, expect, it } from 'vitest'
import app from '../api/app'

describe('GET /api/health', () => {
  it('returns status ok', async () => {
    const req = new Request('http://localhost/api/health')
    const res = await app.fetch(req)
    const body = (await res.json()) as { status: string }

    expect(res.status).toBe(200)
    expect(body.status).toBe('ok')
  })
})
