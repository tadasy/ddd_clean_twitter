import type { FavoriteOutputPort } from '../../application/port/favoritePorts'
import type { Context } from 'hono'
import type { components } from '@repo/api-types'

export class FavoritePresenter implements FavoriteOutputPort {
  constructor(private readonly c: Context) {}
  failure(error: Error): void {
    this.c.res = this.c.json({ error: error.message }, 400)
  }
  successAdd(): void {
    const body: components['schemas']['Api.OkResponse'] = { ok: true }
    this.c.res = this.c.json(body, 200)
  }
  successRemove(): void {
    const body: components['schemas']['Api.OkResponse'] = { ok: true }
    this.c.res = this.c.json(body, 200)
  }
}
