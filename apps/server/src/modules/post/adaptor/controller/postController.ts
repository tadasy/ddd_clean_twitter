import { Hono } from 'hono'
import { z } from 'zod'
import { PostRepositoryDrizzle } from '../infrastructure/postRepositoryDrizzle'
import { CreatePostUseCase } from '../../application/usecase/createPostUseCase'
import { PostPresenter } from '../presenter/postPresenter'
import { requireAuth } from '../../../../shared/auth/requireAuth'

const createPostSchema = z.object({
  // userId はクライアントから送らせない
  message: z.string().min(1).max(280),
})

export const registerPostRoutes = (app: Hono) => {
  const repo = new PostRepositoryDrizzle()
  const usecase = new CreatePostUseCase({ postRepository: repo })

  app.post('/api/posts', requireAuth, async (c: any) => {
    const body = await c.req.json().catch(() => null)
    const parsed = createPostSchema.safeParse(body)
    if (!parsed.success) return c.json({ error: 'invalid request' }, 400)

    // JWT からuserIdを決定
    const auth = c.get('auth') as any
    const userId = Number(auth?.sub)
    if (!Number.isInteger(userId) || userId <= 0) return c.json({ error: 'unauthorized' }, 401)

    const presenter = new PostPresenter(c)
    usecase.setOutputPort(presenter)
    await usecase.execute({ userId, message: parsed.data.message })
    return c.res
  })

  app.get('/api/posts', async (c: any) => {
    const all = await repo.findAll()
    return c.json(all.map((p) => ({ id: p.getID(), userId: p.getUserId(), message: p.getMessage() })))
  })

  app.get('/api/users/:id/posts', async (c: any) => {
    const uid = Number(c.req.param('id'))
    if (!Number.isInteger(uid) || uid <= 0) return c.json({ error: 'invalid user id' }, 400)
    const list = await repo.findByUserId(uid)
    return c.json(list.map((p) => ({ id: p.getID(), userId: p.getUserId(), message: p.getMessage() })))
  })
}
