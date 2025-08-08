import { Hono } from 'hono'
import { z } from 'zod'
import { UserPresenter } from '../presenter/userPresenter'
import { CreateUserUseCase } from '../../application/usecase/createUserUseCase'
import { UserRepositoryDrizzle } from '../infrastructure/userRepositoryDrizzle'
import { UserFactory } from '../../domain/factory/userFactory'

const createUserSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
})

export const registerUserRoutes = (app: Hono) => {
  const repo = new UserRepositoryDrizzle()
  const factory = new UserFactory()
  const usecase = new CreateUserUseCase({ userRepository: repo, userFactory: factory })

  app.post('/api/users', async (c) => {
    const body = await c.req.json().catch(() => null)
    const parsed = createUserSchema.safeParse(body)
    if (!parsed.success) {
      return c.json({ error: 'invalid request' }, 400)
    }
    const presenter = new UserPresenter(c)
    usecase.setOutputPort(presenter)
    await usecase.execute(parsed.data)
    return c.res
  })

  app.get('/api/users', async (c) => {
    const all = await repo.findAll()
    return c.json(all.map((u) => ({ id: u.getID(), name: u.getName(), email: u.getEmail().getValue() })))
  })
}
