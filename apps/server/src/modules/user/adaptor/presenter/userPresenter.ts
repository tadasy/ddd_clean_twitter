import type { UserOutputPort } from '../../application/port/userPorts'
import type { Context } from 'hono'

export class UserPresenter implements UserOutputPort {
  constructor(private readonly c: Context) {}
  failure(error: Error): void {
    this.c.res = this.c.json({ error: error.message }, 400)
  }
  successCreateUser(response: { user: { id: number; name: string; email: string } }): void {
    this.c.res = this.c.json(response, 201)
  }
}
