import type { PostOutputPort } from '../../application/port/postPorts'
import type { Context } from 'hono'
import type { components } from '@repo/api-types'

export class PostPresenter implements PostOutputPort {
  constructor(private readonly c: Context) {}
  failure(error: Error): void {
    this.c.res = this.c.json({ error: error.message }, 400)
  }
  successCreatePost(response: { post: { id: number; userId: number; message: string } }): void {
    const body: components['schemas']['Api.CreatePostResponse'] = {
      id: response.post.id,
      userId: response.post.userId,
      message: response.post.message,
    }
    this.c.res = this.c.json(body, 200)
  }
}
