import { Hono } from 'hono'
import { z } from 'zod'
import { db } from '../../../../db/client'
import { users } from '../../../../db/schema'
import { eq } from 'drizzle-orm'
import { signToken, verifyToken } from '../../../../shared/auth/jwt'

const loginSchema = z.object({ email: z.string().email() })

export const registerAuthRoutes = (app: Hono) => {
  app.post('/api/auth/login', async (c) => {
    const body = await c.req.json().catch(() => null)
    const parsed = loginSchema.safeParse(body)
    if (!parsed.success) return c.json({ error: 'invalid request' }, 400)

    const rows = await db.select().from(users).where(eq(users.email, parsed.data.email))
    const u = rows[0]
    if (!u) return c.json({ error: 'user not found' }, 401)

    const token = await signToken({ sub: u.id, email: u.email }, '7d')
    return c.json({ token, user: { id: u.id, name: u.name, email: u.email } })
  })

  app.post('/api/auth/logout', async (c) => {
    // JWTの場合サーバー側で状態を持たないため、クライアント側でトークン破棄を想定
    return c.json({ ok: true })
  })

  app.get('/api/auth/me', async (c) => {
    const auth = c.req.header('authorization')
    if (!auth) return c.json({ error: 'unauthorized' }, 401)
    const token = auth.replace(/^Bearer\s+/i, '')
    try {
      const payload = await verifyToken(token)
      return c.json({ sub: payload.sub, email: payload.email })
    } catch {
      return c.json({ error: 'unauthorized' }, 401)
    }
  })
}
