import type { UserOutputPort } from '../../application/port/userPorts'
import type { Context } from 'hono'
import type { components } from '@repo/api-types'

export class UserPresenter implements UserOutputPort {
  constructor(private readonly c: Context) {}
  failure(error: Error): void {
    this.c.res = this.c.json({ error: error.message }, 400)
  }
  successCreateUser(response: { user: { id: number; name: string; email: string } }): void {
    const body: components['schemas']['Api.CreateUserResponse'] = {
      id: response.user.id,
      name: response.user.name,
      email: response.user.email,
    }
    this.c.res = this.c.json(body, 200)
  }
}
