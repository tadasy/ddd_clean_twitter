import type { FavoriteOutputPort } from '../../application/port/favoritePorts'
import type { Context } from 'hono'

export class FavoritePresenter implements FavoriteOutputPort {
  constructor(private readonly c: Context) {}
  failure(error: Error): void {
    this.c.res = this.c.json({ error: error.message }, 400)
  }
  successAdd(): void {
    this.c.res = this.c.json({ ok: true }, 201)
  }
  successRemove(): void {
    this.c.res = this.c.json({ ok: true }, 200)
  }
}
