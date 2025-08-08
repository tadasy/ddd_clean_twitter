import type { Post } from '../entity/post'

export interface PostRepository {
  save(post: Post): Promise<void>
  findById(id: number): Promise<Post | null>
  findByUserId(userId: number): Promise<Post[]>
  findAll(): Promise<Post[]>
}
