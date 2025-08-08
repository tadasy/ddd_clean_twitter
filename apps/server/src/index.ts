import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { registerUserRoutes } from './modules/user/adaptor/controller/userController'

const app = new Hono()

app.use('*', cors())

app.get('/health', (c) => c.json({ ok: true }))

registerUserRoutes(app)

export default app
