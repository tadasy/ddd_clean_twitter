import { db } from '../../../../db/client'
import { posts } from '../../../../db/schema'
import { eq, desc } from 'drizzle-orm'
import type { PostRepository } from '../../domain/repository/postRepository'
import { Post } from '../../domain/entity/post'

type Row = typeof posts.$inferSelect

export class PostRepositoryDrizzle implements PostRepository {
  async save(post: Post): Promise<void> {
    if (post.getID() && post.getID() !== 0) {
      await db.update(posts).set({ message: post.getMessage(), userId: post.getUserId() }).where(eq(posts.id, post.getID()))
    } else {
      await db.insert(posts).values({ message: post.getMessage(), userId: post.getUserId() })
    }
  }

  async findById(id: number): Promise<Post | null> {
    const rows: Row[] = await db.select().from(posts).where(eq(posts.id, id))
    const r = rows[0]
    if (!r) return null
    return new Post(r.id, r.userId, r.message)
  }

  async findByUserId(userId: number): Promise<Post[]> {
    const rows: Row[] = await db
      .select()
      .from(posts)
      .where(eq(posts.userId, userId))
      .orderBy(desc(posts.createdAt))
    return rows.map((r) => new Post(r.id, r.userId, r.message))
  }

  async findAll(): Promise<Post[]> {
    const rows: Row[] = await db
      .select()
      .from(posts)
      .orderBy(desc(posts.createdAt))
    return rows.map((r) => new Post(r.id, r.userId, r.message))
  }
}
