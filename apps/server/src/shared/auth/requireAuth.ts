import type { Context, Next } from 'hono'
import { verifyToken } from './jwt'

export async function requireAuth(c: Context, next: Next) {
  const auth = c.req.header('authorization')
  if (!auth) return c.json({ error: 'unauthorized' }, 401)
  const token = auth.replace(/^Bearer\s+/i, '')
  try {
    const payload = await verifyToken(token)
    c.set('auth', { sub: String(payload.sub ?? ''), email: String(payload.email ?? '') })
    await next()
  } catch {
    return c.json({ error: 'unauthorized' }, 401)
  }
}
