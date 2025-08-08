import { db } from '../../../../db/client'
import { favorites } from '../../../../db/schema'
import { and, eq } from 'drizzle-orm'
import type { FavoriteRepository } from '../../domain/repository/favoriteRepository'
import { Favorite } from '../../domain/entity/favorite'

type Row = typeof favorites.$inferSelect

export class FavoriteRepositoryDrizzle implements FavoriteRepository {
  async add(fav: Favorite): Promise<void> {
    await db.insert(favorites).values({ userId: fav.getUserId(), postId: fav.getPostId() })
  }
  async remove(userId: number, postId: number): Promise<void> {
    await db.delete(favorites).where(and(eq(favorites.userId, userId), eq(favorites.postId, postId)))
  }
  async isFavorited(userId: number, postId: number): Promise<boolean> {
    const rows: Row[] = await db.select().from(favorites).where(and(eq(favorites.userId, userId), eq(favorites.postId, postId)))
    return rows.length > 0
  }
  async countByPost(postId: number): Promise<number> {
    const rows: Row[] = await db.select().from(favorites).where(eq(favorites.postId, postId))
    return rows.length
  }
  async listPostIdsByUser(userId: number): Promise<number[]> {
    const rows = await db.select({ postId: favorites.postId }).from(favorites).where(eq(favorites.userId, userId))
    return rows.map((r) => r.postId)
  }
}
