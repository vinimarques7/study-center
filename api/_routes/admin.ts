import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { db } from '../_db/index'
import { siteSettings } from '../_db/schema'
import { requireAdmin } from '../_middleware/auth'

export const adminRouter = new Hono()

const ALLOWED_KEYS = [
  'site_title',
  'site_subtitle',
  'bg_color',
  'hero_text',
  'bg_image_enabled',
  'bg_image_url',
  'bg_image_overlay',
] as const

// ─── GET /api/admin/settings (public — needed to style homepage) ──────────────

adminRouter.get('/settings', async (c) => {
  const settings = await db.select().from(siteSettings)
  const map = Object.fromEntries(settings.map((s) => [s.key, s.value]))
  return c.json({ settings: map })
})

// ─── PUT /api/admin/settings/:key ─────────────────────────────────────────────

adminRouter.put(
  '/settings/:key',
  requireAdmin,
  zValidator('json', z.object({ value: z.string().min(1).max(2000) })),
  async (c) => {
    const { key } = c.req.param()
    const { value } = c.req.valid('json')

    if (!(ALLOWED_KEYS as readonly string[]).includes(key)) {
      return c.json({ error: 'Chave de configuração inválida.' }, 400)
    }

    // Validate color format for bg_color
    if (key === 'bg_color' && !/^#[0-9a-fA-F]{6}$/.test(value)) {
      return c.json({ error: 'Cor inválida. Use formato hexadecimal: #rrggbb.' }, 400)
    }

    if (key === 'bg_image_enabled' && !['true', 'false'].includes(value)) {
      return c.json({ error: 'bg_image_enabled deve ser true ou false.' }, 400)
    }

    if (key === 'bg_image_url' && value.trim().length > 0) {
      const valid = /^https?:\/\//i.test(value.trim())
      if (!valid) {
        return c.json({ error: 'URL da imagem inválida. Use http(s).' }, 400)
      }
    }

    if (key === 'bg_image_overlay') {
      const opacity = Number(value)
      if (Number.isNaN(opacity) || opacity < 0 || opacity > 0.85) {
        return c.json({ error: 'bg_image_overlay deve ser um número entre 0 e 0.85.' }, 400)
      }
    }

    await db
      .insert(siteSettings)
      .values({ key, value, updatedAt: new Date() })
      .onConflictDoUpdate({ target: siteSettings.key, set: { value, updatedAt: new Date() } })

    return c.json({ setting: { key, value } })
  },
)

// ─── PUT /api/admin/settings (batch update) ───────────────────────────────────

adminRouter.put(
  '/settings',
  requireAdmin,
  zValidator(
    'json',
    z.object({
      site_title: z.string().min(1).max(200).optional(),
      site_subtitle: z.string().max(500).optional(),
      bg_color: z
        .string()
        .regex(/^#[0-9a-fA-F]{6}$/, 'Use formato #rrggbb.')
        .optional(),
      hero_text: z.string().max(2000).optional(),
      bg_image_enabled: z.enum(['true', 'false']).optional(),
      bg_image_url: z
        .string()
        .max(2000)
        .refine((v) => v.trim().length === 0 || /^https?:\/\//i.test(v), {
          message: 'Use uma URL http(s) válida.',
        })
        .optional(),
      bg_image_overlay: z
        .string()
        .refine((v) => {
          const n = Number(v)
          return !Number.isNaN(n) && n >= 0 && n <= 0.85
        }, 'Use um valor entre 0 e 0.85.')
        .optional(),
    }),
  ),
  async (c) => {
    const body = c.req.valid('json')
    const entries = Object.entries(body).filter(([, v]) => v !== undefined)

    for (const [key, value] of entries) {
      await db
        .insert(siteSettings)
        .values({ key, value: value as string, updatedAt: new Date() })
        .onConflictDoUpdate({ target: siteSettings.key, set: { value: value as string, updatedAt: new Date() } })
    }

    return c.json({ updated: entries.length })
  },
)
