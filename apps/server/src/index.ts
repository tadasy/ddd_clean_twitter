import { Hono } from 'hono'
import { cors } from 'hono/cors'
import type { Context } from 'hono'
import { registerUserRoutes } from './modules/user/adaptor/controller/userController'
import { registerPostRoutes } from './modules/post/adaptor/controller/postController'
import { registerFavoriteRoutes } from './modules/favorite/adaptor/controller/favoriteController'

const app = new Hono()

app.use('*', cors())

app.get('/health', (c: Context) => c.json({ ok: true }))

registerUserRoutes(app)
registerPostRoutes(app)
registerFavoriteRoutes(app)

export default app
