import { Hono } from 'hono'
import { z } from 'zod'
import { ToggleFavoriteUseCase } from '../../application/usecase/toggleFavoriteUseCase'
import { FavoriteRepositoryDrizzle } from '../infrastructure/favoriteRepositoryDrizzle'
import { FavoritePresenter } from '../presenter/favoritePresenter'
import { requireAuth } from '../../../../shared/auth/requireAuth'

const toggleSchema = z.object({ userId: z.number().int().positive(), postId: z.number().int().positive() })

export const registerFavoriteRoutes = (app: Hono) => {
  const repo = new FavoriteRepositoryDrizzle()
  const usecase = new ToggleFavoriteUseCase({ favoriteRepository: repo })

  app.post('/api/favorites/toggle', requireAuth, async (c) => {
    const body = await c.req.json().catch(() => null)
    const parsed = toggleSchema.safeParse(body)
    if (!parsed.success) return c.json({ error: 'invalid request' }, 400)
    const presenter = new FavoritePresenter(c)
    usecase.setOutputPort(presenter)
    await usecase.execute(parsed.data)
    return c.res
  })

  // 投稿のお気に入り数
  app.get('/api/posts/:id/favorites/count', async (c) => {
    const id = Number(c.req.param('id'))
    if (!Number.isInteger(id) || id <= 0) return c.json({ error: 'invalid post id' }, 400)
    const count = await repo.countByPost(id)
    return c.json({ postId: id, count })
  })

  // ユーザーがお気に入りした投稿ID一覧
  app.get('/api/users/:id/favorites', async (c) => {
    const uid = Number(c.req.param('id'))
    if (!Number.isInteger(uid) || uid <= 0) return c.json({ error: 'invalid user id' }, 400)
    const postIds = await repo.listPostIdsByUser(uid)
    return c.json({ userId: uid, postIds })
  })
}
