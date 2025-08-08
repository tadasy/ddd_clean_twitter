import type { Favorite } from '../entity/favorite'

export interface FavoriteRepository {
  add(fav: Favorite): Promise<void>
  remove(userId: number, postId: number): Promise<void>
  isFavorited(userId: number, postId: number): Promise<boolean>
  countByPost(postId: number): Promise<number>
  listPostIdsByUser(userId: number): Promise<number[]>
}
