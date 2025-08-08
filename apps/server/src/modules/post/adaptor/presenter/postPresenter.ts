import type { PostOutputPort } from '../../application/port/postPorts'
import type { Context } from 'hono'

export class PostPresenter implements PostOutputPort {
  constructor(private readonly c: Context) {}
  failure(error: Error): void {
    this.c.res = this.c.json({ error: error.message }, 400)
  }
  successCreatePost(response: { post: { id: number; userId: number; message: string } }): void {
    this.c.res = this.c.json(response, 201)
  }
}
